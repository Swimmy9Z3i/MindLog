import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CATEGORIES, QUADRANTS } from '../data/mockTasks'

const CATS = CATEGORIES.filter(c => c.code !== 'ALL')

// 象限のカラー・ラベル
const Q_MAP = {
  Q1: { urgent: true,  important: true,  label: '今すぐ',   sub: '緊急 × 重要',    color: '#e03131', bg: '#fff5f5' },
  Q2: { urgent: false, important: true,  label: '計画する',  sub: '重要 × 非緊急',  color: '#1971c2', bg: '#e8f4fd' },
  Q3: { urgent: true,  important: false, label: '委任する',  sub: '緊急 × 非重要',  color: '#e67700', bg: '#fff9db' },
  Q4: { urgent: false, important: false, label: '後回し',   sub: '非緊急 × 非重要', color: '#868e96', bg: '#f8f9fa' },
}

function getQid(urgent, important) {
  if (urgent && important)   return 'Q1'
  if (!urgent && important)  return 'Q2'
  if (urgent && !important)  return 'Q3'
  return 'Q4'
}

export default function TaskCreateModal({ initial, onSave, onClose }) {
  const [title,      setTitle]      = useState(initial?.title || '')
  const [detail,     setDetail]     = useState(initial?.detail || '')
  const [category,   setCategory]   = useState(initial?.category || 'OTHER')
  const [department, setDepartment] = useState(initial?.department || 'OC')
  const [qid,        setQid]        = useState(getQid(initial?.urgent ?? false, initial?.important ?? true))
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '')
      setDetail(initial.detail || '')
      setCategory(initial.category || 'OTHER')
      setDepartment(initial.department || 'OC')
      setQid(getQid(initial.urgent ?? false, initial.important ?? true))
    }
  }, [initial])

  // カテゴリー → 部門を自動推定
  function handleCategoryChange(code) {
    setCategory(code)
    const autoDept = {
      SV: 'MT', BP: 'BP', DT: 'DC', SS: 'FS',
      RR: 'MT', VS: 'OC', IN: 'OC', OTHER: 'OC',
    }
    setDepartment(autoDept[code] || 'OC')
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const q = Q_MAP[qid]
    await onSave({
      title:      title.trim(),
      detail:     detail.trim(),
      category,
      department,
      urgent:     q.urgent,
      important:  q.important,
      deadline:   initial?.deadline || new Date(Date.now() + (q.urgent ? 2 : 24) * 3600000).toISOString(),
    })
    setSaving(false)
    onClose()
  }

  const selectedQ = Q_MAP[qid]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end',
        }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            width: '100%', maxHeight: '92dvh', overflowY: 'auto',
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '0 0 32px',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          {/* ハンドルバー */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: '#dee2e6' }} />
          </div>

          {/* ヘッダー */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 20px 16px' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#212529' }}>
              {initial ? '🤖 AIが分類しました' : '➕ 新しいタスク'}
            </span>
            <button onClick={onClose} style={{
              background: '#f1f3f5', border: 'none', borderRadius: '50%',
              width: 32, height: 32, cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* タイトル入力 */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#868e96', letterSpacing: 0.5 }}>
                タイトル *
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="タスクのタイトル"
                autoFocus={!initial}
                style={{
                  width: '100%', marginTop: 6, padding: '10px 14px',
                  borderRadius: 10, border: '2px solid #dee2e6',
                  fontSize: 14, fontWeight: 700, color: '#212529',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  borderColor: title.trim() ? '#1971c2' : '#dee2e6',
                }}
              />
            </div>

            {/* 詳細入力 */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#868e96', letterSpacing: 0.5 }}>
                詳細・メモ
              </label>
              <textarea
                value={detail}
                onChange={e => setDetail(e.target.value)}
                placeholder="詳細や補足情報（任意）"
                rows={2}
                style={{
                  width: '100%', marginTop: 6, padding: '10px 14px',
                  borderRadius: 10, border: '2px solid #dee2e6',
                  fontSize: 13, color: '#495057', resize: 'none',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />
            </div>

            {/* カテゴリー選択 */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#868e96', letterSpacing: 0.5 }}>
                事業カテゴリー
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                {CATS.map(c => {
                  const isSelected = category === c.code
                  return (
                    <button
                      key={c.code}
                      onClick={() => handleCategoryChange(c.code)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 4, padding: '10px 4px', borderRadius: 12, border: '2px solid',
                        borderColor: isSelected ? '#1971c2' : '#dee2e6',
                        background: isSelected ? '#e8f4fd' : '#fff',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{c.icon}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        color: isSelected ? '#1971c2' : '#868e96',
                        textAlign: 'center', lineHeight: 1.2,
                      }}>
                        {c.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 4象限ピッカー */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#868e96', letterSpacing: 0.5 }}>
                優先度（4象限）
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                {Object.entries(Q_MAP).map(([id, q]) => {
                  const isSelected = qid === id
                  return (
                    <button
                      key={id}
                      onClick={() => setQid(id)}
                      style={{
                        padding: '12px 10px', borderRadius: 12, border: '2px solid',
                        borderColor: isSelected ? q.color : '#dee2e6',
                        background: isSelected ? q.bg : '#fff',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        fontSize: 13, fontWeight: 900,
                        color: isSelected ? q.color : '#adb5bd',
                        marginBottom: 2,
                      }}>
                        {id === 'Q1' ? '🔴' : id === 'Q2' ? '🔵' : id === 'Q3' ? '🟡' : '⚪'} {q.label}
                      </div>
                      <div style={{ fontSize: 10, color: isSelected ? q.color : '#adb5bd', fontWeight: 600 }}>
                        {q.sub}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              style={{
                padding: '14px', borderRadius: 12, border: 'none',
                background: title.trim() ? selectedQ.color : '#dee2e6',
                color: '#fff', fontSize: 14, fontWeight: 900,
                cursor: title.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                boxShadow: title.trim() ? `0 4px 16px ${selectedQ.color}44` : 'none',
              }}
            >
              {saving ? '保存中…' : `タスクを追加 — ${selectedQ.label}`}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
