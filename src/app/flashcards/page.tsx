'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProgress } from '@/context/ProgressContext';
import { Check, X, RotateCcw, BrainCircuit } from 'lucide-react';
import flashcardData from '@/data/flashcards.json';

const MIN_EFACTOR = 1.3;

export default function FlashcardsPage() {
    const { progress, saveFlashcardProgress } = useProgress();
    const [dueCards, setDueCards] = useState<any[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const due = flashcardData.filter(card => {
            const progressData = progress.flashcards?.[card.id];
            if (!progressData) return true;
            return progressData.nextReview <= todayStr;
        });
        setDueCards(due.sort(() => Math.random() - 0.5));
    }, [progress.flashcards]);

    const handleAnswer = async (quality: number) => {
        const currentCard = dueCards[currentCardIndex];
        const cardProgress = progress.flashcards?.[currentCard.id] || { interval: 0, efactor: 2.5 };
        let newEfactor = cardProgress.efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newEfactor = Math.max(MIN_EFACTOR, newEfactor);
        let newInterval;
        if (quality < 3) newInterval = 1;
        else if (cardProgress.interval === 0) newInterval = 1;
        else if (cardProgress.interval === 1) newInterval = 6;
        else newInterval = Math.round(cardProgress.interval * newEfactor);

        await saveFlashcardProgress(currentCard.id, newInterval, newEfactor);
        setIsFlipped(false);
        if (currentCardIndex < dueCards.length - 1) setCurrentCardIndex(prev => prev + 1);
        else setSessionComplete(true);
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-5xl mx-auto px-10 py-10">

                        <div className="mb-10">
                            <span className="text-4xl mb-3 block">🧠</span>
                            <h1 className="text-3xl font-bold text-[var(--notion-text)]">Formula Vault</h1>
                            <p className="text-sm text-[var(--notion-text-secondary)] mt-1">Active recall with spaced repetition</p>
                        </div>

                        {sessionComplete || dueCards.length === 0 ? (
                            <div className="rounded-lg p-12 text-center bg-[var(--notion-bg-secondary)]" style={{ border: '1px solid var(--notion-border)' }}>
                                <span className="text-5xl block mb-4">🎉</span>
                                <h2 className="text-xl font-bold text-[var(--notion-text)] mb-1">All caught up!</h2>
                                <p className="text-sm text-[var(--notion-text-secondary)] mb-5">You&apos;ve reviewed all due formulas for today.</p>
                                <button onClick={() => window.location.reload()}
                                    className="text-sm px-4 py-2 rounded-md font-medium text-[var(--notion-text)] hover:bg-[var(--notion-bg-hover)] transition-colors"
                                    style={{ border: '1px solid var(--notion-border-strong)' }}
                                >
                                    Refresh deck
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                {/* Card counter */}
                                <div className="w-full flex justify-between text-xs text-[var(--notion-text-secondary)] mb-3 px-1">
                                    <span>Card {currentCardIndex + 1} / {dueCards.length}</span>
                                    <span className="px-2 py-0.5 rounded bg-[var(--notion-purple-bg)] text-[var(--notion-purple)] text-[11px] font-medium">{dueCards[currentCardIndex].subject}</span>
                                </div>

                                {/* Flashcard */}
                                <div className="w-full aspect-[2/1] relative cursor-pointer group" style={{ perspective: '1000px' }} onClick={() => setIsFlipped(!isFlipped)}>
                                    <div className={`w-full h-full transition-all duration-500 ${isFlipped ? 'rotate-x-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                                        {/* Front */}
                                        <div className="absolute inset-0 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-[var(--notion-bg)] hover:shadow-md transition-shadow"
                                            style={{ backfaceVisibility: 'hidden', border: '1px solid var(--notion-border)' }}
                                        >
                                            <span className="absolute top-4 left-4 text-xs text-[var(--notion-text-tertiary)]">Question</span>
                                            <h3 className="text-xl font-semibold text-[var(--notion-text)] leading-relaxed">{dueCards[currentCardIndex].front}</h3>
                                            <p className="absolute bottom-4 text-xs text-[var(--notion-text-tertiary)]">Click to reveal</p>
                                        </div>
                                        {/* Back */}
                                        <div className="absolute inset-0 rotate-x-180 rounded-lg p-10 flex flex-col items-center justify-center text-center bg-[var(--notion-blue-bg)]"
                                            style={{ backfaceVisibility: 'hidden', border: '1px solid var(--notion-border)' }}
                                        >
                                            <span className="absolute top-4 left-4 text-xs text-[var(--notion-accent)]">Answer</span>
                                            <h3 className="text-lg font-semibold text-[var(--notion-text)] leading-relaxed">{dueCards[currentCardIndex].back}</h3>
                                        </div>
                                    </div>
                                </div>

                                {/* Rating */}
                                {isFlipped && (
                                    <div className="w-full mt-6">
                                        <p className="text-center text-xs text-[var(--notion-text-secondary)] mb-3">How well did you know this?</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { quality: 1, label: 'Again', color: 'var(--notion-red)', bg: 'var(--notion-red-bg)', icon: X },
                                                { quality: 3, label: 'Hard', color: 'var(--notion-orange)', bg: 'var(--notion-orange-bg)', icon: RotateCcw },
                                                { quality: 4, label: 'Good', color: 'var(--notion-green)', bg: 'var(--notion-green-bg)', icon: Check },
                                                { quality: 5, label: 'Easy', color: 'var(--notion-accent)', bg: 'var(--notion-blue-bg)', icon: BrainCircuit },
                                            ].map(({ quality, label, color, bg, icon: Icon }) => (
                                                <button key={quality}
                                                    onClick={(e) => { e.stopPropagation(); handleAnswer(quality); }}
                                                    className="flex flex-col items-center gap-1 py-3 rounded-md transition-all hover:brightness-[0.95]"
                                                    style={{ backgroundColor: bg, color }}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-xs font-medium">{label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
