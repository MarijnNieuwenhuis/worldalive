import { useState } from 'react'

function CharacterPin({ char, loc, isHovered, onHover, onClick, arrived }) {
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
      }}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {/* Tooltip — shown on hover */}
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

      {/* Name chip */}
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

      {/* Glowing dot + pulse ring */}
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

  if (!mapConfig) {
    return (
      <div className="absolute inset-0" style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }} />
    )
  }

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

      {/* ── Layer 2: SVG — roads + ambient particles + tick trails ── */}
      <svg
        viewBox="0 0 1000 671"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {mapConfig.roads.map(road => (
            <path key={road.id} id={`road-${road.id}`} d={road.d} />
          ))}
        </defs>

        {/* Road strokes — subtle dark lines */}
        {mapConfig.roads.map(road => (
          <use key={road.id} href={`#road-${road.id}`} fill="none" stroke="#1a1936" strokeWidth="4" />
        ))}

        {/* Ambient particles — 3 per road, staggered timing */}
        {mapConfig.roads.flatMap((road, ri) =>
          [0, 1, 2].map(pi => {
            const isOrange = pi === 0 && ri % 4 === 0
            const dur = `${4.5 + ri * 0.7 + pi * 1.3}s`
            const begin = `${-(pi * 1.8 + ri * 0.55)}s`
            return (
              <circle
                key={`${road.id}-p${pi}`}
                r={pi === 0 ? 2 : 1.5}
                fill={isOrange ? '#f97316' : '#22d3ee'}
                opacity={pi === 0 ? 0.5 : 0.3}
                style={{ filter: `blur(${pi === 0 ? 0 : 0.5}px)` }}
              >
                <animateMotion dur={dur} repeatCount="indefinite" begin={begin}>
                  <mpath href={`#road-${road.id}`} />
                </animateMotion>
              </circle>
            )
          })
        )}

        {/* Tick transition trails — added in Task 6 */}
      </svg>

      {/* ── Layer 3: Character pins ── */}
      {(() => {
        // Group characters by location to handle clustering
        const byLocation = {}
        characters.forEach(char => {
          const loc = world?.locations?.find(l => l.id === char.current_location)
          if (!loc) return
          if (!byLocation[char.current_location]) byLocation[char.current_location] = { loc, chars: [] }
          byLocation[char.current_location].chars.push(char)
        })

        return Object.values(byLocation).flatMap(({ loc, chars }) =>
          chars.map((char, idx) => {
            // Spread multiple chars at same location horizontally
            const clusterOffset = chars.length > 1 ? (idx - (chars.length - 1) / 2) * 14 : 0
            const adjustedLoc = { ...loc, x: loc.x + (clusterOffset / 600) * 100 }

            return (
              <CharacterPin
                key={char.id}
                char={char}
                loc={adjustedLoc}
                isHovered={hoveredPin === char.id}
                onHover={(e) => e ? setHoveredPin(char.id) : setHoveredPin(null)}
                onClick={() => onSelectCharacter(char.id)}
                arrived={false}
              />
            )
          })
        )
      })()}

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
