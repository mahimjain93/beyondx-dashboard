import { useState } from 'react'
import { HelpCircle, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

export default function KpiCard({ label, value, sub, trend, tooltip, tooltipHref }) {
  const [showTip, setShowTip] = useState(false)
  const up = trend > 0
  const down = trend < 0

  return (
    <div className="relative bg-white rounded-xl border border-[#E8EEF6] p-6 flex flex-col gap-3">
      {tooltip && (
        <div className="absolute top-3 right-3">
          <button
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="text-[#A8C4E0] hover:text-[#566584] transition-colors"
            aria-label="More info"
          >
            <HelpCircle size={14} />
          </button>
          {showTip && (
            <div className="absolute right-0 top-6 z-20 w-56 bg-white border border-[#E8EEF6] rounded-xl p-3 shadow-xl text-xs text-[#566584] leading-relaxed">
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
          )}
        </div>
      )}
      <span className="text-[2rem] font-bold text-[#1B2A6B] leading-none">{value ?? '—'}</span>
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
