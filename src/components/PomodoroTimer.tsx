'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, BrainCircuit } from 'lucide-react';

export function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (!isBreak) {
                setIsBreak(true);
                setTimeLeft(5 * 60);
            } else {
                setIsBreak(false);
                setTimeLeft(25 * 60);
            }
            try {
                const audio = new Audio('/bell.mp3');
                audio.play().catch(() => { });
            } catch (e) { }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, isBreak]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => { setIsActive(false); setIsBreak(false); setTimeLeft(25 * 60); };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const totalTime = isBreak ? 5 * 60 : 25 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    return (
        <div className="rounded-lg p-3" style={{ border: '1px solid var(--notion-border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
                {isBreak ? (
                    <Coffee className="w-3.5 h-3.5 text-[var(--notion-green)]" />
                ) : (
                    <BrainCircuit className="w-3.5 h-3.5 text-[var(--notion-blue)]" />
                )}
                <span className="text-[11px] font-medium text-[var(--notion-text-secondary)]">
                    {isBreak ? 'Break' : 'Focus'}
                </span>
            </div>

            <div className="text-center">
                <div className="text-2xl font-semibold tabular-nums text-[var(--notion-text)]">
                    {formatTime(timeLeft)}
                </div>
                <div className="w-full h-1 bg-[var(--notion-bg-hover)] mt-2 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-1000 ease-linear rounded-full"
                        style={{
                            width: `${progress}%`,
                            backgroundColor: isBreak ? 'var(--notion-green)' : 'var(--notion-accent)'
                        }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
                <button
                    onClick={toggleTimer}
                    className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[var(--notion-bg-hover)]"
                    style={{ border: '1px solid var(--notion-border)' }}
                >
                    {isActive ? <Pause className="w-3.5 h-3.5 text-[var(--notion-text)]" /> : <Play className="w-3.5 h-3.5 text-[var(--notion-text)] ml-0.5" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-[var(--notion-bg-hover)]"
                    style={{ border: '1px solid var(--notion-border)' }}
                >
                    <RotateCcw className="w-3.5 h-3.5 text-[var(--notion-text-secondary)]" />
                </button>
            </div>
        </div>
    );
}
