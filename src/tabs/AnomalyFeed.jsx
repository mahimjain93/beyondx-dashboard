import { useEffect, useState } from 'react'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2, AlertTriangle, Info, XCircle } from 'lucide-react'
import clsx from 'clsx'

function severityMeta(row) {
  const raw = String(row.Severity ?? row.severity ?? row.Type ?? row.type ?? 'medium').toLowerCase()
  if (/high|critical|error/i.test(raw)) return { label: 'High', color: 'text-red-600 bg-red-50 border-red-100', Icon: XCircle }
  if (/low|info/i.test(raw)) return { label: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-100', Icon: Info }
  return { label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-100', Icon: AlertTriangle }
}

export default function AnomalyFeed({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchSheet('anomaly_log')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const keys = Object.keys(data[0] ?? {})
  const titleKey = keys.find(k => /title|anomaly|description|issue/i.test(k)) ?? keys[0] ?? ''
  const dateKey = keys.find(k => /date|time|when/i.test(k)) ?? ''
  const metricKey = keys.find(k => /metric|value|amount/i.test(k)) ?? ''

  const high = data.filter(r => /high|critical/i.test(String(r.Severity ?? r.severity ?? r.Type ?? r.type ?? ''))).length
  const medium = data.filter(r => /medium|warning/i.test(String(r.Severity ?? r.severity ?? r.Type ?? r.type ?? ''))).length

  const filtered = filter === 'all' ? data : data.filter(r =>
    /high|critical/i.test(String(r.Severity ?? r.severity ?? r.Type ?? r.type ?? '')) === (filter === 'high')
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Anomaly Feed</h2>
        <SourceButton href={SHEET_URLS.anomaly_log} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Anomalies" value={data.length} />
        <KpiCard label="High Severity" value={high || '—'} />
        <KpiCard label="Medium" value={medium || '—'} />
        <KpiCard label="Low / Info" value={data.length - high - medium || '—'} />
      </div>

      <div className="flex gap-2">
        {['all', 'high', 'other'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 text-xs rounded-lg border transition-colors',
              filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            )}
          >
            {f === 'all' ? 'All' : f === 'high' ? 'High severity' : 'Medium / Low'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((row, i) => {
          const { label, color, Icon } = severityMeta(row)
          return (
            <div key={i} className={clsx('flex gap-3 items-start p-4 rounded-xl border bg-white shadow-sm', color.split(' ')[2])}>
              <div className={clsx('mt-0.5 shrink-0', color.split(' ')[0])}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800 truncate">{row[titleKey]}</span>
                  <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded border', color)}>{label}</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  {dateKey && row[dateKey] && <span>{row[dateKey]}</span>}
                  {metricKey && row[metricKey] && <span>{metricKey}: {row[metricKey]}</span>}
                  {keys.filter(k => k !== titleKey && k !== dateKey && k !== metricKey).slice(0, 2).map(k =>
                    row[k] ? <span key={k}>{k}: {row[k]}</span> : null
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No anomalies in this filter.</p>
        )}
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-gray-300"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
