'use client';

import { useState } from 'react';
import { Brain, Loader2, Lightbulb, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { Feedback, BatchSummaryResult, AISuggestion } from '@/types';

interface AIAnalyzerProps {
  feedbacks: Feedback[];
  totalCount: number;
}

const priorityConfig = {
  high: { label: '高优先级', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: AlertTriangle },
  medium: { label: '中优先级', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: Minus },
  low: { label: '低优先级', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', icon: CheckCircle },
};

function SuggestionCard({ suggestion, index }: { suggestion: AISuggestion; index: number }) {
  const pc = priorityConfig[suggestion.priority] ?? priorityConfig.medium;
  const Icon = pc.icon;
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">#{index + 1}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${pc.bg} ${pc.color}`}>
            <Icon className="w-3 h-3" />
            {pc.label}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">⚠ 问题</p>
          <p className="text-sm text-slate-200">{suggestion.problem}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">💡 解决方案</p>
          <p className="text-sm text-slate-300">{suggestion.solution}</p>
        </div>
        <div className="pt-1 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-0.5">📈 预期效果</p>
          <p className="text-xs text-emerald-400">{suggestion.impact}</p>
        </div>
      </div>
    </div>
  );
}

export default function AIAnalyzer({ feedbacks, totalCount }: AIAnalyzerProps) {
  const [result, setResult] = useState<BatchSummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (feedbacks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/batch-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbacks }),
      });
      if (!res.ok) throw new Error('分析请求失败');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError('AI 分析失败，请检查 API Key 配置');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI 批量分析</h3>
            <p className="text-xs text-slate-400">基于当前筛选的 {totalCount} 条反馈</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || feedbacks.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm rounded-lg transition-colors font-medium"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />分析中...</>
          ) : (
            <><Brain className="w-4 h-4" />开始分析</>
          )}
        </button>
      </div>

      <div className="p-5">
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
            {error}
          </div>
        )}

        {!result && !loading && (
          <div className="text-center py-12">
            <Brain className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">点击「开始分析」对当前数据进行智能分析</p>
            <p className="text-slate-600 text-xs mt-1">将生成摘要、关键洞察和产品优化建议</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-300 text-sm">正在调用 AI 分析数据...</p>
            <p className="text-slate-500 text-xs mt-1">大约需要 5-15 秒</p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">整体摘要</h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
              {result.userNeeds && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">用户主要诉求</p>
                  <p className="text-sm text-blue-300">{result.userNeeds}</p>
                </div>
              )}
            </div>

            {result.keyPoints && result.keyPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">核心问题</h4>
                <div className="space-y-2">
                  {result.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-800/30 rounded-lg px-3 py-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                        {i + 1}
                      </span>
                      <p className="text-sm text-slate-300">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.suggestions && result.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">产品优化建议</h4>
                <div className="grid grid-cols-1 gap-3">
                  {result.suggestions.map((s, i) => (
                    <SuggestionCard key={i} suggestion={s} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}