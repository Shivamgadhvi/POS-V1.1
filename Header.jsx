import { ClipboardList, Plus } from 'lucide-react'

export default function Header({ view, onToggleView }) {
  return (
    <div className="app-header">
      <div className="brand-row">
        <div className="brand-badge">SA</div>
        <div>
          <p className="brand-name">ShivAnkita's</p>
          <div className="brand-sub">TASTY DELIGHT</div>
        </div>
      </div>
      <button className="icon-btn" onClick={onToggleView} aria-label={view === 'log' ? 'New order' : "Today's orders"}>
        {view === 'log' ? <Plus size={18} /> : <ClipboardList size={18} />}
      </button>
    </div>
  )
}
