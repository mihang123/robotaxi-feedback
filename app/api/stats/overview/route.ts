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
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}