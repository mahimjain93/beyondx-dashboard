import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

const CHANNEL_COLORS = {
  Amazon: '#1a1a1a',
  Flipkart: '#6b7280',
  'Own Website': '#9ca3af',
  'Offline - Modern Trade': '#d1d5db',
  'Offline - General Trade': '#e5e7eb',
}

export default function NpsAfterSales({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('nps_aftersales')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const avgNps = data.length
    ? Math.round(data.reduce((s, r) => s + num(r.NPS_Score), 0) / data.length)
    : null
  const totalComplaints = data.reduce((s, r) => s + num(r.Complaints_Count), 0)
  const avgResolution = data.length
    ? (data.reduce((s, r) => s + num(r.Avg_Resolution_Days), 0) / data.length).toFixed(1)
    : null

  // NPS by channel (average)
  const byChannel = {}
  data.forEach(r => {
    if (!byChannel[r.Channel]) byChannel[r.Channel] = { Channel: r.Channel, total: 0, count: 0, Complaints_Count: 0 }
    byChannel[r.Channel].total += num(r.NPS_Score)
    byChannel[r.Channel].count += 1
    byChannel[r.Channel].Complaints_Count += num(r.Complaints_Count)
  })
  const channelData = Object.values(byChannel).map(c => ({
    Channel: c.Channel,
    Avg_NPS: Math.round(c.total / c.count),
    Complaints_Count: c.Complaints_Count,
  }))

  // NPS trend by week (avg across channels)
  const byWeek = {}
  data.forEach(r => {
    if (!byWeek[r.Week]) byWeek[r.Week] = { Week: r.Week, total: 0, count: 0 }
    byWeek[r.Week].total += num(r.NPS_Score)
    byWeek[r.Week].count += 1
  })
  const weekData = Object.values(byWeek)
    .map(w => ({ Week: w.Week, Avg_NPS: Math.round(w.total / w.count) }))
    .sort((a, b) => a.Week > b.Week ? 1 : -1)

  // Top complaint categories
  const complaints = {}
  data.forEach(r => {
    complaints[r.Top_Complaint_Category] = (complaints[r.Top_Complaint_Category] || 0) + 1
  })
  const topComplaint = Object.entries(complaints).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#1a2f6b] uppercase tracking-wide">NPS & After-Sales</h2>
        <SourceButton href={SHEET_URLS.nps_aftersales} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Avg NPS Score" value={avgNps ?? '—'} sub="across all channels" />
        <KpiCard label="Total Complaints" value={totalComplaints} />
        <KpiCard label="Avg Resolution" value={avgResolution ? `${avgResolution} days` : '—'} />
        <KpiCard label="Top Issue" value={topComplaint ?? '—'} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">NPS trend by week (avg)</p>
        <div className="p-5 pt-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
              <XAxis dataKey="Week" tick={{ fontSize: 10, fill: '#6b84b8' }} angle={-20} textAnchor="end" height={40} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b84b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="Avg_NPS" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Avg NPS by channel</p>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                <XAxis dataKey="Channel" tick={{ fontSize: 9, fill: '#6b84b8' }} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b84b8' }} />
                <Tooltip />
                <Bar dataKey="Avg_NPS" fill="#1a2f6b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Total complaints by channel</p>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                <XAxis dataKey="Channel" tick={{ fontSize: 9, fill: '#6b84b8' }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} />
                <Tooltip />
                <Bar dataKey="Complaints_Count" fill="#f59e0b" radius={[3, 3, 0, 0]} />
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
