import { allItems, itemCategoryName, ICE_CREAM_PRICE } from '../data/menuItems.js'

// A cart is { [itemId]: { qty, scoops } }. Scoops are independent of qty —
// someone can order 3 brownies and 1 scoop, or 1 brownie and 2 scoops.
export function computeLines(cart) {
  return Object.entries(cart)
    .filter(([, v]) => v.qty > 0)
    .map(([id, v]) => {
      const item = allItems[id]
      const lineTotal = v.qty * item.price + (v.scoops || 0) * ICE_CREAM_PRICE
      return { key: id, item, category: itemCategoryName[id], qty: v.qty, scoops: v.scoops || 0, lineTotal }
    })
}

export function computeTotals(cart, discount = 0) {
  const lines = computeLines(cart)
  const subtotal = lines.reduce((s, l) => s + l.qty * l.item.price, 0)
  const iceCreamRevenue = lines.reduce((s, l) => s + l.scoops * ICE_CREAM_PRICE, 0)
  const gross = subtotal + iceCreamRevenue
  const total = Math.max(0, gross - (Number(discount) || 0))
  return { lines, subtotal, iceCreamRevenue, gross, total }
}
