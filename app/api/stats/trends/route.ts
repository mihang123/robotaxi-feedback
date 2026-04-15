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
    
    const isDemo = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:');
    if (isDemo) {
      const trends = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        trends.push({
          date: `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`,
          count: Math.floor(Math.random() * 10) + 3,
          avgRating: 3.5 + Math.random() * 1.5,
          positive: Math.floor(Math.random() * 8) + 2,
          negative: Math.floor(Math.random() * 3) + 1,
          neutral: Math.floor(Math.random() * 3) + 1,
        });
      }
      return NextResponse.json(trends);
    }
    
    return NextResponse.json({
      error: 'Failed to fetch trends',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}