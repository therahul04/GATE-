'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--notion-bg)]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--notion-text)] border-t-transparent"></div>
            </div>
        );
    }

    if (user) return null;

    return (
        <div className="flex min-h-screen bg-[var(--notion-bg)]">
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <span className="text-4xl">📖</span>
                        <h1 className="mt-4 text-3xl font-bold text-[var(--notion-text)]">GATE IN 2027</h1>
                        <p className="mt-2 text-sm text-[var(--notion-text-secondary)]">
                            Your personalized preparation workspace. Track progress, manage study plans, and follow a structured syllabus timeline.
                        </p>
                    </div>

                    <button
                        onClick={signInWithGoogle}
                        className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--notion-text)] transition-colors hover:bg-[var(--notion-bg-hover)]"
                        style={{ border: '1px solid var(--notion-border-strong)' }}
                    >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="mt-6 text-center text-xs text-[var(--notion-text-tertiary)]">
                        Your data is stored securely in the cloud
                    </p>
                </div>
            </div>

            {/* Right decorative panel */}
            <div className="relative hidden w-0 flex-1 lg:block bg-[var(--notion-sidebar-bg)]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-12">
                        <span className="text-7xl block mb-6">🚀</span>
                        <h2 className="text-2xl font-bold text-[var(--notion-text)] mb-2">Prepare Smarter</h2>
                        <p className="text-sm text-[var(--notion-text-secondary)] max-w-md">
                            Structured study plan with spaced repetition, progress tracking, and intelligent scheduling — all in one place.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
