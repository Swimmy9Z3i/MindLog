import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { QUADRANTS } from '../data/mockTasks'

function DroppableQuadrant({ q, tasks, onDelete, onTap, activeId }) {
  const { setNodeRef, isOver } = useDroppable({ id: q.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: '1 1 calc(50% - 6px)',
        minHeight: 160,
        background: isOver ? q.labelBg : q.bg,
        borderRadius: 16,
        padding: 12,
        border: `2px solid ${isOver ? q.accent : q.accent + '44'}`,
        transition: 'all 0.15s',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* ヘッダー */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: q.labelBg, borderRadius: 999,
          padding: '3px 10px', marginBottom: 2,
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: q.accent }}>{q.label}</span>
        </div>
        <div style={{ fontSize: 9, color: q.accent + 'aa', fontWeight: 600, paddingLeft: 4 }}>{q.sub}</div>
      </div>

      {/* タスク */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <AnimatePresence>
          {tasks.map(task => (
            <DraggableTask key={task.id} task={task} onDelete={onDelete} onTap={onTap} isActive={activeId === task.id} />
          ))}
        </AnimatePresence>
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: q.accent + '66', fontSize: 11, paddingTop: 20 }}>
            タスクなし
          </div>
        )}
      </div>
    </div>
  )
}

function DraggableTask({ task, onDelete, onTap, isActive }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999, position: 'relative' }
    : {}
  return (
    <div ref={setNodeRef} style={{ ...style, opacity: isDragging ? 0 : 1 }} {...listeners} {...attributes}>
      <TaskCard task={task} variant="matrix" onDelete={onDelete} onTap={onTap} />
    </div>
  )
}

export default function MatrixView({ tasks, onDelete, onTap, onMoveTask }) {
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  )

  function handleDragStart({ active }) {
    setActiveTask(tasks.find(t => t.id === active.id) || null)
  }

  function handleDragEnd({ active, over }) {
    setActiveTask(null)
    if (!over || active.id === over.id) return
    const targetQ = QUADRANTS.find(q => q.id === over.id)
    if (!targetQ) return
    onMoveTask(active.id, targetQ.urgent, targetQ.important)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        padding: 12, flex: 1, alignContent: 'flex-start',
      }}>
        {QUADRANTS.map(q => {
          const qTasks = tasks.filter(t =>
            t.urgent === q.urgent && t.important === q.important
          )
          return (
            <DroppableQuadrant
              key={q.id}
              q={q}
              tasks={qTasks}
              onDelete={onDelete}
              onTap={onTap}
              activeId={activeTask?.id}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} variant="matrix" isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
