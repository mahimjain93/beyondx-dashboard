import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

function num(v) { return parseFloat(String(v).replace(/[^0-9.%-]/g, '')) || 0 }

export default function MarginBySku({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('margin_by_sku')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const keys = Object.keys(data[0] ?? {})
  const skuKey = keys[0] ?? ''
  const marginKey = keys.find(k => /margin/i.test(k)) ?? keys[1] ?? ''
  const revenueKey = keys.find(k => /revenue/i.test(k)) ?? keys[2] ?? ''

  const margins = data.map(r => num(r[marginKey]))
  const avgMargin = margins.length ? (margins.reduce((a, b) => a + b, 0) / margins.length).toFixed(1) : null
  const best = [...data].sort((a, b) => num(b[marginKey]) - num(a[marginKey]))[0]
  const worst = [...data].sort((a, b) => num(a[marginKey]) - num(b[marginKey]))[0]

  const chartData = [...data].sort((a, b) => num(b[marginKey]) - num(a[marginKey]))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Margin by SKU</h2>
        <SourceButton href={SHEET_URLS.margin_by_sku} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Avg Margin" value={avgMargin ? `${avgMargin}%` : '—'} />
        <KpiCard label="Best SKU" value={best?.[skuKey] ?? '—'} sub={best ? `${num(best[marginKey])}%` : ''} />
        <KpiCard label="Worst SKU" value={worst?.[skuKey] ?? '—'} sub={worst ? `${num(worst[marginKey])}%` : ''} />
        <KpiCard label="SKUs" value={data.length} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Margin % by SKU (sorted)</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={skuKey} tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={55} />
            <YAxis tick={{ fontSize: 11 }} unit="%" />
            <Tooltip formatter={(v) => [`${v}%`, marginKey]} />
            <Bar dataKey={marginKey} radius={[3, 3, 0, 0]}>
              {chartData.map((row, i) => (
                <Cell key={i} fill={num(row[marginKey]) >= num(avgMargin) ? '#1a1a1a' : '#d1d5db'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {revenueKey && revenueKey !== marginKey && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">{revenueKey} by SKU</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={skuKey} tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey={revenueKey} fill="#6b7280" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
