function num(v) {
  return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0
}

function groupSum(rows, groupKey, valueKey) {
  const out = {}
  for (const r of rows || []) {
    const k = r[groupKey]
    out[k] = (out[k] || 0) + num(r[valueKey])
  }
  return out
}

function groupAvg(rows, groupKey, valueKey, decimals) {
  const sums = {}, counts = {}
  for (const r of rows || []) {
    const k = r[groupKey]
    sums[k] = (sums[k] || 0) + num(r[valueKey])
    counts[k] = (counts[k] || 0) + 1
  }
  const out = {}
  for (const k of Object.keys(sums)) {
    out[k] = parseFloat((sums[k] / counts[k]).toFixed(decimals))
  }
  return out
}

function latestRowByKey(rows, groupKey, weekKey) {
  const out = {}
  for (const r of rows || []) {
    if (!out[r[groupKey]] || r[weekKey] > out[r[groupKey]][weekKey]) out[r[groupKey]] = r
  }
  return out
}

// Precompute the same aggregates each tab's charts already show, using plain
// JS math instead of asking Gemini to sum/average hundreds of raw JSON rows
// itself — in-context LLM arithmetic over large row counts is unreliable and
// was verified to produce wrong totals (e.g. revenue by channel off by 4x+).
function buildRollups(context) {
  const rollups = {}

  if (context?.sales_overview) {
    rollups.revenue_by_channel_INR = groupSum(context.sales_overview, 'Channel', 'Revenue_INR')
  }
  if (context?.install_tracker) {
    rollups.installs_by_city = groupSum(context.install_tracker, 'City', 'Installs')
  }
  if (context?.nps_aftersales) {
    // Rounded to match the whole-number Avg NPS shown in the NPS & After-Sales bar chart.
    rollups.avg_nps_by_channel = groupAvg(context.nps_aftersales, 'Channel', 'NPS_Score', 0)
  }
  if (context?.margin_by_sku) {
    rollups.avg_gross_margin_pct_by_sku = groupAvg(context.margin_by_sku, 'SKU', 'Gross_Margin_Pct', 1)
    rollups.total_gross_profit_INR = groupSum(context.margin_by_sku, 'SKU', 'Gross_Profit_INR')
  }
  if (context?.retailer_coverage) {
    const latest = latestRowByKey(context.retailer_coverage, 'Retailer_Name', 'Week')
    rollups.latest_week_gmv_by_retailer_INR = Object.fromEntries(
      Object.entries(latest).map(([name, row]) => [name, num(row.Monthly_GMV_INR)])
    )
  }

  return rollups
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Gemini API key not configured on server.' })
    return
  }

  const { question, context } = req.body ?? {}
  if (!question) {
    res.status(400).json({ error: 'Missing question.' })
    return
  }

  const rollups = buildRollups(context)

  const prompt = `You are an analytics assistant for BeyondX, a home appliances brand.
Answer the following question based on the dashboard data provided.
Be concise (2-4 sentences). Use numbers when available. If data is insufficient, say so.

The dashboard data is a JSON object keyed by dataset name, each an array of rows from one Google Sheet.
Every column's unit and format is fixed and defined below — never guess or reinterpret them:

sales_overview (weekly sales by channel/SKU/city):
- Week: date, format YYYY-MM-DD.
- Channel: sales channel — Amazon, Flipkart, Own Website, Offline - Modern Trade, or Offline - General Trade. NOT an individual retailer.
- SKU: product name string.
- Units_Sold: integer count of units.
- Revenue_INR: raw rupees (integer). NOT lakhs or crores — e.g. 782913 means ₹7,82,913, not ₹7.8L. Convert yourself if you want to state a value in L/Cr (1L = 100,000; 1Cr = 10,000,000), and label it explicitly when you do.
- City_Tier / City: Tier 1/2/3 classification and city name for that sale.

install_tracker (weekly installations by city/product):
- Week: date, YYYY-MM-DD. City / City_Tier: location. Product: SKU name.
- Installs: integer count of completed installation jobs (not a percentage or rate).
- Installer_ID: identifier string, not a metric.

retailer_coverage (weekly retailer partner snapshot):
- Week: date, YYYY-MM-DD. Retailer_Name: an individual named retail partner (e.g. "Croma", "HomeStop") — distinct from Channel above; NPS/complaint data does NOT exist per Retailer_Name.
- City / City_Tier: retailer location. Status: Active, Onboarding, or Churned (categorical, not numeric).
- Last_Order_Date: date, YYYY-MM-DD. Monthly_GMV_INR: raw rupees (integer), same convention as Revenue_INR.

nps_aftersales (weekly NPS/complaints by channel):
- Week: date, YYYY-MM-DD. Channel: same 5 channel values as sales_overview — NOT broken down by individual retailer.
- NPS_Score: whole number on a 0–100 scale (higher is better; this dataset does not use the classic -100..100 NPS range).
- Complaints_Count: integer count. Top_Complaint_Category: categorical label (e.g. "Installation Issue").
- Avg_Resolution_Days: decimal number of days (e.g. 2.8 or 3 — both mean days, some rows just have no fractional part).

margin_by_sku (weekly margin by SKU):
- Week: date, YYYY-MM-DD. SKU: product name.
- MRP_INR / COGS_INR: raw rupees (integer) — list price and cost of goods sold per unit.
- Gross_Margin_Pct: a percentage already on a 0–100 scale (e.g. 34.6 means 34.6%, not 0.346). Never multiply or divide it by 100.
- Units_Sold: integer count. Gross_Profit_INR: raw rupees (integer), same convention as Revenue_INR.

anomaly_log (flagged anomalies across all modules):
- Week: date, YYYY-MM-DD. Module / Metric: which tab and metric the anomaly relates to. Severity: Low/Medium/High (categorical). Alert_Text: human-readable description — treat this and Deviation_Pct as the authoritative summary of the anomaly.
- Deviation_Pct: percentage already on a 0–100+ scale, sign indicates direction (negative = below expected).
- Expected_Value / Actual_Value: internal anomaly-detection index numbers on a scale specific to that row's Metric. They are NOT directly comparable across different Metric rows, and are NOT on the same scale as the raw columns in other datasets (e.g. an Expected_Value of 286 for "NPS Score" is not itself an NPS score on the 0–100 scale used in nps_aftersales — it's an aggregated detector value). Do not attempt to reinterpret or convert these; rely on Deviation_Pct and Alert_Text for magnitude and direction instead.

General rule: if a question asks for a breakdown that doesn't exist at the level requested (e.g. "which retailer" when only Channel-level data exists for that metric), say so rather than substituting a value from a different field.

Precomputed rollups (exact sums/averages, already correct — for any question about a
total, average, or ranking across weeks/rows, such as total or highest/lowest revenue by
channel, installs by city, average NPS by channel, margin by SKU, or GMV by retailer, READ
THE ANSWER DIRECTLY FROM HERE. Do NOT sum or average the raw per-row data yourself — you
are a language model, not a calculator, and manually aggregating hundreds of JSON rows in
context is unreliable; when tested it produced totals off by 4x and misidentified the top
city and top NPS channel. Only fall back to the raw rows below for questions these rollups
don't cover, e.g. single-week or single-SKU lookups):
${JSON.stringify(rollups, null, 2)}

Dashboard data (JSON):
${JSON.stringify(context, null, 2)}

Question: ${question}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      res.status(response.status).json({ error: err?.error?.message || `Gemini error ${response.status}` })
      return
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from Gemini.'
    res.status(200).json({ text })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to reach Gemini.' })
  }
}
