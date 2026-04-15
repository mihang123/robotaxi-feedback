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
    
    const isDemo = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:');
    if (isDemo) {
      return NextResponse.json({
        byRoute: [
          { route: '望京SOHO-中关村', count: 18, avgRating: 4.3 },
          { route: '国贸CBD-三里屯', count: 15, avgRating: 4.1 },
          { route: '中关村-清华西门', count: 12, avgRating: 4.5 },
          { route: '北京南站-前门', count: 10, avgRating: 3.9 },
          { route: '首都机场T3-望京', count: 8, avgRating: 4.2 },
        ],
        byCategory: [
          { category: '行驶体验', count: 45 },
          { category: '车内环境', count: 32 },
          { category: '接驾体验', count: 28 },
          { category: '路线规划', count: 15 },
          { category: '安全感受', count: 12 },
          { category: '其他', count: 8 },
        ],
        byRating: [
          { rating: 5, count: 38 },
          { rating: 4, count: 32 },
          { rating: 3, count: 25 },
          { rating: 2, count: 19 },
          { rating: 1, count: 13 },
        ],
        byCity: [
          { city: '北京', count: 65, avgRating: 4.2 },
          { city: '上海', count: 38, avgRating: 4.3 },
          { city: '深圳', count: 24, avgRating: 4.1 },
        ],
        bySentiment: [
          { sentiment: 'positive', count: 87 },
          { sentiment: 'neutral', count: 17 },
          { sentiment: 'negative', count: 23 },
        ],
        byTimePeriod: [
          { period: '早高峰 (7-9)', count: 22 },
          { period: '上午 (9-12)', count: 18 },
          { period: '午间 (12-14)', count: 15 },
          { period: '下午 (14-17)', count: 20 },
          { period: '晚高峰 (17-19)', count: 25 },
          { period: '晚间 (19-22)', count: 19 },
          { period: '深夜 (22-次日7)', count: 8 },
        ],
        _demo: true,
        message: '演示模式：使用模拟数据'
      });
    }
    
    return NextResponse.json({
      error: 'Failed to fetch distribution',
      message: error instanceof Error ? error.message : 'Unknown error',
      byRoute: [],
      byCategory: [],
      byRating: [],
      byCity: [],
      bySentiment: [],
      byTimePeriod: []
    }, { status: 500 });
  }
}