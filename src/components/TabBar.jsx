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
    <div className="flex gap-1 border-b border-gray-100 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
            active === tab.id
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
