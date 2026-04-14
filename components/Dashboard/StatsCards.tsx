'use client';

import { MessageSquare, Star, ThumbsUp, TrendingUp } from 'lucide-react';
import { OverviewStats } from '@/types';

interface StatsCardsProps {
  stats: OverviewStats | null;
  loading?: boolean;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="总反馈数"
        value={loading ? '—' : (stats?.totalFeedback?.toLocaleString() ?? '0')}
        subtitle={`本周新增 ${stats?.weekCount ?? 0} 条`}
        icon={MessageSquare}
        color="bg-blue-600"
        loading={loading}
      />
      <StatCard
        title="平均评分"
        value={loading ? '—' : `${stats?.avgRating?.toFixed(2) ?? '0'} / 5`}
        subtitle="基于全量反馈数据"
        icon={Star}
        color="bg-amber-500"
        loading={loading}
      />
      <StatCard
        title="好评率"
        value={loading ? '—' : `${stats?.positiveRate?.toFixed(1) ?? '0'}%`}
        subtitle={`差评率 ${stats?.negativeRate?.toFixed(1) ?? '0'}%`}
        icon={ThumbsUp}
        color="bg-emerald-600"
        loading={loading}
      />
      <StatCard
        title="今日新增"
        value={loading ? '—' : (stats?.todayCount?.toString() ?? '0')}
        subtitle="今天收到的反馈"
        icon={TrendingUp}
        color="bg-violet-600"
        loading={loading}
      />
    </div>
  );
}