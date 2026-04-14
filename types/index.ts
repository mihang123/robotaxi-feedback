export interface Feedback {
  id: string;
  passengerId: string;
  tripId: string;
  vehicleId: string;
  rating: number;
  feedbackText: string;
  category: string;
  route: string;
  city: string;
  tripDate: Date | string;
  tripDuration: number;
  createdAt: Date | string;
  aiSummary?: string | null;
  aiSuggestion?: string | null;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface FeedbackListResponse {
  data: Feedback[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OverviewStats {
  totalFeedback: number;
  avgRating: number;
  positiveRate: number;
  negativeRate: number;
  neutralRate: number;
  todayCount: number;
  weekCount: number;
}

export interface TrendData {
  date: string;
  count: number;
  avgRating: number;
  positive: number;
  negative: number;
  neutral: number;
}

export interface DistributionData {
  byRoute: { route: string; count: number; avgRating: number }[];
  byCategory: { category: string; count: number }[];
  byRating: { rating: number; count: number }[];
  byCity: { city: string; count: number; avgRating: number }[];
  bySentiment: { sentiment: string; count: number }[];
  byTimePeriod: { period: string; count: number }[];
}

export interface AIAnalysisResult {
  category: string;
  sentiment: string;
  confidence: number;
  summary?: string;
}

export interface AISuggestion {
  problem: string;
  solution: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface BatchSummaryResult {
  summary: string;
  keyPoints: string[];
  userNeeds: string;
  suggestions: AISuggestion[];
}

export interface FeedbackFilter {
  page?: number;
  pageSize?: number;
  ratingMin?: number;
  ratingMax?: number;
  startDate?: string;
  endDate?: string;
  city?: string;
  route?: string;
  category?: string;
  sentiment?: string;
  sortBy?: 'tripDate' | 'rating';
  sortOrder?: 'asc' | 'desc';
}