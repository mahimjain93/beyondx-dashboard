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
    <div className="flex gap-0 border-b border-[#e9e9e7] overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-4 py-3 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors duration-100',
            active === tab.id
              ? 'border-[#37352f] text-[#37352f] font-medium'
              : 'border-transparent text-[#9b9a97] hover:text-[#37352f] font-normal'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
