'use client';

import { useState } from 'react';
import { X, Star, MapPin, Clock, Car, User, Brain, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Feedback, AIAnalysisResult } from '@/types';

interface FeedbackDetailProps {
  feedback: Feedback | null;
  onClose: () => void;
}

const sentimentConfig = {
  positive: { label: '好评', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  negative: { label: '差评', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  neutral: { label: '中性', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );
}

export default function FeedbackDetail({ feedback, onClose }: FeedbackDetailProps) {
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  if (!feedback) return null;

  const sentiment = sentimentConfig[feedback.sentiment as keyof typeof sentimentConfig] ??
    sentimentConfig.neutral;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackId: feedback.id, feedbackText: feedback.feedbackText }),
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-semibold text-white">反馈详情</h2>
            <p className="text-xs text-slate-400 mt-0.5">ID: {feedback.id.slice(0, 8)}...</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <StarRating rating={feedback.rating} />
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${sentiment.bg} ${sentiment.color}`}>
              {sentiment.label}
            </span>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-sm font-medium text-slate-300 mb-2">乘客反馈</p>
            <p className="text-sm text-slate-200 leading-relaxed">{feedback.feedbackText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: '路线', value: feedback.route },
              { icon: MapPin, label: '城市', value: feedback.city },
              { icon: Clock, label: '行程时长', value: `${feedback.tripDuration} 分钟` },
              { icon: User, label: '乘客ID', value: feedback.passengerId },
              { icon: Car, label: '车辆ID', value: feedback.vehicleId },
              { icon: Clock, label: '行程时间', value: format(new Date(feedback.tripDate), 'MM-dd HH:mm') },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
                <p className="text-sm text-slate-200 font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">分类：</span>
            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-medium">
              {feedback.category}
            </span>
          </div>

          <div className="border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-slate-200">AI 分析</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex items-center gap-1.5 text-xs bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
                {analyzing ? '分析中...' : '运行分析'}
              </button>
            </div>

            <div className="p-4">
              {feedback.aiSummary && !aiResult && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">已有分析摘要</p>
                  <p className="text-sm text-slate-300">{feedback.aiSummary}</p>
                </div>
              )}
              {aiResult && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">智能摘要</p>
                    <p className="text-sm text-slate-300">{aiResult.summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800 rounded-lg p-2.5">
                      <p className="text-xs text-slate-500 mb-1">识别类别</p>
                      <p className="text-sm text-blue-400 font-medium">{aiResult.category}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-2.5">
                      <p className="text-xs text-slate-500 mb-1">置信度</p>
                      <p className="text-sm text-emerald-400 font-medium">
                        {Math.round((aiResult.confidence ?? 0) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!feedback.aiSummary && !aiResult && (
                <p className="text-sm text-slate-500 text-center py-4">
                  点击「运行分析」获取 AI 智能分析结果
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}