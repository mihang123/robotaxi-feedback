import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const ratingMin = searchParams.get('ratingMin');
    const ratingMax = searchParams.get('ratingMax');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const route = searchParams.get('route');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const sentiment = searchParams.get('sentiment');
    const sortBy = searchParams.get('sortBy') || 'tripDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};

    if (ratingMin || ratingMax) {
      where.rating = {
        ...(ratingMin ? { gte: parseInt(ratingMin) } : {}),
        ...(ratingMax ? { lte: parseInt(ratingMax) } : {}),
      };
    }

    if (startDate || endDate) {
      where.tripDate = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate + 'T23:59:59') } : {}),
      };
    }

    if (route && route !== 'all') where.route = route;
    if (city && city !== 'all') where.city = city;
    if (category && category !== 'all') where.category = category;
    if (sentiment && sentiment !== 'all') where.sentiment = sentiment;

    const orderBy: Record<string, 'asc' | 'desc'> = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else {
      orderBy.tripDate = sortOrder;
    }

    const [data, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('GET /api/feedback error:', error);
    
    const isDemo = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('file:');
    if (isDemo) {
      const mockFeedback = [
        { id: '1', passengerId: 'P001', tripId: 'T001', vehicleId: 'V001', rating: 5, feedbackText: '行驶平稳舒适，非常满意！', category: '行驶体验', route: '望京SOHO-中关村', city: '北京', tripDate: new Date().toISOString(), tripDuration: 25, createdAt: new Date().toISOString(), sentiment: 'positive' },
        { id: '2', passengerId: 'P002', tripId: 'T002', vehicleId: 'V002', rating: 4, feedbackText: '车内环境干净整洁', category: '车内环境', route: '国贸CBD-三里屯', city: '北京', tripDate: new Date().toISOString(), tripDuration: 18, createdAt: new Date().toISOString(), sentiment: 'positive' },
        { id: '3', passengerId: 'P003', tripId: 'T003', vehicleId: 'V003', rating: 3, feedbackText: '等车时间有点长', category: '接驾体验', route: '中关村-清华西门', city: '北京', tripDate: new Date().toISOString(), tripDuration: 20, createdAt: new Date().toISOString(), sentiment: 'neutral' },
        { id: '4', passengerId: 'P004', tripId: 'T004', vehicleId: 'V004', rating: 5, feedbackText: '路线规划很智能', category: '路线规划', route: '北京南站-前门', city: '北京', tripDate: new Date().toISOString(), tripDuration: 30, createdAt: new Date().toISOString(), sentiment: 'positive' },
        { id: '5', passengerId: 'P005', tripId: 'T005', vehicleId: 'V005', rating: 4, feedbackText: '安全感受很好', category: '安全感受', route: '首都机场T3-望京', city: '北京', tripDate: new Date().toISOString(), tripDuration: 45, createdAt: new Date().toISOString(), sentiment: 'positive' },
      ];
      return NextResponse.json({
        data: mockFeedback,
        total: 127,
        page: 1,
        pageSize: 10,
        totalPages: 13,
        _demo: true,
        message: '演示模式：使用模拟数据'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch feedback',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = ['passengerId', 'tripId', 'vehicleId', 'rating', 'feedbackText', 'category', 'route', 'city', 'tripDate', 'tripDuration', 'sentiment'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const feedback = await prisma.feedback.create({ data: body });
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('POST /api/feedback error:', error);
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 });
  }
}