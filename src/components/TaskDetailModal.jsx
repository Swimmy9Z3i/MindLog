import { CATEGORIES } from '../data/mockTasks'

function fmt(iso) {
  const d = new Date(iso)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function getCategoryLabel(code) {
  return CATEGORIES.find(c => c.code === code)?.label || code
}

export default function TaskDetailModal({ task, accent, onClose, onDelete }) {
  if (!task) return null

  const isOverdue = new Date(task.deadline) < new Date()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* ボトムシート */}
      <div
        style={{
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '20px 24px 40px',
          width: '100%',
          maxWidth: 480,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.22s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ハンドル */}
        <div style={{
          width: 40, height: 4, borderRadius: 999,
          background: '#e0e0e0', margin: '0 auto 18px',
        }} />

        {/* カテゴリー + プライベート */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: accent, background: `${accent}18`,
            borderRadius: 999, padding: '4px 12px',
          }}>
            {getCategoryLabel(task.category)}
          </span>
          {task.isPrivate && (
            <span style={{
              fontSize: 12, background: '#f4f4f4',
              borderRadius: 999, padding: '4px 10px', color: '#888',
            }}>🔒 非公開</span>
          )}
          {isOverdue && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              background: '#f03e3e', color: '#fff',
              borderRadius: 999, padding: '4px 12px',
            }}>⚠️ 期限切れ</span>
          )}
        </div>

        {/* タイトル */}
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.4 }}>
          {task.title}
        </h2>

        {/* 詳細 */}
        {task.detail && (
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
            {task.detail}
          </p>
        )}

        {/* 期限 */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24,
          fontSize: 13, color: '#999',
        }}>
          <span>🗓 期限：<strong style={{ color: isOverdue ? '#f03e3e' : '#555' }}>{fmt(task.deadline)}</strong></span>
          <span>📝 登録：{fmt(task.createdAt)}</span>
        </div>

        {/* アクションボタン */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => { onDelete && onDelete(task.id); onClose() }}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 999,
              border: 'none', fontFamily: 'inherit',
              fontSize: 15, fontWeight: 700,
              background: '#f03e3e', color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(240,62,62,0.35)',
            }}
          >
            完了・削除
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 999,
              border: '2px solid #e0e0e0', fontFamily: 'inherit',
              fontSize: 15, fontWeight: 700,
              background: '#fff', color: '#555',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
