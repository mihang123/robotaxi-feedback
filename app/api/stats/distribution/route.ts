import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      select: { tripDate: true, rating: true },
    });

    const byRoute = await prisma.feedback.groupBy({
      by: ['route'],
      _count: { id: true },
      _avg: { rating: true },
    }).then(res => res.map(r => ({
      route: r.route,
      count: r._count.id,
      avgRating: r._avg.rating ? Number(r._avg.rating.toFixed(1)) : 0,
    })));

    const byCategory = await prisma.feedback.groupBy({
      by: ['category'],
      _count: { id: true },
    }).then(res => res.map(r => ({
      category: r.category,
      count: r._count.id,
    })));

    const byRating = await prisma.feedback.groupBy({
      by: ['rating'],
      _count: { id: true },
    }).then(res => res.map(r => ({
      rating: r.rating,
      count: r._count.id,
    })));

    const byCity = await prisma.feedback.groupBy({
      by: ['city'],
      _count: { id: true },
      _avg: { rating: true },
    }).then(res => res.map(r => ({
      city: r.city,
      count: r._count.id,
      avgRating: r._avg.rating ? Number(r._avg.rating.toFixed(1)) : 0,
    })));

    const bySentiment = await prisma.feedback.groupBy({
      by: ['sentiment'],
      _count: { id: true },
    }).then(res => res.map(r => ({
      sentiment: r.sentiment,
      count: r._count.id,
    })));

    const timePeriods = [
      { name: '早高峰 (7-9)', label: '早高峰', range: [7, 9] },
      { name: '上午 (9-12)', label: '上午', range: [9, 12] },
      { name: '午间 (12-14)', label: '午间', range: [12, 14] },
      { name: '下午 (14-17)', label: '下午', range: [14, 17] },
      { name: '晚高峰 (17-19)', label: '晚高峰', range: [17, 19] },
      { name: '晚间 (19-22)', label: '晚间', range: [19, 22] },
      { name: '深夜 (22-次日7)', label: '深夜', range: [22, 24] },
    ];

    const byTimePeriod = timePeriods.map(tp => {
      const count = feedbacks.filter(f => {
        const hour = new Date(f.tripDate).getHours();
        if (tp.range[0] === 22) {
          return hour >= 22 || hour < 7;
        }
        return hour >= tp.range[0] && hour < tp.range[1];
      }).length;
      return { period: tp.name, count };
    });

    return NextResponse.json({ byRoute, byCategory, byRating, byCity, bySentiment, byTimePeriod });
  } catch (error) {
    console.error('GET /api/stats/distribution error:', error);
    return NextResponse.json({ error: 'Failed to fetch distribution' }, { status: 500 });
  }
}