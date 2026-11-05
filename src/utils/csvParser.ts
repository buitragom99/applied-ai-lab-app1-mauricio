import { SalesOrder } from '../types';

export interface ParseResult {
  orders: SalesOrder[];
  errors: string[];
  warnings: string[];
  detectedColumns: Record<string, string>;
  totalRowsProcessed: number;
}

// Robust RFC-4180 compliant CSV line tokenizer
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentToken = '';
  let inQuotes = false;

  // Normalize line breaks
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentToken += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentToken += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentToken.trim());
        currentToken = '';
      } else if (char === '\n') {
        currentRow.push(currentToken.trim());
        if (currentRow.some((field) => field.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
  }

  // Push last row if exists
  if (currentToken.length > 0 || currentRow.length > 0) {
    currentRow.push(currentToken.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Clean and normalize numeric input (stripping $, commas, %, etc.)
function parseNumeric(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[$€£¥,%\s]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Clean discount: if value > 1, assume already percentage (e.g. 15% -> 15 or 0.15 -> 15%)
function parseDiscount(val: string): number {
  if (!val) return 0;
  const isPercentSymbol = val.includes('%');
  const cleaned = val.replace(/[$€£¥,%\s]/g, '').trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;

  if (isPercentSymbol) {
    return num;
  }
  // If decimal <= 1.0 (e.g. 0.15), convert to percentage representation (15.0%)
  if (num > 0 && num <= 1.0) {
    return num * 100;
  }
  return num;
}

// Normalize quarter representations (e.g. "2024-Q2", "Q2 2024", "Quarter 2", "q2" -> "Q2")
export function normalizeQuarter(raw: string): string {
  if (!raw) return 'Unknown';
  const trimmed = raw.trim();
  const match = trimmed.match(/(?:(?:20\d\d[-/ ]?)?[Qq](\d)|[Qq]uarter\s*(\d))/i);
  if (match) {
    const qNum = match[1] || match[2];
    return `Q${qNum}`;
  }
  return trimmed.toUpperCase();
}

export function parseSalesCsv(csvText: string): ParseResult {
  const rows = parseCsvRows(csvText);
  const errors: string[] = [];
  const warnings: string[] = [];
  const orders: SalesOrder[] = [];

  if (rows.length === 0) {
    return {
      orders: [],
      errors: ['The uploaded CSV file is empty.'],
      warnings: [],
      detectedColumns: {},
      totalRowsProcessed: 0,
    };
  }

  // Header detection
  const rawHeaders = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  // Define column alias mappings
  const aliases: Record<string, string[]> = {
    quarter: ['quarter', 'qtr', 'quarter_name', 'period', 'sales_quarter', 'q'],
    region: ['region', 'territory', 'geography', 'geo', 'area', 'market'],
    channel: ['channel', 'sales_channel', 'distribution_channel', 'route'],
    product: ['product', 'item', 'product_name', 'sku', 'offering'],
    units: ['units', 'qty', 'quantity', 'volume', 'units_sold'],
    discount_pct: ['discount_pct', 'discount', 'discount_percentage', 'discount_rate', 'discount_percent', 'disc_pct'],
    revenue: ['revenue', 'sales', 'sales_amount', 'total_revenue', 'net_revenue', 'amount', 'turnover'],
  };

  const detectedColumns: Record<string, number> = {};
  const headerMapDisplayName: Record<string, string> = {};

  for (const [standardKey, aliasList] of Object.entries(aliases)) {
    const idx = rawHeaders.findIndex((h) => {
      return aliasList.some((alias) => h === alias || h.includes(alias));
    });
    if (idx !== -1) {
      detectedColumns[standardKey] = idx;
      headerMapDisplayName[standardKey] = rows[0][idx];
    }
  }

  // Check required columns
  const required = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];
  const missing = required.filter((col) => detectedColumns[col] === undefined);

  if (missing.length > 0) {
    return {
      orders: [],
      errors: [
        `Missing required column(s): ${missing.join(', ')}. Found headers: [${rows[0].join(', ')}].`,
      ],
      warnings,
      detectedColumns: headerMapDisplayName,
      totalRowsProcessed: rows.length - 1,
    };
  }

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const rawQuarter = row[detectedColumns['quarter']] || '';
    const rawRegion = row[detectedColumns['region']] || '';
    const rawChannel = row[detectedColumns['channel']] || '';
    const rawProduct = row[detectedColumns['product']] || '';
    const rawUnits = row[detectedColumns['units']] || '';
    const rawDiscount = row[detectedColumns['discount_pct']] || '';
    const rawRevenue = row[detectedColumns['revenue']] || '';

    if (!rawQuarter || !rawRegion) {
      warnings.push(`Row ${i + 1}: Skipped row due to empty quarter or region.`);
      continue;
    }

    const units = Math.round(parseNumeric(rawUnits));
    const discount_pct = parseDiscount(rawDiscount);
    const revenue = parseNumeric(rawRevenue);

    if (isNaN(revenue)) {
      warnings.push(`Row ${i + 1}: Invalid revenue value '${rawRevenue}'. Recorded as 0.`);
    }

    orders.push({
      id: `ord-${i}`,
      quarter: normalizeQuarter(rawQuarter),
      region: rawRegion.trim(),
      channel: (rawChannel || 'Direct').trim(),
      product: (rawProduct || 'Standard Product').trim(),
      units: Math.max(0, units),
      discount_pct: Math.max(0, discount_pct),
      revenue: Math.max(0, revenue),
    });
  }

  return {
    orders,
    errors,
    warnings,
    detectedColumns: headerMapDisplayName,
    totalRowsProcessed: rows.length - 1,
  };
}
