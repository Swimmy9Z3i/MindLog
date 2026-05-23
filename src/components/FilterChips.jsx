import { CATEGORIES } from '../data/mockTasks'

export default function FilterChips({ active, onChange, mode }) {
  const cats = mode === 'business'
    ? CATEGORIES
    : [{ code: 'ALL', label: 'All Todo', icon: '📋' }, { code: 'OTHER', label: 'プライベート', icon: '🔒' }]

  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto',
      padding: '8px 14px', background: '#fff',
      borderBottom: '1px solid #e9ecef',
      scrollbarWidth: 'none',
    }}>
      {cats.map(c => {
        const isActive = active === c.code
        return (
          <button
            key={c.code}
            onClick={() => onChange(c.code)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap',
              fontSize: 12, fontWeight: 700,
              border: '2px solid',
              background: isActive ? '#212529' : '#fff',
              color: isActive ? '#fff' : '#495057',
              borderColor: isActive ? '#212529' : '#dee2e6',
              cursor: 'pointer', transition: 'all 0.15s',
              flexShrink: 0,
            }}
          >
            <span>{c.icon}</span>
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
