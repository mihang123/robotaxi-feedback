'use client';

import { useEffect, useState, useCallback } from 'react';
import FeedbackFilterBar from '@/components/Feedback/FeedbackFilter';
import FeedbackTable from '@/components/Feedback/FeedbackTable';
import { FeedbackListResponse, FeedbackFilter } from '@/types';

const DEFAULT_FILTERS: FeedbackFilter = {
  page: 1,
  pageSize: 10,
  city: 'all',
  route: 'all',
  category: 'all',
  sentiment: 'all',
};

export default function FeedbackPage() {
  const [filters, setFilters] = useState<FeedbackFilter>(DEFAULT_FILTERS);
  const [data, setData] = useState<FeedbackListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = useCallback(async (f: FeedbackFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.page) params.set('page', String(f.page));
      if (f.pageSize) params.set('pageSize', String(f.pageSize));
      if (f.ratingMin) params.set('ratingMin', String(f.ratingMin));
      if (f.ratingMax) params.set('ratingMax', String(f.ratingMax));
      if (f.startDate) params.set('startDate', f.startDate);
      if (f.endDate) params.set('endDate', f.endDate);
      if (f.route && f.route !== 'all') params.set('route', f.route);
      if (f.city && f.city !== 'all') params.set('city', f.city);
      if (f.category && f.category !== 'all') params.set('category', f.category);
      if (f.sentiment && f.sentiment !== 'all') params.set('sentiment', f.sentiment);
      if (f.sortBy) params.set('sortBy', f.sortBy);
      if (f.sortOrder) params.set('sortOrder', f.sortOrder);

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

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: 'tripDate' | 'rating', sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">反馈列表</h1>
        <p className="text-sm text-slate-400 mt-1">查看和管理所有乘客反馈数据</p>
      </div>

      <FeedbackFilterBar filters={filters} onFilterChange={handleFilterChange} />
      <FeedbackTable
        data={data}
        loading={loading}
        filters={filters}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />
    </div>
  );
}