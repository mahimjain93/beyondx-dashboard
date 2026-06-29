import { useEffect, useState } from 'react'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2, AlertTriangle, Info, XCircle } from 'lucide-react'
import clsx from 'clsx'

const SEVERITY = {
  High: { color: 'text-red-600 bg-red-50 border-red-100', Icon: XCircle, badge: 'bg-red-50 text-red-600 border-red-200' },
  Medium: { color: 'text-amber-600 bg-amber-50 border-amber-100', Icon: AlertTriangle, badge: 'bg-amber-50 text-amber-600 border-amber-200' },
  Low: { color: 'text-blue-600 bg-blue-50 border-blue-100', Icon: Info, badge: 'bg-blue-50 text-blue-600 border-blue-200' },
}

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

export default function AnomalyFeed({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    fetchSheet('anomaly_log')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const sorted = [...data].sort((a, b) => b.Week > a.Week ? 1 : -1)
  const high = data.filter(r => r.Severity === 'High').length
  const medium = data.filter(r => r.Severity === 'Medium').length
  const low = data.filter(r => r.Severity === 'Low').length

  const filtered = filter === 'All' ? sorted : sorted.filter(r => r.Severity === filter)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#37352f]">Anomaly Feed</h2>
        <SourceButton href={SHEET_URLS.anomaly_log} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Anomalies" value={data.length} />
        <KpiCard label="High Severity" value={high} />
        <KpiCard label="Medium" value={medium} />
        <KpiCard label="Low" value={low} />
      </div>

      <div className="flex gap-2">
        {['All', 'High', 'Medium', 'Low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 text-xs rounded-lg border transition-colors',
              filter === f ? 'bg-[#37352f] text-white border-[#37352f]' : 'text-[#9b9a97] border-[#e9e9e7] hover:text-[#37352f] hover:border-[#9b9a97]'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((row, i) => {
          const { color, Icon, badge } = SEVERITY[row.Severity] ?? SEVERITY.Medium
          const deviation = num(row.Deviation_Pct)
          return (
            <div key={i} className={clsx('flex gap-3 items-start p-4 rounded-lg border', color.split(' ').slice(1).join(' '))}>
              <div className={clsx('mt-0.5 shrink-0', color.split(' ')[0])}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <span className="text-sm font-medium text-[#37352f]">{row.Alert_Text}</span>
                  <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0', badge)}>
                    {row.Severity}
                  </span>
                </div>
                <div className="flex gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs text-[#9b9a97] bg-[#f7f6f3] px-2 py-0.5 rounded">{row.Module}</span>
                  <span className="text-xs text-[#9b9a97] bg-[#f7f6f3] px-2 py-0.5 rounded">{row.Metric}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded font-medium', deviation < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
                    {deviation > 0 ? '+' : ''}{row.Deviation_Pct}%
                  </span>
                  <span className="text-xs text-[#9b9a97]">{row.Week}</span>
                </div>
                <div className="flex gap-4 mt-1 text-xs text-[#9b9a97]">
                  <span>Expected: {row.Expected_Value}</span>
                  <span>Actual: {row.Actual_Value}</span>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-[#9b9a97] text-center py-8">No anomalies for this filter.</p>
        )}
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
