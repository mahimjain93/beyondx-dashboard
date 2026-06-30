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
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-[820px] mx-auto px-10 pt-12 pb-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold text-[#A8C4E0] uppercase tracking-[0.18em] mb-3">BeyondX · Founder's Associate Portfolio</p>
          <h1 className="text-[2.4rem] font-bold text-[#1B2A6B] leading-tight tracking-tight">Analytics Dashboard</h1>
          <p className="text-sm text-[#566584] mt-2">
            Built by <span className="font-semibold text-[#1B2A6B]">Mahim Jain</span> — demonstrating operational analytics for Beyond's home appliances portfolio
          </p>
        </div>

        {/* NL Query Bar */}
        <div className="mb-10">
          <NLQueryBar dashboardData={tabData} />
        </div>

        {/* Tab Navigation */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-10">
          <ActiveTab onData={handleTabData} />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-[#A8C4E0]">Data from Google Sheets · React + Vite + Tailwind CSS · Gemini 2.5 Flash</p>
        </div>
      </div>
    </div>
  )
}
