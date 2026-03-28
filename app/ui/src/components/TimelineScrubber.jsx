import { useState } from 'react'

export default function TimelineScrubber({ index, currentTick, onSelectTick }) {
  if (!index?.ticks?.length) return null

  const activeTick = currentTick ?? index.ticks[index.ticks.length - 1].timestamp

  const shortLabel = (label) => {
    const m = label?.match(/(\d{1,2}:\d{2})/)
    return m ? m[1] : label
  }

  return (
    <div className="flex items-center px-6 relative" style={{ height: 56 }}>
      {/* Horizontal line */}
      <div
        className="absolute left-6 right-6"
        style={{ height: 2, background: 'rgba(42,42,74,0.6)', top: '50%', transform: 'translateY(-50%)', borderRadius: 1 }}
      />

      {/* Dots */}
      <div className="relative w-full flex items-center justify-between">
        {index.ticks.map((tick) => {
          const isSelected = tick.timestamp === activeTick
          const isPast = index.ticks.indexOf(tick) < index.ticks.findIndex(t => t.timestamp === activeTick)
          return (
            <TimelineDot
              key={tick.timestamp}
              tick={tick}
              isSelected={isSelected}
              isPast={isPast}
              onClick={() => onSelectTick(tick.timestamp)}
              shortLabel={shortLabel}
            />
          )
        })}
      </div>
    </div>
  )
}

function TimelineDot({ tick, isSelected, isPast, onClick, shortLabel }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex flex-col items-center cursor-pointer"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={tick.summary || tick.label}
      style={{ padding: '14px 24px', margin: '-14px -24px' }}
    >
      {/* The dot */}
      <div
        className="rounded-full transition-all duration-150"
        style={{
          width: isSelected ? 16 : hovered ? 14 : 10,
          height: isSelected ? 16 : hovered ? 14 : 10,
          background: isSelected ? '#22d3ee' : isPast ? 'rgba(34,211,238,0.35)' : (hovered ? 'rgba(148,163,184,0.5)' : 'rgba(100,116,139,0.3)'),
          border: `2px solid ${isSelected ? '#22d3ee' : isPast ? 'rgba(34,211,238,0.6)' : (hovered ? '#94a3b8' : 'rgba(100,116,139,0.5)')}`,
          boxShadow: isSelected ? '0 0 12px rgba(34,211,238,0.5)' : (hovered ? '0 0 6px rgba(148,163,184,0.2)' : 'none'),
        }}
      />
      {/* Time label — always show on selected, show on hover for others */}
      {(isSelected || hovered) && (
        <span
          className="absolute font-mono whitespace-nowrap font-bold"
          style={{
            fontSize: 11,
            top: 28,
            color: isSelected ? '#22d3ee' : '#94a3b8',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          {shortLabel(tick.label)}
        </span>
      )}
    </div>
  )
}
