import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint to generate 3-sentence executive summary based STRICTLY on calculated numbers
app.post('/api/ai/summary', async (req: Request, res: Response) => {
  try {
    const {
      maxChangedRegion,
      comparisonBasis, // 'dollar' | 'percent'
      allRegionChanges,
      calculatedDetails,
    } = req.body;

    if (!maxChangedRegion) {
      return res.status(400).json({ error: 'Missing calculated region change data.' });
    }

    if (!ai) {
      // If no API key is present in environment, return a helpful error so UI can display it
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets panel.',
      });
    }

    const prompt = `You are a senior executive financial intelligence analyst.
Analyze the following strictly pre-calculated regional sales performance data for Q2 to Q3.
You MUST write a crisp, factual, exactly THREE-SENTENCE summary explaining which region changed the most from Q2 to Q3, and why, using ONLY the exact numbers provided below.

RULES:
1. Output MUST be exactly three sentences. No title, no bullets, no markdown bolding, no preface, no trailing commentary. Just 3 complete sentences.
2. Sentence 1: Identify the region that changed the most from Q2 to Q3 (${comparisonBasis === 'dollar' ? 'by absolute dollar revenue' : 'by percentage growth/decline'}), quoting its exact Q2 revenue, Q3 revenue, and the net change ($ and %).
3. Sentence 2: Explain WHY it changed using the exact calculated product drivers and channel drivers (cite the product(s) or channel(s) that accounted for the largest shift, with their specific figures).
4. Sentence 3: Cite the calculated unit volume shift and average discount percentage impact (or net profitability factor), concluding the operational significance of this regional swing.
5. Grounding: Do NOT invent, assume, or hallucinate any numbers or external market factors not provided in the data.

PRE-CALCULATED REGIONAL METRICS:
- Primary Region with Largest Q2->Q3 Shift: ${maxChangedRegion.region}
- Comparison Criterion: ${comparisonBasis === 'dollar' ? 'Absolute Revenue Dollar Change' : 'Percentage Revenue Growth Rate'}
- Q2 Total Revenue: $${Number(maxChangedRegion.q2Revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Q3 Total Revenue: $${Number(maxChangedRegion.q3Revenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Net Revenue Variance: ${maxChangedRegion.revenueDiff >= 0 ? '+' : ''}$${Number(maxChangedRegion.revenueDiff).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${maxChangedRegion.pctChange >= 0 ? '+' : ''}${maxChangedRegion.pctChange.toFixed(1)}%)
- Q2 Units Sold: ${Number(maxChangedRegion.q2Units).toLocaleString('en-US')} units
- Q3 Units Sold: ${Number(maxChangedRegion.q3Units).toLocaleString('en-US')} units (Net: ${maxChangedRegion.unitsDiff >= 0 ? '+' : ''}${Number(maxChangedRegion.unitsDiff).toLocaleString('en-US')} units)
- Average Discount Q2: ${maxChangedRegion.q2AvgDiscount.toFixed(1)}%
- Average Discount Q3: ${maxChangedRegion.q3AvgDiscount.toFixed(1)}% (Variance: ${(maxChangedRegion.q3AvgDiscount - maxChangedRegion.q2AvgDiscount >= 0 ? '+' : '')}${(maxChangedRegion.q3AvgDiscount - maxChangedRegion.q2AvgDiscount).toFixed(1)} percentage points)

PRODUCT DRIVERS FOR ${maxChangedRegion.region}:
${JSON.stringify(maxChangedRegion.topProductDrivers, null, 2)}

CHANNEL DRIVERS FOR ${maxChangedRegion.region}:
${JSON.stringify(maxChangedRegion.topChannelDrivers, null, 2)}

ALL REGIONS Q2 TO Q3 COMPARISON (For Context):
${JSON.stringify(allRegionChanges, null, 2)}

ADDITIONAL CALCULATED METRICS:
${JSON.stringify(calculatedDetails || {}, null, 2)}

Write the exact 3 sentences now:`;

    // Retry helper with model failover for transient 503 / 429 API spikes
    let responseText = '';
    let usedModel = 'gemini-3.8-flash';
    let lastError: any = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const modelName of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction:
                'You are a precise corporate finance analyst. You must produce strictly 3 sentences explaining which region changed most between Q2 and Q3 and why, strictly citing the provided calculated figures without extrapolation or hallucinations.',
            },
          });
          responseText = response.text ? response.text.trim() : '';
          if (responseText) {
            usedModel = modelName;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} attempt ${attempt} failed:`, err?.message || err);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }
      if (responseText) break;
    }

    if (!responseText && lastError) {
      throw lastError;
    }

    const summary = responseText;

    return res.json({
      summary,
      model: usedModel,
      targetRegion: maxChangedRegion.region,
      revenueDiff: maxChangedRegion.revenueDiff,
      pctChange: maxChangedRegion.pctChange,
    });
  } catch (err: any) {
    console.error('Error in /api/ai/summary:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate AI executive summary',
    });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
