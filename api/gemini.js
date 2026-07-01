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

  const prompt = `You are an analytics assistant for BeyondX, a home appliances brand.
Answer the following question based on the dashboard data provided.
Be concise (2-4 sentences). Use numbers when available. If data is insufficient, say so.

Field definitions — do not conflate these:
- "Channel" (in sales_overview and nps_aftersales) is a sales channel: Amazon, Flipkart, Own Website, Offline - Modern Trade, or Offline - General Trade. It is NOT an individual retailer.
- "Retailer_Name" (in retailer_coverage only) is an individual named retail store/partner. NPS and complaint data are not broken down by Retailer_Name.
If a question asks about "retailers" but the relevant metric is only available by Channel (or vice versa), say the breakdown isn't available at that level rather than answering with a Channel value as if it were a retailer.

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
