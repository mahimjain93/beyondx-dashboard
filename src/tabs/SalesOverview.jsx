import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

export default function SalesOverview({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('sales_overview')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const keys = Object.keys(data[0] ?? {})
  const revenueKey = keys.find(k => /revenue/i.test(k)) ?? keys[1] ?? ''
  const unitsKey = keys.find(k => /unit/i.test(k)) ?? keys[2] ?? ''
  const dateKey = keys.find(k => /month|date|period|week/i.test(k)) ?? keys[0] ?? ''
  const chartKey = (r) => r[dateKey] ?? ''

  const totalRevenue = data.reduce((s, r) => s + num(r[revenueKey] ?? 0), 0)
  const totalUnits = data.reduce((s, r) => s + num(r[unitsKey] ?? 0), 0)
  const avgOrderValue = totalUnits ? totalRevenue / totalUnits : 0

  const sorted = [...data].sort((a, b) => String(a[dateKey]) > String(b[dateKey]) ? 1 : -1)
  const last = sorted[sorted.length - 1]
  const prev = sorted[sorted.length - 2]
  const growth = prev && num(prev[revenueKey])
    ? Math.round(((num(last?.[revenueKey]) - num(prev[revenueKey])) / num(prev[revenueKey])) * 100)
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Sales Overview</h2>
        <SourceButton href={SHEET_URLS.sales_overview} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={`₹${(totalRevenue / 1e5).toFixed(1)}L`} trend={growth} sub="vs last month" />
        <KpiCard label="Units Sold" value={totalUnits.toLocaleString()} />
        <KpiCard label="Avg Order Value" value={`₹${Math.round(avgOrderValue).toLocaleString()}`} />
        <KpiCard label="Data Points" value={data.length} sub="months" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Revenue trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={chartKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey={revenueKey} stroke="#1a1a1a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Units sold by period</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={chartKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={unitsKey} fill="#d1d5db" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-48 text-gray-300">
      <Loader2 className="animate-spin" size={24} />
    </div>
  )
}

function Error({ msg }) {
  return (
    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
      Failed to load: {msg}
    </div>
  )
}
