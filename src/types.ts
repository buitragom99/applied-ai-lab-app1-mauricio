export interface SalesOrder {
  id?: string;
  quarter: string; // e.g., 'Q1', 'Q2', 'Q3', 'Q4' or '2024-Q1'
  region: string;
  channel: string;
  product: string;
  units: number;
  discount_pct: number; // 0 - 100 or 0 - 1 decimal
  revenue: number;
}

export interface ProductDriver {
  product: string;
  q2Revenue: number;
  q3Revenue: number;
  diff: number;
  pctChange: number;
}

export interface ChannelDriver {
  channel: string;
  q2Revenue: number;
  q3Revenue: number;
  diff: number;
  pctChange: number;
}

export interface RegionQuarterData {
  revenue: number;
  units: number;
  avgDiscount: number;
  orderCount: number;
}

export interface RegionVarianceAnalysis {
  region: string;
  q2Revenue: number;
  q3Revenue: number;
  revenueDiff: number;
  absRevenueDiff: number;
  pctChange: number;
  q2Units: number;
  q3Units: number;
  unitsDiff: number;
  q2AvgDiscount: number;
  q3AvgDiscount: number;
  topProductDrivers: ProductDriver[];
  topChannelDrivers: ChannelDriver[];
  primaryProductGrowth?: string;
  primaryChannelGrowth?: string;
}

export interface AggregatedAnalytics {
  quarters: string[];
  regions: string[];
  channels: string[];
  products: string[];
  matrix: Record<string, Record<string, RegionQuarterData>>; // [region][quarter]
  quarterTotals: Record<string, number>;
  regionTotals: Record<string, number>;
  grandTotalRevenue: number;
  grandTotalUnits: number;
  overallAvgDiscount: number;
  hasQ2AndQ3: boolean;
  regionVariances: RegionVarianceAnalysis[];
  maxDollarChangedRegion: RegionVarianceAnalysis | null;
  maxPctChangedRegion: RegionVarianceAnalysis | null;
}

export interface AiSummaryResponse {
  summary: string;
  model: string;
  targetRegion: string;
  revenueDiff: number;
  pctChange: number;
}
