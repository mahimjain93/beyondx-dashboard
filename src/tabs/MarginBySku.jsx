import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

const C = { navy: '#1B2A6B', orange: '#F5A623', blue: '#A8C4E0', grid: '#EBF0F8', axis: '#7a91b8' }

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }
function fmt(n) {
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold text-[#566584] uppercase tracking-[0.12em] mb-4">{children}</p>
}

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

  const bySku = {}
  data.forEach(r => {
    if (!bySku[r.SKU]) bySku[r.SKU] = { SKU: r.SKU, marginSum: 0, count: 0, Units_Sold: 0, Gross_Profit_INR: 0 }
    bySku[r.SKU].marginSum += num(r.Gross_Margin_Pct)
    bySku[r.SKU].count += 1
    bySku[r.SKU].Units_Sold += num(r.Units_Sold)
    bySku[r.SKU].Gross_Profit_INR += num(r.Gross_Profit_INR)
  })
  const skuData = Object.values(bySku).map(s => ({
    SKU: s.SKU,
    Avg_Margin_Pct: parseFloat((s.marginSum / s.count).toFixed(1)),
    Units_Sold: s.Units_Sold,
    Gross_Profit_INR: s.Gross_Profit_INR,
  })).sort((a, b) => b.Avg_Margin_Pct - a.Avg_Margin_Pct)

  const avgMargin = skuData.length
    ? (skuData.reduce((s, r) => s + r.Avg_Margin_Pct, 0) / skuData.length).toFixed(1)
    : null

  const byWeek = {}
  data.forEach(r => {
    if (!byWeek[r.Week]) byWeek[r.Week] = { Week: r.Week, total: 0, count: 0 }
    byWeek[r.Week].total += num(r.Gross_Margin_Pct)
    byWeek[r.Week].count += 1
  })
  const weekData = Object.values(byWeek)
    .map(w => ({ Week: w.Week, Avg_Margin: parseFloat((w.total / w.count).toFixed(1)) }))
    .sort((a, b) => a.Week > b.Week ? 1 : -1)

  const best = skuData[0]
  const totalProfit = skuData.reduce((s, r) => s + r.Gross_Profit_INR, 0)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2A6B]">Margin by SKU</h2>
        <SourceButton href={SHEET_URLS.margin_by_sku} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <KpiCard label="Avg Gross Margin" value={avgMargin ? `${avgMargin}%` : '—'} />
        <KpiCard label="Best Margin SKU" value={best?.SKU?.replace(' - ', ' ') ?? '—'} sub={`${best?.Avg_Margin_Pct}%`} />
        <KpiCard label="Total Gross Profit" value={fmt(totalProfit)} />
        <KpiCard label="SKUs" value={skuData.length} />
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF6] p-6">
        <SectionTitle>Avg Gross Margin % by SKU</SectionTitle>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={skuData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="SKU" tick={{ fontSize: 10, fill: C.axis }} angle={-20} textAnchor="end" height={55} />
            <YAxis tick={{ fontSize: 11, fill: C.axis }} unit="%" domain={[0, 50]} />
            <Tooltip formatter={v => [`${v}%`, 'Avg Margin']} />
            <Bar dataKey="Avg_Margin_Pct" name="Avg Margin %" radius={[3, 3, 0, 0]}>
              {skuData.map((row, i) => (
                <Cell key={i} fill={row.Avg_Margin_Pct >= parseFloat(avgMargin) ? C.navy : C.blue} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8EEF6] p-6">
          <SectionTitle>Margin % Trend by Week</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="Week" tick={{ fontSize: 10, fill: C.axis }} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} unit="%" domain={[25, 45]} />
              <Tooltip formatter={v => [`${v}%`, 'Avg Margin']} />
              <Legend wrapperStyle={{ fontSize: 12, color: C.axis }} />
              <Line type="monotone" dataKey="Avg_Margin" name="Avg Margin" stroke={C.orange} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-[#E8EEF6] p-6">
          <SectionTitle>Total Gross Profit by SKU</SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={skuData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="SKU" tick={{ fontSize: 10, fill: C.axis }} angle={-20} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} tickFormatter={v => `${(v/1e7).toFixed(1)}Cr`} />
              <Tooltip formatter={v => [fmt(v), 'Gross Profit']} />
              <Bar dataKey="Gross_Profit_INR" name="Gross Profit" fill={C.orange} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#A8C4E0]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
