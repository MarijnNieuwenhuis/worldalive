import { useState, useRef, useEffect } from 'react'

const VISIBLE_TICKS = 12 // max visible before scrolling kicks in

export default function TimelineScrubber({ index, currentTick, onSelectTick }) {
  if (!index?.ticks?.length) return null

  const activeTick = currentTick ?? index.ticks[index.ticks.length - 1].timestamp
  const activeIdx = index.ticks.findIndex(t => t.timestamp === activeTick)
  const scrollRef = useRef(null)
  const activeRef = useRef(null)

  const needsScroll = index.ticks.length > VISIBLE_TICKS

  // Auto-scroll to keep active tick visible
  useEffect(() => {
    if (needsScroll && activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeIdx, needsScroll])

  const shortLabel = (label) => {
    const m = label?.match(/(\d{1,2}:\d{2})/)
    return m ? m[1] : label
  }

  // Group ticks by day for large timelines
  const dayGroups = []
  let currentDay = null
  index.ticks.forEach((tick, i) => {
    const dayMatch = tick.label?.match(/(\w+day),\s+(\w+ \d+)/) || tick.label?.match(/(\w+), (\w+ \d+, \d+)/)
    const dayLabel = dayMatch ? dayMatch[2] : null
    if (dayLabel !== currentDay) {
      currentDay = dayLabel
      dayGroups.push({ day: dayLabel, startIdx: i })
    }
  })

  if (!needsScroll) {
    // Simple layout — all ticks visible, same as before
    return (
      <div className="flex items-stretch px-3 gap-1" style={{ height: 60 }}>
        {index.ticks.map((tick, i) => (
          <TimelineSegment
            key={tick.timestamp}
            tick={tick}
            isSelected={tick.timestamp === activeTick}
            isPast={i < activeIdx}
            tickIndex={i}
            onClick={() => onSelectTick(tick.timestamp)}
            shortLabel={shortLabel}
            compact={false}
          />
        ))}
      </div>
    )
  }

  // Scrollable layout — horizontal scroll, compact segments
  return (
    <div style={{ position: 'relative', height: 60 }}>
      {/* Day group labels — float above the scrubber */}
      {dayGroups.length > 1 && (
        <div className="flex items-center gap-2 px-3 absolute top-0 left-0 right-0" style={{ height: 16, zIndex: 2, pointerEvents: 'none' }}>
          {dayGroups.map((g, i) => {
            const span = (dayGroups[i + 1]?.startIdx ?? index.ticks.length) - g.startIdx
            return (
              <span
                key={g.day}
                className="font-mono text-[8px] uppercase tracking-widest"
                style={{
                  color: '#4a4970',
                  flex: `${span} 0 0`,
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                }}
              >
                {g.day}
              </span>
            )
          })}
        </div>
      )}

      {/* Scrollable tick strip */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-0.5 px-2 overflow-x-auto"
        style={{
          height: 60,
          paddingTop: dayGroups.length > 1 ? 14 : 0,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        {index.ticks.map((tick, i) => (
          <div
            key={tick.timestamp}
            ref={tick.timestamp === activeTick ? activeRef : null}
          >
            <TimelineSegment
              tick={tick}
              isSelected={tick.timestamp === activeTick}
              isPast={i < activeIdx}
              tickIndex={i}
              onClick={() => onSelectTick(tick.timestamp)}
              shortLabel={shortLabel}
              compact={true}
            />
          </div>
        ))}
      </div>

      {/* Scroll fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30, background: 'linear-gradient(90deg, #1c1b38, transparent)', pointerEvents: 'none', borderRadius: '0 0 0 var(--radius-card)', zIndex: 1 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30, background: 'linear-gradient(270deg, #1c1b38, transparent)', pointerEvents: 'none', borderRadius: '0 0 var(--radius-card) 0', zIndex: 1 }} />
    </div>
  )
}

function TimelineSegment({ tick, isSelected, isPast, tickIndex, onClick, shortLabel, compact }) {
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
      className={`flex items-center gap-2 rounded-xl cursor-pointer ${compact ? 'px-2' : 'flex-1 px-3'}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: '100%',
        minWidth: compact ? 60 : 'auto',
        background: isSelected
          ? 'rgba(34,211,238,0.07)'
          : hovered
            ? 'rgba(255,255,255,0.025)'
            : 'transparent',
        border: `1px solid ${isSelected ? 'rgba(34,211,238,0.18)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent'}`,
        transform: clicked ? 'scale(0.96)' : 'scale(1)',
        transition: 'background 0.15s, border-color 0.15s, transform 0.1s',
        flexShrink: 0,
      }}
    >
      {/* Dot + time column */}
      <div className="flex flex-col items-center shrink-0 gap-1" style={{ width: compact ? 28 : 32 }}>
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

      {/* Tick summary — hidden in compact mode, visible otherwise */}
      {!compact && tick.summary && (
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
          {tick.summary.length > 60 ? tick.summary.slice(0, 60) + '...' : tick.summary}
        </p>
      )}
    </div>
  )
}
