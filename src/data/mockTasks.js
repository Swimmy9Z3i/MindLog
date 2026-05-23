// ── 象限定義 ─────────────────────────────────────────────────
export const QUADRANTS = [
  { id: 'Q1', urgent: true,  important: true,  label: '今すぐやる',   sub: '緊急 × 重要',    accent: '#e03131', bg: '#fff5f5', labelBg: '#ffe3e3' },
  { id: 'Q2', urgent: false, important: true,  label: '計画する',    sub: '重要 × 非緊急',  accent: '#1971c2', bg: '#e8f4fd', labelBg: '#d0ebff' },
  { id: 'Q3', urgent: true,  important: false, label: '委任する',    sub: '緊急 × 非重要',  accent: '#e67700', bg: '#fff9db', labelBg: '#ffec99' },
  { id: 'Q4', urgent: false, important: false, label: '後回し・削除', sub: '非緊急 × 非重要', accent: '#868e96', bg: '#f8f9fa', labelBg: '#e9ecef' },
]

// 象限IDを返すヘルパー
export function getQuadrantId(urgent, important) {
  if (urgent && important)   return 'Q1'
  if (!urgent && important)  return 'Q2'
  if (urgent && !important)  return 'Q3'
  return 'Q4'
}

// ── 事業カテゴリー ────────────────────────────────────────────
export const CATEGORIES = [
  { code: 'ALL',   label: 'All Todo',      icon: '📋' },
  { code: 'VS',    label: '車両販売',       icon: '🚗' },
  { code: 'SV',    label: '車検・整備',     icon: '🔧' },
  { code: 'BP',    label: '板金塗装',       icon: '🎨' },
  { code: 'DT',    label: 'コーティング',   icon: '✨' },
  { code: 'SS',    label: 'SS',            icon: '⛽' },
  { code: 'RR',    label: 'ロードサービス', icon: '🚨' },
  { code: 'IN',    label: '保険',          icon: '📄' },
  { code: 'OTHER', label: 'その他',        icon: '📌' },
]

// ── 部門 ──────────────────────────────────────────────────────
export const DEPARTMENTS = [
  { code: 'MT', label: '整備部門' },
  { code: 'BP', label: '鈑金塗装' },
  { code: 'DC', label: 'ディティール' },
  { code: 'FS', label: 'スタンド' },
  { code: 'OC', label: '事務' },
]

// ── グループ化オプション ───────────────────────────────────────
export const GROUP_OPTIONS = [
  { value: 'QUADRANT',  label: '4分類順' },
  { value: 'CATEGORY',  label: '事業カテゴリー別' },
  { value: 'DEPARTMENT',label: '部門別' },
]

// ── モックタスク ──────────────────────────────────────────────
export const mockTasks = [
  // Q1 緊急 × 重要
  {
    id: 1, title: '保険会社へ折り返し電話',
    detail: '山田様の車両事故件の損害額確認。担当：佐々木氏',
    category: 'BP', department: 'BP',
    urgent: true, important: true, isPrivate: false,
    deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 2, title: '車検満了のお客様に連絡',
    detail: '田中様、今月末車検切れ。受付予約を急ぎ確保する',
    category: 'SV', department: 'MT',
    urgent: true, important: true, isPrivate: false,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 3, title: 'レッカー車の手配',
    detail: '国道でパンク。お客様が現場で待機中。塩田くんに依頼',
    category: 'RR', department: 'MT',
    urgent: true, important: true, isPrivate: false,
    deadline: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },

  // Q2 重要 × 非緊急
  {
    id: 4, title: '新車見積書の作成',
    detail: '松元様、新型アルファードの見積を今週中に提出',
    category: 'VS', department: 'OC',
    urgent: false, important: true, isPrivate: false,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5, title: 'スタッフ面談の準備',
    detail: '来週の個人面談に向けて評価シート記入。3名分',
    category: 'OTHER', department: 'OC',
    urgent: false, important: true, isPrivate: true,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6, title: 'コーティング価格表の改訂',
    detail: '資材費値上がり分を反映。来月から適用予定',
    category: 'DT', department: 'DC',
    urgent: false, important: true, isPrivate: false,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },

  // Q3 緊急 × 非重要
  {
    id: 7, title: 'SSレジ締め確認',
    detail: '今日のレジ締め金額を河鰭さんに確認依頼',
    category: 'SS', department: 'FS',
    urgent: true, important: false, isPrivate: false,
    deadline: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 8, title: '宅配便の受け取り',
    detail: 'タイヤ4本が午後届く予定。倉庫に誘導する',
    category: 'SV', department: 'MT',
    urgent: true, important: false, isPrivate: false,
    deadline: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },

  // Q4 非緊急 × 非重要
  {
    id: 9, title: '待合室の雑誌入れ替え',
    detail: '古い雑誌を処分して新しいものに交換',
    category: 'OTHER', department: 'OC',
    urgent: false, important: false, isPrivate: false,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10, title: 'ゴルフコンペの日程調整',
    detail: '取引先との親睦ゴルフ、来月候補日を3日提案する',
    category: 'OTHER', department: 'OC',
    urgent: false, important: false, isPrivate: true,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
