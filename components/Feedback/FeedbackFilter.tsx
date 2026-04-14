'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FeedbackFilter } from '@/types';

interface FeedbackFilterProps {
  filters: FeedbackFilter;
  onFilterChange: (filters: FeedbackFilter) => void;
}

const CATEGORIES = ['行驶体验', '车内环境', '接驾体验', '路线规划', '安全感受', '其他'];
const CITIES = ['北京', '上海', '深圳'];
const ROUTES: Record<string, string[]> = {
  北京: ['中关村-国贸', '北京南站-天安门', '望京-三里屯', '回龙观-上地', '亦庄-大兴机场'],
  上海: ['陆家嘴-人民广场', '虹桥机场-静安寺', '张江-徐汇滨江', '浦东机场-世博园', '五角场-外滩'],
  深圳: ['南山科技园-福田中心区', '宝安机场-龙华', '坪山-深圳北站', '蛇口-罗湖', '光明-龙岗'],
};

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
    >
      <option value="all">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function FeedbackFilterBar({ filters, onFilterChange }: FeedbackFilterProps) {
  const [expanded, setExpanded] = useState(false);

  const availableRoutes = filters.city && filters.city !== 'all'
    ? ROUTES[filters.city] ?? []
    : Object.values(ROUTES).flat();

  const activeFilterCount = [
    filters.ratingMin, filters.ratingMax, filters.startDate,
    filters.endDate, filters.city !== 'all' && filters.city,
    filters.category !== 'all' && filters.category,
    filters.sentiment !== 'all' && filters.sentiment,
    filters.route !== 'all' && filters.route,
  ].filter(Boolean).length;

  const clearAll = () => {
    onFilterChange({
      page: 1,
      pageSize: filters.pageSize,
      ratingMin: undefined,
      ratingMax: undefined,
      startDate: undefined,
      endDate: undefined,
      city: 'all',
      route: 'all',
      category: 'all',
      sentiment: 'all',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          筛选条件
          {activeFilterCount > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            清除筛选
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">每页显示</span>
          <select
            value={filters.pageSize}
            onChange={e => onFilterChange({ ...filters, pageSize: Number(e.target.value), page: 1 })}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1 focus:outline-none"
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n} 条</option>)}
          </select>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">最低评分</label>
            <Select
              value={filters.ratingMin?.toString() ?? 'all'}
              onChange={v => onFilterChange({ ...filters, ratingMin: v !== 'all' ? Number(v) : undefined, page: 1 })}
              options={[1, 2, 3, 4, 5].map(r => ({ value: String(r), label: `${r}星` }))}
              placeholder="不限"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">最高评分</label>
            <Select
              value={filters.ratingMax?.toString() ?? 'all'}
              onChange={v => onFilterChange({ ...filters, ratingMax: v !== 'all' ? Number(v) : undefined, page: 1 })}
              options={[1, 2, 3, 4, 5].map(r => ({ value: String(r), label: `${r}星` }))}
              placeholder="不限"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">城市</label>
            <Select
              value={filters.city ?? 'all'}
              onChange={v => onFilterChange({ ...filters, city: v, route: 'all', page: 1 })}
              options={CITIES.map(c => ({ value: c, label: c }))}
              placeholder="全部城市"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">路线</label>
            <Select
              value={filters.route ?? 'all'}
              onChange={v => onFilterChange({ ...filters, route: v, page: 1 })}
              options={availableRoutes.map(r => ({ value: r, label: r }))}
              placeholder="全部路线"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">类别</label>
            <Select
              value={filters.category ?? 'all'}
              onChange={v => onFilterChange({ ...filters, category: v, page: 1 })}
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              placeholder="全部类别"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">情感倾向</label>
            <Select
              value={filters.sentiment ?? 'all'}
              onChange={v => onFilterChange({ ...filters, sentiment: v, page: 1 })}
              options={[
                { value: 'positive', label: '好评' },
                { value: 'negative', label: '差评' },
                { value: 'neutral', label: '中性' },
              ]}
              placeholder="全部"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">开始日期</label>
            <input
              type="date"
              value={filters.startDate ?? ''}
              onChange={e => onFilterChange({ ...filters, startDate: e.target.value || undefined, page: 1 })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">结束日期</label>
            <input
              type="date"
              value={filters.endDate ?? ''}
              onChange={e => onFilterChange({ ...filters, endDate: e.target.value || undefined, page: 1 })}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}