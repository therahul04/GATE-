'use client';

import { useParams } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProgress } from '@/context/ProgressContext';
import { ArrowLeft, CheckCircle2, Clock, FileText } from 'lucide-react';
import { MarkdownNoteEditor } from '@/components/MarkdownNoteEditor';

export default function TestPage() {
    const params = useParams();
    const decodedUrl = decodeURIComponent(params.id as string);

    const { isCompleted, markAsCompleted } = useProgress();

    // We use the decoded URL as the unique ID for progress tracking
    const completed = isCompleted('test', decodedUrl);

    const handleMarkComplete = async () => {
        if (!completed) {
            await markAsCompleted('test', decodedUrl);
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-black font-sans">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full p-0 text-white relative flex flex-col">
                    <header className="px-8 py-6 border-b border-zinc-900 bg-black/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-zinc-900 rounded-full transition-colors" onClick={() => window.history.back()}>
                                <ArrowLeft className="h-5 w-5 text-zinc-400" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white mb-1">
                                    Mock Test Environment
                                </h1>
                                <p className="text-xs text-gray-500 truncate max-w-xl">{decodedUrl}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleMarkComplete}
                            disabled={completed}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${completed
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 cursor-not-allowed'
                                : 'bg-gray-900 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/80'
                                }`}
                        >
                            <CheckCircle2 className={`h-4 w-4 ${completed ? 'text-emerald-400' : ''}`} />
                            {completed ? 'Score Recorded' : 'Mark as Completed'}
                        </button>
                    </header>

                    <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto">
                        <div className="max-w-4xl w-full text-center space-y-8">

                            {/* Wrapper for the external link callouts */}
                            <div className="border border-zinc-800 bg-zinc-950 p-8 rounded-none">
                                <div className="mx-auto w-24 h-24 bg-black rounded-none flex items-center justify-center border border-zinc-800 shadow-2xl mb-8">
                                    <FileText className="h-10 w-10 text-emerald-500" />
                                </div>

                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-4">External Test Link</h2>
                                    <p className="text-gray-400 leading-relaxed text-lg">
                                        Mock tests and PYQ platforms require specific examination interfaces that cannot be embedded within an iframe.
                                    </p>
                                </div>

                                <div className="bg-black border border-emerald-900/50 rounded-none p-6 flex flex-col sm:flex-row items-center justify-center gap-6 mb-8 mt-8">
                                    <div className="text-left">
                                        <p className="font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                                            <Clock className="w-5 h-5 text-emerald-500" />
                                            Reminder
                                        </p>
                                        <p className="text-sm text-zinc-500 mt-1 font-medium">Ensure you have 3 hours of uninterrupted time before starting a full-length mock.</p>
                                    </div>
                                </div>

                                <a
                                    href={decodedUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-none font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                                >
                                    Open Test Platform
                                </a>
                            </div>

                            {/* Note Editor */}
                            <div className="text-left border-t border-zinc-900 pt-8">
                                <h3 className="text-xl font-black tracking-tighter text-white uppercase mb-2">Post-Test Analysis Notes</h3>
                                <p className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-4">Space for equations, weaknesses, and strategies</p>
                                <MarkdownNoteEditor resourceId={decodedUrl} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
