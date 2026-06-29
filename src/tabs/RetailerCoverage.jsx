import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

function num(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0 }
function fmt(n) {
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

const STATUS_COLORS = {
  Active: 'bg-green-50 text-green-700 border-green-100',
  Onboarding: 'bg-blue-50 text-blue-700 border-blue-100',
  Churned: 'bg-red-50 text-red-600 border-red-100',
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

  // Latest week per retailer
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#1a2f6b] uppercase tracking-wide">Retailer Coverage</h2>
        <SourceButton href={SHEET_URLS.retailer_coverage} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Retailers" value={active} />
        <KpiCard label="Onboarding" value={onboarding} />
        <KpiCard label="Churned" value={churned} />
        <KpiCard label="Total GMV" value={fmt(totalGMV)} sub="latest week" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Monthly GMV by retailer (latest week)</p>
        <div className="p-5 pt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={gmvData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
              <XAxis dataKey="Retailer_Name" tick={{ fontSize: 10, fill: '#6b84b8' }} angle={-25} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} tickFormatter={v => `${(v/1e5).toFixed(0)}L`} />
              <Tooltip formatter={v => [fmt(v), 'GMV']} />
              <Bar dataKey="Monthly_GMV_INR" fill="#1a2f6b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Retailer status (latest week)</p>
        <div className="overflow-auto px-5 pb-5">
          <table className="w-full text-sm mt-3">
            <thead>
              <tr className="border-b border-[#eef2f7]">
                {['Retailer', 'City', 'Tier', 'Status', 'Last Order', 'Monthly GMV'].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-[#6b84b8] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {latest.map((row, i) => (
                <tr key={i} className="border-b border-[#f4f7fc] hover:bg-[#f4f7fc]">
                  <td className="py-2 pr-4 font-semibold text-[#1a2f6b]">{row.Retailer_Name}</td>
                  <td className="py-2 pr-4 text-[#6b84b8]">{row.City}</td>
                  <td className="py-2 pr-4 text-[#6b84b8]">{row.City_Tier}</td>
                  <td className="py-2 pr-4">
                    <span className={clsx('text-xs px-2 py-0.5 rounded border font-semibold', STATUS_COLORS[row.Status] ?? 'bg-gray-50 text-gray-500 border-gray-100')}>
                      {row.Status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-[#6b84b8]">{row.Last_Order_Date}</td>
                  <td className="py-2 pr-4 font-semibold text-[#1a2f6b]">{fmt(num(row.Monthly_GMV_INR))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#6b84b8]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
