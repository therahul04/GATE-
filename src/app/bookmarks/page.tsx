'use client';

import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProgress } from '@/context/ProgressContext';
import resources from '@/data/resources.json';
import { CheckCircle2, Star, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function BookmarksPage() {
    const { progress, isCompleted, toggleBookmark } = useProgress();

    const allBookmarks = useMemo(() => {
        const bookmarks: { id: string; type: 'video' | 'test' | 'read'; text: string; url: string; subjectName: string }[] = [];
        resources.forEach(subject => {
            Object.values(subject.categories || {}).forEach((items: any) => {
                items.forEach((item: any) => {
                    if (!item.url) return;
                    const type = item.url.includes('youtube.com') ? 'video' : item.url.includes('gateoverflow.in') ? 'test' : 'read';
                    if (
                        (type === 'video' && progress.bookmarkedVideos?.includes(item.url)) ||
                        (type === 'test' && progress.bookmarkedTests?.includes(item.url)) ||
                        (type === 'read' && progress.bookmarkedReads?.includes(item.url))
                    ) {
                        if (!bookmarks.find(b => b.url === item.url)) {
                            bookmarks.push({ id: item.url, type, text: item.text || 'Resource Link', url: item.url, subjectName: subject.name });
                        }
                    }
                });
            });
        });
        return bookmarks;
    }, [progress, resources]);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-10 py-10">

                        <div className="mb-8">
                            <span className="text-4xl mb-3 block">⭐</span>
                            <h1 className="text-3xl font-bold text-[var(--notion-text)]">Review Later</h1>
                            <p className="text-sm text-[var(--notion-text-secondary)] mt-1">
                                Quick-access list for difficult topics and critical resources.
                            </p>
                        </div>

                        {allBookmarks.length === 0 ? (
                            <div className="rounded-lg p-12 text-center bg-[var(--notion-bg-secondary)]" style={{ border: '1px solid var(--notion-border)' }}>
                                <span className="text-4xl block mb-3">📌</span>
                                <h3 className="text-base font-semibold text-[var(--notion-text)] mb-1">No bookmarks yet</h3>
                                <p className="text-sm text-[var(--notion-text-secondary)]">Star any video, chapter, or test to save it here.</p>
                            </div>
                        ) : (
                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--notion-border)' }}>
                                {allBookmarks.map((item, i) => {
                                    const isDone = isCompleted(item.type, item.url);
                                    return (
                                        <div key={i}
                                            className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--notion-bg-hover)] transition-colors group ${isDone ? 'opacity-50' : ''}`}
                                            style={i < allBookmarks.length - 1 ? { borderBottom: '1px solid var(--notion-border)' } : {}}
                                        >
                                            <div className="flex-shrink-0">
                                                {isDone ? <CheckCircle2 className="h-4 w-4 text-[var(--notion-green)]" /> : <Star className="h-4 w-4 text-[var(--notion-yellow)] fill-[var(--notion-yellow)]" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-[var(--notion-text-secondary)]' : 'text-[var(--notion-text)]'}`}>{item.text}</p>
                                                <p className="text-[11px] text-[var(--notion-text-tertiary)]">{item.subjectName}</p>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.type === 'video' ? (
                                                    <Link href={`/watch/${encodeURIComponent(item.url)}`}
                                                        className="text-xs text-[var(--notion-accent)] hover:underline px-1">Open</Link>
                                                ) : item.type === 'test' ? (
                                                    <Link href={`/test/${encodeURIComponent(item.url)}`}
                                                        className="text-xs text-[var(--notion-accent)] hover:underline px-1">Open</Link>
                                                ) : null}
                                                <button onClick={() => toggleBookmark(item.type, item.url)}
                                                    className="p-1 rounded hover:bg-[var(--notion-red-bg)] text-[var(--notion-text-tertiary)] hover:text-[var(--notion-red)] transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
