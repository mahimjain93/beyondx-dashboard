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
    <div className="bg-white rounded-xl shadow-sm p-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b84b8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the dashboard… e.g. Which retailer has the lowest NPS?"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#d0daea] rounded-lg outline-none focus:border-[#1a2f6b] transition-colors text-[#1a2f6b] placeholder:text-[#6b84b8] bg-[#f4f7fc]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2 bg-[#1a2f6b] text-white text-sm rounded-lg hover:bg-[#152558] disabled:opacity-30 transition-colors flex items-center gap-2 font-semibold"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Ask
        </button>
      </form>

      {answer && (
        <div className="mt-3 p-3 bg-[#f4f7fc] rounded-lg text-sm text-[#1a2f6b] leading-relaxed border border-[#d0daea]">
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
