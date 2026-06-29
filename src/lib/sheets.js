import Papa from 'papaparse'

const SHEET_IDS = {
  sales_overview: '1tUTEFQHhHPsVFuvnAVDhPRRyioqJYvIcRNJmXVVd8Nw',
  install_tracker: '1znxTwlQb_tNzdCxWcqWRzaoszrcl9lk0Hs_RJXVtMBo',
  retailer_coverage: '1ayHJ2FhnPcZy2T8h6vA1AIO-EA7f5vCm99UqBKC53a0',
  nps_aftersales: '1eoR_ToI83aDtylIYQulincs1LA6c-6qBFdd5_kC416U',
  margin_by_sku: '1wPB4JbnM_ziXZPLFGiPLpR1-40bPHkWPS1gGw027u_c',
  anomaly_log: '1AgXHS5fKaCBq2iBfhnz-YYBx1uZw7Ibb4l0cMTolHc8',
}

export const SHEET_URLS = Object.fromEntries(
  Object.entries(SHEET_IDS).map(([k, id]) => [
    k,
    `https://docs.google.com/spreadsheets/d/${id}/edit`,
  ])
)

const CSV_URL = (id) =>
  `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`

const cache = {}

export async function fetchSheet(name) {
  if (cache[name]) return cache[name]
  const id = SHEET_IDS[name]
  if (!id) throw new Error(`Unknown sheet: ${name}`)

  const res = await fetch(CSV_URL(id))
  if (!res.ok) throw new Error(`Failed to fetch sheet ${name}: ${res.status}`)
  const text = await res.text()

  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
  cache[name] = data
  return data
}

export function clearCache() {
  Object.keys(cache).forEach((k) => delete cache[k])
}
