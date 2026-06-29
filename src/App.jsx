import { useState } from 'react'
import TabBar from './components/TabBar'
import NLQueryBar from './components/NLQueryBar'
import SalesOverview from './tabs/SalesOverview'
import InstallTracker from './tabs/InstallTracker'
import RetailerCoverage from './tabs/RetailerCoverage'
import NpsAfterSales from './tabs/NpsAfterSales'
import MarginBySku from './tabs/MarginBySku'
import AnomalyFeed from './tabs/AnomalyFeed'

const TAB_COMPONENTS = {
  sales_overview: SalesOverview,
  install_tracker: InstallTracker,
  retailer_coverage: RetailerCoverage,
  nps_aftersales: NpsAfterSales,
  margin_by_sku: MarginBySku,
  anomaly_feed: AnomalyFeed,
}

export default function App() {
  const [activeTab, setActiveTab] = useState('sales_overview')
  const [tabData, setTabData] = useState({})

  const ActiveTab = TAB_COMPONENTS[activeTab]

  function handleTabData(data) {
    setTabData(prev => ({ ...prev, [activeTab]: data }))
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-gray-900" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">BeyondX</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            A portfolio demonstration built by{' '}
            <span className="text-gray-600 font-medium">Mahim Jain</span>{' '}
            for Beyond&apos;s Founder&apos;s Associate role
          </p>
        </div>

        {/* NL Query Bar */}
        <div className="mb-6">
          <NLQueryBar dashboardData={tabData} />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4">
            <TabBar active={activeTab} onChange={setActiveTab} />
          </div>
          <div className="p-6">
            <ActiveTab onData={handleTabData} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-300">
          Data sourced from Google Sheets · Built with React + Vite + Tailwind CSS
        </div>
      </div>
    </div>
  )
}
