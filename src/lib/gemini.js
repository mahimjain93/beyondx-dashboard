export async function askGemini(question, context) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, context }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data?.error || `Gemini error ${res.status}`)
  }

  return data.text ?? 'No response from Gemini.'
}
