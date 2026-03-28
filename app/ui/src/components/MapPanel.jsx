import { useEffect, useState, useRef } from 'react'

function MapPin({ x, y, label, locationName, selected, isManual, onSelect, svgRatio = 1, inCluster = false }) {
  const [hovered, setHovered] = useState(false)
  const r = selected ? 2.2 : isManual ? 1.8 : 1.5
  const rx = r / svgRatio

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={e => { e.stopPropagation(); onSelect() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Hit area — generous for easy clicking */}
      <rect x={-5 / svgRatio} y={-5} width={10 / svgRatio} height={10} fill="transparent" />

      {/* Pin — ellipse to compensate for non-uniform SVG scaling */}
      <ellipse
        cx={0} cy={0}
        rx={rx} ry={r}
        fill={selected ? '#22d3ee' : isManual ? '#f97316' : (hovered ? '#cbd5e1' : '#8b8da8')}
        stroke={selected ? '#22d3ee' : isManual ? '#f97316' : 'none'}
        strokeWidth={selected ? 0.3 / svgRatio : isManual ? 0.2 / svgRatio : 0}
        style={{
          filter: selected
            ? 'drop-shadow(0 0 4px rgba(34,211,238,0.7))'
            : isManual
              ? 'drop-shadow(0 0 3px rgba(249,115,22,0.5))'
              : hovered
                ? 'drop-shadow(0 0 2px rgba(203,213,225,0.4))'
                : undefined,
          transition: 'all 0.2s ease',
        }}
      />

      {/* Pulse ring on selected */}
      {selected && (
        <>
          <ellipse cx={0} cy={0} rx={rx * 2} ry={r * 2} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth={0.15 / svgRatio} />
          <ellipse cx={0} cy={0} rx={rx * 1.5} ry={r * 1.5} fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth={0.1 / svgRatio}>
            <animate attributeName="rx" from={rx * 1.5} to={rx * 3} dur="2s" repeatCount="indefinite" />
            <animate attributeName="ry" from={r * 1.5} to={r * 3} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
          </ellipse>
        </>
      )}

      {/* Label — first name always for solo pins, hover/selected only for clusters */}
      {(selected || hovered || !inCluster) && (() => {
        const firstName = label.split(' ')[0]
        const displayName = (selected || hovered || isManual) ? label : firstName
        const charCount = displayName.length
        const showLocation = (selected || hovered) && locationName && !inCluster
        const locText = locationName?.length > 20 ? locationName.slice(0, 18) + '…' : locationName
        const locCount = locText?.length ?? 0
        const pillH = showLocation ? 3.4 : 2
        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={-Math.max(Math.max(charCount, locCount) * 0.32, 3) / svgRatio}
              y={-r - 3.2}
              width={Math.max(Math.max(charCount, locCount) * 0.65, 6) / svgRatio}
              height={pillH}
              rx={0.5}
              fill={selected || hovered || isManual ? 'rgba(12,11,26,0.96)' : 'rgba(12,11,26,0.72)'}
              stroke={selected ? 'rgba(34,211,238,0.4)' : isManual ? 'rgba(249,115,22,0.45)' : hovered ? 'rgba(148,163,184,0.25)' : 'rgba(100,116,139,0.15)'}
              strokeWidth={0.15}
            />
            <text
              x={0}
              y={-r - 1.7}
              fill={selected ? '#22d3ee' : isManual ? '#f97316' : hovered ? '#cbd5e1' : '#6b7a8d'}
              fontSize={selected || hovered || isManual ? 0.95 : 0.82}
              fontFamily="sans-serif"
              fontWeight={selected || isManual ? 'bold' : 'normal'}
              textAnchor="middle"
            >
              {displayName}
            </text>
            {showLocation && (
              <text
                x={0}
                y={-r - 0.25}
                fill={selected ? 'rgba(34,211,238,0.55)' : 'rgba(148,163,184,0.5)'}
                fontSize={0.72}
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {locText}
              </text>
            )}
          </g>
        )
      })()}
    </g>
  )
}

export default function MapPanel({ world, characters, selectedCharacter, onSelectCharacter, scene }) {
  const [svgRatio, setSvgRatio] = useState(1)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (height > 0) setSvgRatio(width / height)
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const charsByLocation = {}
  for (const char of characters) {
    const loc = char.current_location
    if (!charsByLocation[loc]) charsByLocation[loc] = []
    charsByLocation[loc].push(char)
  }

  // Time-of-day ambient color
  const hour = parseInt(world?.clock?.match(/(\d{1,2}):\d{2}/)?.[1] ?? '12')
  const isEvening = hour >= 18 || hour < 6
  const isMorning = hour >= 6 && hour < 12
  const ambientColor = isEvening
    ? 'rgba(20,30,60,0.15)' // cool blue evening
    : isMorning
      ? 'rgba(60,40,20,0.06)' // warm morning
      : 'rgba(40,35,20,0.04)' // subtle warm midday

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }}
      onClick={() => onSelectCharacter(null)}
    >
      {/* JPG map background */}
      <img
        src="/map.jpg"
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 38%',
          borderRadius: 'var(--radius-card)',
          opacity: 0.96,
        }}
      />

      {/* Vignette + time-of-day ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${ambientColor} 0%, rgba(22,21,43,0.12) 100%)`,
          borderRadius: 'var(--radius-card)',
          transition: 'background 0.5s ease',
        }}
      />

      {/* Bottom fade — obscures illustrated map label artifacts */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '28%',
          background: 'linear-gradient(to top, rgba(18,17,31,0.88) 0%, rgba(18,17,31,0.45) 45%, rgba(18,17,31,0.10) 75%, transparent 100%)',
          borderBottomLeftRadius: 'var(--radius-card)',
          borderBottomRightRadius: 'var(--radius-card)',
        }}
      />

      {/* Right-side fade — covers the diagonal AI label zone (STOCKHOLMEGADE etc.) */}
      <div
        className="absolute inset-y-0 right-0 pointer-events-none"
        style={{
          width: '38%',
          background: 'linear-gradient(to left, rgba(18,17,31,0.80) 0%, rgba(18,17,31,0.55) 25%, rgba(18,17,31,0.22) 58%, transparent 100%)',
          borderTopRightRadius: 'var(--radius-card)',
          borderBottomRightRadius: 'var(--radius-card)',
        }}
      />

      {/* Top fade — covers "1st Ave N" and top-edge AI label artifacts */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '22%',
          background: 'linear-gradient(to bottom, rgba(18,17,31,0.82) 0%, rgba(18,17,31,0.55) 30%, rgba(18,17,31,0.20) 65%, transparent 100%)',
          borderTopLeftRadius: 'var(--radius-card)',
          borderTopRightRadius: 'var(--radius-card)',
        }}
      />

      {/* Top-right vignette — covers railway Bance, STRUS YLLE, diagonal AI label artifacts */}
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          width: '72%',
          height: '55%',
          background: 'radial-gradient(ellipse at 100% 0%, rgba(18,17,31,0.96) 0%, rgba(18,17,31,0.82) 15%, rgba(18,17,31,0.58) 32%, rgba(18,17,31,0.28) 52%, rgba(18,17,31,0.08) 68%, transparent 82%)',
          borderTopRightRadius: 'var(--radius-card)',
        }}
      />

      {/* Bottom-right corner vignette — aggressively targets the map label artifacts */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: '42%',
          height: '70%',
          background: 'radial-gradient(ellipse at 100% 100%, rgba(18,17,31,0.99) 0%, rgba(18,17,31,0.95) 25%, rgba(18,17,31,0.75) 50%, rgba(18,17,31,0.35) 70%, transparent 88%)',
          borderBottomRightRadius: 'var(--radius-card)',
        }}
      />

      {/* Map overlay — world clock + active count (narrative framing, not a metric) */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        {(() => {
          const active = characters.filter(c => {
            const locName = world?.locations?.find(l => l.id === c.current_location)?.name ?? ''
            return locName.toLowerCase() !== 'home'
          }).length
          const timeLabel = world?.clock?.match(/at (\d{1,2}:\d{2})/)?.[1] ?? ''
          const dayLabel = world?.clock?.match(/(\w+),/)?.[1] ?? ''
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

      {/* Zoom controls removed — not functional yet */}

      {/* Pins overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Activity glow rings — one per occupied location */}
        {world?.locations?.map(location => {
          const chars = charsByLocation[location.id] ?? []
          if (!chars.length) return null
          const hasManual = chars.some(c => c.type === 'manual')
          const glowR = hasManual ? 5.5 : 4.5
          const glowColor = hasManual ? 'rgba(249,115,22,0.12)' : 'rgba(34,211,238,0.07)'
          const ringColor = hasManual ? 'rgba(249,115,22,0.18)' : 'rgba(34,211,238,0.12)'
          return (
            <g key={`glow-${location.id}`} style={{ pointerEvents: 'none' }}>
              <ellipse
                cx={location.x} cy={location.y}
                rx={glowR / svgRatio} ry={glowR}
                fill={glowColor}
              />
              <ellipse
                cx={location.x} cy={location.y}
                rx={(glowR - 1.5) / svgRatio} ry={glowR - 1.5}
                fill="none"
                stroke={ringColor}
                strokeWidth={0.15 / svgRatio}
              />
            </g>
          )
        })}

        {world?.locations?.map(location => {
          const chars = charsByLocation[location.id] ?? []
          if (!chars.length) return null

          return chars.map((char, i) => {
            const cols = Math.ceil(Math.sqrt(chars.length))
            const gap = chars.length > 5 ? 2.2 : chars.length > 3 ? 2.5 : 3.0
            const col = i % cols
            const row = Math.floor(i / cols)
            const totalCols = Math.min(cols, chars.length)
            const offsetX = (col - (totalCols - 1) / 2) * gap
            const offsetY = row * gap * 0.8

            return (
              <MapPin
                key={char.id}
                x={location.x + offsetX}
                y={location.y + offsetY}
                label={char.name}
                locationName={location.name}
                selected={char.id === selectedCharacter}
                isManual={char.type === 'manual'}
                onSelect={() => onSelectCharacter(char.id === selectedCharacter ? null : char.id)}
                svgRatio={svgRatio}
                inCluster={chars.length > 1}
              />
            )
          })
        })}

        {/* Location name pill for clustered locations */}
        {world?.locations?.map(location => {
          const chars = charsByLocation[location.id] ?? []
          if (chars.length < 2) return null
          const name = location.name.length > 22 ? location.name.slice(0, 20) + '…' : location.name
          const charCount = name.length
          const pillW = Math.max(charCount * 0.55, 7) / svgRatio
          const pillX = -pillW / 2
          return (
            <g key={`loc-${location.id}`} style={{ pointerEvents: 'none' }}>
              <rect
                x={pillX}
                y={location.y - 6.8}
                width={pillW}
                height={1.85}
                rx={0.4}
                fill="rgba(12,11,26,0.78)"
                stroke="rgba(100,116,139,0.25)"
                strokeWidth={0.12}
              />
              <text
                x={location.x}
                y={location.y - 5.32}
                fill="rgba(148,163,184,0.7)"
                fontSize={0.82}
                fontFamily="sans-serif"
                fontWeight="normal"
                textAnchor="middle"
              >
                {name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
