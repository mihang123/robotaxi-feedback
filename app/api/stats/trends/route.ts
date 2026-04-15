import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export async function GET() {
  try {
    const days = 30;
    const trends = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const nextDate = subDays(today, i - 1);

      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(nextDate.setHours(0, 0, 0, 0));

      const [count, avgRating, positive, negative, neutral] = await Promise.all([
        prisma.feedback.count({
          where: { tripDate: { gte: dayStart, lt: dayEnd } },
        }),
        prisma.feedback.aggregate({
          where: { tripDate: { gte: dayStart, lt: dayEnd } },
          _avg: { rating: true },
        }),
        prisma.feedback.count({
          where: { tripDate: { gte: dayStart, lt: dayEnd }, sentiment: 'positive' },
        }),
        prisma.feedback.count({
          where: { tripDate: { gte: dayStart, lt: dayEnd }, sentiment: 'negative' },
        }),
        prisma.feedback.count({
          where: { tripDate: { gte: dayStart, lt: dayEnd }, sentiment: 'neutral' },
        }),
      ]);

      trends.push({
        date: format(dayStart, 'MM-dd'),
        count,
        avgRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
        positive,
        negative,
        neutral,
      });
    }

    return NextResponse.json(trends);
  } catch (error) {
    console.error('GET /api/stats/trends error:', error);
    return NextResponse.json({
      error: 'Failed to fetch trends',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}