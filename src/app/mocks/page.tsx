'use client';

import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProgress } from '@/context/ProgressContext';
import resources from '@/data/resources.json';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function MocksPage() {
    const { isCompleted } = useProgress();

    const allTests = useMemo(() => {
        const tests: { id: string; text: string; url: string; subjectName: string }[] = [];
        resources.forEach(subject => {
            if ((subject.categories as any)['Previous Year Questions (PYQs)']) {
                (subject.categories as any)['Previous Year Questions (PYQs)'].forEach((item: any) => {
                    if (item.url) {
                        tests.push({ id: item.url, text: item.text, url: item.url, subjectName: subject.name });
                    }
                });
            }
        });
        tests.unshift(
            { id: 'full-mock-3', text: 'GATE 2027 Full Length Mock 3', url: 'https://gateoverflow.in/', subjectName: 'Full Syllabus' },
            { id: 'full-mock-2', text: 'GATE 2027 Full Length Mock 2', url: 'https://gateoverflow.in/', subjectName: 'Full Syllabus' },
            { id: 'full-mock-1', text: 'GATE 2027 Full Length Mock 1', url: 'https://gateoverflow.in/', subjectName: 'Full Syllabus' },
        );
        return tests;
    }, []);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-10 py-10">

                        <div className="mb-8">
                            <span className="text-4xl mb-3 block">✏️</span>
                            <h1 className="text-3xl font-bold text-[var(--notion-text)]">Mock Tests & PYQs</h1>
                            <p className="text-sm text-[var(--notion-text-secondary)] mt-1">
                                Access topic-wise PYQs and full-length exam simulations.
                            </p>
                        </div>

                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--notion-border)' }}>
                            {allTests.map((test, i) => {
                                const isDone = isCompleted('test', test.url);
                                return (
                                    <Link key={test.id + i} href={`/test/${encodeURIComponent(test.url)}`} className="block">
                                        <div
                                            className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--notion-bg-hover)] transition-colors ${isDone ? 'opacity-50' : ''}`}
                                            style={i < allTests.length - 1 ? { borderBottom: '1px solid var(--notion-border)' } : {}}
                                        >
                                            <div className="flex-shrink-0">
                                                {isDone ? (
                                                    <CheckCircle2 className="h-4 w-4 text-[var(--notion-green)]" />
                                                ) : (
                                                    <div className="h-4 w-4 rounded border border-[var(--notion-border-strong)]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-[var(--notion-text-secondary)]' : 'text-[var(--notion-text)]'}`}>
                                                    {test.text}
                                                </p>
                                            </div>
                                            <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--notion-bg-hover)] text-[var(--notion-text-secondary)] flex-shrink-0">
                                                {test.subjectName}
                                            </span>
                                            <ChevronRight className="h-3.5 w-3.5 text-[var(--notion-text-tertiary)] flex-shrink-0" />
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
