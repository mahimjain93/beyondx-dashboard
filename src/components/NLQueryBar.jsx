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
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about the dashboard… e.g. Which retailer has the lowest NPS?"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-gray-400 transition-colors bg-gray-50 focus:bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Ask
        </button>
      </form>

      {answer && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100">
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
