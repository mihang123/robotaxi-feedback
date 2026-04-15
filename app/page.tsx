'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatsCards from '@/components/Dashboard/StatsCards';
import TrendChart from '@/components/Dashboard/TrendChart';
import DistributionCharts from '@/components/Dashboard/DistributionCharts';
import CategoryRouteCharts from '@/components/Dashboard/CategoryRouteCharts';
import { OverviewStats, TrendData, DistributionData } from '@/types';

const DEFAULT_STATS: OverviewStats = {
  totalFeedback: 0,
  avgRating: 0,
  positiveRate: 0,
  negativeRate: 0,
  neutralRate: 0,
  todayCount: 0,
  weekCount: 0,
};

const DEFAULT_TRENDS: TrendData[] = [];
const DEFAULT_DISTRIBUTION: DistributionData = {
  byRoute: [],
  byCategory: [],
  byRating: [],
  byCity: [],
  bySentiment: [],
  byTimePeriod: [],
};

export default function DashboardPage() {
  const [stats, setStats] = useState<OverviewStats>(DEFAULT_STATS);
  const [trends, setTrends] = useState<TrendData[]>(DEFAULT_TRENDS);
  const [distribution, setDistribution] = useState<DistributionData>(DEFAULT_DISTRIBUTION);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, trendsRes, distRes] = await Promise.all([
        fetch('/api/stats/overview'),
        fetch('/api/stats/trends'),
        fetch('/api/stats/distribution'),
      ]);
      
      if (!statsRes.ok || !trendsRes.ok || !distRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const [statsData, trendsData, distData] = await Promise.all([
        statsRes.json(),
        trendsRes.json(),
        distRes.json(),
      ]);
      setStats(statsData);
      setTrends(trendsData);
      setDistribution(distData);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch dashboard data', e);
      setError(e instanceof Error ? e.message : '加载数据失败');
      setStats(DEFAULT_STATS);
      setTrends(DEFAULT_TRENDS);
      setDistribution(DEFAULT_DISTRIBUTION);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">数据仪表盘</h1>
          <p className="text-sm text-slate-400 mt-1">
            {lastUpdated
              ? `最后更新：${lastUpdated.toLocaleTimeString('zh-CN')}`
              : '加载数据中...'}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-200">
          <p className="font-medium">加载数据出错</p>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <StatsCards stats={stats} loading={loading} />
      <TrendChart data={trends} loading={loading} />
      <DistributionCharts data={distribution} loading={loading} />
      <CategoryRouteCharts data={distribution} loading={loading} />
    </div>
  );
}