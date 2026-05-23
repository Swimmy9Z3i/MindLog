import { QUADRANTS } from '../data/mockTasks'
import TaskCard from './TaskCard'

function getTasksForQuadrant(tasks, urgent, important) {
  return tasks.filter(t => t.urgent === urgent && t.important === important)
}

export default function StaffView({ tasks, onDelete }) {
  const businessTasks = tasks.filter(t => !t.isPrivate)
  const overdueCount = businessTasks.filter(t => new Date(t.deadline) < new Date()).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f4f6f9' }}>
      {/* 閲覧専用バナー */}
      <div style={{
        background: '#1971c2',
        color: '#fff',
        textAlign: 'center',
        padding: '9px',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}>
        スタッフ閲覧専用 — 社長のタスク状況（業務のみ表示）
      </div>

      {/* サマリー */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #eee',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a' }}>{businessTasks.length}</div>
          <div style={{ fontSize: 10, color: '#999', fontWeight: 500 }}>業務タスク</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#f03e3e' }}>
            {businessTasks.filter(t => t.urgent && t.important).length}
          </div>
          <div style={{ fontSize: 10, color: '#999', fontWeight: 500 }}>今すぐやる</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: overdueCount > 0 ? '#f03e3e' : '#aaa' }}>
            {overdueCount}
          </div>
          <div style={{ fontSize: 10, color: '#999', fontWeight: 500 }}>期限超過</div>
        </div>
      </div>

      {/* 4分割マトリクス */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        padding: 10,
      }}>
        {QUADRANTS.map((q, i) => {
          const qTasks = getTasksForQuadrant(businessTasks, q.urgent, q.important)
          return (
            <div key={i} style={{
              background: q.bg,
              borderRadius: 16,
              border: `1.5px solid ${q.accent}33`,
              padding: '10px 10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minHeight: 140,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{
                    display: 'inline-block',
                    background: q.labelBg,
                    color: q.labelText,
                    fontSize: 11,
                    fontWeight: 800,
                    borderRadius: 7,
                    padding: '2px 9px',
                  }}>
                    {q.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#bbb', marginTop: 3, paddingLeft: 2 }}>{q.sub}</div>
                </div>
                {qTasks.length > 0 && (
                  <span style={{
                    background: q.accent, color: '#fff', borderRadius: '50%',
                    width: 22, height: 22, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 900, fontSize: 12,
                  }}>
                    {qTasks.length}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {qTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#ddd', fontSize: 12, padding: '12px 0' }}>なし</div>
                ) : (
                  qTasks.map(task => <TaskCard key={task.id} task={task} accent={q.accent} onDelete={onDelete} />)
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
