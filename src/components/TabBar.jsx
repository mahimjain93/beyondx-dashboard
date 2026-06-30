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
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-5 py-2 text-sm whitespace-nowrap rounded-full border transition-all duration-150 font-medium',
            active === tab.id
              ? 'bg-[#1B2A6B] text-white border-[#1B2A6B]'
              : 'border-[#E8EEF6] text-[#7a91b8] hover:text-[#1B2A6B] hover:border-[#A8C4E0] bg-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
