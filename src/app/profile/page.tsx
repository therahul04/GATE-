'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { usePreferences } from '@/context/PreferencesContext';
import resources from '@/data/resources.json';
import { ArrowUp, ArrowDown, LogOut, Save } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { preferences, setSubjectOrder, setStartDate } = usePreferences();
    const [localOrder, setLocalOrder] = useState<number[]>(preferences.subjectOrder);
    const [localStartDate, setLocalStartDate] = useState(preferences.startDate);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const moveSubject = (fromIndex: number, direction: 'up' | 'down') => {
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= localOrder.length) return;
        const newOrder = [...localOrder];
        [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
        setLocalOrder(newOrder);
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setSubjectOrder(localOrder);
            await setStartDate(localStartDate);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-[var(--notion-bg)]">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="max-w-5xl mx-auto px-10 py-10">

                        <div className="mb-8">
                            <span className="text-4xl mb-3 block">👤</span>
                            <h1 className="text-3xl font-bold text-[var(--notion-text)]">Profile</h1>
                            <p className="text-sm text-[var(--notion-text-secondary)] mt-1">Manage your study preferences and account</p>
                        </div>

                        {/* User Info */}
                        {user && (
                            <div className="flex items-center gap-4 p-4 rounded-lg mb-8 bg-[var(--notion-bg-secondary)]" style={{ border: '1px solid var(--notion-border)' }}>
                                {user.photoURL && (
                                    <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full object-cover" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-semibold text-[var(--notion-text)]">{user.displayName}</p>
                                    <p className="text-sm text-[var(--notion-text-secondary)]">{user.email}</p>
                                </div>
                                <button onClick={logout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-[var(--notion-red)] hover:bg-[var(--notion-red-bg)] transition-colors font-medium"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Logout
                                </button>
                            </div>
                        )}

                        {/* Start Date */}
                        <div className="mb-8">
                            <h2 className="text-base font-semibold text-[var(--notion-text)] mb-1 flex items-center gap-2">📅 Start Date</h2>
                            <p className="text-sm text-[var(--notion-text-secondary)] mb-3">When did you start (or plan to start) your GATE preparation?</p>
                            <input
                                type="date"
                                value={localStartDate}
                                onChange={(e) => { setLocalStartDate(e.target.value); setSaved(false); }}
                                className="rounded-md px-3 py-2 text-sm text-[var(--notion-text)] bg-[var(--notion-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--notion-accent)] w-48"
                                style={{ border: '1px solid var(--notion-border-strong)' }}
                            />
                        </div>

                        {/* Subject Order */}
                        <div className="mb-8">
                            <h2 className="text-base font-semibold text-[var(--notion-text)] mb-1 flex items-center gap-2">📋 Subject Study Order</h2>
                            <p className="text-sm text-[var(--notion-text-secondary)] mb-4">
                                The planner picks the <strong>top 3</strong> subjects and assigns <strong>2 videos from each</strong> per day.
                            </p>

                            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--notion-border)' }}>
                                {localOrder.map((subjectIdx, orderPos) => {
                                    const subject = resources[subjectIdx];
                                    if (!subject) return null;
                                    const videoCount = (subject.categories as any)['Youtube Videos']?.length || 0;

                                    return (
                                        <div key={subjectIdx}
                                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${orderPos < 3 ? 'bg-[var(--notion-green-bg)]' : 'bg-[var(--notion-bg)] hover:bg-[var(--notion-bg-hover)]'}`}
                                            style={orderPos < localOrder.length - 1 ? { borderBottom: '1px solid var(--notion-border)' } : {}}
                                        >
                                            <span className={`text-xs font-semibold w-5 text-center ${orderPos < 3 ? 'text-[var(--notion-green)]' : 'text-[var(--notion-text-tertiary)]'}`}>
                                                {orderPos + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--notion-text)] truncate">{subject.name}</p>
                                                <p className="text-[11px] text-[var(--notion-text-tertiary)]">{videoCount} videos</p>
                                            </div>
                                            {orderPos < 3 && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--notion-bg)] text-[var(--notion-green)]">Active</span>
                                            )}
                                            <div className="flex gap-0.5">
                                                <button onClick={() => moveSubject(orderPos, 'up')} disabled={orderPos === 0}
                                                    className="p-1 rounded hover:bg-[var(--notion-bg-hover)] disabled:opacity-20 transition-colors">
                                                    <ArrowUp className="h-3.5 w-3.5 text-[var(--notion-text-secondary)]" />
                                                </button>
                                                <button onClick={() => moveSubject(orderPos, 'down')} disabled={orderPos === localOrder.length - 1}
                                                    className="p-1 rounded hover:bg-[var(--notion-bg-hover)] disabled:opacity-20 transition-colors">
                                                    <ArrowDown className="h-3.5 w-3.5 text-[var(--notion-text-secondary)]" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Save */}
                        <div className="flex items-center gap-3">
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-white bg-[var(--notion-accent)] hover:brightness-[1.1] disabled:opacity-50 transition-all"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {saving ? 'Saving...' : 'Save preferences'}
                            </button>
                            {saved && (
                                <span className="text-sm text-[var(--notion-green)] font-medium">✓ Saved</span>
                            )}
                        </div>

                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
