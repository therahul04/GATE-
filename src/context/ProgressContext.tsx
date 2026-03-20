'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface ProgressData {
    completedVideos: string[];
    completedTests: string[];
    readChapters: string[];
    bookmarkedVideos: string[];
    bookmarkedTests: string[];
    bookmarkedReads: string[];
    notes: Record<string, string>;
    activityLog: Record<string, number>;
    flashcards: Record<string, { interval: number; nextReview: string; efactor: number }>;
}

interface ProgressContextType {
    progress: ProgressData;
    markAsCompleted: (type: 'video' | 'test' | 'read', id: string) => Promise<void>;
    isCompleted: (type: 'video' | 'test' | 'read', id: string) => boolean;
    toggleBookmark: (type: 'video' | 'test' | 'read', id: string) => Promise<void>;
    isBookmarked: (type: 'video' | 'test' | 'read', id: string) => boolean;
    saveNote: (id: string, content: string) => Promise<void>;
    saveFlashcardProgress: (id: string, interval: number, efactor: number) => Promise<void>;
}

const defaultProgress: ProgressData = {
    completedVideos: [],
    completedTests: [],
    readChapters: [],
    bookmarkedVideos: [],
    bookmarkedTests: [],
    bookmarkedReads: [],
    notes: {},
    activityLog: {},
    flashcards: {}
};

const ProgressContext = createContext<ProgressContextType>({
    progress: defaultProgress,
    markAsCompleted: async () => { },
    isCompleted: () => false,
    toggleBookmark: async () => { },
    isBookmarked: () => false,
    saveNote: async () => { },
    saveFlashcardProgress: async () => { },
});

export const ProgressProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<ProgressData>(defaultProgress);

    useEffect(() => {
        if (!user) {
            setProgress(defaultProgress);
            return;
        }

        const fetchProgress = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setProgress({
                        completedVideos: data.progress?.completedVideos || [],
                        completedTests: data.progress?.completedTests || [],
                        readChapters: data.progress?.readChapters || [],
                        bookmarkedVideos: data.progress?.bookmarkedVideos || [],
                        bookmarkedTests: data.progress?.bookmarkedTests || [],
                        bookmarkedReads: data.progress?.bookmarkedReads || [],
                        notes: data.progress?.notes || {},
                        activityLog: data.progress?.activityLog || {},
                        flashcards: data.progress?.flashcards || {},
                    });
                }
            } catch (error) {
                console.error("Error fetching progress", error);
            }
        };

        fetchProgress();
    }, [user]);

    const markAsCompleted = async (type: 'video' | 'test' | 'read', id: string) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);

            // Get today's local date in YYYY-MM-DD format
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayDateString = `${year}-${month}-${day}`;

            setProgress(prev => {
                const updated = { ...prev };
                const list = type === 'video' ? updated.completedVideos
                    : type === 'test' ? updated.completedTests
                        : updated.readChapters;

                if (!list.includes(id)) {
                    list.push(id);
                }

                // Increment today's activity count
                const newActivityLog = { ...updated.activityLog };
                newActivityLog[todayDateString] = (newActivityLog[todayDateString] || 0) + 1;
                updated.activityLog = newActivityLog;

                // Fire and forget update
                setDoc(userRef, {
                    progress: {
                        [`${type === 'video' ? 'completedVideos' : type === 'test' ? 'completedTests' : 'readChapters'}`]: list,
                        activityLog: newActivityLog
                    }
                }, { merge: true }).catch((e: any) => console.error("Error saving progress to DB", e));

                return updated;
            });

        } catch (error) {
            console.error("Error marking as completed", error);
        }
    };

    const isCompleted = (type: 'video' | 'test' | 'read', id: string) => {
        const list = type === 'video' ? progress.completedVideos
            : type === 'test' ? progress.completedTests
                : progress.readChapters;
        return list.includes(id);
    };

    const toggleBookmark = async (type: 'video' | 'test' | 'read', id: string) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);

            setProgress(prev => {
                const updated = { ...prev };
                let list = type === 'video' ? updated.bookmarkedVideos
                    : type === 'test' ? updated.bookmarkedTests
                        : updated.bookmarkedReads;

                // Create a new array so React detects state change
                list = [...list];

                if (list.includes(id)) {
                    list = list.filter(item => item !== id);
                } else {
                    list.push(id);
                }

                if (type === 'video') updated.bookmarkedVideos = list;
                else if (type === 'test') updated.bookmarkedTests = list;
                else updated.bookmarkedReads = list;

                setDoc(userRef, {
                    progress: {
                        [`${type === 'video' ? 'bookmarkedVideos' : type === 'test' ? 'bookmarkedTests' : 'bookmarkedReads'}`]: list
                    }
                }, { merge: true }).catch((e: any) => console.error("Error saving bookmark", e));

                return updated;
            });
        } catch (error) {
            console.error("Error toggling bookmark", error);
        }
    };

    const isBookmarked = (type: 'video' | 'test' | 'read', id: string) => {
        const list = type === 'video' ? progress.bookmarkedVideos
            : type === 'test' ? progress.bookmarkedTests
                : progress.bookmarkedReads;
        return list.includes(id);
    };

    const saveNote = async (id: string, content: string) => {
        if (!user) return;

        try {
            const userRef = doc(db, 'users', user.uid);

            setProgress(prev => {
                const updated = { ...prev };
                const newNotes = { ...updated.notes, [id]: content };
                updated.notes = newNotes;

                setDoc(userRef, {
                    progress: {
                        notes: newNotes
                    }
                }, { merge: true }).catch((e: any) => console.error("Error saving note", e));

                return updated;
            });
        } catch (error) {
            console.error("Error saving note", error);
        }
    };

    const saveFlashcardProgress = async (id: string, interval: number, efactor: number) => {
        if (!user) return;

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        const nextReviewStr = nextReviewDate.toISOString().split('T')[0];

        try {
            const userRef = doc(db, 'users', user.uid);
            const updatedFlashcards = {
                ...progress.flashcards,
                [id]: { interval, nextReview: nextReviewStr, efactor }
            };

            await setDoc(userRef, { flashcards: updatedFlashcards }, { merge: true });

            setProgress(prev => ({
                ...prev,
                flashcards: updatedFlashcards
            }));
        } catch (error) {
            console.error("Error saving flashcard progress:", error);
        }
    };

    return (
        <ProgressContext.Provider value={{ progress, markAsCompleted, isCompleted, toggleBookmark, isBookmarked, saveNote, saveFlashcardProgress }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
