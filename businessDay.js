// The stall runs roughly 8 PM to past midnight, sometimes to 3-4 AM.
// A "business day" here means: everything from opening until this cutoff hour
// the next morning is treated as the same working day in the app's local log,
// so the order list doesn't reset at midnight while you're still open.
export const CUTOFF_HOUR = 6 // 6 AM

export function businessDayLabel(date = new Date()) {
  const d = new Date(date)
  if (d.getHours() < CUTOFF_HOUR) {
    d.setDate(d.getDate() - 1)
  }
  return d.toDateString()
}
