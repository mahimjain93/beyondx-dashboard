import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { askGemini } from '../lib/gemini'

export default function NLQueryBar({ dashboardData }) {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setAnswer(null)
    setError(null)
    try {
      const result = await askGemini(query, dashboardData)
      setAnswer(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8EEF6] p-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8C4E0]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the dashboard… e.g. Which retailer has the lowest NPS?"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E8EEF6] rounded-lg outline-none focus:border-[#1B2A6B] transition-colors text-[#1B2A6B] placeholder:text-[#A8C4E0] bg-[#F5F7FA]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2.5 bg-[#1B2A6B] text-white text-sm rounded-lg hover:bg-[#152257] disabled:opacity-30 transition-colors flex items-center gap-2 font-semibold shrink-0"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Ask Gemini
        </button>
      </form>

      {answer && (
        <div className="mt-3 p-4 bg-[#F5F7FA] rounded-lg text-sm text-[#1B2A6B] leading-relaxed border border-[#E8EEF6]">
          {answer}
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}
    </div>
  )
}
