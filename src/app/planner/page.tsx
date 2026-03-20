'use client';

import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, PlayCircle, BookOpen } from 'lucide-react';
import { useProgress } from '@/context/ProgressContext';
import { usePreferences } from '@/context/PreferencesContext';
import Link from 'next/link';
import resources from '@/data/resources.json';

const VIDEOS_PER_SUBJECT_PER_DAY = 2;
const ACTIVE_SUBJECTS_COUNT = 3;
const DEFAULT_VIDEOS_PER_DAY = ACTIVE_SUBJECTS_COUNT * VIDEOS_PER_SUBJECT_PER_DAY; // 6

/**
 * Count total working days (Mon–Sat) between two Date objects (exclusive end).
 */
function countWorkingDays(start: Date, end: Date): number {
    let days = 0;
    const curr = new Date(start);
    curr.setHours(0, 0, 0, 0);
    const endMidnight = new Date(end);
    endMidnight.setHours(0, 0, 0, 0);
    while (curr < endMidnight) {
        if (curr.getDay() !== 0) days++;
        curr.setDate(curr.getDate() + 1);
    }
    return days;
}

function buildSchedule(subjectOrder: number[], startDate: Date, endDate: Date | null) {
    // Build per-subject video queues
    const queues = subjectOrder.map(subjectIdx => {
        const subject = resources[subjectIdx];
        const videos = ((subject?.categories as any)?.['Youtube Videos'] || []).map((v: any) => ({
            ...v, subject: subject.name, subjectIdx
        }));
        return { subjectIdx, name: subject?.name || 'Unknown', videos };
    });

    // Decide how many videos to assign per day
    let videosPerDay = DEFAULT_VIDEOS_PER_DAY;
    if (endDate && endDate > startDate) {
        const availableWorkingDays = countWorkingDays(startDate, endDate);
        if (availableWorkingDays > 0) {
            const totalVideos = queues.reduce((sum, q) => sum + q.videos.length, 0);
            // At least DEFAULT_VIDEOS_PER_DAY, but increase if needed to fit the window
            videosPerDay = Math.max(DEFAULT_VIDEOS_PER_DAY, Math.ceil(totalVideos / availableWorkingDays));
        }
    }

    // Determine videos per subject per day based on active subjects
    // We distribute videosPerDay evenly across ACTIVE_SUBJECTS_COUNT active subjects
    const vidPerSubject = Math.max(1, Math.round(videosPerDay / ACTIVE_SUBJECTS_COUNT));

    const positions = queues.map(() => 0);
    const schedule: Array<Array<{ url: string; text: string; subject: string; subjectIdx: number }>> = [];
    let windowStart = 0;
    while (windowStart < queues.length) {
        const dayVideos: Array<{ url: string; text: string; subject: string; subjectIdx: number }> = [];
        const activeIndices: number[] = [];
        for (let i = windowStart; i < queues.length && activeIndices.length < ACTIVE_SUBJECTS_COUNT; i++) {
            if (positions[i] < queues[i].videos.length) activeIndices.push(i);
        }
        if (activeIndices.length === 0) break;
        for (const qi of activeIndices) {
            const queue = queues[qi];
            for (let v = 0; v < vidPerSubject && positions[qi] < queue.videos.length; v++) {
                dayVideos.push(queue.videos[positions[qi]]);
                positions[qi]++;
            }
        }
        schedule.push(dayVideos);
        while (windowStart < queues.length && positions[windowStart] >= queues[windowStart].videos.length) {
            windowStart++;
        }
    }
    return schedule;
}

export default function PlannerPage() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(today);
    const [extraVideosCount, setExtraVideosCount] = useState(0);
    const { isCompleted } = useProgress();
    const { preferences } = usePreferences();

    const startDate = useMemo(() => new Date(preferences.startDate), [preferences.startDate]);
    const endDate = useMemo(() => preferences.endDate ? new Date(preferences.endDate) : null, [preferences.endDate]);
    const schedule = useMemo(() => buildSchedule(preferences.subjectOrder, startDate, endDate), [preferences.subjectOrder, startDate, endDate]);

    // Days remaining until endDate
    const daysRemaining = useMemo(() => {
        if (!endDate) return null;
        const todayMidnight = new Date(today); todayMidnight.setHours(0, 0, 0, 0);
        const endMidnight = new Date(endDate); endMidnight.setHours(0, 0, 0, 0);
        return Math.ceil((endMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
    }, [endDate]);

    const calculateWorkingDays = (targetDate: Date) => {
        let days = 0;
        const s = new Date(startDate); s.setHours(0, 0, 0, 0);
        const t = new Date(targetDate); t.setHours(0, 0, 0, 0);
        if (t < s) return -1;
        const curr = new Date(s);
        while (curr < t) { if (curr.getDay() !== 0) days++; curr.setDate(curr.getDate() + 1); }
        return days;
    };

    const getVideosForWorkingDay = (wd: number) => {
        if (wd < 0 || wd >= schedule.length) return [];
        return schedule[wd];
    };

    const getTasksForDate = (date: Date) => {
        if (date.getDay() === 0) return [];
        const workingDays = calculateWorkingDays(date);
        if (workingDays < 0) return [];
        const isToday = date.toDateString() === today.toDateString();
        const todaysVideos = getVideosForWorkingDay(workingDays);
        const tasks: any[] = [];

        if (isToday) {
            for (let i = 0; i < workingDays; i++) {
                getVideosForWorkingDay(i).forEach((v: any) => {
                    if (!isCompleted('video', v.url)) {
                        tasks.push({ type: 'video', resource: { name: v.subject }, title: `[Backlog] ${v.text}`, subjectIdx: v.subjectIdx, url: v.url, status: 'pending', isRevision: false, isBacklog: true });
                    }
                });
            }
        }

        todaysVideos.forEach((v: any) => {
            tasks.push({ type: 'video', resource: { name: v.subject }, title: v.text, subjectIdx: v.subjectIdx, url: v.url, status: 'pending', isRevision: false });
        });

        if (isToday && extraVideosCount > 0) {
            getVideosForWorkingDay(workingDays + 1).slice(0, extraVideosCount).forEach((v: any) => {
                tasks.push({ type: 'video', resource: { name: v.subject }, title: `[Bonus] ${v.text}`, subjectIdx: v.subjectIdx, url: v.url, status: 'pending', isRevision: false });
            });
        }

        const addRevisionTasks = (daysAgo: number, label: string) => {
            if (workingDays < daysAgo) return;
            const pastDate = new Date(date); pastDate.setDate(date.getDate() - daysAgo);
            if (pastDate.getDay() !== 0) {
                const pastWd = calculateWorkingDays(pastDate);
                if (pastWd >= 0) {
                    getVideosForWorkingDay(pastWd).slice(0, 1).forEach((v: any) => {
                        tasks.push({ type: 'video', resource: { name: v.subject }, title: `[Review: ${label}] ${v.text}`, subjectIdx: v.subjectIdx, url: v.url.includes('?') ? `${v.url}&rev=true` : `${v.url}?rev=true`, status: 'pending', isRevision: true });
                    });
                }
            }
        };
        addRevisionTasks(1, '1d ago'); addRevisionTasks(3, '3d ago'); addRevisionTasks(7, '1w ago');

        if (todaysVideos.length > 0 && workingDays > 3 && workingDays % 3 === 0) {
            tasks.push({ type: 'test', resource: resources[todaysVideos[0].subjectIdx], subjectIdx: todaysVideos[0].subjectIdx, title: 'PYQ Practice', status: 'pending', isRevision: false });
        }
        return tasks;
    };

    const displayTasks = getTasksForDate(selectedDate);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const selectedWd = calculateWorkingDays(selectedDate);
    const activeSubjects = [...new Set(getVideosForWorkingDay(selectedWd).map(v => v.subject))];

    const renderCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
            let dayStatus = 'none';
            if (isPast && date.getDay() !== 0) {
                const wd = calculateWorkingDays(date);
                if (wd >= 0) {
                    const vids = getVideosForWorkingDay(wd);
                    if (vids.length > 0) dayStatus = vids.every((v: any) => isCompleted('video', v.url)) ? 'completed' : 'missed';
                }
            }
            days.push(
                <button key={i} onClick={() => setSelectedDate(date)}
                    className={`h-9 w-9 rounded-md flex flex-col items-center justify-center text-sm transition-all relative ${isSelected
                        ? 'bg-[var(--notion-text)] text-white font-medium'
                        : isToday
                            ? 'bg-[var(--notion-accent-light)] text-[var(--notion-accent)] font-medium'
                            : date.getDay() === 0
                                ? 'text-[var(--notion-text-tertiary)]'
                                : 'text-[var(--notion-text)] hover:bg-[var(--notion-bg-hover)]'
                    }`}
                >
                    <span className="text-xs">{i}</span>
                    {dayStatus !== 'none' && !isSelected && (
                        <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${dayStatus === 'completed' ? 'bg-[var(--notion-green)]' : 'bg-[var(--notion-red)]'}`} />
                    )}
                </button>
            );
        }
        return days;
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-10 py-10 flex flex-col xl:flex-row gap-10">

                        {/* Left: Tasks */}
                        <div className="flex-1">
                            <div className="mb-8">
                                <span className="text-4xl mb-3 block">📅</span>
                                <h1 className="text-3xl font-bold text-[var(--notion-text)]">Study Planner</h1>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--notion-blue-bg)] text-[var(--notion-blue)] font-medium">Adaptive schedule</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--notion-purple-bg)] text-[var(--notion-purple)] font-medium">Spaced repetition</span>
                                    {daysRemaining !== null && (
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                            daysRemaining < 0
                                                ? 'bg-[var(--notion-red-bg)] text-[var(--notion-red)]'
                                                : daysRemaining <= 30
                                                    ? 'bg-[var(--notion-orange-bg)] text-[var(--notion-orange)]'
                                                    : 'bg-[var(--notion-green-bg)] text-[var(--notion-green)]'
                                        }`}>
                                            {daysRemaining < 0
                                                ? `⚠️ Deadline passed ${Math.abs(daysRemaining)}d ago`
                                                : daysRemaining === 0
                                                    ? '🎯 Exam day!'
                                                    : `🎯 ${daysRemaining}d until deadline`}
                                        </span>
                                    )}
                                </div>
                                {activeSubjects.length > 0 && (
                                    <div className="flex gap-1.5 flex-wrap mt-3">
                                        {activeSubjects.map(name => (
                                            <span key={name} className="text-[11px] px-2 py-0.5 rounded bg-[var(--notion-green-bg)] text-[var(--notion-green)] font-medium">{name}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <h2 className="text-base font-semibold text-[var(--notion-text)] mb-4">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>

                            {displayTasks.length > 0 ? (
                                <div className="space-y-0.5">
                                    {displayTasks.map((task, idx) => {
                                        const taskId = task.type === 'video' ? task.url : task.type === 'test' ? (task.url || 'https://gateoverflow.in/') : `${task.subjectIdx}-${task.title}`;
                                        const completed = isCompleted(task.type, taskId);

                                        return (
                                            <div key={idx} className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors hover:bg-[var(--notion-bg-hover)] group ${completed ? 'opacity-50' : ''}`}>
                                                <div className="flex-shrink-0">
                                                    {completed ? (
                                                        <CheckCircle2 className="h-4 w-4 text-[var(--notion-green)]" />
                                                    ) : task.isRevision ? (
                                                        <RotateCcw className="h-4 w-4 text-[var(--notion-orange)]" />
                                                    ) : task.isBacklog ? (
                                                        <div className="h-4 w-4 rounded border-2 border-[var(--notion-red)]" />
                                                    ) : task.type === 'video' ? (
                                                        <PlayCircle className="h-4 w-4 text-[var(--notion-accent)]" />
                                                    ) : (
                                                        <BookOpen className="h-4 w-4 text-[var(--notion-green)]" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm truncate ${completed ? 'line-through text-[var(--notion-text-secondary)]' : task.isBacklog ? 'text-[var(--notion-red)]' : task.isRevision ? 'text-[var(--notion-orange)]' : 'text-[var(--notion-text)]'}`}>{task.title}</p>
                                                    <p className="text-[11px] text-[var(--notion-text-tertiary)]">{task.resource.name}</p>
                                                </div>
                                                <Link
                                                    href={task.type === 'video' ? `/watch/${encodeURIComponent(task.url)}` : task.type === 'test' ? `/test/${encodeURIComponent(task.url || 'https://gateoverflow.in/')}` : `/subjects/${task.subjectIdx}`}
                                                    className="text-xs text-[var(--notion-accent)] hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                >
                                                    {completed ? 'Review' : 'Start →'}
                                                </Link>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-lg p-10 text-center bg-[var(--notion-bg-secondary)]" style={{ border: '1px solid var(--notion-border)' }}>
                                    <p className="text-sm text-[var(--notion-text-secondary)]">🌤️ Rest day — no tasks scheduled</p>
                                </div>
                            )}

                            {selectedDate.toDateString() === today.toDateString() && displayTasks.length > 0 && displayTasks.every(t => {
                                const taskId = t.type === 'video' ? t.url : t.type === 'test' ? (t.url || 'https://gateoverflow.in/') : `${t.subjectIdx}-${t.title}`;
                                return isCompleted(t.type, taskId);
                            }) && (
                                <div className="mt-6 rounded-lg p-5 bg-[var(--notion-green-bg)]" style={{ border: '1px solid var(--notion-border)' }}>
                                    <p className="text-sm font-medium text-[var(--notion-green)] mb-2">✅ All caught up!</p>
                                    <p className="text-xs text-[var(--notion-text-secondary)] mb-3">You&apos;ve finished today&apos;s tasks. Want to get ahead?</p>
                                    <button onClick={() => setExtraVideosCount(prev => prev + 1)}
                                        className="text-xs px-3 py-1.5 rounded-md bg-[var(--notion-bg)] text-[var(--notion-text)] hover:bg-[var(--notion-bg-hover)] transition-colors font-medium"
                                        style={{ border: '1px solid var(--notion-border-strong)' }}
                                    >
                                        Add more videos
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Calendar */}
                        <div className="w-full xl:w-[300px] flex-shrink-0">
                            <div className="sticky top-12 rounded-lg p-5" style={{ border: '1px solid var(--notion-border)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-[var(--notion-text)]">
                                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                    </h3>
                                    <div className="flex gap-1">
                                        <button onClick={prevMonth} className="p-1 rounded hover:bg-[var(--notion-bg-hover)] transition-colors">
                                            <ChevronLeft className="h-4 w-4 text-[var(--notion-text-secondary)]" />
                                        </button>
                                        <button onClick={nextMonth} className="p-1 rounded hover:bg-[var(--notion-bg-hover)] transition-colors">
                                            <ChevronRight className="h-4 w-4 text-[var(--notion-text-secondary)]" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-medium text-[var(--notion-text-tertiary)]">
                                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 place-items-center">
                                    {renderCalendarDays()}
                                </div>

                                <div className="mt-4 pt-4 space-y-2" style={{ borderTop: '1px solid var(--notion-border)' }}>
                                    <div className="flex items-center gap-2 text-[11px] text-[var(--notion-text-secondary)]">
                                        <span className="w-2 h-2 rounded-full bg-[var(--notion-green)]" /> Completed
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-[var(--notion-text-secondary)]">
                                        <span className="w-2 h-2 rounded-full bg-[var(--notion-red)]" /> Missed
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
