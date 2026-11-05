import {
  SalesOrder,
  AggregatedAnalytics,
  RegionQuarterData,
  RegionVarianceAnalysis,
  ProductDriver,
  ChannelDriver,
} from '../types';

export function computeAnalytics(orders: SalesOrder[]): AggregatedAnalytics {
  if (orders.length === 0) {
    return {
      quarters: [],
      regions: [],
      channels: [],
      products: [],
      matrix: {},
      quarterTotals: {},
      regionTotals: {},
      grandTotalRevenue: 0,
      grandTotalUnits: 0,
      overallAvgDiscount: 0,
      hasQ2AndQ3: false,
      regionVariances: [],
      maxDollarChangedRegion: null,
      maxPctChangedRegion: null,
    };
  }

  // Collect unique entities
  const quarterSet = new Set<string>();
  const regionSet = new Set<string>();
  const channelSet = new Set<string>();
  const productSet = new Set<string>();

  orders.forEach((o) => {
    quarterSet.add(o.quarter);
    regionSet.add(o.region);
    channelSet.add(o.channel);
    productSet.add(o.product);
  });

  // Sort quarters in chronological order if Q1, Q2, Q3, Q4, otherwise alphabetically
  const standardQOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarters = Array.from(quarterSet).sort((a, b) => {
    const idxA = standardQOrder.indexOf(a);
    const idxB = standardQOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const regions = Array.from(regionSet).sort();
  const channels = Array.from(channelSet).sort();
  const products = Array.from(productSet).sort();

  // Initialize Matrix
  const matrix: Record<string, Record<string, RegionQuarterData>> = {};
  regions.forEach((r) => {
    matrix[r] = {};
    quarters.forEach((q) => {
      matrix[r][q] = { revenue: 0, units: 0, avgDiscount: 0, orderCount: 0 };
    });
  });

  const regionTotals: Record<string, number> = {};
  regions.forEach((r) => (regionTotals[r] = 0));

  const quarterTotals: Record<string, number> = {};
  quarters.forEach((q) => (quarterTotals[q] = 0));

  let grandTotalRevenue = 0;
  let grandTotalUnits = 0;
  let totalDiscountWeightedRevenue = 0;

  // Track discounts for weighted averages per region-quarter
  const discountWeightAccumulator: Record<string, Record<string, { weightRev: number; totalRev: number }>> = {};
  regions.forEach((r) => {
    discountWeightAccumulator[r] = {};
    quarters.forEach((q) => {
      discountWeightAccumulator[r][q] = { weightRev: 0, totalRev: 0 };
    });
  });

  orders.forEach((o) => {
    const r = o.region;
    const q = o.quarter;

    if (!matrix[r]) matrix[r] = {};
    if (!matrix[r][q]) {
      matrix[r][q] = { revenue: 0, units: 0, avgDiscount: 0, orderCount: 0 };
      discountWeightAccumulator[r][q] = { weightRev: 0, totalRev: 0 };
    }

    matrix[r][q].revenue += o.revenue;
    matrix[r][q].units += o.units;
    matrix[r][q].orderCount += 1;

    discountWeightAccumulator[r][q].weightRev += o.discount_pct * (o.revenue || 1);
    discountWeightAccumulator[r][q].totalRev += o.revenue || 1;

    regionTotals[r] = (regionTotals[r] || 0) + o.revenue;
    quarterTotals[q] = (quarterTotals[q] || 0) + o.revenue;
    grandTotalRevenue += o.revenue;
    grandTotalUnits += o.units;

    totalDiscountWeightedRevenue += o.discount_pct * (o.revenue || 1);
  });

  // Calculate weighted average discounts
  regions.forEach((r) => {
    quarters.forEach((q) => {
      const acc = discountWeightAccumulator[r]?.[q];
      if (acc && acc.totalRev > 0) {
        matrix[r][q].avgDiscount = acc.weightRev / acc.totalRev;
      }
    });
  });

  const overallAvgDiscount = grandTotalRevenue > 0 ? totalDiscountWeightedRevenue / grandTotalRevenue : 0;

  // Q2 vs Q3 Variance Calculation
  // Find matching Q2 and Q3 keys
  const q2Key = quarters.find((q) => q.toUpperCase() === 'Q2' || q.toLowerCase().includes('q2'));
  const q3Key = quarters.find((q) => q.toUpperCase() === 'Q3' || q.toLowerCase().includes('q3'));

  const hasQ2AndQ3 = !!q2Key && !!q3Key;
  const regionVariances: RegionVarianceAnalysis[] = [];

  if (hasQ2AndQ3 && q2Key && q3Key) {
    regions.forEach((r) => {
      const q2Data = matrix[r][q2Key] || { revenue: 0, units: 0, avgDiscount: 0, orderCount: 0 };
      const q3Data = matrix[r][q3Key] || { revenue: 0, units: 0, avgDiscount: 0, orderCount: 0 };

      const revenueDiff = q3Data.revenue - q2Data.revenue;
      const absRevenueDiff = Math.abs(revenueDiff);
      const pctChange = q2Data.revenue > 0 ? (revenueDiff / q2Data.revenue) * 100 : q3Data.revenue > 0 ? 100 : 0;
      const unitsDiff = q3Data.units - q2Data.units;

      // Calculate product drivers for this region between Q2 and Q3
      const productQ2: Record<string, number> = {};
      const productQ3: Record<string, number> = {};

      orders
        .filter((o) => o.region === r && (o.quarter === q2Key || o.quarter === q3Key))
        .forEach((o) => {
          if (o.quarter === q2Key) {
            productQ2[o.product] = (productQ2[o.product] || 0) + o.revenue;
          } else if (o.quarter === q3Key) {
            productQ3[o.product] = (productQ3[o.product] || 0) + o.revenue;
          }
        });

      const topProductDrivers: ProductDriver[] = products
        .map((p) => {
          const rev2 = productQ2[p] || 0;
          const rev3 = productQ3[p] || 0;
          const diff = rev3 - rev2;
          const pct = rev2 > 0 ? (diff / rev2) * 100 : rev3 > 0 ? 100 : 0;
          return { product: p, q2Revenue: rev2, q3Revenue: rev3, diff, pctChange: pct };
        })
        .filter((d) => d.q2Revenue > 0 || d.q3Revenue > 0)
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

      // Calculate channel drivers for this region between Q2 and Q3
      const channelQ2: Record<string, number> = {};
      const channelQ3: Record<string, number> = {};

      orders
        .filter((o) => o.region === r && (o.quarter === q2Key || o.quarter === q3Key))
        .forEach((o) => {
          if (o.quarter === q2Key) {
            channelQ2[o.channel] = (channelQ2[o.channel] || 0) + o.revenue;
          } else if (o.quarter === q3Key) {
            channelQ3[o.channel] = (channelQ3[o.channel] || 0) + o.revenue;
          }
        });

      const topChannelDrivers: ChannelDriver[] = channels
        .map((c) => {
          const rev2 = channelQ2[c] || 0;
          const rev3 = channelQ3[c] || 0;
          const diff = rev3 - rev2;
          const pct = rev2 > 0 ? (diff / rev2) * 100 : rev3 > 0 ? 100 : 0;
          return { channel: c, q2Revenue: rev2, q3Revenue: rev3, diff, pctChange: pct };
        })
        .filter((d) => d.q2Revenue > 0 || d.q3Revenue > 0)
        .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

      regionVariances.push({
        region: r,
        q2Revenue: q2Data.revenue,
        q3Revenue: q3Data.revenue,
        revenueDiff,
        absRevenueDiff,
        pctChange,
        q2Units: q2Data.units,
        q3Units: q3Data.units,
        unitsDiff,
        q2AvgDiscount: q2Data.avgDiscount,
        q3AvgDiscount: q3Data.avgDiscount,
        topProductDrivers,
        topChannelDrivers,
        primaryProductGrowth: topProductDrivers[0]?.product,
        primaryChannelGrowth: topChannelDrivers[0]?.channel,
      });
    });
  }

  // Find max changed regions
  let maxDollarChangedRegion: RegionVarianceAnalysis | null = null;
  let maxPctChangedRegion: RegionVarianceAnalysis | null = null;

  if (regionVariances.length > 0) {
    // Sort by absolute dollar change descending
    const byDollar = [...regionVariances].sort((a, b) => b.absRevenueDiff - a.absRevenueDiff);
    maxDollarChangedRegion = byDollar[0];

    // Sort by absolute percentage change descending
    const byPct = [...regionVariances].sort((a, b) => Math.abs(b.pctChange) - Math.abs(a.pctChange));
    maxPctChangedRegion = byPct[0];
  }

  return {
    quarters,
    regions,
    channels,
    products,
    matrix,
    quarterTotals,
    regionTotals,
    grandTotalRevenue,
    grandTotalUnits,
    overallAvgDiscount,
    hasQ2AndQ3,
    regionVariances,
    maxDollarChangedRegion,
    maxPctChangedRegion,
  };
}

export function formatCurrency(amount: number, compact: boolean = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}k`;
    }
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}
