export default function ModeToggle({ mode, onToggle, currentView, onViewChange }) {
  const isBusiness = mode === 'business'
  const headerBg = isBusiness ? '#2e7d32' : '#ad1457'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      background: headerBg,
      color: '#fff',
      gap: 8,
    }}>
      {/* 左：アプリ名 */}
      <div style={{ lineHeight: 1.15, flexShrink: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: 2, fontStyle: 'italic' }}>MindLog</div>
        <div style={{ fontSize: 8, letterSpacing: 3, opacity: 0.6, fontWeight: 600 }}>LOG SERIES</div>
      </div>

      {/* 中央：モードトグル（pill） */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255,255,255,0.18)',
          border: '1.5px solid rgba(255,255,255,0.45)',
          borderRadius: 999,
          padding: '7px 14px',
          color: '#fff',
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
          minHeight: 40,
        }}
      >
        <span style={{ fontSize: 16 }}>{isBusiness ? '💼' : '🏠'}</span>
        <span>{isBusiness ? '業務' : 'プライベート'}</span>
      </button>

      {/* 右：ビュー切替（サークル系pill） */}
      <div style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 999,
        padding: 3,
        gap: 0,
        flexShrink: 0,
      }}>
        {[{ key: 'president', label: '社長' }, { key: 'staff', label: 'スタッフ' }].map(v => (
          <button
            key={v.key}
            onClick={() => onViewChange(v.key)}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: currentView === v.key ? '#fff' : 'transparent',
              color: currentView === v.key ? headerBg : 'rgba(255,255,255,0.8)',
              transition: 'all 0.2s',
              minHeight: 34,
            }}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
