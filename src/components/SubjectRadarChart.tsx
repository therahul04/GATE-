'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import resources from '@/data/resources.json';
import { useProgress } from '@/context/ProgressContext';

export function SubjectRadarChart() {
    const { isCompleted } = useProgress();

    const data = resources.map(subject => {
        let totalItems = 0;
        let completedItems = 0;
        Object.values(subject.categories || {}).forEach((items: any) => {
            items.forEach((item: any) => {
                if (item.url) {
                    totalItems++;
                    const type = item.url.includes('youtube.com') ? 'video' : item.url.includes('gateoverflow.in') ? 'test' : 'read';
                    if (isCompleted(type, item.url)) completedItems++;
                }
            });
        });
        const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        // Shorten long names for the chart
        const shortName = subject.name.length > 18 ? subject.name.substring(0, 16) + '…' : subject.name;
        return { subject: shortName, progress: pct, fullMark: 100 };
    });

    return (
        <div className="rounded-lg p-5" style={{ border: '1px solid var(--notion-border)' }}>
            <h3 className="text-sm font-semibold text-[var(--notion-text)] mb-1">📈 Subject Mastery</h3>
            <p className="text-xs text-[var(--notion-text-secondary)] mb-4">Progress across all subjects</p>

            <div className="w-full h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="var(--notion-border-strong)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'var(--notion-text-secondary)', fontSize: 9.5, fontFamily: 'Inter' }}
                        />
                        <Radar
                            name="Progress"
                            dataKey="progress"
                            stroke="#2eaadc"
                            fill="#2eaadc"
                            fillOpacity={0.15}
                            strokeWidth={1.5}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
