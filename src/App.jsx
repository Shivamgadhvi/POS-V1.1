import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import CategoryTabs from './components/CategoryTabs.jsx'
import ItemCard from './components/ItemCard.jsx'
import CartBar from './components/CartBar.jsx'
import OrderReview from './components/OrderReview.jsx'
import OrderLog from './components/OrderLog.jsx'
import CustomOrderForm from './components/CustomOrderForm.jsx'
import { categories } from './data/menuItems.js'
import { computeTotals } from './lib/orderMath.js'
import { submitOrder, retrySubmit } from './lib/orders.js'
import { businessDayLabel } from './lib/businessDay.js'

const STORAGE_KEY = 'shivankitas-pos-orders-v2'
const DAY_KEY = 'shivankitas-pos-business-day'

function loadOrders() {
  try {
    const storedDay = localStorage.getItem(DAY_KEY)
    if (storedDay !== businessDayLabel()) return []
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function App() {
  const [orders, setOrders] = useState(loadOrders)
  const [activeOrderId, setActiveOrderId] = useState(null)
  const [view, setView] = useState('menu') // menu | review | log
  const [activeCategory, setActiveCategory] = useState(categories[0].id)

  // Roll over to a fresh log once the business day boundary (6 AM) passes,
  // even if the app was left open across it.
  useEffect(() => {
    const check = () => {
      const label = businessDayLabel()
      if (localStorage.getItem(DAY_KEY) !== label) {
        setOrders([])
        setActiveOrderId(null)
        localStorage.setItem(DAY_KEY, label)
      }
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    localStorage.setItem(DAY_KEY, businessDayLabel())
  }, [orders])

  // Always have a fresh open order ready when landing on the menu screen.
  useEffect(() => {
    if (view === 'menu' && !orders.some((o) => o.localId === activeOrderId)) {
      createNewOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, activeOrderId])

  const activeOrder = orders.find((o) => o.localId === activeOrderId) || null
  const activeCategoryData = categories.find((c) => c.id === activeCategory)
  const { lines, gross, total } = computeTotals(activeOrder?.cart || {}, activeOrder?.discount || 0)
  const cartCount = lines.reduce((s, l) => s + l.qty, 0)

  function createNewOrder() {
    const localId = crypto.randomUUID()
    const displayNo = orders.length + 1
    const order = {
      localId,
      displayNo,
      status: 'open',
      cart: {},
      name: '',
      phone: '',
      discount: 0,
      createdAt: Date.now(),
      deliveredAt: null,
      paymentMethod: null,
      amountCollected: null,
      sheetOrderId: null,
      synced: false,
      clientOrderId: crypto.randomUUID(),
      payload: null,
    }
    setOrders((prev) => [...prev, order])
    setActiveOrderId(localId)
  }

  const startNewOrder = () => {
    createNewOrder()
    setView('menu')
  }

  const updateCart = (updater) => {
    setOrders((prev) => prev.map((o) => (o.localId === activeOrderId ? { ...o, cart: updater(o.cart) } : o)))
  }
  const handleAdd = (itemId) => {
    updateCart((cart) => ({ ...cart, [itemId]: { qty: 1, scoops: cart[itemId]?.scoops || 0 } }))
  }
  const handleAddCustomOrder = ({ name, price }) => {
  const customId = `custom-${crypto.randomUUID()}`

  updateCart((cart) => ({
    ...cart,
    [customId]: {
      qty: 1,
      scoops: 0,
      custom: true,
      name,
      price,
    },
  }))
}

  const handleChangeQty = (itemId, delta) => {
    updateCart((cart) => {
      const cur = cart[itemId] || { qty: 0, scoops: 0 }
      const nextQty = Math.max(0, cur.qty + delta)
      if (nextQty === 0) {
        const { [itemId]: _, ...rest } = cart
        return rest
      }
      return { ...cart, [itemId]: { ...cur, qty: nextQty } }
    })
  }

  const handleChangeScoops = (itemId, delta) => {
    updateCart((cart) => {
      const cur = cart[itemId] || { qty: 0, scoops: 0 }
      if (cur.qty === 0) return cart
      return { ...cart, [itemId]: { ...cur, scoops: Math.max(0, cur.scoops + delta) } }
    })
  }

  const handleSaveOrder = ({ name, phone, discount }) => {
    setOrders((prev) => prev.map((o) => (o.localId === activeOrderId ? { ...o, name, phone, discount } : o)))
    setActiveOrderId(null)
    setView('log')
  }

  const handleReopen = (localId) => {
    setActiveOrderId(localId)
    setView('menu')
  }

  const handleDiscard = (localId) => {
    setOrders((prev) => prev.filter((o) => o.localId !== localId))
  }

  const handleMarkDelivered = async (localId, { paymentMethod, amountCollected }) => {
    const order = orders.find((o) => o.localId === localId)
    if (!order) return
    const t = computeTotals(order.cart, order.discount || 0)

    const payload = {
      clientOrderId: order.clientOrderId,
      name: order.name,
      phone: order.phone,
      itemCount: t.lines.reduce((s, l) => s + l.qty, 0),
      subtotal: t.subtotal,
      iceCreamRevenue: t.iceCreamRevenue,
      discount: order.discount || 0,
      total: t.total,
      amountCollected,
      paymentMethod,
      items: t.lines.map((l) => ({
        itemId: l.item.id,
        itemName: l.item.name,
        category: l.category,
        qty: l.qty,
        unitPrice: l.item.price,
        iceCreamScoops: l.scoops,
        lineTotal: l.lineTotal,
      })),
    }

    const { orderId, synced } = await submitOrder(payload)
    setOrders((prev) => prev.map((o) => (o.localId === localId ? {
      ...o,
      status: 'delivered',
      deliveredAt: Date.now(),
      paymentMethod,
      amountCollected,
      sheetOrderId: orderId,
      synced,
      payload,
    } : o)))
  }

  const handleRetrySync = async (localId) => {
    const order = orders.find((o) => o.localId === localId)
    if (!order || order.synced || !order.payload) return
    const result = await retrySubmit(order.payload)
    if (result) {
      setOrders((prev) => prev.map((o) => (o.localId === localId ? { ...o, sheetOrderId: result.orderId, synced: true } : o)))
    }
  }

  return (
    <div className="app-shell">
      <Header
        view={view}
        onToggleView={() => (view === 'log' ? startNewOrder() : setView('log'))}
      />

      {view === 'menu' && activeOrder && (
        <>
          <CategoryTabs categories={categories} activeCategory={activeCategory} onSelect={setActiveCategory} />
          {activeCategory === 'custom' ? (
  <CustomOrderForm onAdd={handleAddCustomOrder} />
) : (
  <div className="item-list">
    {activeCategoryData.items.map((item) => (
      <ItemCard
        key={item.id}
        item={item}
        categoryIcon={activeCategoryData.icon}
        cartEntry={activeOrder.cart[item.id]}
        onAdd={handleAdd}
        onChangeQty={handleChangeQty}
        onChangeScoops={handleChangeScoops}
      />
    ))}
  </div>
)}
          <CartBar count={cartCount} total={total} onOpen={() => cartCount > 0 && setView('review')} />
        </>
      )}

      {view === 'review' && activeOrder && (
        <OrderReview
          lines={lines}
          gross={gross}
          initialName={activeOrder.name}
          initialPhone={activeOrder.phone}
          initialDiscount={activeOrder.discount}
          onBack={() => setView('menu')}
          onSave={handleSaveOrder}
        />
      )}

      {view === 'log' && (
        <OrderLog
          orders={orders}
          onBack={() => setView('menu')}
          onReopen={handleReopen}
          onDiscard={handleDiscard}
          onMarkDelivered={handleMarkDelivered}
          onRetrySync={handleRetrySync}
        />
      )}
    </div>
  )
}
