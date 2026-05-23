import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { QUADRANTS, getQuadrantId } from '../data/mockTasks'

function useDeleteGesture(onDelete) {
  const pressTimer = useRef(null)
  function onPointerDown() {
    pressTimer.current = setTimeout(() => {
      navigator.vibrate && navigator.vibrate([40, 30, 60])
      onDelete()
    }, 600)
  }
  function onPointerUp() { clearTimeout(pressTimer.current) }
  function onContextMenu(e) { e.preventDefault(); onDelete() }
  return { onPointerDown, onPointerUp, onPointerLeave: onPointerUp, onContextMenu }
}

function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: 999,
      fontSize: 10, fontWeight: 800,
      background: color + '22', color, border: `1px solid ${color}44`,
    }}>
      {label}
    </span>
  )
}

function DeadlineLabel({ deadline }) {
  const diff = new Date(deadline) - Date.now()
  const isOverdue = diff < 0
  const abs = Math.abs(diff)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const label = h > 0 ? `${h}時間${m}分` : `${m}分`
  return (
    <span style={{ fontSize: 10, fontWeight: 700,
      color: isOverdue ? '#e03131' : diff < 3600000 ? '#e67700' : '#868e96' }}>
      {isOverdue ? `⚠️ ${label}超過` : `⏱ ${label}後`}
    </span>
  )
}

export default function TaskCard({ task, variant = 'list', onDelete, onTap, isDragging = false }) {
  const qi = QUADRANTS.find(q => q.id === getQuadrantId(task.urgent, task.important))
  const accent = qi?.accent ?? '#868e96'

  const gestures = useDeleteGesture(() => onDelete && onDelete(task.id))

  if (variant === 'matrix') {
    return (
      <motion.div layout whileTap={{ scale: 0.97 }}
        style={{
          background: '#fff', borderRadius: 12, padding: '10px 12px',
          borderLeft: `4px solid ${accent}`,
          boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)',
          cursor: 'grab', marginBottom: 8,
        }}
        onClick={() => onTap && onTap(task)}
        {...gestures}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#212529', marginBottom: 4 }}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <DeadlineLabel deadline={task.deadline} />
          <div style={{ display: 'flex', gap: 4 }}>
            <Badge label={task.category} color={accent} />
            {task.isPrivate && <Badge label="🔒" color="#868e96" />}
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'grid') {
    return (
      <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }} whileTap={{ scale: 0.97 }}
        style={{
          background: '#fff', borderRadius: 14, padding: 14,
          borderTop: `4px solid ${accent}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}
        onClick={() => onTap && onTap(task)}
        {...gestures}
      >
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Badge label={task.category} color={accent} />
          {task.department && <Badge label={task.department} color="#5c7cfa" />}
          {task.isPrivate && <Badge label="🔒" color="#868e96" />}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#212529', lineHeight: 1.3 }}>{task.title}</div>
        <div style={{ fontSize: 11, color: '#868e96', lineHeight: 1.4, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.detail}
        </div>
        <DeadlineLabel deadline={task.deadline} />
      </motion.div>
    )
  }

  // list
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }} whileTap={{ scale: 0.985 }}
      style={{
        display: 'flex', alignItems: 'stretch', background: '#fff',
        borderRadius: 12, overflow: 'hidden',
        boxShadow: '0 1px 5px rgba(0,0,0,0.07)', cursor: 'pointer', marginBottom: 8,
      }}
      onClick={() => onTap && onTap(task)}
      {...gestures}
    >
      <div style={{ width: 4, background: accent, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '10px 12px', minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#212529',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
        <div style={{ fontSize: 11, color: '#868e96', marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.detail}</div>
        <div style={{ marginTop: 6 }}><DeadlineLabel deadline={task.deadline} /></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
        gap: 4, padding: '10px 12px', flexShrink: 0, alignItems: 'flex-end' }}>
        <Badge label={task.category} color={accent} />
        {task.department && <Badge label={task.department} color="#5c7cfa" />}
        {task.isPrivate && <Badge label="🔒" color="#868e96" />}
      </div>
    </motion.div>
  )
}
