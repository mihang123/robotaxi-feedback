'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DistributionData } from '@/types';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#f59e0b',
};

const SENTIMENT_LABELS: Record<string, string> = {
  positive: '好评',
  negative: '差评',
  neutral: '中性',
};

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const TIME_PERIOD_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name?: string; category?: string } }> }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs">
        <p className="text-slate-200 font-medium">{payload[0].payload.name || payload[0].payload.category}</p>
        <p className="text-blue-400">数量: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

interface DistributionChartsProps {
  data: DistributionData | null;
  loading?: boolean;
}

export default function DistributionCharts({ data, loading }: DistributionChartsProps) {
  const sentimentData = (data?.bySentiment ?? []).map(d => ({
    ...d,
    name: SENTIMENT_LABELS[d.sentiment] ?? d.sentiment,
    color: SENTIMENT_COLORS[d.sentiment] ?? '#94a3b8',
  }));

  const ratingData = (data?.byRating ?? []).map(d => ({
    ...d,
    name: `${d.rating}星`,
  }));

  const categoryData = (data?.byCategory ?? []).map((d, i) => ({
    ...d,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const timePeriodData = (data?.byTimePeriod ?? []).map((d, i) => ({
    ...d,
    name: d.period,
    color: TIME_PERIOD_COLORS[i % TIME_PERIOD_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">情感分布</h3>
        <p className="text-xs text-slate-400 mb-4">好评/差评/中性占比</p>
        {loading ? (
          <div className="h-48 bg-slate-800 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="count"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [value, name]}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">评分分布</h3>
        <p className="text-xs text-slate-400 mb-4">1-5星评分数量</p>
        {loading ? (
          <div className="h-48 bg-slate-800 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ratingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rating >= 4 ? '#10b981' : entry.rating === 3 ? '#f59e0b' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">时段分布</h3>
        <p className="text-xs text-slate-400 mb-4">各时段反馈数量</p>
        {loading ? (
          <div className="h-48 bg-slate-800 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timePeriodData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="period"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" name="数量" radius={[0, 4, 4, 0]}>
                {timePeriodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}