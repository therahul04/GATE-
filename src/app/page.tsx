'use client';

import { useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import resources from '../data/resources.json';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { SubjectRadarChart } from '@/components/SubjectRadarChart';
import { usePreferences } from '@/context/PreferencesContext';

const VIDEOS_PER_SUBJECT_PER_DAY = 2;
const ACTIVE_SUBJECTS_COUNT = 3;

function buildSchedule(subjectOrder: number[]) {
    const queues = subjectOrder.map(subjectIdx => {
        const subject = resources[subjectIdx];
        const videos = ((subject?.categories as any)?.['Youtube Videos'] || []).map((v: any) => ({
            ...v, subject: subject.name, subjectIdx
        }));
        return { subjectIdx, name: subject?.name || 'Unknown', videos };
    });
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
            for (let v = 0; v < VIDEOS_PER_SUBJECT_PER_DAY && positions[qi] < queue.videos.length; v++) {
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

export default function Home() {
  const { progress, isCompleted } = useProgress();
  const { preferences } = usePreferences();

  const totalSubjects = resources.length;
  let completedSubjects = 0;

  const subjectProgressMap = resources.map((subject, idx) => {
    let totalItems = 0;
    let completedItems = 0;
    Object.keys(subject.categories).forEach(cat => {
      subject.categories[cat as keyof typeof subject.categories]?.forEach(item => {
        const url = (item as any).url;
        if (url) {
          totalItems++;
          const type = url.includes('youtube.com') ? 'video' : url.includes('gateoverflow.in') ? 'test' : 'read';
          if (isCompleted(type, url)) completedItems++;
        }
      });
    });
    const subjectPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    if (subjectPercentage === 100 && totalItems > 0) completedSubjects++;
    return { ...subject, idx, totalItems, completedItems, subjectPercentage };
  });

  const schedule = useMemo(() => buildSchedule(preferences.subjectOrder), [preferences.subjectOrder]);
  const startDate = useMemo(() => new Date(preferences.startDate), [preferences.startDate]);

  const getTodaysTasksCount = () => {
    let workingDays = 0;
    const s = new Date(startDate); s.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (today.getDay() === 0 || today < s) return { videos: 0, tests: 0, read: 0 };
    const curr = new Date(s);
    while (curr < today) { if (curr.getDay() !== 0) workingDays++; curr.setDate(curr.getDate() + 1); }
    const todaysVideos = workingDays >= 0 && workingDays < schedule.length ? schedule[workingDays] : [];
    const tests = todaysVideos.length > 0 && workingDays > 3 && workingDays % 3 === 0 ? 1 : 0;
    return { videos: todaysVideos.length, tests, read: todaysVideos.length > 0 ? 1 : 0 };
  };

  const todaysTasks = getTodaysTasksCount();
  const totalTrackableItems = subjectProgressMap.reduce((acc, curr) => acc + curr.totalItems, 0);
  const totalCompletedItems = subjectProgressMap.reduce((acc, curr) => acc + curr.completedItems, 0);
  const progressPercentage = totalTrackableItems > 0 ? Math.round((totalCompletedItems / totalTrackableItems) * 100) : 0;

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl mx-auto px-10 py-10">

            {/* Page Title - Notion Style */}
            <div className="mb-10">
              <span className="text-4xl mb-3 block">🎯</span>
              <h1 className="text-3xl font-bold text-[var(--notion-text)]">Dashboard</h1>
              <p className="text-sm text-[var(--notion-text-secondary)] mt-1">Track your GATE IN 2027 preparation progress</p>
            </div>

            {/* Stats - Notion callout style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="rounded-lg p-4 bg-[var(--notion-blue-bg)]">
                <p className="text-xs text-[var(--notion-text-secondary)] mb-1">Overall Progress</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[var(--notion-text)]">{progressPercentage}%</span>
                </div>
                <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full bg-[var(--notion-accent)] rounded-full transition-all" style={{ width: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="rounded-lg p-4 bg-[var(--notion-green-bg)]">
                <p className="text-xs text-[var(--notion-text-secondary)] mb-1">Subjects Completed</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-[var(--notion-text)]">{completedSubjects}</span>
                  <span className="text-sm text-[var(--notion-text-secondary)]">/ {totalSubjects}</span>
                </div>
              </div>

              <Link href="/planner" className="rounded-lg p-4 bg-[var(--notion-yellow-bg)] hover:brightness-[0.97] transition-all group block">
                <p className="text-xs text-[var(--notion-text-secondary)] mb-1">Today&apos;s Session</p>
                {todaysTasks.videos === 0 && todaysTasks.tests === 0 ? (
                  <p className="text-sm font-medium text-[var(--notion-text)]">Rest day 🎉</p>
                ) : (
                  <p className="text-sm font-medium text-[var(--notion-text)]">
                    {todaysTasks.videos > 0 && `${todaysTasks.videos} lectures`}{todaysTasks.tests > 0 && ` · ${todaysTasks.tests} test`}
                  </p>
                )}
                <p className="text-xs text-[var(--notion-text-secondary)] mt-1 group-hover:text-[var(--notion-text)] transition-colors">Open planner →</p>
              </Link>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-10">
              <div className="xl:col-span-2">
                <ActivityHeatmap />
              </div>
              <div className="xl:col-span-1">
                <SubjectRadarChart />
              </div>
            </div>

            {/* Subject List - Notion database view */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--notion-text)] mb-3 flex items-center gap-2">
                📚 All Subjects
              </h2>
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--notion-border)' }}>
                {subjectProgressMap.map((subject, i) => (
                  <Link key={subject.idx} href={`/subjects/${subject.idx}`} className="block">
                    <div
                      className={`flex items-center gap-4 px-4 py-3 hover:bg-[var(--notion-bg-hover)] transition-colors ${i < subjectProgressMap.length - 1 ? '' : ''}`}
                      style={i < subjectProgressMap.length - 1 ? { borderBottom: '1px solid var(--notion-border)' } : {}}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--notion-text)] truncate">{subject.name}</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="w-24 h-1.5 bg-[var(--notion-bg-hover)] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${subject.subjectPercentage === 100 ? 'bg-[var(--notion-green)]' : 'bg-[var(--notion-accent)]'}`}
                            style={{ width: `${subject.subjectPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--notion-text-secondary)] w-10 text-right tabular-nums">{subject.subjectPercentage}%</span>
                        <span className="text-xs text-[var(--notion-text-tertiary)] w-16 text-right">{subject.completedItems}/{subject.totalItems}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
