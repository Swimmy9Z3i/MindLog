import { CATEGORIES } from '../data/mockTasks'

export default function CategoryTabs({ active, onChange, mode }) {
  const isBusiness = mode === 'business'
  const activeColor = isBusiness ? '#2e7d32' : '#ad1457'

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      padding: '10px 14px',
      overflowX: 'auto',
      background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      WebkitOverflowScrolling: 'touch',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}>
      {CATEGORIES.map(cat => {
        const isActive = active === cat.code
        return (
          <button
            key={cat.code}
            onClick={() => onChange(cat.code)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: isActive ? activeColor : '#f4f4f4',
              color: isActive ? '#fff' : '#666',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s',
              flexShrink: 0,
              minHeight: 38,
              boxShadow: isActive ? `0 3px 10px ${activeColor}44` : 'none',
            }}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
