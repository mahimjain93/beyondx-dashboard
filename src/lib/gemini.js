const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

export async function askGemini(question, context) {
  if (!API_KEY) {
    return 'Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.'
  }

  const prompt = `You are an analytics assistant for BeyondX, a home appliances brand.
Answer the following question based on the dashboard data provided.
Be concise (2-4 sentences). Use numbers when available. If data is insufficient, say so.

Dashboard data (JSON):
${JSON.stringify(context, null, 2)}

Question: ${question}`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.3 },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini error ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response from Gemini.'
}
