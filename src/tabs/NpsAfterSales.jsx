import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import { num } from '../lib/format'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import ChartCard from '../components/ChartCard'
import { Loader2 } from 'lucide-react'

const C = { navy: '#1B2A6B', orange: '#F5A623', blue: '#A8C4E0', grid: '#EBF0F8', axis: '#7a91b8' }

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

  const byWeek = {}
  data.forEach(r => {
    if (!byWeek[r.Week]) byWeek[r.Week] = { Week: r.Week, total: 0, count: 0 }
    byWeek[r.Week].total += num(r.NPS_Score)
    byWeek[r.Week].count += 1
  })
  const weekData = Object.values(byWeek)
    .map(w => ({ Week: w.Week, Avg_NPS: Math.round(w.total / w.count) }))
    .sort((a, b) => a.Week > b.Week ? 1 : -1)

  const complaints = {}
  data.forEach(r => {
    complaints[r.Top_Complaint_Category] = (complaints[r.Top_Complaint_Category] || 0) + 1
  })
  const topComplaint = Object.entries(complaints).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2A6B]">NPS & After-Sales</h2>
        <SourceButton href={SHEET_URLS.nps_aftersales} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Avg NPS Score" value={avgNps ?? '—'} sub="across all channels" tooltip="Average Net Promoter Score across all channels and weeks. NPS ranges from -100 to 100; above 50 is excellent." tooltipHref={SHEET_URLS.nps_aftersales} />
        <KpiCard label="Total Complaints" value={totalComplaints} tooltip="Total customer complaints logged across all channels and weeks in the dataset." tooltipHref={SHEET_URLS.nps_aftersales} />
        <KpiCard label="Avg Resolution" value={avgResolution ? `${avgResolution} days` : '—'} tooltip="Average number of days to resolve a customer complaint. Lower is better." tooltipHref={SHEET_URLS.nps_aftersales} />
        <KpiCard label="Top Issue" value={topComplaint ?? '—'} tooltip="Most frequently occurring customer complaint category across the entire dataset." tooltipHref={SHEET_URLS.nps_aftersales} />
      </div>

      <ChartCard title="NPS Trend by Week (Avg)" sourceHref={SHEET_URLS.nps_aftersales}>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="Week" tick={{ fontSize: 10, fill: C.axis }} angle={-20} textAnchor="end" height={40} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.axis }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, color: C.axis }} />
            <Line type="monotone" dataKey="Avg_NPS" name="Avg NPS" stroke={C.orange} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Avg NPS by Channel" sourceHref={SHEET_URLS.nps_aftersales}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="Channel" tick={{ fontSize: 9, fill: C.axis }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: C.axis }} />
              <Tooltip />
              <Bar dataKey="Avg_NPS" name="Avg NPS" fill={C.navy} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Total Complaints by Channel" sourceHref={SHEET_URLS.nps_aftersales}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="Channel" tick={{ fontSize: 9, fill: C.axis }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} />
              <Tooltip />
              <Bar dataKey="Complaints_Count" name="Complaints" fill={C.orange} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#A8C4E0]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
