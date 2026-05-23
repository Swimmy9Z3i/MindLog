import { useState, useRef, useEffect } from 'react'

// ── 音声テキストをタスク情報に解析 ───────────────────────────
function parseSpeech(text) {
  const t = text.trim()

  // 緊急度判定
  const urgentWords = ['緊急', '急ぎ', '今すぐ', '至急', 'すぐ', '急いで', '早急', 'ASAP']
  const urgent = urgentWords.some(w => t.includes(w))

  // 重要度判定
  const importantWords = ['重要', '大事', '必ず', '絶対', '優先', '必須', '重大']
  const important = importantWords.some(w => t.includes(w))

  // カテゴリー自動判定
  const catMap = [
    { words: ['車両', '販売', '見積', '商談', '新車', '中古車', '納車'],          code: 'VS' },
    { words: ['車検', '整備', 'オイル', 'タイヤ', 'ブレーキ', 'バッテリー'],       code: 'SV' },
    { words: ['板金', '塗装', '修理', '事故', '凹み', 'キズ'],                   code: 'BP' },
    { words: ['コーティング', 'ディテール', '磨き', 'ガラスコート'],               code: 'DT' },
    { words: ['給油', 'ガソリン', 'スタンド', 'SS', '洗車'],                     code: 'SS' },
    { words: ['レッカー', 'ロードサービス', 'パンク', '救援', '搬送', 'カギ'],     code: 'RR' },
    { words: ['保険', '損保', '自賠責', '事故対応'],                              code: 'IN' },
  ]
  let category = 'OTHER'
  for (const m of catMap) {
    if (m.words.some(w => t.includes(w))) { category = m.code; break }
  }

  // タイトル：最初の30文字
  const title = t.length > 30 ? t.slice(0, 30) + '…' : t

  // 自動期限：緊急なら2時間後、それ以外は翌日
  const deadline = new Date(Date.now() + (urgent ? 2 : 24) * 3600000).toISOString()

  return { title, detail: t, category, urgent, important, deadline }
}

export default function MicButton({ mode, onVoiceInput }) {
  const [state, setState] = useState('idle') // idle | listening | processing | done
  const [transcript, setTranscript] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const recognitionRef = useRef(null)
  const isBusiness = mode === 'business'
  const accent = isBusiness ? '#1971c2' : '#ad1457'

  useEffect(() => () => recognitionRef.current?.abort(), [])

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
    rec.maxAlternatives = 1
    recognitionRef.current = rec

    rec.onstart = () => { setState('listening'); setTranscript('') }

    rec.onresult = (e) => {
      let interim = '', final = ''
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      setTranscript(final || interim)
    }

    rec.onerror = (e) => {
      setState('idle')
      if (e.error === 'no-speech') setErrorMsg('音声が聞き取れませんでした')
      else if (e.error === 'not-allowed') setErrorMsg('マイクの許可が必要です')
      else setErrorMsg('エラー: ' + e.error)
      setTimeout(() => setErrorMsg(''), 3000)
    }

    rec.onend = () => {
      const finalText = transcript
      if (finalText.trim()) {
        setState('processing')
        setTimeout(() => {
          const parsed = parseSpeech(finalText)
          onVoiceInput && onVoiceInput(parsed)
          setState('done')
          setTimeout(() => { setState('idle'); setTranscript('') }, 1500)
        }, 300)
      } else {
        setState('idle')
      }
    }

    rec.start()
  }

  function stopRecording() {
    recognitionRef.current?.stop()
  }

  function handleClick() {
    if (state === 'listening') stopRecording()
    else if (state === 'idle') startRecording()
  }

  const btnColor = state === 'listening' ? '#e03131' : state === 'done' ? '#2f9e44' : accent
  const btnIcon  = state === 'listening' ? '⏹' : state === 'processing' ? '⏳' : state === 'done' ? '✓' : '🎙️'

  return (
    <>
      <div style={{ position: 'fixed', bottom: 28, right: 20, zIndex: 100 }}>
        {/* 波紋 */}
        {state === 'listening' && (
          <>
            {['-18px', '-9px'].map((inset, i) => (
              <div key={i} style={{
                position: 'absolute', inset,
                borderRadius: '50%', border: '3px solid #e03131',
                animation: `pulse-ring 1.1s ease-out infinite ${i * 0.5}s`,
                pointerEvents: 'none',
              }} />
            ))}
          </>
        )}
        {state === 'idle' && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: `${accent}22`,
            animation: 'pulse-ring 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        <button
          onClick={handleClick}
          disabled={state === 'processing'}
          style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            background: btnColor, color: '#fff', fontSize: 28,
            cursor: state === 'processing' ? 'default' : 'pointer',
            boxShadow: `0 6px 20px ${btnColor}66`,
            animation: state === 'listening' ? 'mic-active 1.2s ease-in-out infinite' : 'none',
            transition: 'background 0.25s, transform 0.1s',
            transform: state === 'listening' ? 'scale(1.08)' : 'scale(1)',
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {btnIcon}
        </button>
      </div>

      {/* ライブ字幕トースト */}
      {(state === 'listening' || state === 'processing') && (
        <div style={{
          position: 'fixed', bottom: 104, left: 16, right: 90,
          background: '#1a1a1a', color: '#fff',
          fontSize: 13, fontWeight: 600, borderRadius: 14,
          padding: '10px 16px', zIndex: 100,
          boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
        }}>
          {state === 'listening' && (
            <div style={{ fontSize: 10, color: '#e03131', fontWeight: 700, marginBottom: 4 }}>
              ● 録音中 — タップで停止
            </div>
          )}
          {state === 'processing' && (
            <div style={{ fontSize: 10, color: '#fab005', fontWeight: 700, marginBottom: 4 }}>
              ⏳ 解析中…
            </div>
          )}
          <div style={{ color: transcript ? '#fff' : 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
            {transcript || '話しかけてください…'}
          </div>
        </div>
      )}

      {/* 完了トースト */}
      {state === 'done' && (
        <div style={{
          position: 'fixed', bottom: 104, right: 16,
          background: '#2f9e44', color: '#fff',
          fontSize: 12, fontWeight: 700, borderRadius: 999,
          padding: '8px 18px', zIndex: 100,
          boxShadow: '0 4px 14px rgba(47,158,68,0.4)',
        }}>
          ✓ タスクを追加しました
        </div>
      )}

      {/* エラートースト */}
      {errorMsg && (
        <div style={{
          position: 'fixed', bottom: 104, right: 16,
          background: '#e03131', color: '#fff',
          fontSize: 12, fontWeight: 700, borderRadius: 999,
          padding: '8px 18px', zIndex: 100,
          boxShadow: '0 4px 14px rgba(224,49,49,0.4)',
        }}>
          ⚠️ {errorMsg}
        </div>
      )}
    </>
  )
}
