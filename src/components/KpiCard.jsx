import { HelpCircle, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

export default function KpiCard({ label, value, sub, trend, tooltip, tooltipHref }) {
  const up = trend > 0
  const down = trend < 0

  const valueLength = String(value ?? '—').length
  const valueSizeClass =
    valueLength > 16 ? 'text-lg sm:text-xl' : valueLength > 10 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-[2rem]'

  return (
    <div className="relative bg-white rounded-xl border border-[#E8EEF6] p-6 flex flex-col gap-3">
      {tooltip && (
        <div className="absolute top-3 right-3 group">
          <button className="text-[#A8C4E0] group-hover:text-[#566584] transition-colors" aria-label="More info">
            <HelpCircle size={14} />
          </button>
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute right-0 top-full pt-2 z-20 w-56">
            <div className="bg-white border border-[#E8EEF6] rounded-xl p-3 shadow-xl text-xs text-[#566584] leading-relaxed">
              {tooltip}
              {tooltipHref && (
                <a
                  href={tooltipHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 mt-2 text-[#1B2A6B] font-semibold hover:underline"
                >
                  <ExternalLink size={10} />
                  View source data
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      <span className={clsx('font-bold text-[#1B2A6B] leading-tight break-words', valueSizeClass)}>
        {value ?? '—'}
      </span>
      <span className="text-[11px] font-semibold text-[#566584] uppercase tracking-[0.1em]">{label}</span>
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
          {sub && <span className="text-xs text-[#7a91b8]">{sub}</span>}
        </div>
      )}
    </div>
  )
}
