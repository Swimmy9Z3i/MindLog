import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { transcript } = req.body
  if (!transcript?.trim()) return res.status(400).json({ error: 'transcript required' })

  const prompt = `あなたは自動車販売・整備会社のタスク管理AIです。
以下の音声テキストを分析し、タスク情報をJSONで返してください。

音声テキスト:「${transcript}」

以下のルールで分類してください:

【category（事業カテゴリー）】
- VS: 車両販売・見積・商談・納車・新車・中古車・リース
- SV: 車検・整備・オイル・タイヤ・点検・修理・バッテリー
- BP: 板金・塗装・事故・キズ・凹み・鈑金
- DT: コーティング・ディテール・磨き・ガラスコート・洗車仕上げ
- SS: ガソリン・給油・スタンド・洗車・SS
- RR: レッカー・ロードサービス・パンク・救援・搬送・カギ開け・ジャンプ
- IN: 保険・自賠責・損保・事故対応・保険請求
- OTHER: 上記以外（事務・会議・電話など）

【department（担当部門）】
- MT: 整備・車検・タイヤ・オイル関連
- BP: 板金・塗装・事故修理関連
- DC: コーティング・ディテール関連
- FS: ガソリンスタンド・給油関連
- OC: 事務・保険・販売・その他

【urgent（緊急）】
- true: 「今すぐ」「至急」「緊急」「急ぎ」「すぐに」「早急」「今日中」「ASAP」
- false: それ以外

【important（重要）】
- true: 「重要」「大事」「必ず」「絶対」「優先」「必須」「社長」「お客様」
- false: それ以外（デフォルトtrue）

【deadline_hours（期限時間）】
- 2: 緊急（urgent=true）
- 8: 今日中
- 24: 明日まで（デフォルト）
- 72: 今週中
- 168: 来週中

必ずJSONのみ返してください:
{
  "title": "タスクタイトル（25文字以内・簡潔に）",
  "detail": "詳細説明（音声の内容をそのまま自然な文章に）",
  "category": "カテゴリーコード",
  "department": "部門コード",
  "urgent": true or false,
  "important": true or false,
  "deadline_hours": 数値
}`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].text.trim()
    // JSONブロックが含まれる場合も対応
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text)

    const deadline = new Date(Date.now() + (parsed.deadline_hours || 24) * 3600000).toISOString()

    res.json({ ...parsed, deadline })
  } catch (e) {
    console.error('classify error:', e)
    res.status(500).json({ error: e.message })
  }
}
