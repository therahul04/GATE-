'use client';

import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import resources from '@/data/resources.json';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';

export default function SubjectsPage() {
    const { isCompleted } = useProgress();

    const subjectData = resources.map((subject, idx) => {
        let totalItems = 0;
        let completedItems = 0;
        Object.keys(subject.categories).forEach(cat => {
            (subject.categories as any)[cat]?.forEach((item: any) => {
                if (item.url) {
                    totalItems++;
                    const type = item.url.includes('youtube.com') ? 'video' : item.url.includes('gateoverflow.in') ? 'test' : 'read';
                    if (isCompleted(type, item.url)) completedItems++;
                }
            });
        });
        const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        return { ...subject, idx, totalItems, completedItems, pct };
    });

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-10 py-10">

                        <div className="mb-8">
                            <span className="text-4xl mb-3 block">📚</span>
                            <h1 className="text-3xl font-bold text-[var(--notion-text)]">GATE IN Subjects</h1>
                            <p className="text-sm text-[var(--notion-text-secondary)] mt-1">
                                Browse all {resources.length} subjects with video lectures, textbooks, and practice questions.
                            </p>
                        </div>

                        {/* Database-style table view */}
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--notion-border)' }}>
                            {/* Table header */}
                            <div className="flex items-center gap-4 px-4 py-2 bg-[var(--notion-bg-secondary)]" style={{ borderBottom: '1px solid var(--notion-border)' }}>
                                <span className="flex-1 text-xs font-medium text-[var(--notion-text-secondary)] uppercase tracking-wide">Subject</span>
                                <span className="w-20 text-xs font-medium text-[var(--notion-text-secondary)] uppercase tracking-wide text-center">Videos</span>
                                <span className="w-24 text-xs font-medium text-[var(--notion-text-secondary)] uppercase tracking-wide text-center">Progress</span>
                                <span className="w-16 text-xs font-medium text-[var(--notion-text-secondary)] uppercase tracking-wide text-right">Status</span>
                            </div>

                            {subjectData.map((subject, i) => {
                                const videoCount = (subject.categories as any)['Youtube Videos']?.length || 0;

                                return (
                                    <Link key={subject.idx} href={`/subjects/${subject.idx}`} className="block">
                                        <div
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--notion-bg-hover)] transition-colors cursor-pointer"
                                            style={i < subjectData.length - 1 ? { borderBottom: '1px solid var(--notion-border)' } : {}}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--notion-text)] truncate">{subject.name}</p>
                                            </div>
                                            <div className="w-20 text-center">
                                                <span className="text-xs text-[var(--notion-text-secondary)]">{videoCount}</span>
                                            </div>
                                            <div className="w-24 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-[var(--notion-bg-hover)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${subject.pct}%`,
                                                            backgroundColor: subject.pct === 100 ? 'var(--notion-green)' : 'var(--notion-accent)'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-[var(--notion-text-secondary)] tabular-nums w-8 text-right">{subject.pct}%</span>
                                            </div>
                                            <div className="w-16 text-right">
                                                {subject.pct === 100 ? (
                                                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--notion-green-bg)] text-[var(--notion-green)]">Done</span>
                                                ) : subject.pct > 0 ? (
                                                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--notion-blue-bg)] text-[var(--notion-blue)]">Active</span>
                                                ) : (
                                                    <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--notion-bg-hover)] text-[var(--notion-text-tertiary)]">Todo</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
