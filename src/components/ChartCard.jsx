import SourceButton from './SourceButton'

export default function ChartCard({ title, sourceHref, className = '', children }) {
  return (
    <div className={`bg-white rounded-xl border border-[#E8EEF6] p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[11px] font-semibold text-[#566584] uppercase tracking-[0.12em]">{title}</p>
        {sourceHref && <SourceButton href={sourceHref} size="sm" />}
      </div>
      {children}
    </div>
  )
}
