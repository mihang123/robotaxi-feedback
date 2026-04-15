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