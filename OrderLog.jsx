import { useState } from 'react'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { computeLines, computeTotals } from '../lib/orderMath.js'

export default function OrderLog({ orders, onBack, onReopen, onDiscard, onMarkDelivered, onRetrySync }) {
  const [payingFor, setPayingFor] = useState(null)
  const [method, setMethod] = useState('Cash')
  const [amount, setAmount] = useState('')

  const open = orders.filter((o) => o.status === 'open')
  const delivered = orders.filter((o) => o.status === 'delivered')
  const deliveredRevenue = delivered.reduce((s, o) => s + (o.amountCollected ?? 0), 0)

  const startPayment = (order) => {
    const { total } = computeTotals(order.cart, order.discount)
    setPayingFor(order.localId)
    setMethod('Cash')
    setAmount(String(total))
  }

  const confirmPayment = (order) => {
    onMarkDelivered(order.localId, { paymentMethod: method, amountCollected: Number(amount) || 0 })
    setPayingFor(null)
  }

  return (
    <div className="screen">
      <div className="screen-title-row">
        <button onClick={onBack} aria-label="Back to menu"><ArrowLeft size={19} /></button>
        <h2 className="screen-title">Today's orders</h2>
      </div>

      <div className="log-summary-bar">
        <span>{delivered.length} delivered</span>
        <span>₹{deliveredRevenue} collected</span>
      </div>

      {orders.length === 0 && <div className="empty-note">No orders yet tonight.</div>}

      {open.length > 0 && <div className="log-section-label">Open — not yet delivered</div>}
      {open.map((o) => {
        const { lines, total } = computeTotals(o.cart, o.discount)
        return (
          <div className="log-entry" key={o.localId}>
            <div className="log-entry-head">
              <span className="log-order-no">Order #{o.displayNo}</span>
              <span className="status-pill open">Open</span>
            </div>
            <div className="log-customer">{o.name || 'Walk-in'}{o.phone ? ` · ${o.phone}` : ''}</div>
            <div className="log-items">
              {lines.length === 0 && <span className="log-items-empty">No items added yet</span>}
              {lines.map((l, i) => (
                <div key={i}>{l.item.name} x{l.qty}{l.scoops > 0 ? ` (+${l.scoops} ice cream)` : ''}</div>
              ))}
            </div>
            <div className="log-total-row"><span>Total</span><span>₹{total}</span></div>

            {payingFor === o.localId ? (
              <div className="payment-form">
                <div className="payment-method-row">
                  <button className={method === 'Cash' ? 'method-btn active' : 'method-btn'} onClick={() => setMethod('Cash')}>Cash</button>
                  <button className={method === 'Online' ? 'method-btn active' : 'method-btn'} onClick={() => setMethod('Online')}>Online</button>
                </div>
                <div className="field-label">Amount collected (₹)</div>
                <input className="field-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <button className="confirm-btn" onClick={() => confirmPayment(o)}>Confirm delivered</button>
              </div>
            ) : (
              <div className="log-action-row">
                <button className="log-action-btn" onClick={() => onReopen(o.localId)}><Pencil size={13} /> Edit</button>
                <button className="log-action-btn danger" onClick={() => onDiscard(o.localId)}><Trash2 size={13} /> Discard</button>
                <button className="log-action-btn primary" onClick={() => startPayment(o)} disabled={lines.length === 0}>Mark delivered</button>
              </div>
            )}
          </div>
        )
      })}

      {delivered.length > 0 && <div className="log-section-label">Delivered</div>}
      {[...delivered].reverse().map((o) => {
        const lines = computeLines(o.cart)
        return (
          <div className="log-entry" key={o.localId}>
            <div className="log-entry-head">
              <span className="log-order-no">{o.synced ? `Order #${o.sheetOrderId}` : 'Pending sync'}</span>
              <span className="log-time">{new Date(o.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="log-customer">{o.name || 'Walk-in'}{o.phone ? ` · ${o.phone}` : ''}</div>
            <div className="log-items">
              {lines.map((l, i) => (
                <div key={i}>{l.item.name} x{l.qty}{l.scoops > 0 ? ` (+${l.scoops} ice cream)` : ''}</div>
              ))}
            </div>
            <div className="log-total-row"><span>Collected · {o.paymentMethod}</span><span>₹{o.amountCollected}</span></div>
            {!o.synced && (
              <button className="retry-sync-btn" onClick={() => onRetrySync(o.localId)}>Retry saving to sheet</button>
            )}
          </div>
        )
      })}
    </div>
  )
}
