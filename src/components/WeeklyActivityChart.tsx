import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { LearnedWordMeta } from '../types';
import { getLocalDateString } from '../utils/streak';

interface WeeklyActivityChartProps {
  learnedMeta: Record<string, LearnedWordMeta>;
  learnedCountToday: number;
}

interface DayActivityData {
  dayLabel: string;
  dateStr: string;
  count: number;
  isToday: boolean;
  target: number;
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({
  learnedMeta,
  learnedCountToday,
}) => {
  const chartData: DayActivityData[] = useMemo(() => {
    const days: DayActivityData[] = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Map counts from learnedMeta
    const dateCounts: Record<string, number> = {};

    (Object.values(learnedMeta) as LearnedWordMeta[]).forEach((item) => {
      if (item && item.learnedAt) {
        dateCounts[item.learnedAt] = (dateCounts[item.learnedAt] || 0) + 1;
      }
    });

    // Generate last 7 days from 6 days ago to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const dayLabel = i === 0 ? 'Hôm nay' : dayNames[d.getDay()];

      let count = dateCounts[dateString] || 0;
      if (i === 0) {
        count = Math.max(count, learnedCountToday);
      }

      days.push({
        dayLabel,
        dateStr: dateString,
        count,
        isToday: i === 0,
        target: 10,
      });
    }

    return days;
  }, [learnedMeta, learnedCountToday]);

  const totalWeeklyWords = chartData.reduce((acc, curr) => acc + curr.count, 0);
  const avgDaily = (totalWeeklyWords / 7).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Weekly Learning Activity
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold block -mt-0.5">
              Số từ đã học trong 7 ngày qua
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            {totalWeeklyWords} từ / tuần
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-36 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 12]}
              ticks={[0, 5, 10]}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DayActivityData;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-xl border border-slate-700">
                      <p className="font-bold text-amber-300">
                        {data.dayLabel} ({data.dateStr})
                      </p>
                      <p className="font-extrabold text-sm text-white mt-0.5">
                        {data.count} / 10 từ đã học
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {data.count >= 10 ? '🎉 Đạt 100% mục tiêu ngày' : `Tiến độ: ${Math.round((data.count / 10) * 100)}%`}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={10}
              stroke="#f59e0b"
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.isToday
                      ? '#6366f1' // Active Indigo for today
                      : entry.count >= 10
                      ? '#10b981' // Green for completed target
                      : entry.count > 0
                      ? '#818cf8' // Soft purple/indigo
                      : '#e2e8f0' // Empty slate
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats & Legend */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
          <span>Hôm nay</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block ml-1.5" />
          <span>Đạt 10 từ</span>
        </div>
        <div className="flex items-center gap-1 text-slate-700 font-extrabold">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          <span>TB: {avgDaily} từ/ngày</span>
        </div>
      </div>
    </div>
  );
};
