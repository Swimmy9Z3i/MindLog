import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { mockTasks, QUADRANTS, CATEGORIES } from './data/mockTasks'
import Header from './components/Header'
import FilterChips from './components/FilterChips'
import MatrixView from './components/MatrixView'
import ListView from './components/ListView'
import GridView from './components/GridView'
import MicButton from './components/MicButton'
import TaskDetailModal from './components/TaskDetailModal'

let nextId = 100

function createTask(mode) {
  const samples = [
    { title: '見積書の確認依頼', detail: 'ディーラーから届いた見積を確認して返信', category: 'VS', department: 'OC', urgent: true, important: true },
    { title: 'オイル交換の予約確認', detail: '佐藤様から電話、来週月曜の予約確定', category: 'SV', department: 'MT', urgent: false, important: true },
    { title: 'タイヤ在庫の確認', detail: 'スタッドレスの在庫確認・発注', category: 'SV', department: 'MT', urgent: false, important: false },
  ]
  const s = samples[Math.floor(Math.random() * samples.length)]
  return {
    id: ++nextId, ...s,
    isPrivate: mode === 'private',
    deadline: new Date(Date.now() + (Math.random() * 8 + 0.5) * 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  }
}

export default function App() {
  const [mode, setMode]             = useState('business')
  const [currentView, setCurrentView] = useState('president')
  const [viewMode, setViewMode]     = useState('MATRIX')
  const [groupBy, setGroupBy]       = useState('QUADRANT')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [tasks, setTasks]           = useState(mockTasks)
  const [selectedTask, setSelectedTask] = useState(null)

  function handleDeleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)) }
  function handleVoiceInput(parsed) {
    const task = parsed
      ? {
          id: ++nextId,
          title: parsed.title,
          detail: parsed.detail,
          category: parsed.category || 'OTHER',
          department: 'OC',
          urgent: parsed.urgent ?? false,
          important: parsed.important ?? true,
          isPrivate: mode === 'private',
          deadline: parsed.deadline,
          createdAt: new Date().toISOString(),
        }
      : createTask(mode)
    setTasks(prev => [task, ...prev])
  }
  function handleMoveTask(id, urgent, important) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, urgent, important } : t))
  }

  const filteredTasks = useMemo(() => tasks.filter(t => {
    if (currentView === 'staff' && t.isPrivate) return false
    if (mode === 'private') return t.isPrivate
    if (activeCategory !== 'ALL' && t.category !== activeCategory) return false
    return true
  }), [tasks, activeCategory, currentView, mode])

  const selectedQ = selectedTask
    ? QUADRANTS.find(q => q.urgent === selectedTask.urgent && q.important === selectedTask.important)
    : null

  const overdueCount = filteredTasks.filter(t => new Date(t.deadline) < new Date()).length

  const views = { MATRIX: MatrixView, LIST: ListView, GRID: GridView }
  const ActiveView = views[viewMode]

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif",
      background: '#f1f3f5', overflow: 'hidden',
    }}>
      <Header
        mode={mode}
        onToggleMode={() => setMode(m => m === 'business' ? 'private' : 'business')}
        viewMode={viewMode}
        onViewMode={setViewMode}
        groupBy={groupBy}
        onGroupBy={setGroupBy}
        currentView={currentView}
        onCurrentView={setCurrentView}
      />

      <FilterChips
        active={activeCategory}
        onChange={setActiveCategory}
        mode={mode}
      />

      {/* 期限超過バナー */}
      {overdueCount > 0 && (
        <motion.div
          initial={{ height: 0 }} animate={{ height: 'auto' }}
          style={{
            background: '#fff5f5', borderBottom: '2px solid #e03131',
            color: '#e03131', textAlign: 'center',
            padding: '6px', fontSize: 12, fontWeight: 700,
          }}
        >
          ⚠️ 期限超過タスクが {overdueCount} 件あります
        </motion.div>
      )}

      {/* スタッフビュー警告 */}
      {currentView === 'staff' && (
        <div style={{
          background: '#e7f5ff', borderBottom: '1px solid #74c0fc',
          color: '#1971c2', textAlign: 'center',
          padding: '5px', fontSize: 11, fontWeight: 700,
        }}>
          👤 スタッフ閲覧専用 — 業務タスクのみ表示
        </div>
      )}

      {/* メインエリア */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <ActiveView
              tasks={filteredTasks}
              onDelete={handleDeleteTask}
              onTap={setSelectedTask}
              groupBy={groupBy}
              onMoveTask={handleMoveTask}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FABマイク */}
      <MicButton mode={mode} onVoiceInput={handleVoiceInput} />

      {/* タスク詳細モーダル */}
      <TaskDetailModal
        task={selectedTask}
        accent={selectedQ?.accent || '#1971c2'}
        onClose={() => setSelectedTask(null)}
        onDelete={(id) => { handleDeleteTask(id); setSelectedTask(null) }}
      />
    </div>
  )
}
