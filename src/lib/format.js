export function num(v) {
  return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0
}

// All amounts are raw INR (integer rupees). This is the single formatter
// used across every tab so ₹Cr/₹L/raw switch at the same thresholds everywhere.
export function fmtCurrency(n) {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export function fmtPct(n) {
  return `${n.toFixed(1)}%`
}
