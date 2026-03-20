'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--notion-bg)]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--notion-accent)] border-t-transparent"></div>
            </div>
        );
    }

    if (!user) return null;

    return <>{children}</>;
}
