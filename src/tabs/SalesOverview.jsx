import { useEffect, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import ChartCard from '../components/ChartCard'
import { Loader2 } from 'lucide-react'

const C = { navy: '#1B2A6B', orange: '#F5A623', blue: '#A8C4E0', grid: '#EBF0F8', axis: '#7a91b8' }
const PIE_COLORS = ['#1B2A6B', '#F5A623', '#A8C4E0', '#7ED9A9', '#E86A6A', '#C9C9C9']

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }
function fmt(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function SalesOverview({ onData }) {
  const [data, setData] = useState([])
  const [retailerData, setRetailerData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([fetchSheet('sales_overview'), fetchSheet('retailer_coverage')])
      .then(([salesRows, retailerRows]) => {
        setData(salesRows)
        setRetailerData(retailerRows)
        onData?.(salesRows)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const totalRevenue = data.reduce((s, r) => s + num(r.Revenue_INR), 0)
  const totalUnits = data.reduce((s, r) => s + num(r.Units_Sold), 0)
  const avgOrderValue = totalUnits ? totalRevenue / totalUnits : 0

  const byWeek = {}
  data.forEach(r => {
    if (!byWeek[r.Week]) byWeek[r.Week] = { Week: r.Week, Revenue_INR: 0, Units_Sold: 0 }
    byWeek[r.Week].Revenue_INR += num(r.Revenue_INR)
    byWeek[r.Week].Units_Sold += num(r.Units_Sold)
  })
  const weekData = Object.values(byWeek).sort((a, b) => a.Week > b.Week ? 1 : -1)

  const last = weekData[weekData.length - 1]
  const prev = weekData[weekData.length - 2]
  const growth = prev?.Revenue_INR
    ? Math.round(((last?.Revenue_INR - prev.Revenue_INR) / prev.Revenue_INR) * 100)
    : null

  const byChannel = {}
  data.forEach(r => {
    if (!byChannel[r.Channel]) byChannel[r.Channel] = { Channel: r.Channel, Revenue_INR: 0, Units_Sold: 0 }
    byChannel[r.Channel].Revenue_INR += num(r.Revenue_INR)
    byChannel[r.Channel].Units_Sold += num(r.Units_Sold)
  })
  const channelData = Object.values(byChannel)

  // Top city by GMV from retailer data
  const latestByRetailer = {}
  retailerData.forEach(r => {
    if (!latestByRetailer[r.Retailer_Name] || r.Week > latestByRetailer[r.Retailer_Name].Week) {
      latestByRetailer[r.Retailer_Name] = r
    }
  })
  const cityGMV = {}
  Object.values(latestByRetailer).forEach(r => {
    if (!cityGMV[r.City]) cityGMV[r.City] = { City: r.City, Tier: r.City_Tier, GMV: 0 }
    cityGMV[r.City].GMV += num(r.Monthly_GMV_INR)
  })
  const cityByGMV = Object.values(cityGMV).sort((a, b) => b.GMV - a.GMV)
  const topCity = cityByGMV[0]

  const topCities = cityByGMV.slice(0, 5)
  const otherCityGMV = cityByGMV.slice(5).reduce((s, c) => s + c.GMV, 0)
  const cityPieData = [
    ...topCities.map(c => ({ name: c.City, value: c.GMV })),
    ...(otherCityGMV > 0 ? [{ name: 'Other', value: otherCityGMV }] : []),
  ]
  const totalCityGMV = cityPieData.reduce((s, c) => s + c.value, 0)

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2A6B]">Sales Overview</h2>
        <SourceButton href={SHEET_URLS.sales_overview} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
        <KpiCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          trend={growth}
          sub="vs last week"
          tooltip="Aggregate revenue across all sales channels for the full dataset period."
          tooltipHref={SHEET_URLS.sales_overview}
        />
        <KpiCard
          label="Units Sold"
          value={totalUnits.toLocaleString('en-IN')}
          tooltip="Total appliance units sold across all channels and weeks."
          tooltipHref={SHEET_URLS.sales_overview}
        />
        <KpiCard
          label="Avg Selling Price"
          value={fmt(avgOrderValue)}
          tooltip="Average revenue per unit, computed as total revenue ÷ total units sold."
          tooltipHref={SHEET_URLS.sales_overview}
        />
        <KpiCard
          label="Weeks of Data"
          value={weekData.length}
          tooltip="Number of distinct weekly snapshots available in the sales dataset."
          tooltipHref={SHEET_URLS.sales_overview}
        />
        <KpiCard
          label="Top City"
          value={topCity?.City ?? '—'}
          sub={topCity?.Tier ?? ''}
          tooltip="City with the highest cumulative GMV from retailer orders, based on latest-week retailer data."
          tooltipHref={SHEET_URLS.retailer_coverage}
        />
      </div>

      <ChartCard title="Weekly Revenue Trend" sourceHref={SHEET_URLS.sales_overview}>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="Week" tick={{ fontSize: 10, fill: C.axis }} angle={-20} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 11, fill: C.axis }} tickFormatter={v => `₹${(v/1e5).toFixed(0)}L`} />
            <Tooltip formatter={v => [fmt(v), 'Revenue']} />
            <Legend wrapperStyle={{ fontSize: 12, color: C.axis }} />
            <Line type="monotone" dataKey="Revenue_INR" name="Revenue" stroke={C.orange} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid md:grid-cols-3 gap-6">
        <ChartCard title="Revenue by Channel" sourceHref={SHEET_URLS.sales_overview}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="Channel" tick={{ fontSize: 10, fill: C.axis }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} tickFormatter={v => `${(v/1e5).toFixed(0)}L`} />
              <Tooltip formatter={v => [fmt(v), 'Revenue']} />
              <Bar dataKey="Revenue_INR" name="Revenue" fill={C.navy} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Units by Channel" sourceHref={SHEET_URLS.sales_overview}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="Channel" tick={{ fontSize: 10, fill: C.axis }} angle={-15} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize: 11, fill: C.axis }} />
              <Tooltip />
              <Bar dataKey="Units_Sold" name="Units" fill={C.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="GMV Share by City" sourceHref={SHEET_URLS.retailer_coverage}>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Tooltip formatter={(v, n) => [`${fmt(v)} (${((v / totalCityGMV) * 100).toFixed(1)}%)`, n]} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.axis }} />
              <Pie data={cityPieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {cityPieData.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#A8C4E0]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
