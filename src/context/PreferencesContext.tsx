'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import resources from '@/data/resources.json';

interface UserPreferences {
    subjectOrder: number[];
    startDate: string;
    endDate: string;
}

interface PreferencesContextType {
    preferences: UserPreferences;
    loading: boolean;
    setSubjectOrder: (order: number[]) => Promise<void>;
    setStartDate: (date: string) => Promise<void>;
    setEndDate: (date: string) => Promise<void>;
}

const getDefaultPreferences = (): UserPreferences => ({
    subjectOrder: resources.map((_, i) => i),
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
});

const PreferencesContext = createContext<PreferencesContextType>({
    preferences: getDefaultPreferences(),
    loading: true,
    setSubjectOrder: async () => { },
    setStartDate: async () => { },
    setEndDate: async () => { },
});

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setPreferences(getDefaultPreferences());
            setLoading(false);
            return;
        }

        const fetchPreferences = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.preferences) {
                        setPreferences({
                            subjectOrder: data.preferences.subjectOrder || resources.map((_, i) => i),
                            startDate: data.preferences.startDate || new Date().toISOString().split('T')[0],
                            endDate: data.preferences.endDate || '',
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching preferences", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [user]);

    const setSubjectOrder = useCallback(async (order: number[]) => {
        if (!user) return;
        const newPrefs = { ...preferences, subjectOrder: order };
        setPreferences(newPrefs);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { preferences: newPrefs }, { merge: true });
        } catch (error) {
            console.error("Error saving subject order", error);
        }
    }, [user, preferences]);

    const setStartDate = useCallback(async (date: string) => {
        if (!user) return;
        const newPrefs = { ...preferences, startDate: date };
        setPreferences(newPrefs);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { preferences: newPrefs }, { merge: true });
        } catch (error) {
            console.error("Error saving start date", error);
        }
    }, [user, preferences]);

    const setEndDate = useCallback(async (date: string) => {
        if (!user) return;
        const newPrefs = { ...preferences, endDate: date };
        setPreferences(newPrefs);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { preferences: newPrefs }, { merge: true });
        } catch (error) {
            console.error("Error saving end date", error);
        }
    }, [user, preferences]);

    return (
        <PreferencesContext.Provider value={{ preferences, loading, setSubjectOrder, setStartDate, setEndDate }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
