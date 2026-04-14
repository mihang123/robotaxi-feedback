'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Star, ChevronLeft, ChevronRight, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Feedback, FeedbackListResponse, FeedbackFilter } from '@/types';
import FeedbackDetail from './FeedbackDetail';

interface FeedbackTableProps {
  data: FeedbackListResponse | null;
  loading?: boolean;
  filters: FeedbackFilter;
  onPageChange: (page: number) => void;
  onSortChange?: (sortBy: 'tripDate' | 'rating', sortOrder: 'asc' | 'desc') => void;
}

const sentimentConfig = {
  positive: { label: '好评', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  negative: { label: '差评', class: 'text-red-400 bg-red-400/10 border-red-400/20' },
  neutral: { label: '中性', class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3 h-3 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {Array(6).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-800 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function SortIcon({ column, sortBy, sortOrder }: { column: string; sortBy?: string; sortOrder?: string }) {
  if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
  return sortOrder === 'asc'
    ? <ArrowUp className="w-3 h-3 ml-1 text-blue-400" />
    : <ArrowDown className="w-3 h-3 ml-1 text-blue-400" />;
}

export default function FeedbackTable({ data, loading, filters, onPageChange, onSortChange }: FeedbackTableProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = filters.pageSize ?? 10;

  const handleSort = (column: 'tripDate' | 'rating') => {
    if (!onSortChange) return;
    const newOrder = filters.sortBy === column && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange(column, newOrder);
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">反馈记录</h3>
          <span className="text-xs text-slate-400">共 {total} 条</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap cursor-pointer hover:text-white"
                  onClick={() => handleSort('rating')}
                >
                  <div className="flex items-center">评分<SortIcon column="rating" sortBy={filters.sortBy} sortOrder={filters.sortOrder} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">情感</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">类别</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">路线 / 城市</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">反馈内容</th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap cursor-pointer hover:text-white"
                  onClick={() => handleSort('tripDate')}
                >
                  <div className="flex items-center">时间<SortIcon column="tripDate" sortBy={filters.sortBy} sortOrder={filters.sortOrder} /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading
                ? Array(pageSize).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : data?.data.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                      暂无符合条件的反馈数据
                    </td>
                  </tr>
                )
                : data?.data.map(fb => {
                  const sc = sentimentConfig[fb.sentiment as keyof typeof sentimentConfig] ?? sentimentConfig.neutral;
                  return (
                    <tr
                      key={fb.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedFeedback(fb)}
                    >
                      <td className="px-4 py-3">
                        <StarRating rating={fb.rating} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.class}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                          {fb.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-200 whitespace-nowrap">{fb.route}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fb.city}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-xs text-slate-300 truncate">{fb.feedbackText}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs text-slate-300">{format(new Date(fb.tripDate), 'MM-dd')}</p>
                        <p className="text-xs text-slate-500">{format(new Date(fb.tripDate), 'HH:mm')}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedFeedback(fb); }}
                          className="text-slate-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!loading && total > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              第 {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} 条，共 {total} 条
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && page > 3) p = page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-colors ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FeedbackDetail feedback={selectedFeedback} onClose={() => setSelectedFeedback(null)} />
    </>
  );
}