import { useEffect, useState, useRef } from 'react'

function MapPin({ x, y, label, selected, onSelect, svgRatio = 1 }) {
  const [hovered, setHovered] = useState(false)
  const r = selected ? 1.2 : 0.8
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

      {/* Pin circle */}
      <circle
        cx={0} cy={0}
        r={rx}
        fill={selected ? '#22d3ee' : (hovered ? '#94a3b8' : '#64748b')}
        stroke={selected ? '#22d3ee' : 'none'}
        strokeWidth={selected ? 0.3 : 0}
        style={{
          filter: selected ? 'drop-shadow(0 0 3px rgba(34,211,238,0.6))' : undefined,
          transition: 'all 0.15s ease',
        }}
      />

      {/* Outer ring on selected */}
      {selected && (
        <circle
          cx={0} cy={0}
          r={rx * 2}
          fill="none"
          stroke="rgba(34,211,238,0.3)"
          strokeWidth={0.15}
        />
      )}

      {/* Label */}
      {(selected || hovered) && (
        <text
          x={rx + 0.8 / svgRatio}
          y={0.4}
          fill={selected ? '#22d3ee' : '#94a3b8'}
          fontSize={1.1}
          fontFamily="monospace"
          fontWeight={selected ? 'bold' : 'normal'}
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

export default function MapPanel({ world, characters, selectedCharacter, onSelectCharacter, scene }) {
  const [mapSVG, setMapSVG] = useState(null)
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

  useEffect(() => {
    fetch('/dist/assets/map.svg?v=' + Date.now())
      .then(r => r.text())
      .then(svg => {
        const cleaned = svg
          .replace(/\s+width="[^"]*"/, '')
          .replace(/\s+height="[^"]*"/, '')
          .replace('<svg ', '<svg preserveAspectRatio="none" ')
        setMapSVG(cleaned)
      })
      .catch(() => setMapSVG(null))
  }, [])

  const charsByLocation = {}
  for (const char of characters) {
    const loc = char.current_location
    if (!charsByLocation[loc]) charsByLocation[loc] = []
    charsByLocation[loc].push(char)
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }}
      onClick={() => onSelectCharacter(null)}
    >
      {/* SVG map background */}
      {mapSVG ? (
        <div
          className="absolute inset-0 w-full h-full [&>svg]:w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: mapSVG }}
          style={{ opacity: 0.85 }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs" style={{ color: '#2a2a4a' }}>
          MAP NOT FOUND
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, transparent 40%, rgba(22,21,43,0.4) 100%)',
          borderRadius: 'var(--radius-card)',
        }}
      />

      {/* Location badge — top-left */}
      <div
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg pointer-events-none"
        style={{ background: 'rgba(30,30,56,0.8)', border: '1px solid #2a2a4a', backdropFilter: 'blur(4px)' }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7.25 6 11 6 11s3.5-3.75 3.5-6.5C9.5 2.57 7.93 1 6 1z" stroke="#f97316" strokeWidth="1.2" fill="none" />
          <circle cx="6" cy="4.5" r="1" fill="#f97316" />
        </svg>
        <span className="font-mono text-[11px] font-medium" style={{ color: '#f1f5f9' }}>Billings, MT</span>
        <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>{characters.length} characters</span>
      </div>

      {/* Scene event summary — what's happening now */}
      {scene?.events?.length > 0 && (
        <div
          className="absolute top-14 left-4 z-10 flex items-start gap-2 px-3 py-1.5 rounded-lg pointer-events-none"
          style={{ background: 'rgba(30,30,56,0.7)', backdropFilter: 'blur(4px)', maxWidth: '45%', borderLeft: '2px solid rgba(249,115,22,0.5)' }}
        >
          <span className="text-[10px] leading-snug" style={{ color: '#94a3b8' }}>
            {scene.events[0].length > 80 ? scene.events[0].substring(0, 80) + '...' : scene.events[0]}
          </span>
        </div>
      )}

      {/* Zoom controls removed — not functional yet */}

      {/* Pins overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
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
                selected={char.id === selectedCharacter}
                onSelect={() => onSelectCharacter(char.id === selectedCharacter ? null : char.id)}
                svgRatio={svgRatio}
              />
            )
          })
        })}

        {/* Location cluster count badges — show when 3+ characters at one spot */}
        {world?.locations?.map(location => {
          const chars = charsByLocation[location.id] ?? []
          if (chars.length < 3) return null
          return (
            <g key={`count-${location.id}`} transform={`translate(${location.x}, ${location.y})`}>
              <circle cx={-2.5 / svgRatio} cy={-2.5} r={1.5 / svgRatio} fill="rgba(249,115,22,0.9)" />
              <text
                x={-2.5 / svgRatio} y={-2}
                fill="#fff"
                fontSize={1.2}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {chars.length}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
