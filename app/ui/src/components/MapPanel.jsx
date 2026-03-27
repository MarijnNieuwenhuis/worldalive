import { useEffect, useState } from 'react'

export default function MapPanel({ world, characters, selectedCharacter, onSelectCharacter }) {
  const [mapSVG, setMapSVG] = useState(null)

  useEffect(() => {
    fetch('/dist/assets/map.svg')
      .then(r => r.text())
      .then(setMapSVG)
      .catch(() => setMapSVG(null))
  }, [])

  const charsByLocation = {}
  for (const char of characters) {
    const loc = char.current_location
    if (!charsByLocation[loc]) charsByLocation[loc] = []
    charsByLocation[loc].push(char)
  }

  const healthPinColor = (status) => ({
    healthy: '#a78bfa',
    injured: '#fbbf24',
    hospitalized: '#f87171',
    deceased: '#6b7280',
    absent: '#6b7280',
  }[status] ?? '#a78bfa')

  return (
    <div className="flex-1 bg-gray-900 relative overflow-hidden">
      {mapSVG ? (
        <div
          className="absolute inset-0 w-full h-full"
          dangerouslySetInnerHTML={{ __html: mapSVG }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-sm">
          Map not found
        </div>
      )}

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {world?.locations?.map(location => {
          const chars = charsByLocation[location.id] ?? []
          if (!chars.length) return null

          return chars.map((char, i) => {
            const offsetX = (i - (chars.length - 1) / 2) * 4
            const isSelected = char.id === selectedCharacter

            return (
              <g
                key={char.id}
                transform={`translate(${location.x + offsetX}, ${location.y})`}
                onClick={() => onSelectCharacter(char.id === selectedCharacter ? null : char.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  r={isSelected ? 3 : 2.5}
                  fill={healthPinColor(char.health_status)}
                  stroke={isSelected ? '#fff' : 'transparent'}
                  strokeWidth="0.5"
                  opacity={0.9}
                />
                {isSelected && (
                  <text
                    y={-4}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="2.5"
                    fontFamily="sans-serif"
                  >
                    {char.name.split(' ')[0]}
                  </text>
                )}
              </g>
            )
          })
        })}
      </svg>
    </div>
  )
}
