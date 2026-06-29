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
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8">

        {/* Header */}
        <div className="pt-12 pb-6 border-b border-[#e9e9e7]">
          <p className="text-xs font-medium text-[#9b9a97] uppercase tracking-widest mb-2">BeyondX · Founder's Associate Portfolio</p>
          <h1 className="text-3xl font-bold text-[#37352f] tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-[#9b9a97] mt-1.5">
            Built by <span className="text-[#37352f]">Mahim Jain</span> — demonstrating operational analytics for Beyond's home appliances portfolio
          </p>
        </div>

        {/* NL Query Bar */}
        <div className="py-4 border-b border-[#e9e9e7]">
          <NLQueryBar dashboardData={tabData} />
        </div>

        {/* Tab Navigation */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="py-8">
          <ActiveTab onData={handleTabData} />
        </div>

        {/* Footer */}
        <div className="py-6 border-t border-[#e9e9e7] text-center">
          <p className="text-xs text-[#c7c6c3]">Data from Google Sheets · React + Vite + Tailwind CSS · Gemini 2.5 Flash</p>
        </div>
      </div>
    </div>
  )
}
