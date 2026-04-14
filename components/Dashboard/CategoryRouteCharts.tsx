'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { DistributionData } from '@/types';

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const ROUTE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#10b981', '#14b8a6', '#06b6d4'];

interface CategoryRouteChartsProps {
  data: DistributionData | null;
  loading?: boolean;
}

export default function CategoryRouteCharts({ data, loading }: CategoryRouteChartsProps) {
  const categoryData = (data?.byCategory ?? []).map((d, i) => ({
    ...d,
    name: d.category,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const routeData = (data?.byRoute ?? []).slice(0, 10).map((d, i) => ({
    ...d,
    name: d.route.length > 12 ? d.route.substring(0, 12) + '...' : d.route,
    fullName: d.route,
    color: ROUTE_COLORS[i % ROUTE_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">类别分布</h3>
        <p className="text-xs text-slate-400 mb-4">各问题类别占比</p>
        {loading ? (
          <div className="h-48 bg-slate-800 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="count" name="数量" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">路线分布 (Top 10)</h3>
        <p className="text-xs text-slate-400 mb-4">各路线反馈数量</p>
        {loading ? (
          <div className="h-48 bg-slate-800 rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={routeData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value: number) => [value, '数量']}
                labelFormatter={(label) => routeData.find(r => r.name === label)?.fullName || label}
              />
              <Bar dataKey="count" name="数量" radius={[0, 4, 4, 0]}>
                {routeData.map((entry, index) => (
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