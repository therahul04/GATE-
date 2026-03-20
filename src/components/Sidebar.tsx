'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, CalendarDays, CheckSquare, Star, BrainCircuit, User, ChevronLeft, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PomodoroTimer } from './PomodoroTimer';
import { useState } from 'react';

const navItems = [
    { name: 'Dashboard', href: '/', icon: Home, emoji: '🏠' },
    { name: 'Subjects', href: '/subjects', icon: BookOpen, emoji: '📚' },
    { name: 'Study Planner', href: '/planner', icon: CalendarDays, emoji: '📅' },
    { name: 'Mock Tests', href: '/mocks', icon: CheckSquare, emoji: '✏️' },
    { name: 'Review Later', href: '/bookmarks', icon: Star, emoji: '⭐' },
    { name: 'Formula Vault', href: '/flashcards', icon: BrainCircuit, emoji: '🧠' },
    { name: 'Profile', href: '/profile', icon: User, emoji: '👤' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`flex h-screen flex-col bg-[var(--notion-sidebar-bg)] transition-all duration-200 ${collapsed ? 'w-14' : 'w-60'}`}
            style={{ borderRight: '1px solid var(--notion-border)' }}
        >
            {/* Workspace Header */}
            <div className="flex items-center justify-between px-3 py-3 min-h-[44px]">
                {!collapsed && (
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-5 w-5 rounded bg-gradient-to-br from-[var(--notion-accent)] to-[#6940a5] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[10px] font-bold">G</span>
                        </div>
                        <span className="text-sm font-semibold text-[var(--notion-text)] truncate">GATE IN 2027</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1 rounded hover:bg-[var(--notion-bg-hover)] text-[var(--notion-text-secondary)] transition-colors flex-shrink-0"
                >
                    {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-1 py-1 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`group flex items-center rounded-[4px] px-2 py-1.5 text-sm transition-colors ${isActive
                                ? 'bg-[var(--notion-bg-active)] text-[var(--notion-text)] font-medium'
                                : 'text-[var(--notion-text-secondary)] hover:bg-[var(--notion-bg-hover)]'
                                }`}
                            title={collapsed ? item.name : undefined}
                        >
                            <span className="flex-shrink-0 text-base mr-2 w-5 text-center">{item.emoji}</span>
                            {!collapsed && (
                                <span className="truncate">{item.name}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Pomodoro Timer */}
            {!collapsed && (
                <div className="px-2 py-2">
                    <PomodoroTimer />
                </div>
            )}

            {/* User Section */}
            {user && !collapsed && (
                <div className="px-3 py-3" style={{ borderTop: '1px solid var(--notion-border)' }}>
                    <div className="flex items-center gap-2">
                        {user.photoURL && (
                            <img src={user.photoURL} alt="" className="h-6 w-6 rounded-full object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium text-[var(--notion-text)]">{user.displayName}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
