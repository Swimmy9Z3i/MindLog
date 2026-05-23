import { useState, useRef, useEffect } from 'react'

function fallbackParse(text) {
  const urgentWords    = ['緊急', '急ぎ', '今すぐ', '至急', 'すぐ', '急いで', '早急']
  const importantWords = ['重要', '大事', '必ず', '絶対', '優先', '必須']
  const catMap = [
    { words: ['車両', '販売', '見積', '商談', '新車', '中古車', '納車'], code: 'VS', dept: 'OC' },
    { words: ['車検', '整備', 'オイル', 'タイヤ', '点検'],               code: 'SV', dept: 'MT' },
    { words: ['板金', '塗装', '事故', 'キズ', '凹み'],                   code: 'BP', dept: 'BP' },
    { words: ['コーティング', 'ディテール', '磨き'],                      code: 'DT', dept: 'DC' },
    { words: ['給油', 'ガソリン', 'スタンド', 'SS'],                      code: 'SS', dept: 'FS' },
    { words: ['レッカー', 'ロードサービス', 'パンク', '救援'],             code: 'RR', dept: 'MT' },
    { words: ['保険', '自賠責', '損保'],                                  code: 'IN', dept: 'OC' },
  ]
  const urgent    = urgentWords.some(w => text.includes(w))
  const important = importantWords.some(w => text.includes(w))
  let category = 'OTHER', department = 'OC'
  for (const m of catMap) {
    if (m.words.some(w => text.includes(w))) { category = m.code; department = m.dept; break }
  }
  return {
    title: text.slice(0, 25) + (text.length > 25 ? '…' : ''),
    detail: text, category, department, urgent, important,
    deadline: new Date(Date.now() + (urgent ? 2 : 24) * 3600000).toISOString(),
  }
}

export default function MicButton({ mode, onClassified }) {
  const [state, setState]       = useState('idle') // idle | listening | analyzing
  const [transcript, setTranscript] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const recognitionRef = useRef(null)
  const isBusiness = mode === 'business'
  const accent = isBusiness ? '#1971c2' : '#ad1457'

  useEffect(() => () => recognitionRef.current?.abort(), [])

  async function classifyWithAI(text) {
    setState('analyzing')
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      if (!res.ok) throw new Error()
      return await res.json()
    } catch {
      return fallbackParse(text)
    }
  }

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setErrorMsg('このブラウザは音声入力未対応です')
      setTimeout(() => setErrorMsg(''), 3000)
      return
    }
    const rec = new SR()
    rec.lang = 'ja-JP'
    rec.interimResults = true
    rec.continuous = false
    recognitionRef.current = rec
    let finalText = ''

    rec.onstart  = () => { setState('listening'); setTranscript('') }
    rec.onresult = (e) => {
      let interim = ''
      finalText = ''
      for (const r of e.results) {
        if (r.isFinal) finalText += r[0].transcript
        else interim += r[0].transcript
      }
      setTranscript(finalText || interim)
    }
    rec.onerror = (e) => {
      setState('idle')
      if (e.error === 'no-speech') setErrorMsg('音声が聞き取れませんでした')
      else if (e.error === 'not-allowed') setErrorMsg('マイクの許可が必要です')
      else setErrorMsg('エラー: ' + e.error)
      setTimeout(() => setErrorMsg(''), 3000)
    }
    rec.onend = async () => {
      if (!finalText.trim()) { setState('idle'); return }
      const result = await classifyWithAI(finalText)
      setState('idle')
      setTranscript('')
      onClassified && onClassified(result) // モーダルを開く
    }
    rec.start()
  }

  function handleClick() {
    if (state === 'idle') startRecording()
    else if (state === 'listening') recognitionRef.current?.stop()
  }

  const btnColor = state === 'listening' ? '#e03131' : state === 'analyzing' ? '#f59f00' : accent
  const btnIcon  = state === 'listening' ? '⏹' : state === 'analyzing' ? '🤖' : '🎙️'

  return (
    <>
      <div style={{ position: 'fixed', bottom: 28, right: 20, zIndex: 150 }}>
        {state === 'listening' && ['-18px', '-9px'].map((inset, i) => (
          <div key={i} style={{
            position: 'absolute', inset, borderRadius: '50%',
            border: '3px solid #e03131',
            animation: `pulse-ring 1.1s ease-out infinite ${i * 0.5}s`,
            pointerEvents: 'none',
          }} />
        ))}
        {state === 'idle' && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: `${accent}22`, animation: 'pulse-ring 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}
        <button onClick={handleClick} disabled={state === 'analyzing'} style={{
          width: 64, height: 64, borderRadius: '50%', border: 'none',
          background: btnColor, color: '#fff', fontSize: 28,
          cursor: state === 'analyzing' ? 'default' : 'pointer',
          boxShadow: `0 6px 20px ${btnColor}66`,
          animation: state === 'listening' ? 'mic-active 1.2s ease-in-out infinite' : 'none',
          transition: 'background 0.25s',
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {btnIcon}
        </button>
      </div>

      {/* ライブ字幕 */}
      {(state === 'listening' || state === 'analyzing') && (
        <div style={{
          position: 'fixed', bottom: 104, left: 16, right: 90,
          background: '#1a1a1a', color: '#fff',
          fontSize: 13, fontWeight: 600, borderRadius: 14,
          padding: '12px 16px', zIndex: 150,
          boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 6,
            color: state === 'listening' ? '#e03131' : '#f59f00' }}>
            {state === 'listening' ? '● 録音中 — タップで停止' : '🤖 AIが分類中…'}
          </div>
          <div style={{ color: transcript ? '#fff' : 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
            {transcript || '話しかけてください…'}
          </div>
        </div>
      )}

      {/* エラー */}
      {errorMsg && (
        <div style={{
          position: 'fixed', bottom: 104, right: 16,
          background: '#e03131', color: '#fff',
          fontSize: 12, fontWeight: 700, borderRadius: 999,
          padding: '8px 18px', zIndex: 150,
        }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </>
  )
}
