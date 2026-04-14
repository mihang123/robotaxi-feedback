'use client';

import { useEffect, useState, useCallback } from 'react';
import AIAnalyzer from '@/components/AI/AIAnalyzer';
import FeedbackTable from '@/components/Feedback/FeedbackTable';
import FeedbackFilterBar from '@/components/Feedback/FeedbackFilter';
import { Feedback, FeedbackFilter, FeedbackListResponse } from '@/types';

const DEFAULT_FILTERS: FeedbackFilter = {
  page: 1,
  pageSize: 20,
  city: 'all',
  route: 'all',
  category: 'all',
  sentiment: 'all',
};

export default function AIAnalysisPage() {
  const [filters, setFilters] = useState<FeedbackFilter>(DEFAULT_FILTERS);
  const [data, setData] = useState<FeedbackListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async (f: FeedbackFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.page) params.set('page', String(f.page));
      if (f.pageSize) params.set('pageSize', String(f.pageSize));
      if (f.route && f.route !== 'all') params.set('route', f.route);
      if (f.city && f.city !== 'all') params.set('city', f.city);
      if (f.category && f.category !== 'all') params.set('category', f.category);
      if (f.sentiment && f.sentiment !== 'all') params.set('sentiment', f.sentiment);

      const res = await fetch(`/api/feedback?${params.toString()}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Failed to fetch feedback', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback(filters);
  }, [filters, fetchFeedback]);

  const handleFilterChange = (newFilters: FeedbackFilter) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const feedbacks: Feedback[] = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">AI 智能分析</h1>
        <p className="text-sm text-slate-400 mt-1">利用大模型分析批量反馈，生成摘要、洞察与产品建议</p>
      </div>

      <AIAnalyzer feedbacks={feedbacks} totalCount={totalCount} />

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">参与分析的数据</h2>
        <FeedbackFilterBar filters={filters} onFilterChange={handleFilterChange} />
        <div className="mt-4">
          <FeedbackTable
            data={data}
            loading={loading}
            filters={filters}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          />
        </div>
      </div>
    </div>
  );
}