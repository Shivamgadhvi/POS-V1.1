import { useState } from 'react'

export default function CustomOrderForm({ onAdd }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmedName = name.trim()
    const amount = Number(price)

    if (!trimmedName || !amount || amount <= 0) return

    onAdd({
      name: trimmedName,
      price: amount,
    })

    setName('')
    setPrice('')
  }

  return (
    <form className="custom-order-form" onSubmit={handleSubmit}>
      <div className="field-label">What's the order?</div>

      <input
        className="field-input"
        type="text"
        placeholder="e.g. Birthday Brownie Box"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="field-label">Amount charged (₹)</div>

      <input
        className="field-input"
        type="number"
        min="1"
        step="1"
        placeholder="e.g. 500"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button
        className="confirm-btn"
        type="submit"
        disabled={!name.trim() || !price || Number(price) <= 0}
      >
        Add Custom Order
      </button>
    </form>
  )
}
