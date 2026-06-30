import clsx from 'clsx'

export default function KpiCard({ label, value, sub, trend }) {
  const up = trend > 0
  const down = trend < 0

  return (
    <div className="bg-white rounded-xl border border-[#E8EEF6] p-6 flex flex-col gap-3">
      <span className="text-[2rem] font-bold text-[#1B2A6B] leading-none">{value ?? '—'}</span>
      <span className="text-[11px] font-semibold text-[#7a91b8] uppercase tracking-[0.1em]">{label}</span>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span
              className={clsx(
                'text-xs font-semibold px-1.5 py-0.5 rounded',
                up && 'bg-orange-50 text-[#F5A623]',
                down && 'bg-red-50 text-red-500',
                !up && !down && 'bg-[#F5F7FA] text-[#7a91b8]'
              )}
            >
              {up ? '▲' : down ? '▼' : '—'} {Math.abs(trend)}%
            </span>
          )}
          {sub && <span className="text-xs text-[#A8C4E0]">{sub}</span>}
        </div>
      )}
    </div>
  )
}
