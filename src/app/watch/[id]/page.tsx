'use client';

import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProgress } from '@/context/ProgressContext';
import { ArrowLeft, CheckCircle2, Bookmark } from 'lucide-react';
import { MarkdownNoteEditor } from '@/components/MarkdownNoteEditor';

export default function WatchPage() {
    const params = useParams();
    const decodedUrl = decodeURIComponent(params.id as string);
    const isRevision = decodedUrl.includes('?rev=true');
    const actualUrl = isRevision ? decodedUrl.replace('?rev=true', '') : decodedUrl;

    const getEmbedUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.searchParams.has('v')) return `https://www.youtube.com/embed/${urlObj.searchParams.get('v')}`;
            if (urlObj.searchParams.has('list')) return `https://www.youtube.com/embed/videoseries?list=${urlObj.searchParams.get('list')}`;
            if (urlObj.hostname === 'youtu.be') return `https://www.youtube.com/embed${urlObj.pathname}`;
        } catch (e) { console.error("Invalid URL:", e); }
        return url;
    };

    const embedUrl = getEmbedUrl(actualUrl);
    const { isCompleted, markAsCompleted, isBookmarked, toggleBookmark } = useProgress();
    const completed = isCompleted('video', decodedUrl);
    const bookmarked = isBookmarked('video', actualUrl);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full flex flex-col">
                    {/* Header */}
                    <header className="px-6 py-3 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--notion-border)' }}>
                        <div className="flex items-center gap-3">
                            <button className="p-1.5 rounded-md hover:bg-[var(--notion-bg-hover)] transition-colors" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-4 w-4 text-[var(--notion-text-secondary)]" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-sm font-semibold text-[var(--notion-text)]">Lecture Player</h1>
                                <p className="text-xs text-[var(--notion-text-tertiary)] truncate max-w-lg">{decodedUrl}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggleBookmark('video', actualUrl)}
                                className={`p-1.5 rounded-md transition-colors ${bookmarked
                                    ? 'bg-[var(--notion-yellow-bg)] text-[var(--notion-yellow)]'
                                    : 'hover:bg-[var(--notion-bg-hover)] text-[var(--notion-text-secondary)]'}`}
                                title={bookmarked ? "Remove Bookmark" : "Bookmark"}
                            >
                                <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={() => !completed && markAsCompleted('video', decodedUrl)} disabled={completed}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${completed
                                    ? 'bg-[var(--notion-green-bg)] text-[var(--notion-green)] cursor-default'
                                    : 'text-[var(--notion-text)] hover:bg-[var(--notion-bg-hover)]'}`}
                                style={!completed ? { border: '1px solid var(--notion-border-strong)' } : {}}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {completed ? 'Completed' : 'Mark complete'}
                            </button>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-5xl mx-auto space-y-6">
                            <div className="w-full aspect-video rounded-lg overflow-hidden bg-[var(--notion-bg-secondary)] relative" style={{ border: '1px solid var(--notion-border)' }}>
                                {embedUrl !== actualUrl ? (
                                    <iframe src={embedUrl} className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center flex-col p-8 text-center">
                                        <p className="text-sm text-[var(--notion-text-secondary)] mb-3">This resource cannot be embedded.</p>
                                        <a href={actualUrl} target="_blank" rel="noreferrer"
                                            className="text-sm px-4 py-2 rounded-md font-medium text-[var(--notion-accent)] hover:bg-[var(--notion-accent-light)] transition-colors"
                                            style={{ border: '1px solid var(--notion-border-strong)' }}
                                        >
                                            Open in new tab →
                                        </a>
                                    </div>
                                )}
                            </div>
                            <MarkdownNoteEditor resourceId={actualUrl} />
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
