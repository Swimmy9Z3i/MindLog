import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { QUADRANTS } from '../data/mockTasks'

// ── 乱数（シード固定） ────────────────────────────────────────
function rand(seed) {
  return Math.abs(Math.sin(seed * 127.1 + 311.7)) % 1
}

// ── タスクごとの泡サイズ・初期位置 ───────────────────────────
function getBubbleData(task) {
  const qi = Math.max(0, QUADRANTS.findIndex(q => q.urgent === task.urgent && q.important === task.important))
  const bx = qi % 2 === 0 ? -3.5 : 3.5
  const by = qi < 2 ? 2.5 : -2.0
  const s = task.id
  return {
    qi,
    position: [
      bx + (rand(s)     - 0.5) * 4.0,
      by + (rand(s + 1) - 0.5) * 2.5,
      (rand(s + 2) - 0.5) * 3.5,
    ],
    radius: [1.0, 0.80, 0.65, 0.48][qi],
  }
}

// ── 🫧 タスク泡 ──────────────────────────────────────────────
function Bubble({ task, accent, radius, initPos, onDelete, onTap }) {
  const meshRef  = useRef()
  const matRef   = useRef()
  const phase    = useRef(rand(task.id + 99) * Math.PI * 2)
  const popping  = useRef(false)
  const popProg  = useRef(0)
  const deleted  = useRef(false)
  const pressTimer  = useRef(null)
  const pressStart  = useRef(0)

  useFrame((state, delta) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    if (!popping.current) {
      // ゆらゆら浮遊
      meshRef.current.position.y = initPos[1] + Math.sin(t * 0.65 + phase.current) * 0.32
      meshRef.current.position.x = initPos[0] + Math.sin(t * 0.40 + phase.current * 1.3) * 0.14
      meshRef.current.rotation.y += delta * 0.18
    } else {
      popProg.current += delta * 5.0
      meshRef.current.scale.setScalar(1 + popProg.current * 2.2)
      if (matRef.current) matRef.current.opacity = Math.max(0, 0.55 - popProg.current * 1.1)
      if (popProg.current > 0.55 && !deleted.current) {
        deleted.current = true
        onDelete(task.id)
      }
    }
  })

  function onPointerDown(e) {
    e.stopPropagation()
    pressStart.current = Date.now()
    pressTimer.current = setTimeout(() => {
      navigator.vibrate && navigator.vibrate([30, 20, 80])
      popping.current = true
    }, 600)
  }
  function onPointerUp(e) {
    e.stopPropagation()
    const held = Date.now() - pressStart.current
    clearTimeout(pressTimer.current)
    if (!popping.current && held < 350) onTap(task)
  }
  function onPointerLeave() { clearTimeout(pressTimer.current) }

  const isOverdue = new Date(task.deadline) < new Date()

  return (
    <mesh
      ref={meshRef}
      position={[...initPos]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        ref={matRef}
        color={accent}
        transparent
        opacity={0.75}
        roughness={0.15}
        metalness={0.3}
        side={THREE.DoubleSide}
        emissive={accent}
        emissiveIntensity={isOverdue ? 0.5 : 0.25}
      />
      <Html center distanceFactor={8}>
        <div style={{
          pointerEvents: 'none',
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 1px 6px rgba(0,0,0,0.8)',
          fontFamily: 'Noto Sans JP, sans-serif',
          width: 80,
          lineHeight: 1.35,
        }}>
          <div style={{ fontSize: 9, opacity: 0.75, marginBottom: 2 }}>{task.category}</div>
          <div style={{ fontSize: 12, fontWeight: 900 }}>
            {task.title.length > 6 ? task.title.slice(0, 6) + '…' : task.title}
          </div>
          {isOverdue && <div style={{ fontSize: 9, color: '#ffaaaa', marginTop: 2 }}>⚠️ 期限切れ</div>}
        </div>
      </Html>
    </mesh>
  )
}

// ── 🐠 ニモ（クマノミ） ──────────────────────────────────────
function Nemo({ target }) {
  const groupRef = useRef()
  const phase    = useRef(Math.random() * Math.PI * 2)
  const pos      = useRef([-6, 1.5, 2])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const [tx, ty] = target

    const dx = tx - pos.current[0]
    const dy = ty - pos.current[1]
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001

    pos.current[0] += (dx / dist) * 0.7 * delta + Math.sin(t * 1.1 + phase.current) * 0.005
    pos.current[1] += (dy / dist) * 0.55 * delta + Math.sin(t * 0.8) * 0.004
    pos.current[2]  = Math.sin(t * 0.55 + phase.current) * 1.8

    pos.current[0] = Math.max(-9, Math.min(9, pos.current[0]))
    pos.current[1] = Math.max(-5, Math.min(5, pos.current[1]))

    groupRef.current.position.set(...pos.current)
    groupRef.current.rotation.y = dx >= 0 ? 0 : Math.PI
    groupRef.current.rotation.z = Math.sin(t * 4.5 + phase.current) * 0.13
  })

  return (
    <group ref={groupRef} position={[-6, 1.5, 2]}>
      {/* 胴体 */}
      <mesh scale={[1.45, 0.88, 0.88]}>
        <sphereGeometry args={[0.3, 20, 20]} />
        <meshStandardMaterial color="#ff6b2b" />
      </mesh>
      {/* 白い縞① */}
      <mesh position={[0.1, 0, 0]} scale={[0.18, 0.95, 0.95]}>
        <sphereGeometry args={[0.31, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* 白い縞② */}
      <mesh position={[-0.22, 0, 0]} scale={[0.12, 0.72, 0.72]}>
        <sphereGeometry args={[0.31, 16, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* しっぽ */}
      <mesh position={[-0.58, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.3, 4]} />
        <meshStandardMaterial color="#ff6b2b" />
      </mesh>
      {/* 目 */}
      <mesh position={[0.26, 0.14, 0.24]}>
        <sphereGeometry args={[0.065, 8, 8]} />
        <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  )
}

// ── 🐟 スイミー（暗い小魚の群れ） ───────────────────────────
function SwimmyFish({ index, target }) {
  const ref   = useRef()
  const phase = useRef(Math.random() * Math.PI * 2 + index * 0.9)
  const offset= useRef([(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 0.8])
  const pos   = useRef([Math.random() * 8 - 4, Math.random() * 4 - 2, Math.random() * 3 - 1.5])

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    const tx = (target[0] + 3) + offset.current[0]
    const ty = (target[1] - 0.5) + offset.current[1]

    const dx = tx - pos.current[0]
    const dy = ty - pos.current[1]
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001

    pos.current[0] += (dx / dist) * 1.0 * delta
    pos.current[1] += (dy / dist) * 0.9 * delta + Math.sin(t * 2.2 + phase.current) * 0.006
    pos.current[2]  = Math.sin(t * 1.0 + phase.current) * 2.2

    ref.current.position.set(...pos.current)
    ref.current.rotation.y = dx >= 0 ? 0 : Math.PI
    ref.current.rotation.z = Math.sin(t * 5.5 + phase.current) * 0.14
  })

  return (
    <group ref={ref} position={pos.current} scale={0.5}>
      <mesh scale={[1.3, 0.7, 0.7]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#1a1a3e" emissive="#2233aa" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.22, 3]} />
        <meshStandardMaterial color="#1a1a3e" />
      </mesh>
      <mesh position={[0.18, 0.1, 0.15]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}

// ── 🪸 海底装飾 ──────────────────────────────────────────────
function SeaFloor() {
  const decos = [
    [-7, -5.3, -1, '🪸', 2.2], [-4, -5.3, 2, '🌿', 1.8],
    [-1, -5.3, -2, '🪸', 2.4], [2, -5.3, 1, '🌿', 1.6],
    [5, -5.3, -1, '🪸', 2.0], [-6, -5.3, 3, '🌿', 1.5],
    [7, -5.3, 2, '🪸', 1.9],  [0, -5.3, 3, '🌿', 1.7],
  ]
  return (
    <>
      <mesh position={[0, -5.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#082010" roughness={1} />
      </mesh>
      {decos.map(([x, y, z, emoji, size], i) => (
        <Html key={i} position={[x, y, z]} center>
          <div style={{ fontSize: size * 18, pointerEvents: 'none', lineHeight: 1 }}>{emoji}</div>
        </Html>
      ))}
    </>
  )
}

// ── メインシーン ─────────────────────────────────────────────
export default function Scene3D({ tasks, onDelete, onTap }) {
  const bubbles = useMemo(
    () => tasks.map(t => ({ task: t, ...getBubbleData(t) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks.map(t => t.id).join(',')]
  )

  // 魚がターゲットにするのは「一番ヤバいタスク」
  const fishTarget = useMemo(() => {
    const overdue = tasks.find(t => new Date(t.deadline) < new Date())
    const target  = overdue ?? tasks.find(t => t.urgent && t.important) ?? tasks[0]
    if (!target) return [0, 0, 0]
    return getBubbleData(target).position
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks])

  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      dpr={[1, 1.5]}
      style={{
        background: 'linear-gradient(180deg, #001a33 0%, #00334d 30%, #004466 60%, #001a22 100%)',
      }}
    >
      <Suspense fallback={null}>
        {/* 水中ライティング */}
        <ambientLight intensity={0.55} color="#224466" />
        <directionalLight position={[0, 12, 5]} intensity={1.1} color="#88ccff" />
        <pointLight position={[-6, 4, 3]}  intensity={0.7} color="#00aaff" />
        <pointLight position={[6, -3, -4]} intensity={0.5} color="#00ffaa" />
        <pointLight position={[0, 8, 0]}   intensity={0.5} color="#aaddff" />

        {/* 水中フォグ */}
        <fog attach="fog" args={['#003355', 18, 42]} />

        {/* 海底・サンゴ */}
        <SeaFloor />

        {/* 4象限ラベル */}
        {QUADRANTS.map((q, i) => (
          <Html key={i} position={[i % 2 === 0 ? -5.8 : 5.8, i < 2 ? 4.6 : -4.6, 0]} center>
            <div style={{
              fontFamily: 'Noto Sans JP, sans-serif',
              color: q.accent,
              fontSize: 11,
              fontWeight: 800,
              background: `${q.accent}30`,
              border: `1.5px solid ${q.accent}66`,
              borderRadius: 999,
              padding: '4px 12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              textAlign: 'center',
              backdropFilter: 'blur(4px)',
            }}>
              {q.label}
              <div style={{ fontSize: 9, opacity: 0.7 }}>{q.sub}</div>
            </div>
          </Html>
        ))}

        {/* 象限区切り線 */}
        <Line points={[[-11, 0, 0], [11, 0, 0]]} color="#ffffff" opacity={0.07} transparent lineWidth={0.5} />
        <Line points={[[0, -6.5, 0], [0, 6.5, 0]]} color="#ffffff" opacity={0.07} transparent lineWidth={0.5} />

        {/* 🫧 タスク泡 */}
        {bubbles.map(({ task, qi, position, radius }) => (
          <Bubble
            key={task.id}
            task={task}
            accent={QUADRANTS[qi]?.accent ?? '#4488ff'}
            radius={radius}
            initPos={position}
            onDelete={onDelete}
            onTap={onTap}
          />
        ))}

        {/* 🐠 ニモ */}
        <Nemo target={fishTarget} />

        {/* 🐟 スイミーの群れ（6匹） */}
        {Array.from({ length: 6 }, (_, i) => (
          <SwimmyFish key={i} index={i} target={fishTarget} />
        ))}

        {/* カメラ操作 */}
        <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={30} />
      </Suspense>
    </Canvas>
  )
}
