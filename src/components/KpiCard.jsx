import clsx from 'clsx'

export default function KpiCard({ label, value, sub, trend }) {
  const up = trend > 0
  const down = trend < 0

  return (
    <div className="bg-white rounded-xl p-5 flex flex-col gap-1 shadow-sm">
      <span className="text-3xl font-black text-[#1a2f6b]">{value ?? '—'}</span>
      <span className="text-xs font-semibold text-[#6b84b8] uppercase tracking-wide">{label}</span>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-0.5">
          {trend !== undefined && (
            <span
              className={clsx(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                up && 'bg-orange-50 text-orange-600',
                down && 'bg-red-50 text-red-600',
                !up && !down && 'bg-blue-50 text-[#6b84b8]'
              )}
            >
              {up ? '▲' : down ? '▼' : '—'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-xs text-[#6b84b8]">{sub}</span>}
        </div>
      )}
    </div>
  )
}
