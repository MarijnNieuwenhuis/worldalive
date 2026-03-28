import { useState } from 'react'

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

      {/* ── Layer 3: Character pins ── added in Task 4 */}

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
