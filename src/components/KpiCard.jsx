import clsx from 'clsx'

export default function KpiCard({ label, value, sub, trend }) {
  const up = trend > 0
  const down = trend < 0

  return (
    <div className="border border-[#e9e9e7] rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-[#9b9a97] uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-semibold text-[#37352f]">{value ?? '—'}</span>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-0.5">
          {trend !== undefined && (
            <span
              className={clsx(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                up && 'bg-green-50 text-green-700',
                down && 'bg-red-50 text-red-600',
                !up && !down && 'bg-[#f7f6f3] text-[#9b9a97]'
              )}
            >
              {up ? '▲' : down ? '▼' : '—'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-xs text-[#9b9a97]">{sub}</span>}
        </div>
      )}
    </div>
  )
}
