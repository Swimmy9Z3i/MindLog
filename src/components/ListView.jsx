import { AnimatePresence, motion } from 'framer-motion'
import TaskCard from './TaskCard'
import { QUADRANTS, CATEGORIES, DEPARTMENTS } from '../data/mockTasks'

function SectionHeader({ label, sub, accent, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 }}>
      <div style={{ width: 3, height: 18, background: accent, borderRadius: 99 }} />
      <span style={{ fontSize: 13, fontWeight: 900, color: '#212529' }}>{label}</span>
      <span style={{ fontSize: 11, color: '#868e96' }}>{sub}</span>
      <span style={{
        marginLeft: 'auto', fontSize: 11, fontWeight: 700,
        background: accent + '22', color: accent,
        borderRadius: 999, padding: '1px 8px',
      }}>{count}</span>
    </div>
  )
}

export default function ListView({ tasks, onDelete, onTap, groupBy }) {
  let sections = []

  if (groupBy === 'QUADRANT') {
    sections = QUADRANTS.map(q => ({
      key: q.id, label: q.label, sub: q.sub, accent: q.accent,
      tasks: tasks.filter(t => t.urgent === q.urgent && t.important === q.important),
    }))
  } else if (groupBy === 'CATEGORY') {
    sections = CATEGORIES.filter(c => c.code !== 'ALL').map(c => ({
      key: c.code, label: `${c.icon} ${c.label}`, sub: c.code, accent: '#5c7cfa',
      tasks: tasks.filter(t => t.category === c.code),
    }))
  } else if (groupBy === 'DEPARTMENT') {
    sections = DEPARTMENTS.map(d => ({
      key: d.code, label: d.label, sub: d.code, accent: '#0ca678',
      tasks: tasks.filter(t => t.department === d.code),
    }))
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
      {sections.map(sec => (
        <div key={sec.key} style={{ marginBottom: 20 }}>
          <SectionHeader label={sec.label} sub={sec.sub} accent={sec.accent} count={sec.tasks.length} />
          <AnimatePresence>
            {sec.tasks.map(task => (
              <TaskCard key={task.id} task={task} variant="list" onDelete={onDelete} onTap={onTap} />
            ))}
          </AnimatePresence>
          {sec.tasks.length === 0 && (
            <div style={{ color: '#adb5bd', fontSize: 12, padding: '8px 4px' }}>タスクなし</div>
          )}
        </div>
      ))}
    </div>
  )
}
