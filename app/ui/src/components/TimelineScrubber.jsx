export default function TimelineScrubber({ index, currentTick, onSelectTick }) {
  if (!index?.ticks?.length) return null

  const activeTick = currentTick ?? index.ticks[index.ticks.length - 1].timestamp

  const shortLabel = (label) => {
    const m = label?.match(/(\d{1,2}:\d{2})/)
    return m ? m[1] : label
  }

  return (
    <div className="flex items-center px-8 relative" style={{ height: 48 }}>
      {/* Horizontal line */}
      <div
        className="absolute left-8 right-8"
        style={{ height: 1, background: '#2a2a4a', top: '50%', transform: 'translateY(-50%)' }}
      />

      {/* Dots */}
      <div className="relative w-full flex items-center justify-between">
        {index.ticks.map((tick) => {
          const isSelected = tick.timestamp === activeTick
          return (
            <div
              key={tick.timestamp}
              className="relative flex flex-col items-center cursor-pointer group"
              onClick={() => onSelectTick(tick.timestamp)}
              title={tick.summary || tick.label}
              style={{ padding: '8px 16px', margin: '-8px -16px' }}
            >
              <div
                className="rounded-full transition-all duration-150"
                style={{
                  width: isSelected ? 14 : 8,
                  height: isSelected ? 14 : 8,
                  background: isSelected ? '#22d3ee' : 'transparent',
                  border: `2px solid ${isSelected ? '#22d3ee' : '#64748b'}`,
                  boxShadow: isSelected ? '0 0 8px rgba(34,211,238,0.5)' : 'none',
                }}
              />
              {/* Time label below selected */}
              {isSelected && (
                <span
                  className="absolute font-mono whitespace-nowrap font-medium"
                  style={{
                    fontSize: 10,
                    top: 22,
                    color: '#22d3ee',
                    letterSpacing: '0.05em',
                    pointerEvents: 'none',
                  }}
                >
                  {shortLabel(tick.label)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
