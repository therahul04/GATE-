'use client';

import { ActivityCalendar } from 'react-activity-calendar';
import { useProgress } from '@/context/ProgressContext';
import { Flame } from 'lucide-react';

export function ActivityHeatmap() {
    const { progress } = useProgress();

    const generateCalendarData = () => {
        const data: { date: string; count: number; level: number }[] = [];
        const today = new Date();
        const past = new Date();
        past.setDate(today.getDate() - 120);

        for (let d = new Date(past); d <= today; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            const count = progress.activityLog?.[dateStr] || 0;

            let level = 0;
            if (count > 0) level = 1;
            if (count >= 2) level = 2;
            if (count >= 4) level = 3;
            if (count >= 7) level = 4;

            data.push({ date: dateStr, count, level });
        }
        return data;
    };

    const calculateStreak = () => {
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            if (progress.activityLog?.[dateStr] && progress.activityLog[dateStr] > 0) {
                currentStreak++;
            } else if (i > 0) {
                break;
            }
        }
        return currentStreak;
    };

    const data = generateCalendarData();
    const streak = calculateStreak();

    return (
        <div className="rounded-lg p-5" style={{ border: '1px solid var(--notion-border)' }}>
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--notion-text)]">📊 Activity</h3>
                    <p className="text-xs text-[var(--notion-text-secondary)] mt-0.5">Daily study sessions</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--notion-yellow-bg)]">
                    <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-[var(--notion-orange)]' : 'text-[var(--notion-text-tertiary)]'}`} />
                    <span className="text-sm font-semibold text-[var(--notion-text)]">{streak}</span>
                    <span className="text-[10px] text-[var(--notion-text-secondary)]">day streak</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-2">
                <div className="min-w-[600px]">
                    <ActivityCalendar
                        data={data}
                        theme={{
                            light: ['#2d2d2d', '#0e4429', '#006d32', '#26a641', '#39d353'],
                            dark: ['#2d2d2d', '#0e4429', '#006d32', '#26a641', '#39d353'],
                        }}
                        labels={{
                            legend: { less: 'Less', more: 'More' },
                        }}
                        fontSize={11}
                        blockSize={12}
                        blockRadius={2}
                        blockMargin={3}
                    />
                </div>
            </div>
        </div>
    );
}
