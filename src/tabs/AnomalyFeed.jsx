import { useEffect, useState } from 'react'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import { num } from '../lib/format'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2, AlertTriangle, Info, XCircle } from 'lucide-react'
import clsx from 'clsx'

const SEVERITY = {
  High: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', badge: 'bg-red-50 text-red-600 border-red-200', Icon: XCircle },
  Medium: { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-50 text-amber-600 border-amber-200', Icon: AlertTriangle },
  Low: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-400', badge: 'bg-blue-50 text-blue-600 border-blue-200', Icon: Info },
}

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
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2A6B]">Anomaly Feed</h2>
        <SourceButton href={SHEET_URLS.anomaly_log} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard label="Total Anomalies" value={data.length} tooltip="Total flagged anomalies across all modules and severity levels in the log." tooltipHref={SHEET_URLS.anomaly_log} />
        <KpiCard label="High Severity" value={high} tooltip="Critical anomalies with significant deviation from expected values — require immediate review." tooltipHref={SHEET_URLS.anomaly_log} />
        <KpiCard label="Medium" value={medium} tooltip="Moderate anomalies worth monitoring — may indicate emerging trends or data quality issues." tooltipHref={SHEET_URLS.anomaly_log} />
        <KpiCard label="Low" value={low} tooltip="Minor anomalies within near-acceptable deviation ranges — informational only." tooltipHref={SHEET_URLS.anomaly_log} />
      </div>

      <div className="flex gap-2">
        {['All', 'High', 'Medium', 'Low'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 text-xs rounded-lg border font-semibold transition-all',
              filter === f
                ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
                : 'text-[#7a91b8] border-[#E8EEF6] hover:text-[#1B2A6B] hover:border-[#A8C4E0] bg-white'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((row, i) => {
          const sev = SEVERITY[row.Severity] ?? SEVERITY.Medium
          const { Icon } = sev
          const deviation = num(row.Deviation_Pct)
          return (
            <div key={i} className={clsx('flex gap-4 items-start p-5 rounded-xl border', sev.bg)}>
              <div className={clsx('mt-0.5 shrink-0', sev.icon)}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-[#1B2A6B]">{row.Alert_Text}</span>
                  <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0', sev.badge)}>
                    {row.Severity}
                  </span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs text-[#7a91b8] bg-white border border-[#E8EEF6] px-2 py-0.5 rounded">{row.Module}</span>
                  <span className="text-xs text-[#7a91b8] bg-white border border-[#E8EEF6] px-2 py-0.5 rounded">{row.Metric}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded font-semibold', deviation < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
                    {deviation > 0 ? '+' : ''}{row.Deviation_Pct}%
                  </span>
                  <span className="text-xs text-[#7a91b8]">{row.Week}</span>
                </div>
                <div className="flex gap-5 mt-1.5 text-xs text-[#7a91b8]">
                  <span>Expected: {row.Expected_Value}</span>
                  <span>Actual: {row.Actual_Value}</span>
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-[#A8C4E0] text-center py-10">No anomalies for this filter.</p>
        )}
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#A8C4E0]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
