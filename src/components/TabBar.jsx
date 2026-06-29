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
    <div className="flex border-b border-[#dde6f0] overflow-x-auto gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-5 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-all duration-150',
            active === tab.id
              ? 'border-[#1B2A6B] text-[#1B2A6B] font-semibold'
              : 'border-transparent text-[#7a91b8] hover:text-[#1B2A6B] hover:border-[#A8C4E0] font-normal'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
