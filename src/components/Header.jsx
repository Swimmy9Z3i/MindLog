import { GROUP_OPTIONS } from '../data/mockTasks'

const VIEW_MODES = [
  { id: 'MATRIX', icon: '⊞', label: '4象限' },
  { id: 'LIST',   icon: '≡',  label: 'リスト' },
  { id: 'GRID',   icon: '⊟', label: 'グリッド' },
]

export default function Header({ mode, onToggleMode, viewMode, onViewMode, groupBy, onGroupBy, currentView, onCurrentView }) {
  const isBusiness = mode === 'business'

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e9ecef', userSelect: 'none' }}>

      {/* ── 1行目 ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 14px', gap: 10,
      }}>
        {/* モード切り替え */}
        <button
          onClick={onToggleMode}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: isBusiness ? '#1971c2' : '#e64980',
            color: '#fff', border: 'none', borderRadius: 999,
            padding: '6px 14px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          {isBusiness ? '🏢 業務' : '🔒 プライベート'}
        </button>

        {/* ロゴ */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#212529', letterSpacing: '-0.5px' }}>MindLog</span>
          <span style={{ fontSize: 9, color: '#868e96', marginLeft: 5, fontWeight: 600 }}>LOG SERIES</span>
        </div>

        {/* 社長 / スタッフ */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {['president', 'staff'].map(v => (
            <button
              key={v}
              onClick={() => onCurrentView(v)}
              style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                border: '2px solid',
                background: currentView === v ? '#212529' : 'transparent',
                color: currentView === v ? '#fff' : '#868e96',
                borderColor: currentView === v ? '#212529' : '#dee2e6',
                cursor: 'pointer',
              }}
            >
              {v === 'president' ? '社長' : 'スタッフ'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2行目 ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 14px 10px', gap: 10,
      }}>
        {/* ビューモード 3値トグル */}
        <div style={{
          display: 'flex', background: '#f1f3f5',
          borderRadius: 10, padding: 3, gap: 2,
        }}>
          {VIEW_MODES.map(v => (
            <button
              key={v.id}
              onClick={() => onViewMode(v.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: viewMode === v.id ? '#fff' : 'transparent',
                color: viewMode === v.id ? '#212529' : '#868e96',
                boxShadow: viewMode === v.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 14 }}>{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>

        {/* グループ化 ドロップダウン */}
        <select
          value={groupBy}
          onChange={e => onGroupBy(e.target.value)}
          style={{
            marginLeft: 'auto',
            padding: '6px 10px', borderRadius: 8,
            border: '1.5px solid #dee2e6',
            fontSize: 12, fontWeight: 600, color: '#495057',
            background: '#fff', cursor: 'pointer',
            appearance: 'none',
            paddingRight: 24,
          }}
        >
          {GROUP_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
