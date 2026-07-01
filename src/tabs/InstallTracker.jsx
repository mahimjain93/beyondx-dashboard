import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import ChartCard from '../components/ChartCard'
import { Loader2 } from 'lucide-react'

const C = { navy: '#1B2A6B', orange: '#F5A623', blue: '#A8C4E0', grid: '#EBF0F8', axis: '#7a91b8' }

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }

export default function InstallTracker({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('install_tracker')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const totalInstalls = data.reduce((s, r) => s + num(r.Installs), 0)

  const byCity = {}
  data.forEach(r => {
    if (!byCity[r.City]) byCity[r.City] = { City: r.City, Tier: r.City_Tier, Installs: 0 }
    byCity[r.City].Installs += num(r.Installs)
  })
  const cityData = Object.values(byCity).sort((a, b) => b.Installs - a.Installs).slice(0, 12)

  const byProduct = {}
  data.forEach(r => {
    if (!byProduct[r.Product]) byProduct[r.Product] = { Product: r.Product, Installs: 0 }
    byProduct[r.Product].Installs += num(r.Installs)
  })
  const productData = Object.values(byProduct)

  const byWeek = {}
  data.forEach(r => {
    if (!byWeek[r.Week]) byWeek[r.Week] = { Week: r.Week, Installs: 0 }
    byWeek[r.Week].Installs += num(r.Installs)
  })
  const weekData = Object.values(byWeek).sort((a, b) => a.Week > b.Week ? 1 : -1)

  const topCity = cityData[0]
  const cities = Object.keys(byCity).length

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2A6B]">Install Tracker</h2>
        <SourceButton href={SHEET_URLS.install_tracker} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <KpiCard label="Total Installs" value={totalInstalls.toLocaleString('en-IN')} tooltip="Total number of appliance installation jobs completed across all cities and products." tooltipHref={SHEET_URLS.install_tracker} />
        <KpiCard label="Cities Covered" value={cities} tooltip="Number of distinct cities where at least one installation was recorded." tooltipHref={SHEET_URLS.install_tracker} />
        <KpiCard label="Top City" value={topCity?.City ?? '—'} sub={`${topCity?.Installs?.toLocaleString()} installs`} tooltip="City with the highest number of completed appliance installations in the dataset." tooltipHref={SHEET_URLS.install_tracker} />
        <KpiCard label="Products" value={productData.length} tooltip="Number of distinct appliance SKUs with installation records in the dataset." tooltipHref={SHEET_URLS.install_tracker} />
      </div>

      <ChartCard title="Weekly Install Trend" sourceHref={SHEET_URLS.install_tracker}>
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="Week" tick={{ fontSize: 10, fill: C.axis }} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 11, fill: C.axis }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, color: C.axis }} />
            <Line type="monotone" dataKey="Installs" name="Installs" stroke={C.orange} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid md:grid-cols-2 gap-6">
        <ChartCard title="Top Cities by Installs" sourceHref={SHEET_URLS.install_tracker}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={cityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.axis }} />
              <YAxis dataKey="City" type="category" tick={{ fontSize: 11, fill: C.axis }} width={80} />
              <Tooltip />
              <Bar dataKey="Installs" name="Installs" fill={C.navy} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Installs by Product" sourceHref={SHEET_URLS.install_tracker}>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="Product" tick={{ fontSize: 9, fill: C.axis }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} />
              <Tooltip />
              <Bar dataKey="Installs" name="Installs" fill={C.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#A8C4E0]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
