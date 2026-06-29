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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#1a2f6b] uppercase tracking-wide">Sales Overview</h2>
        <SourceButton href={SHEET_URLS.sales_overview} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={fmt(totalRevenue)} trend={growth} sub="vs last week" />
        <KpiCard label="Units Sold" value={totalUnits.toLocaleString('en-IN')} />
        <KpiCard label="Avg Selling Price" value={fmt(avgOrderValue)} />
        <KpiCard label="Weeks of Data" value={weekData.length} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Weekly revenue trend</p>
        <div className="p-5 pt-4">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
              <XAxis dataKey="Week" tick={{ fontSize: 10, fill: '#6b84b8' }} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} tickFormatter={v => `₹${(v/1e5).toFixed(0)}L`} />
              <Tooltip formatter={v => [fmt(v), 'Revenue']} />
              <Line type="monotone" dataKey="Revenue_INR" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Revenue by channel</p>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                <XAxis dataKey="Channel" tick={{ fontSize: 10, fill: '#6b84b8' }} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} tickFormatter={v => `${(v/1e5).toFixed(0)}L`} />
                <Tooltip formatter={v => [fmt(v), 'Revenue']} />
                <Bar dataKey="Revenue_INR" fill="#1a2f6b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Units by channel</p>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                <XAxis dataKey="Channel" tick={{ fontSize: 10, fill: '#6b84b8' }} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} />
                <Tooltip />
                <Bar dataKey="Units_Sold" fill="#93c5fd" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#6b84b8]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
