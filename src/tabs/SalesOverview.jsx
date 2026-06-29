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

function fmt(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

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

  const totalRevenue = data.reduce((s, r) => s + num(r.Revenue_INR), 0)
  const totalUnits = data.reduce((s, r) => s + num(r.Units_Sold), 0)
  const avgOrderValue = totalUnits ? totalRevenue / totalUnits : 0

  // Aggregate by week for chart
  const byWeek = {}
  data.forEach(r => {
    const w = r.Week
    if (!byWeek[w]) byWeek[w] = { Week: w, Revenue_INR: 0, Units_Sold: 0 }
    byWeek[w].Revenue_INR += num(r.Revenue_INR)
    byWeek[w].Units_Sold += num(r.Units_Sold)
  })
  const weekData = Object.values(byWeek).sort((a, b) => a.Week > b.Week ? 1 : -1)

  const last = weekData[weekData.length - 1]
  const prev = weekData[weekData.length - 2]
  const growth = prev?.Revenue_INR
    ? Math.round(((last?.Revenue_INR - prev.Revenue_INR) / prev.Revenue_INR) * 100)
    : null

  // Aggregate by channel
  const byChannel = {}
  data.forEach(r => {
    if (!byChannel[r.Channel]) byChannel[r.Channel] = { Channel: r.Channel, Revenue_INR: 0, Units_Sold: 0 }
    byChannel[r.Channel].Revenue_INR += num(r.Revenue_INR)
    byChannel[r.Channel].Units_Sold += num(r.Units_Sold)
  })
  const channelData = Object.values(byChannel)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Sales Overview</h2>
        <SourceButton href={SHEET_URLS.sales_overview} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmt(totalRevenue)} trend={growth} sub="vs last week" />
        <KpiCard label="Units Sold" value={totalUnits.toLocaleString('en-IN')} />
        <KpiCard label="Avg Selling Price" value={fmt(avgOrderValue)} />
        <KpiCard label="Weeks of Data" value={weekData.length} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Weekly revenue trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="Week" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1e5).toFixed(0)}L`} />
            <Tooltip formatter={v => [fmt(v), 'Revenue']} />
            <Line type="monotone" dataKey="Revenue_INR" stroke="#1a1a1a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Revenue by channel</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="Channel" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1e5).toFixed(0)}L`} />
              <Tooltip formatter={v => [fmt(v), 'Revenue']} />
              <Bar dataKey="Revenue_INR" fill="#1a1a1a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Units by channel</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="Channel" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Units_Sold" fill="#d1d5db" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
