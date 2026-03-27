export default function CharacterPanel({ characters, world, selectedCharacter, onSelectCharacter }) {
  const selected = characters.find(c => c.id === selectedCharacter)

  const locationName = (locationId) =>
    world?.locations?.find(l => l.id === locationId)?.name ?? locationId

  const healthColor = (status) => ({
    healthy: 'text-green-400',
    injured: 'text-yellow-400',
    hospitalized: 'text-red-400',
    deceased: 'text-gray-500',
    absent: 'text-gray-500',
  }[status] ?? 'text-gray-400')

  if (selected) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-800 flex items-center gap-2">
          <button
            onClick={() => onSelectCharacter(null)}
            className="text-gray-500 hover:text-gray-300 text-xs"
          >
            ← All
          </button>
          <span className="text-sm font-semibold text-gray-100">{selected.name}</span>
        </div>
        <div className="p-4 space-y-4 text-xs text-gray-300">
          <div>
            <span className="text-gray-500 uppercase tracking-wide text-[10px]">Location</span>
            <p className="mt-1">{locationName(selected.current_location)}</p>
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wide text-[10px]">Status</span>
            <p className={`mt-1 ${healthColor(selected.health_status)}`}>{selected.health_status}</p>
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wide text-[10px]">About</span>
            <p className="mt-1 leading-relaxed">{selected.soul_summary}</p>
          </div>
          {selected.diary_entry && (
            <div>
              <span className="text-gray-500 uppercase tracking-wide text-[10px]">Diary</span>
              <p className="mt-1 leading-relaxed italic text-gray-400">{selected.diary_entry}</p>
            </div>
          )}
          {selected.relationships?.length > 0 && (
            <div>
              <span className="text-gray-500 uppercase tracking-wide text-[10px]">Relationships</span>
              <ul className="mt-1 space-y-1">
                {selected.relationships.map(r => (
                  <li key={r.character_id} className="flex gap-2">
                    <span
                      className="text-purple-400 cursor-pointer hover:underline"
                      onClick={() => onSelectCharacter(r.character_id)}
                    >
                      {r.name}
                    </span>
                    <span className="text-gray-500">— {r.dynamic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 border-b border-gray-800 text-[10px] text-gray-500 uppercase tracking-wide">
        Characters
      </div>
      {characters.map(char => (
        <div
          key={char.id}
          onClick={() => onSelectCharacter(char.id)}
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-800/50 hover:bg-gray-800/50 cursor-pointer"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-100 truncate">{char.name}</p>
            <p className="text-xs text-gray-500 truncate">{locationName(char.current_location)}</p>
          </div>
          <span className={`text-[10px] ${healthColor(char.health_status)}`}>
            {char.health_status !== 'healthy' ? char.health_status : ''}
          </span>
        </div>
      ))}
    </div>
  )
}
