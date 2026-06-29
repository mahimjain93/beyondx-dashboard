import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

const PIE_COLORS = ['#1a1a1a', '#6b7280', '#d1d5db', '#f3f4f6']

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

  const keys = Object.keys(data[0] ?? {})
  const npsKey = keys.find(k => /nps/i.test(k)) ?? keys[1] ?? ''
  const labelKey = keys[0] ?? ''

  const npsValues = data.map(r => num(r[npsKey])).filter(v => !isNaN(v))
  const avgNps = npsValues.length ? Math.round(npsValues.reduce((a, b) => a + b, 0) / npsValues.length) : null

  const promoters = npsValues.filter(v => v >= 9).length
  const passives = npsValues.filter(v => v === 7 || v === 8).length
  const detractors = npsValues.filter(v => v <= 6).length
  const total = npsValues.length

  const pieData = [
    { name: 'Promoters', value: promoters },
    { name: 'Passives', value: passives },
    { name: 'Detractors', value: detractors },
  ].filter(d => d.value > 0)

  const npsScore = total ? Math.round(((promoters - detractors) / total) * 100) : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">NPS & After-Sales</h2>
        <SourceButton href={SHEET_URLS.nps_aftersales} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="NPS Score" value={npsScore !== null ? npsScore : avgNps ?? '—'} sub={npsScore !== null ? 'net promoter' : 'avg score'} />
        <KpiCard label="Promoters" value={promoters || '—'} />
        <KpiCard label="Detractors" value={detractors || '—'} />
        <KpiCard label="Responses" value={data.length} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">NPS distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            {pieData.length > 0 ? (
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={data.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey={npsKey} fill="#1a1a1a" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">{npsKey} by {labelKey}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey={labelKey} tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey={npsKey} fill="#6b7280" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
