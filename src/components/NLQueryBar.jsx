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
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c6c3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the dashboard… e.g. Which retailer has the lowest NPS?"
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#e9e9e7] rounded-md outline-none focus:border-[#9b9a97] transition-colors text-[#37352f] placeholder:text-[#c7c6c3]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-[#37352f] text-white text-sm rounded-md hover:bg-[#1a1a18] disabled:opacity-30 transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 size={13} className="animate-spin" />}
          Ask
        </button>
      </form>

      {answer && (
        <div className="mt-3 p-3 bg-[#f7f6f3] rounded-md text-sm text-[#37352f] leading-relaxed border border-[#e9e9e7]">
          {answer}
        </div>
      )}
      {error && (
        <div className="mt-3 p-3 bg-red-50 rounded-md text-sm text-red-600 border border-red-100">
          {error}
        </div>
      )}
    </div>
  )
}
