import { useState, useRef } from 'react'
import { CATEGORIES } from '../data/mockTasks'

function getDeadlineStatus(deadline) {
  const diffMin = Math.floor((new Date(deadline) - new Date()) / 60000)
  if (diffMin < 0) return { color: '#f03e3e', label: '期限切れ', overdue: true, warn: false }
  if (diffMin < 180) return { color: '#f59f00', label: diffMin < 60 ? `${diffMin}分` : `${Math.floor(diffMin/60)}h`, warn: true, overdue: false }
  if (diffMin < 1440) return { color: null, label: `${Math.floor(diffMin/60)}h`, warn: false, overdue: false }
  return { color: null, label: `${Math.floor(diffMin/1440)}日`, warn: false, overdue: false }
}

function shortTitle(title) {
  // 5文字以内に収める
  return title.length > 5 ? title.slice(0, 5) + '…' : title
}

function getCategoryShort(code) {
  const map = { VS:'車販', SV:'車検', BP:'板金', DT:'詳細', SS:'SS', RR:'RR', OTHER:'他' }
  return map[code] || code
}

const LONG_PRESS_MS = 520
const FLICK_THRESHOLD = 68

export default function TaskCircle({ task, accent, onDelete, onTap }) {
  const dl = getDeadlineStatus(task.deadline)
  const [removing, setRemoving] = useState(false)
  const [longPressed, setLongPressed] = useState(false)
  const [swipeX, setSwipeX] = useState(0)
  const timerRef = useRef(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const longPressOk = useRef(false)
  const moved = useRef(false)

  function triggerDelete() {
    setRemoving(true)
    setTimeout(() => onDelete && onDelete(task.id), 300)
  }

  function handleContextMenu(e) {
    e.preventDefault()
    triggerDelete()
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    longPressOk.current = false
    moved.current = false
    setSwipeX(0)
    timerRef.current = setTimeout(() => {
      if (!moved.current) {
        longPressOk.current = true
        setLongPressed(true)
        navigator.vibrate && navigator.vibrate(40)
      }
    }, LONG_PRESS_MS)
  }

  function handleTouchMove(e) {
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    if (Math.abs(dy) > 12 || Math.abs(dx) > 12) moved.current = true
    if (!longPressOk.current && Math.abs(dy) > 10) clearTimeout(timerRef.current)
    if (longPressOk.current) setSwipeX(dx)
  }

  function handleTouchEnd() {
    clearTimeout(timerRef.current)
    setLongPressed(false)
    if (longPressOk.current && Math.abs(swipeX) >= FLICK_THRESHOLD) {
      triggerDelete()
    } else if (!longPressOk.current && !moved.current) {
      onTap && onTap(task)
    } else {
      setSwipeX(0)
    }
    longPressOk.current = false
  }

  function handleClick(e) {
    // タッチデバイスでは onTouchEnd 側で処理するので PC クリックのみ
    if (e.detail > 0) onTap && onTap(task)
  }

  const ringColor = dl.overdue ? '#f03e3e' : dl.warn ? '#f59f00' : `${accent}88`
  const size = 80

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `${accent}ee`,
    boxShadow: removing
      ? 'none'
      : dl.overdue
        ? `0 0 0 3px #f03e3e, 0 4px 16px #f03e3e66`
        : longPressed
          ? `0 0 0 4px ${accent}, 0 6px 20px ${accent}66`
          : `0 0 0 2.5px ${ringColor}, 0 4px 14px ${accent}44`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: longPressed ? 'none' : 'pan-y',
    animation: dl.overdue && !removing ? 'blink 1.4s ease-in-out infinite' : 'none',
    transition: removing
      ? 'opacity 0.28s ease, transform 0.28s ease'
      : 'box-shadow 0.15s, transform 0.18s',
    opacity: removing ? 0 : 1,
    transform: removing
      ? `scale(0) translateX(${swipeX >= 0 ? 60 : -60}px)`
      : longPressed
        ? `translateX(${swipeX}px) scale(1.1)`
        : 'scale(1)',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  }

  return (
    <div
      style={circleStyle}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {/* カテゴリー */}
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 1,
        marginBottom: 3,
      }}>
        {getCategoryShort(task.category)}{task.isPrivate ? ' 🔒' : ''}
      </span>

      {/* タイトル */}
      <span style={{
        fontSize: 12,
        fontWeight: 900,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 1.25,
        padding: '0 6px',
        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
        wordBreak: 'break-all',
      }}>
        {shortTitle(task.title)}
      </span>

      {/* 期限 */}
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        color: dl.overdue ? '#fff' : dl.warn ? '#fff3bf' : 'rgba(255,255,255,0.7)',
        marginTop: 4,
      }}>
        {dl.overdue ? '⚠️期限切' : dl.label}
      </span>

      {/* 長押し中オーバーレイ */}
      {longPressed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          {Math.abs(swipeX) >= FLICK_THRESHOLD ? '✓' : '↔'}
        </div>
      )}
    </div>
  )
}
