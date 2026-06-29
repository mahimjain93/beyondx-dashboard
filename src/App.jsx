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
    <div className="min-h-screen bg-[#eef2f7]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#6b84b8] uppercase tracking-widest mb-1">BeyondX · Founder's Associate Portfolio</p>
          <h1 className="text-4xl font-black text-[#1a2f6b] uppercase tracking-tight leading-none">Analytics Dashboard</h1>
          <p className="text-sm text-[#6b84b8] mt-1.5">
            Built by <span className="font-semibold text-[#1a2f6b]">Mahim Jain</span> — demonstrating operational analytics for Beyond's home appliances portfolio
          </p>
        </div>

        {/* NL Query Bar */}
        <div className="mb-5">
          <NLQueryBar dashboardData={tabData} />
        </div>

        {/* Tab Navigation */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-5">
          <ActiveTab onData={handleTabData} />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#6b84b8]">Data from Google Sheets · React + Vite + Tailwind CSS · Gemini 2.5 Flash</p>
        </div>
      </div>
    </div>
  )
}
