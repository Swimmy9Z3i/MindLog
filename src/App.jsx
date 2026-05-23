import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QUADRANTS } from './data/mockTasks'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import FilterChips from './components/FilterChips'
import MatrixView from './components/MatrixView'
import ListView from './components/ListView'
import GridView from './components/GridView'
import MicButton from './components/MicButton'
import TaskDetailModal from './components/TaskDetailModal'
import TaskCreateModal from './components/TaskCreateModal'

// DB行 → アプリ形式に変換
function fromDb(row) {
  return {
    id:         row.id,
    title:      row.title,
    detail:     row.detail || '',
    category:   row.category || 'OTHER',
    department: row.department || 'OC',
    urgent:     row.urgent ?? false,
    important:  row.important ?? true,
    isPrivate:  row.is_private ?? false,
    deadline:   row.deadline,
    createdAt:  row.created_at,
  }
}

export default function App() {
  const [mode, setMode]               = useState('business')
  const [currentView, setCurrentView] = useState('president')
  const [viewMode, setViewMode]       = useState('MATRIX')
  const [groupBy, setGroupBy]         = useState('QUADRANT')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [tasks, setTasks]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [createInitial, setCreateInitial] = useState(null) // null=閉じる, {}=新規, {…}=AI分類済み

  // ── 初回ロード ─────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setTasks(data.map(fromDb))
      setLoading(false)
    }
    load()
  }, [])

  // ── リアルタイム同期 ───────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, ({ new: row }) => {
        setTasks(prev => [fromDb(row), ...prev])
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, ({ old: row }) => {
        setTasks(prev => prev.filter(t => t.id !== row.id))
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, ({ new: row }) => {
        setTasks(prev => prev.map(t => t.id === row.id ? fromDb(row) : t))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // ── CRUD ──────────────────────────────────────────────────
  async function handleDeleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id))
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) console.error('削除エラー:', error.message)
  }

  // 音声AI分類後 → モーダルを開く
  function handleClassified(parsed) {
    setCreateInitial(parsed)
  }

  // モーダルから保存（楽観的更新：即座に画面反映）
  async function handleCreateSave(data) {
    const tempId = Date.now()
    const newTask = {
      id:         tempId,
      title:      data.title,
      detail:     data.detail || '',
      category:   data.category || 'OTHER',
      department: data.department || 'OC',
      urgent:     data.urgent ?? false,
      important:  data.important ?? true,
      isPrivate:  mode === 'private',
      deadline:   data.deadline || new Date(Date.now() + 24 * 3600000).toISOString(),
      createdAt:  new Date().toISOString(),
    }
    // 即座に画面に追加
    setTasks(prev => [newTask, ...prev])

    // Supabaseに保存
    const { data: inserted, error } = await supabase
      .from('tasks')
      .insert({
        title:      newTask.title,
        detail:     newTask.detail,
        category:   newTask.category,
        department: newTask.department,
        urgent:     newTask.urgent,
        important:  newTask.important,
        is_private: newTask.isPrivate,
        deadline:   newTask.deadline,
      })
      .select()
      .single()

    if (error) {
      console.error('保存エラー:', error.message)
      // 失敗したらロールバック
      setTasks(prev => prev.filter(t => t.id !== tempId))
      alert(`保存できませんでした: ${error.message}`)
      return
    }
    // tempIdを本物のIDに置き換え
    setTasks(prev => prev.map(t => t.id === tempId ? fromDb(inserted) : t))
  }

  async function handleMoveTask(id, urgent, important) {
    // 楽観的更新
    setTasks(prev => prev.map(t => t.id === id ? { ...t, urgent, important } : t))
    const { error } = await supabase.from('tasks').update({ urgent, important }).eq('id', id)
    if (error) {
      console.error('移動エラー:', error.message)
      // ロールバック（元の値に戻す）
      setTasks(prev => [...prev])
    }
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
        onAddTask={() => setCreateInitial({})}
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
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: '#f1f3f5', zIndex: 20 }}>
            <div style={{ textAlign: 'center', color: '#868e96' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>読み込み中…</div>
            </div>
          </div>
        )}
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
      <MicButton mode={mode} onClassified={handleClassified} />

      {/* タスク作成モーダル */}
      {createInitial !== null && (
        <TaskCreateModal
          initial={createInitial}
          onSave={handleCreateSave}
          onClose={() => setCreateInitial(null)}
        />
      )}

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
