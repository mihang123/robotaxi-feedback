import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [totalFeedback, avgRating, positiveCount, negativeCount, neutralCount, todayCount, weekCount] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.aggregate({ _avg: { rating: true } }),
      prisma.feedback.count({ where: { sentiment: 'positive' } }),
      prisma.feedback.count({ where: { sentiment: 'negative' } }),
      prisma.feedback.count({ where: { sentiment: 'neutral' } }),
      prisma.feedback.count({ where: { tripDate: { gte: today } } }),
      prisma.feedback.count({ where: { tripDate: { gte: weekAgo } } }),
    ]);

    const total = totalFeedback || 1;
    return NextResponse.json({
      totalFeedback,
      avgRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(2)) : 0,
      positiveRate: Number(((positiveCount / total) * 100).toFixed(1)),
      negativeRate: Number(((negativeCount / total) * 100).toFixed(1)),
      neutralRate: Number(((neutralCount / total) * 100).toFixed(1)),
      todayCount,
      weekCount,
    });
  } catch (error) {
    console.error('GET /api/stats/overview error:', error);
    
    const isDemo = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:');
    if (isDemo) {
      return NextResponse.json({
        totalFeedback: 127,
        avgRating: 4.2,
        positiveRate: 68.5,
        negativeRate: 18.1,
        neutralRate: 13.4,
        todayCount: 8,
        weekCount: 45,
        _demo: true,
        message: '演示模式：使用模拟数据'
      });
    }
    
    return NextResponse.json({
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error',
      totalFeedback: 0,
      avgRating: 0,
      positiveRate: 0,
      negativeRate: 0,
      neutralRate: 0,
      todayCount: 0,
      weekCount: 0,
    }, { status: 500 });
  }
}