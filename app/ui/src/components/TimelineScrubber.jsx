export default function TimelineScrubber({ index, currentTick, onSelectTick }) {
  if (!index?.ticks?.length) return null

  const latestTimestamp = index.ticks[index.ticks.length - 1].timestamp
  const activeTick = currentTick ?? latestTimestamp

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-1 overflow-x-auto shrink-0">
      {index.ticks.map((tick) => {
        const isActive = tick.timestamp === activeTick
        return (
          <button
            key={tick.timestamp}
            onClick={() => onSelectTick(tick.timestamp)}
            title={tick.summary}
            className={`shrink-0 px-3 py-1 rounded text-xs transition-colors ${
              isActive
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tick.label}
          </button>
        )
      })}
    </div>
  )
}
