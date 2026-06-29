import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from 'recharts'
import { fetchSheet, SHEET_URLS } from '../lib/sheets'
import KpiCard from '../components/KpiCard'
import SourceButton from '../components/SourceButton'
import { Loader2 } from 'lucide-react'

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

  // By city
  const byCity = {}
  data.forEach(r => {
    if (!byCity[r.City]) byCity[r.City] = { City: r.City, Tier: r.City_Tier, Installs: 0 }
    byCity[r.City].Installs += num(r.Installs)
  })
  const cityData = Object.values(byCity).sort((a, b) => b.Installs - a.Installs).slice(0, 12)

  // By product
  const byProduct = {}
  data.forEach(r => {
    if (!byProduct[r.Product]) byProduct[r.Product] = { Product: r.Product, Installs: 0 }
    byProduct[r.Product].Installs += num(r.Installs)
  })
  const productData = Object.values(byProduct)

  // By week
  const byWeek = {}
  data.forEach(r => {
    if (!byWeek[r.Week]) byWeek[r.Week] = { Week: r.Week, Installs: 0 }
    byWeek[r.Week].Installs += num(r.Installs)
  })
  const weekData = Object.values(byWeek).sort((a, b) => a.Week > b.Week ? 1 : -1)

  const topCity = cityData[0]
  const cities = Object.keys(byCity).length

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[#1a2f6b] uppercase tracking-wide">Install Tracker</h2>
        <SourceButton href={SHEET_URLS.install_tracker} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Installs" value={totalInstalls.toLocaleString('en-IN')} />
        <KpiCard label="Cities Covered" value={cities} />
        <KpiCard label="Top City" value={topCity?.City ?? '—'} sub={`${topCity?.Installs?.toLocaleString()} installs`} />
        <KpiCard label="Products" value={productData.length} />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Weekly install trend</p>
        <div className="p-5 pt-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
              <XAxis dataKey="Week" tick={{ fontSize: 10, fill: '#6b84b8' }} angle={-20} textAnchor="end" height={40} />
              <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="Installs" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Top cities by installs</p>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b84b8' }} />
                <YAxis dataKey="City" type="category" tick={{ fontSize: 11, fill: '#6b84b8' }} width={80} />
                <Tooltip />
                <Bar dataKey="Installs" fill="#1a2f6b" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-[#1a2f6b] uppercase tracking-wide bg-[#eef2f7] px-5 py-2">Installs by product</p>
          <div className="p-5 pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8edf5" />
                <XAxis dataKey="Product" tick={{ fontSize: 9, fill: '#6b84b8' }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#6b84b8' }} />
                <Tooltip />
                <Bar dataKey="Installs" fill="#93c5fd" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader() { return <div className="flex items-center justify-center h-48 text-[#6b84b8]"><Loader2 className="animate-spin" size={24} /></div> }
function Error({ msg }) { return <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">Failed to load: {msg}</div> }
