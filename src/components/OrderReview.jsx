import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function OrderReview({ lines, gross, initialName, initialPhone, initialDiscount, onBack, onSave }) {
  const [name, setName] = useState(initialName || '')
  const [phone, setPhone] = useState(initialPhone || '')
  const [discount, setDiscount] = useState(initialDiscount || 0)

  const finalTotal = Math.max(0, gross - (Number(discount) || 0))

  return (
    <div className="screen">
      <div className="screen-title-row">
        <button onClick={onBack} aria-label="Back to menu"><ArrowLeft size={19} /></button>
        <h2 className="screen-title">Order details</h2>
      </div>

      {lines.map((l) => (
        <div className="cart-line" key={l.key}>
          <div className="cart-line-name">
            <span>{l.item.name} x{l.qty}</span>
            {l.scoops > 0 && <span className="cart-line-sub">+ ice cream x{l.scoops}</span>}
          </div>
          <span>₹{l.lineTotal}</span>
        </div>
      ))}

      <div className="cart-line" style={{ fontWeight: 500 }}>
        <span>Subtotal</span><span>₹{gross}</span>
      </div>

      <div className="field-label">Discount, if any (₹)</div>
      <input
        className="field-input"
        type="number"
        min="0"
        placeholder="0"
        value={discount || ''}
        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
      />

      <div className="cart-total-row">
        <span>Total</span><span>₹{finalTotal}</span>
      </div>

      <div className="field-label">Name (optional)</div>
      <input
        className="field-input"
        placeholder="Skip if you'd rather not share"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="field-label">Phone (optional)</div>
      <input
        className="field-input"
        placeholder="Only if you want an update"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        className="confirm-btn"
        onClick={() => onSave({ name: name.trim(), phone: phone.trim(), discount: Number(discount) || 0 })}
      >
        Save order
      </button>
    </div>
  )
}
