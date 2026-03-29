import { useState, useEffect, useRef } from 'react'

const MOVE_SPEED = 35 // map units per second (0-100 coordinate space)
const MAX_MOVE_DURATION = 2.8 // seconds — clamp so all arrive before phase ends

function TrailPath({ char, oldLoc, newLoc, duration }) {
  const isManual = char.type === 'manual'
  const color = isManual ? '#f97316' : '#22d3ee'
  const strokeW = isManual ? 2.5 : 2

  const ox = oldLoc.x * 10
  const oy = oldLoc.y * 6.71
  const nx = newLoc.x * 10
  const ny = newLoc.y * 6.71

  // Straight line from old to new
  const d = `M ${ox.toFixed(1)},${oy.toFixed(1)} L ${nx.toFixed(1)},${ny.toFixed(1)}`

  const pathLen = Math.round(Math.sqrt((nx - ox) ** 2 + (ny - oy) ** 2))
  if (pathLen < 5) return null

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeW}
      strokeLinecap="round"
      strokeDasharray={pathLen}
      strokeDashoffset={pathLen}
      style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
    >
      <animate
        attributeName="stroke-dashoffset"
        from={pathLen}
        to={0}
        dur={`${duration}s`}
        begin="0s"
        fill="freeze"
        calcMode="spline"
        keySplines="0.1 0 0.9 1"
        keyTimes="0;1"
      />
      <animate
        attributeName="opacity"
        from={1}
        to={0}
        dur="0.5s"
        begin={`${duration}s`}
        fill="freeze"
      />
    </path>
  )
}

function CharacterPin({ char, loc, isHovered, onHover, onClick, arrived, transitionDuration }) {
  const isManual = char.type === 'manual'
  const color = isManual ? '#f97316' : '#22d3ee'
  const dotSize = isManual ? 10 : 8
  const firstName = char.name.split(' ')[0].toUpperCase()

  return (
    <div
      style={{
        position: 'absolute',
        left: `${loc.x}%`,
        top: `${loc.y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        cursor: 'pointer',
        zIndex: isManual ? 10 : 5,
        transition: transitionDuration > 0
          ? `left ${transitionDuration}s linear, top ${transitionDuration}s linear`
          : 'none',
      }}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {isHovered && (
        <div
          className="animate-fade-in-up"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(18,17,42,0.95)',
            border: '1px solid #262545',
            borderRadius: 10,
            padding: '6px 10px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', fontFamily: 'system-ui' }}>
            {char.name}
          </div>
          <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
            {loc.name}
          </div>
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #262545',
          }} />
        </div>
      )}

      <div style={{
        fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
        padding: '2px 6px', borderRadius: 5,
        background: isManual ? 'rgba(249,115,22,0.15)' : 'rgba(34,211,238,0.08)',
        border: `1px solid ${isManual ? 'rgba(249,115,22,0.35)' : 'rgba(34,211,238,0.2)'}`,
        color,
        whiteSpace: 'nowrap', letterSpacing: '0.05em',
        pointerEvents: 'none',
      }}>
        {firstName}
      </div>

      <div style={{ position: 'relative', width: dotSize, height: dotSize, flexShrink: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          animation: 'pin-pulse 2.5s ease-out infinite',
          opacity: 0.6,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: color,
          boxShadow: isManual
            ? '0 0 10px rgba(249,115,22,0.7), 0 0 20px rgba(249,115,22,0.3)'
            : '0 0 8px rgba(34,211,238,0.6)',
          animation: arrived
            ? 'pin-arrive 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both'
            : 'glow-pulse 3s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}

export default function MapPanel({ world, characters, mapConfig, transitionPhase, prevCharacters, onSelectCharacter }) {
  const [hoveredPin, setHoveredPin] = useState(null)
  // Explicit position overrides: when set, pins render at old positions.
  // When cleared (null), pins snap to current character locations → CSS transition fires.
  const [positionOverrides, setPositionOverrides] = useState(null)
  const prevCharsRef = useRef(null) // track character changes

  if (!mapConfig) {
    return (
      <div className="absolute inset-0" style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }} />
    )
  }

  // Build set of character IDs that moved this tick
  const movedIds = new Set(
    (prevCharacters ?? [])
      .filter(pc => {
        const cc = characters.find(c => c.id === pc.id)
        return cc && pc.current_location !== cc.current_location
      })
      .map(pc => pc.id)
  )

  // Compute movement data for each moved character
  const moveData = {}
  movedIds.forEach(id => {
    const prevChar = (prevCharacters ?? []).find(pc => pc.id === id)
    const currChar = characters.find(c => c.id === id)
    if (!prevChar || !currChar) return
    const oldLoc = world?.locations?.find(l => l.id === prevChar.current_location)
    const newLoc = world?.locations?.find(l => l.id === currChar.current_location)
    if (!oldLoc || !newLoc) return
    const dist = Math.sqrt((newLoc.x - oldLoc.x) ** 2 + (newLoc.y - oldLoc.y) ** 2)
    const duration = Math.min(MAX_MOVE_DURATION, dist / MOVE_SPEED)
    moveData[id] = { oldLoc, newLoc, dist, duration }
  })

  // Two-frame animation trigger: set pins to old positions, then clear after 2 frames
  // so CSS transition fires as pins slide to new positions.
  const animTriggeredRef = useRef(false)

  useEffect(() => {
    if (transitionPhase === 'idle') {
      setPositionOverrides(null)
      animTriggeredRef.current = false
      return
    }

    if (transitionPhase !== 'moving' || movedIds.size === 0 || animTriggeredRef.current) return
    animTriggeredRef.current = true

    // Set pins to old positions first
    const oldPos = {}
    Object.entries(moveData).forEach(([id, data]) => {
      oldPos[id] = { x: data.oldLoc.x, y: data.oldLoc.y, name: data.oldLoc.name }
    })
    setPositionOverrides(oldPos)

    // After 2 frames, clear overrides → pins slide to new positions via CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setPositionOverrides(null)
      })
    })
  }, [transitionPhase, characters])

  return (
    <div className="absolute inset-0" style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }}>

      {/* ── Layer 1: Map image ── */}
      <img
        src={mapConfig.image}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
          borderRadius: 'var(--radius-card)',
          opacity: 0.96,
        }}
      />

      {/* ── Layer 2: SVG — tick transition trails ── */}
      <svg
        viewBox="0 0 1000 671"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {transitionPhase !== 'idle' && !positionOverrides && Object.entries(moveData).map(([id, data]) => {
          const char = (prevCharacters ?? []).find(pc => pc.id === id) ?? characters.find(c => c.id === id)
          if (!char) return null
          return (
            <TrailPath
              key={`trail-${id}`}
              char={char}
              oldLoc={data.oldLoc}
              newLoc={data.newLoc}
              duration={data.duration}
            />
          )
        })}
      </svg>

      {/* ── Layer 3: Character pins ── */}
      {characters.map(char => {
        const loc = world?.locations?.find(l => l.id === char.current_location)
        if (!loc) return null

        const sameLocation = characters.filter(c => c.current_location === char.current_location)
        const idx = sameLocation.indexOf(char)
        const clusterOffset = sameLocation.length > 1 ? (idx - (sameLocation.length - 1) / 2) * 14 : 0
        const adjustedLoc = { ...loc, x: loc.x + (clusterOffset / 600) * 100 }

        const moved = movedIds.has(char.id)
        const duration = moveData[char.id]?.duration ?? 0

        // During the override frame, moved pins are at their old position
        const override = positionOverrides?.[char.id]
        const pinLoc = override ?? adjustedLoc

        // Transition is set when override is cleared (pins sliding to new position)
        const isSliding = transitionPhase === 'moving' && moved && !positionOverrides

        return (
          <CharacterPin
            key={char.id}
            char={char}
            loc={pinLoc}
            isHovered={hoveredPin === char.id}
            onHover={(val) => val ? setHoveredPin(char.id) : setHoveredPin(null)}
            onClick={() => onSelectCharacter(char.id)}
            arrived={transitionPhase === 'settling' && moved}
            transitionDuration={isSliding ? duration : 0}
          />
        )
      })}

      {/* Active count chip */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        {(() => {
          const active = characters.filter(c => {
            const locName = world?.locations?.find(l => l.id === c.current_location)?.name ?? ''
            return locName.toLowerCase() !== 'home'
          }).length
          return (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(18,17,31,0.72)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(38,37,69,0.5)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22d3ee', display: 'inline-block', boxShadow: '0 0 5px rgba(34,211,238,0.5)', flexShrink: 0 }} />
              <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>
                {active} <span style={{ color: '#4a4970' }}>out in Billings</span>
              </span>
            </div>
          )
        })()}
      </div>

    </div>
  )
}
