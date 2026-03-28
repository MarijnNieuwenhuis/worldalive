import { useState } from 'react'

export default function CharacterPanel({ characters, world, selectedCharacter, onSelectCharacter }) {
  const [activeTab, setActiveTab] = useState('brief')
  const selected = characters.find(c => c.id === selectedCharacter)

  const locationName = (locationId) =>
    world?.locations?.find(l => l.id === locationId)?.name ?? locationId

  // No character selected — show quick-glance roster
  if (!selected) {
    const manual = characters.filter(c => c.type === 'manual')
    const generated = characters.filter(c => c.type !== 'manual')
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="font-bold text-xs uppercase tracking-widest mb-4" style={{ color: '#f1f5f9', letterSpacing: '0.12em' }}>
          CHARACTER SPOTLIGHT
        </h3>
        <p className="text-[11px] mb-4" style={{ color: '#64748b' }}>
          Click a character on the map or roster to see their details.
        </p>

        {/* Protagonist highlight */}
        {manual.map(char => (
          <div
            key={char.id}
            onClick={() => onSelectCharacter(char.id)}
            className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all mb-3"
            style={{
              background: 'rgba(249,115,22,0.06)',
              border: '1px solid rgba(249,115,22,0.25)',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'}
          >
            <div
              className="shrink-0 flex items-center justify-center rounded-full font-bold"
              style={{ width: 36, height: 36, background: 'rgba(249,115,22,0.15)', border: '1.5px solid rgba(249,115,22,0.4)', color: '#f97316', fontSize: 13 }}
            >
              {char.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: '#f1f5f9' }}>{char.name}</span>
                <span className="font-mono px-1.5 py-0.5 rounded" style={{ fontSize: 8, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>YOUR CHARACTER</span>
              </div>
              <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                {locationName(char.current_location)}
              </span>
            </div>
          </div>
        ))}

        {/* Generated characters list */}
        <span className="font-mono text-[10px] uppercase tracking-wider mb-2 block" style={{ color: '#64748b' }}>
          {generated.length} other characters
        </span>
        <div className="flex-1 overflow-y-auto card-scroll">
          {generated.map((char, idx) => (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className="flex items-center gap-2 px-2.5 py-2 rounded cursor-pointer transition-all"
              style={{ color: '#94a3b8', background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#f1f5f9' }}
              onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <span className="font-mono text-[10px] shrink-0" style={{ color: '#64748b', width: 20 }}>
                {char.name.split(' ').map(w => w[0]).join('')}
              </span>
              <span className="text-[11px] truncate">{char.name}</span>
              <span className="text-[10px] ml-auto shrink-0 truncate" style={{ color: '#64748b', maxWidth: 100 }}>
                {locationName(char.current_location)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const initials = selected.name.split(' ').map(w => w[0]).join('')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-xs uppercase tracking-widest" style={{ color: '#f1f5f9', letterSpacing: '0.12em' }}>
          CHARACTER SPOTLIGHT
        </h3>
        <button
          onClick={() => onSelectCharacter(null)}
          className="font-mono text-[10px] transition-colors"
          style={{ color: '#64748b', padding: '4px 8px', borderRadius: 6 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
        >
          CLOSE
        </button>
      </div>

      {/* Identity block */}
      <div className="flex items-center gap-3 mb-3">
        {/* Initials circle */}
        <div
          className="shrink-0 flex items-center justify-center rounded-full font-bold"
          style={{
            width: 44, height: 44,
            background: selected.type === 'manual' ? 'rgba(249,115,22,0.15)' : 'rgba(34,211,238,0.1)',
            border: `2px solid ${selected.type === 'manual' ? 'rgba(249,115,22,0.35)' : 'rgba(34,211,238,0.25)'}`,
            color: selected.type === 'manual' ? '#f97316' : '#22d3ee',
            fontSize: 15,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base truncate" style={{ color: '#f1f5f9' }}>
              {selected.name}
            </h4>
            {selected.type === 'manual' && (
              <span className="font-mono px-1.5 py-0.5 rounded shrink-0" style={{ fontSize: 8, background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>YOU</span>
            )}
          </div>
          {/* Location badge */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7.25 6 11 6 11s3.5-3.75 3.5-6.5C9.5 2.57 7.93 1 6 1z" stroke="#f97316" strokeWidth="1" fill="none" />
              <circle cx="6" cy="4.5" r="1" fill="#f97316" />
            </svg>
            <span className="font-mono text-[11px]" style={{ color: '#f97316' }}>
              {locationName(selected.current_location)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-0 mb-3 rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a4a' }}>
        {['brief', 'diary'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 font-mono text-[11px] uppercase tracking-wider py-2 transition-all font-medium"
            style={{
              background: activeTab === tab ? 'rgba(249,115,22,0.15)' : 'transparent',
              color: activeTab === tab ? '#f97316' : '#64748b',
              borderRight: tab === 'brief' ? '1px solid #2a2a4a' : 'none',
            }}
            onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.background = 'transparent' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto card-scroll space-y-3">
        {activeTab === 'brief' ? (
          <>
            {/* Soul summary — truncated to keep spotlight scannable */}
            {selected.soul_summary && (
              <div className="pb-3" style={{ borderBottom: '1px solid #2a2a4a' }}>
                <span className="font-mono text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#94a3b8' }}>
                  About
                </span>
                <p className="text-[11px] leading-[1.6]" style={{ color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selected.soul_summary}
                </p>
              </div>
            )}

            {/* Personality — also truncated */}
            {selected.personality_summary && (
              <div className="pb-3" style={{ borderBottom: '1px solid #2a2a4a' }}>
                <span className="font-mono text-[10px] uppercase tracking-wider font-medium block mb-1.5" style={{ color: '#94a3b8' }}>
                  Personality
                </span>
                <p className="text-[11px] leading-[1.6]" style={{ color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selected.personality_summary}
                </p>
              </div>
            )}

            {/* Relationships — only show navigable ones (characters in the loaded world) */}
            {selected.relationships?.length > 0 && (() => {
              const charIds = new Set(characters.map(c => c.id))
              const navigable = selected.relationships.filter(r => charIds.has(r.character_id))
              const external = selected.relationships.filter(r => !charIds.has(r.character_id))
              if (!navigable.length && !external.length) return null
              return (
              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-medium block mb-2" style={{ color: '#94a3b8' }}>
                  Relationships
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {navigable.map(r => (
                    <button
                      key={r.character_id}
                      onClick={() => onSelectCharacter(r.character_id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all text-[10px] cursor-pointer"
                      style={{
                        background: '#222240',
                        border: '1px solid #2a2a4a',
                        color: '#94a3b8',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#94a3b8' }}
                      title={r.dynamic}
                    >
                      <span style={{ color: '#22d3ee', fontSize: 8 }}>●</span>
                      {r.name}
                    </button>
                  ))}
                  {external.map(r => (
                    <span
                      key={r.character_id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]"
                      style={{ color: '#64748b' }}
                      title={r.dynamic}
                    >
                      <span style={{ fontSize: 8 }}>○</span>
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
              )
            })()}
          </>
        ) : (
          /* Diary tab */
          <div>
            {selected.diary_entry ? (
              <div style={{ borderLeft: '3px solid rgba(249,115,22,0.3)', paddingLeft: 14 }}>
                <p className="text-[11px] leading-[1.7] italic" style={{ color: '#94a3b8' }}>
                  {selected.diary_entry}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <span className="text-[11px]" style={{ color: '#64748b' }}>
                  No diary entry for this tick
                </span>
                <span className="text-[10px] font-mono" style={{ color: '#2a2a4a' }}>
                  {selected.type === 'manual' ? 'Diary updates after world-clock advances' : 'Only manual characters have diary entries'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
