import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

export default function InstallTracker({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('install_tracker')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const totalInstalls = data.reduce((s, r) => {
    const v = Object.values(r).find((_, i) => /install/i.test(Object.keys(r)[i]))
    return s + num(v ?? 0)
  }, 0)

  const installKey = Object.keys(data[0] ?? {}).find(k => /install/i.test(k)) ?? Object.keys(data[0] ?? {})[1] ?? ''
  const labelKey = Object.keys(data[0] ?? {})[0] ?? ''

  const pending = data.filter(r => /pending/i.test(String(r.Status ?? r.status ?? ''))).length
  const completed = data.filter(r => /complet/i.test(String(r.Status ?? r.status ?? ''))).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Install Tracker</h2>
        <SourceButton href={SHEET_URLS.install_tracker} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Installs" value={totalInstalls || data.length} />
        <KpiCard label="Completed" value={completed || '—'} />
        <KpiCard label="Pending" value={pending || '—'} />
        <KpiCard label="Records" value={data.length} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Installs by {labelKey}</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.slice(0, 20)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey={labelKey} type="category" tick={{ fontSize: 11 }} width={120} />
            <Tooltip />
            <Bar dataKey={installKey} fill="#1a1a1a" radius={[0, 3, 3, 0]}>
              {data.slice(0, 20).map((_, i) => (
                <Cell key={i} fill={i % 2 === 0 ? '#1a1a1a' : '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function Loader() {
  return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div>
}
function Error({ msg }) {
  return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div>
}
