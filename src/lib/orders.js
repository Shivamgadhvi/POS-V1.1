import { ORDERS_ENDPOINT } from '../config.js'

const TIMEOUT_MS = 6000

// Attempts to write the order to the Google Sheet and get back its
// sequential OrderID. If the network is slow/unavailable, the order still
// completes locally with synced: false, so marking it delivered is never blocked.
export async function submitOrder(payload) {
  try {
    const orderId = await postToSheet(payload)
    return { orderId, synced: true }
  } catch {
    return { orderId: null, synced: false }
  }
}

// Re-sends the same payload (same clientOrderId) so the Sheet can safely
// dedupe if the first attempt actually succeeded despite looking like it failed.
export async function retrySubmit(payload) {
  try {
    const orderId = await postToSheet(payload)
    return { orderId, synced: true }
  } catch {
    return null
  }
}

async function postToSheet(payload) {
  if (!ORDERS_ENDPOINT || ORDERS_ENDPOINT.includes('PASTE_YOUR')) {
    throw new Error('Apps Script endpoint not configured yet')
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    // Content-Type text/plain keeps this a "simple request" so the browser
    // skips a CORS preflight, which Apps Script web apps don't handle.
    const res = await fetch(ORDERS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const data = await res.json()
    if (data.status !== 'success') throw new Error(data.message || 'Sheet write failed')
    return data.orderId
  } finally {
    clearTimeout(timer)
  }
}
