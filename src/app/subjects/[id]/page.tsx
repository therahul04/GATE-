'use client';

import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import resources from '@/data/resources.json';
import { useState } from 'react';
import { CheckCircle2, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useProgress } from '@/context/ProgressContext';

export default function SubjectPage() {
    const params = useParams();
    const id = parseInt(params.id as string);
    const subject = (resources as any[])[id];

    const [activeTab, setActiveTab] = useState(Object.keys(subject?.categories || {})[0] || '');
    const { isCompleted, toggleBookmark, isBookmarked } = useProgress();

    if (!subject) return (
        <div className="flex h-screen items-center justify-center bg-[var(--notion-bg)] text-[var(--notion-text)]">Subject not found</div>
    );

    const categories = Object.keys(subject.categories);

    let totalItems = 0;
    let completedItems = 0;
    categories.forEach(cat => {
        subject.categories[cat]?.forEach((item: any) => {
            if (item.url) {
                totalItems++;
                const type = item.url.includes('youtube.com') ? 'video' : item.url.includes('gateoverflow.in') ? 'test' : 'read';
                if (isCompleted(type, item.url)) completedItems++;
            }
        });
    });
    const subjectPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Emoji map for categories
    const getCatEmoji = (cat: string) => {
        if (cat.includes('Video') || cat.includes('NPTEL')) return '🎥';
        if (cat.includes('Book') || cat.includes('Textbook') || cat.includes('Reference')) return '📖';
        if (cat.includes('PYQ') || cat.includes('Question') || cat.includes('Test')) return '✏️';
        return '📄';
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-6xl mx-auto px-10 py-10">

                        {/* Breadcrumb */}
                        <div className="mb-6">
                            <Link href="/subjects" className="text-sm text-[var(--notion-text-secondary)] hover:text-[var(--notion-text)] transition-colors">
                                ← Back to Subjects
                            </Link>
                        </div>

                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-[var(--notion-text)]">{subject.name}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--notion-text-secondary)]">
                                <span>{categories.length} categories</span>
                                <span>·</span>
                                <span>{completedItems}/{totalItems} completed</span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                    <span>{subjectPercentage}%</span>
                                </span>
                            </div>
                            <div className="mt-3 w-full h-1.5 bg-[var(--notion-bg-hover)] rounded-full overflow-hidden max-w-xs">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${subjectPercentage}%`,
                                        backgroundColor: subjectPercentage === 100 ? 'var(--notion-green)' : 'var(--notion-accent)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-1 mb-6 flex-wrap" style={{ borderBottom: '1px solid var(--notion-border)' }}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`text-sm px-3 py-2 transition-colors relative ${activeTab === cat
                                        ? 'text-[var(--notion-text)] font-medium'
                                        : 'text-[var(--notion-text-secondary)] hover:text-[var(--notion-text)]'
                                    }`}
                                >
                                    <span className="mr-1.5">{getCatEmoji(cat)}</span>
                                    {cat}
                                    {activeTab === cat && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--notion-text)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Items List */}
                        <div className="space-y-0.5">
                            {subject.categories[activeTab]?.map((item: { url?: string, text?: string }, index: number) => {
                                const type = item.url?.includes('youtube.com') ? 'video' : item.url?.includes('gateoverflow.in') ? 'test' : 'read';
                                const isDone = item.url ? isCompleted(type, item.url) : false;

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md group transition-colors hover:bg-[var(--notion-bg-hover)] ${isDone ? 'opacity-60' : ''}`}
                                    >
                                        {/* Checkbox */}
                                        <div className="flex-shrink-0">
                                            {isDone ? (
                                                <CheckCircle2 className="h-4 w-4 text-[var(--notion-green)]" />
                                            ) : (
                                                <div className="h-4 w-4 rounded border border-[var(--notion-border-strong)]" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm text-[var(--notion-text)] truncate ${isDone ? 'line-through text-[var(--notion-text-secondary)]' : ''}`}>
                                                {item.text || `Resource ${index + 1}`}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.url && (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(type, item.url as string); }}
                                                    className={`p-1 rounded hover:bg-[var(--notion-bg-active)] transition-colors ${isBookmarked(type, item.url) ? 'text-[var(--notion-yellow)]' : 'text-[var(--notion-text-tertiary)]'}`}
                                                >
                                                    <Star className={`h-3.5 w-3.5 ${isBookmarked(type, item.url) ? 'fill-current' : ''}`} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Open Link */}
                                        {item.url && item.url.includes('youtube.com') ? (
                                            <Link
                                                href={`/watch/${encodeURIComponent(item.url)}`}
                                                className="text-xs text-[var(--notion-accent)] hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0"
                                            >
                                                Open <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        ) : item.url && item.url.includes('gateoverflow.in') ? (
                                            <Link
                                                href={`/test/${encodeURIComponent(item.url)}`}
                                                className="text-xs text-[var(--notion-accent)] hover:underline opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0"
                                            >
                                                Open <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
