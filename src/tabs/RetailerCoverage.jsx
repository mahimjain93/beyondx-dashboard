import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const C = { navy: '#1B2A6B', orange: '#F5A623', blue: '#A8C4E0', grid: '#EBF0F8', axis: '#7a91b8' }

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }
function fmt(n) {
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}
function SectionTitle({ children }) {
  return <p className="text-[11px] font-semibold text-[#566584] uppercase tracking-[0.12em] mb-4">{children}</p>
}

const STATUS_COLORS = {
  Active: 'bg-green-50 text-green-700 border-green-200',
  Onboarding: 'bg-blue-50 text-blue-700 border-blue-200',
  Churned: 'bg-red-50 text-red-600 border-red-200',
}

export default function RetailerCoverage({ onData }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSheet('retailer_coverage')
      .then((rows) => { setData(rows); onData?.(rows) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Error msg={error} />

  const latestByRetailer = {}
  data.forEach(r => {
    if (!latestByRetailer[r.Retailer_Name] || r.Week > latestByRetailer[r.Retailer_Name].Week) {
      latestByRetailer[r.Retailer_Name] = r
    }
  })
  const latest = Object.values(latestByRetailer)

  const active = latest.filter(r => r.Status === 'Active').length
  const onboarding = latest.filter(r => r.Status === 'Onboarding').length
  const churned = latest.filter(r => r.Status === 'Churned').length
  const totalGMV = latest.reduce((s, r) => s + num(r.Monthly_GMV_INR), 0)
  const gmvData = [...latest].sort((a, b) => num(b.Monthly_GMV_INR) - num(a.Monthly_GMV_INR))

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1B2A6B]">Retailer Coverage</h2>
        <SourceButton href={SHEET_URLS.retailer_coverage} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <KpiCard label="Active Retailers" value={active} />
        <KpiCard label="Onboarding" value={onboarding} />
        <KpiCard label="Churned" value={churned} />
        <KpiCard label="Total GMV" value={fmt(totalGMV)} sub="latest week" />
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF6] p-6">
        <SectionTitle>Monthly GMV by Retailer (Latest Week)</SectionTitle>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={gmvData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
            <XAxis dataKey="Retailer_Name" tick={{ fontSize: 10, fill: C.axis }} angle={-25} textAnchor="end" height={55} />
            <YAxis tick={{ fontSize: 11, fill: C.axis }} tickFormatter={v => `${(v/1e5).toFixed(0)}L`} />
            <Tooltip formatter={v => [fmt(v), 'GMV']} />
            <Bar dataKey="Monthly_GMV_INR" name="Monthly GMV" fill={C.navy} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF6] p-6 overflow-auto">
        <SectionTitle>Retailer Status (Latest Week)</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EBF0F8]">
              {['Retailer', 'City', 'Tier', 'Status', 'Last Order', 'Monthly GMV'].map(h => (
                <th key={h} className="text-left py-2.5 pr-5 text-[11px] font-semibold text-[#7a91b8] uppercase tracking-[0.08em]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {latest.map((row, i) => (
              <tr key={i} className="border-b border-[#F5F7FA] hover:bg-[#F5F7FA] transition-colors">
                <td className="py-3 pr-5 font-semibold text-[#1B2A6B]">{row.Retailer_Name}</td>
                <td className="py-3 pr-5 text-[#7a91b8]">{row.City}</td>
                <td className="py-3 pr-5 text-[#7a91b8]">{row.City_Tier}</td>
                <td className="py-3 pr-5">
                  <span className={clsx('text-xs px-2 py-0.5 rounded border font-semibold', STATUS_COLORS[row.Status] ?? 'bg-gray-50 text-gray-500 border-gray-200')}>
                    {row.Status}
                  </span>
                </td>
                <td className="py-3 pr-5 text-[#7a91b8]">{row.Last_Order_Date}</td>
                <td className="py-3 pr-5 font-semibold text-[#1B2A6B]">{fmt(num(row.Monthly_GMV_INR))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#A8C4E0]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
