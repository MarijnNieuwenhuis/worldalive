import { useState } from 'react'

export default function TimelineScrubber({ index, currentTick, onSelectTick }) {
  if (!index?.ticks?.length) return null

  const activeTick = currentTick ?? index.ticks[index.ticks.length - 1].timestamp
  const activeIdx = index.ticks.findIndex(t => t.timestamp === activeTick)

  const shortLabel = (label) => {
    const m = label?.match(/(\d{1,2}:\d{2})/)
    return m ? m[1] : label
  }

  return (
    <div className="flex items-stretch px-3 gap-1" style={{ height: 60 }}>
      {index.ticks.map((tick, i) => {
        const isSelected = tick.timestamp === activeTick
        const isPast = i < activeIdx
        const isFuture = i > activeIdx

        return (
          <TimelineSegment
            key={tick.timestamp}
            tick={tick}
            isSelected={isSelected}
            isPast={isPast}
            isFuture={isFuture}
            tickIndex={i}
            totalTicks={index.ticks.length}
            onClick={() => onSelectTick(tick.timestamp)}
            shortLabel={shortLabel}
          />
        )
      })}
    </div>
  )
}

function TimelineSegment({ tick, isSelected, isPast, isFuture, tickIndex, totalTicks, onClick, shortLabel }) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 400)
    onClick()
  }

  const dotColor = isSelected
    ? '#22d3ee'
    : isPast
      ? 'rgba(34,211,238,0.5)'
      : 'rgba(100,116,139,0.3)'

  const timeColor = isSelected
    ? '#22d3ee'
    : isPast
      ? 'rgba(34,211,238,0.7)'
      : hovered
        ? '#94a3b8'
        : '#64748b'

  return (
    <div
      className="flex-1 flex items-center gap-2.5 px-3 rounded-xl cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected
          ? 'rgba(34,211,238,0.07)'
          : hovered
            ? 'rgba(255,255,255,0.025)'
            : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(34,211,238,0.18)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent'}`,
        transform: clicked ? 'scale(0.96)' : 'scale(1)',
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
      }}
    >
      {/* Dot + time column */}
      <div className="flex flex-col items-center shrink-0 gap-1" style={{ width: 32 }}>
        {/* Dot */}
        <div
          className={clicked ? 'animate-tick-bounce' : ''}
          style={{
            width: isSelected ? 9 : 6,
            height: isSelected ? 9 : 6,
            borderRadius: '50%',
            background: dotColor,
            boxShadow: isSelected ? '0 0 10px rgba(34,211,238,0.6)' : 'none',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
        />
        {/* Time label — always visible */}
        <span
          className="font-mono font-bold leading-none"
          style={{
            fontSize: isSelected ? 11 : 10,
            color: timeColor,
            letterSpacing: '0.03em',
            transition: 'color 0.15s',
          }}
        >
          {shortLabel(tick.label)}
        </span>
      </div>

      {/* Tick summary — always visible, intensity varies by state */}
      {tick.summary && (
        <p
          className="text-[9px] leading-snug flex-1 min-w-0"
          style={{
            color: isSelected ? '#94a3b8' : hovered ? '#64748b' : '#4a5568',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.15s',
          }}
        >
          {tick.summary.length > 60 ? tick.summary.slice(0, 60) + '…' : tick.summary}
        </p>
      )}
    </div>
  )
}
