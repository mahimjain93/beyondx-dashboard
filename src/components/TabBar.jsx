import clsx from 'clsx'

const TABS = [
  { id: 'sales_overview', label: 'Sales Overview' },
  { id: 'install_tracker', label: 'Install Tracker' },
  { id: 'retailer_coverage', label: 'Retailer Coverage' },
  { id: 'nps_aftersales', label: 'NPS & After-Sales' },
  { id: 'margin_by_sku', label: 'Margin by SKU' },
  { id: 'anomaly_feed', label: 'Anomaly Feed' },
]

export default function TabBar({ active, onChange }) {
  return (
    <div className="flex gap-0 border-b-2 border-[#d0daea] overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors duration-100',
            active === tab.id
              ? 'border-[#f59e0b] text-[#1a2f6b] font-semibold'
              : 'border-transparent text-[#6b84b8] hover:text-[#1a2f6b] font-normal'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
