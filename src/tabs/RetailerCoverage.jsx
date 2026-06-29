import { useEffect, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

export default function RetailerCoverage({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('retailer_coverage')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const keys = Object.keys(data[0] ?? {})
  const nameKey = keys[0] ?? ''
  const numKeys = keys.filter(k => k !== nameKey)
  const primaryNumKey = numKeys[0] ?? ''
  const secondaryNumKey = numKeys[1] ?? ''

  const activeRetailers = data.filter(r => /active/i.test(String(r.Status ?? r.status ?? 'active'))).length || data.length
  const totalRetailers = data.length
  const topRetailer = [...data].sort((a, b) => num(b[primaryNumKey]) - num(a[primaryNumKey]))[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Retailer Coverage</h2>
        <SourceButton href={SHEET_URLS.retailer_coverage} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Retailers" value={totalRetailers} />
        <KpiCard label="Active" value={activeRetailers} />
        <KpiCard label="Top Retailer" value={topRetailer?.[nameKey] ?? '—'} />
        <KpiCard label="Columns" value={keys.length} sub="data fields" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">{primaryNumKey} by retailer</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.slice(0, 15)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={primaryNumKey} fill="#1a1a1a" radius={[3, 3, 0, 0]} />
            {secondaryNumKey && <Bar dataKey={secondaryNumKey} fill="#d1d5db" radius={[3, 3, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 overflow-auto">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Retailer table</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {keys.map(k => <th key={k} className="text-left py-2 pr-4 text-xs font-medium text-gray-400">{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 20).map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                {keys.map(k => <td key={k} className="py-2 pr-4 text-gray-700">{row[k]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
