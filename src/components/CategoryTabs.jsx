export default function CategoryTabs({ categories, activeCategory, onSelect }) {
  return (
    <div className="cat-tabs">
      {categories.map((c) => (
        <div
          key={c.id}
          className={`cat-tab ${c.id === activeCategory ? 'active' : ''}`}
          onClick={() => onSelect(c.id)}
        >
          {c.name}
        </div>
      ))}
    </div>
  )
}
