import clsx from 'clsx'

export default function KpiCard({ label, value, sub, trend }) {
  const up = trend > 0
  const down = trend < 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-1 shadow-sm">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold text-gray-900">{value ?? '—'}</span>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-0.5">
          {trend !== undefined && (
            <span
              className={clsx(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                up && 'bg-green-50 text-green-700',
                down && 'bg-red-50 text-red-600',
                !up && !down && 'bg-gray-100 text-gray-500'
              )}
            >
              {up ? '▲' : down ? '▼' : '—'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-xs text-gray-400">{sub}</span>}
        </div>
      )}
    </div>
  )
}
