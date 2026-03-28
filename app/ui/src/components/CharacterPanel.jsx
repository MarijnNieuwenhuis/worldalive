import { useState } from 'react'

export default function CharacterPanel({ characters, world, selectedCharacter, onSelectCharacter }) {
  const selected = characters.find(c => c.id === selectedCharacter)
  const manual = characters.filter(c => c.type === 'manual')
  const npcs = characters.filter(c => c.type !== 'manual')

  const locationName = (locationId) =>
    world?.locations?.find(l => l.id === locationId)?.name ?? locationId

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div style={{ width: 3, height: 14, background: '#22d3ee', borderRadius: 2 }} />
          <h3 className="font-bold text-xs uppercase tracking-widest" style={{ color: '#f1f5f9', letterSpacing: '0.1em' }}>
            Characters
          </h3>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee' }}>
            {characters.length}
          </span>
        </div>
        {selected && (
          <button
            onClick={() => onSelectCharacter(null)}
            className="text-[10px] font-mono px-2 py-1 rounded-md"
            style={{ color: '#64748b' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
          >
            ALL
          </button>
        )}
      </div>

      {/* Animated view swap — key causes remount + entrance animation on selection change */}
      <div key={selectedCharacter ?? '__list__'} className="flex-1 flex flex-col min-h-0 animate-panel-slide">
        {selected ? (
          <SelectedCharacterView
            char={selected}
            characters={characters}
            locationName={locationName}
            onSelectCharacter={onSelectCharacter}
          />
        ) : (
          <CharacterListView
            manual={manual}
            npcs={npcs}
            locationName={locationName}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={onSelectCharacter}
          />
        )}
      </div>
    </div>
  )
}

/* ── Character List View (no selection) ── */
function CharacterListView({ manual, npcs, locationName, selectedCharacter, onSelectCharacter }) {
  return (
    <div className="flex-1 overflow-y-auto card-scroll space-y-4 animate-fade-in-up">
      {/* YOUR CHARACTERS section */}
      {manual.length > 0 && (
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#f97316', letterSpacing: '0.12em' }}>
            Your Characters
          </span>
          {manual.map(char => (
            <div
              key={char.id}
              onClick={() => onSelectCharacter(char.id)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: 'rgba(249,115,22,0.05)',
                border: '1px solid rgba(249,115,22,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateX(2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.15)'; e.currentTarget.style.transform = 'translateX(0)' }}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-full font-bold"
                style={{ width: 38, height: 38, background: 'rgba(249,115,22,0.12)', border: '1.5px solid rgba(249,115,22,0.3)', color: '#f97316', fontSize: 13 }}
              >
                {char.name.split(' ').map(w => w[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>{char.name}</span>
                </div>
                <span className="text-[10px]" style={{ color: '#94a3b8' }}>
                  {locationName(char.current_location)}
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}>
                <path d="M6 4l4 4-4 4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}

          {/* Diary — hero content, show generously */}
          {manual[0]?.diary_entry && (
            <div
              className="mt-2 px-4 py-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(249,115,22,0.04) 0%, rgba(249,115,22,0.01) 100%)',
                borderLeft: '3px solid rgba(249,115,22,0.3)',
                border: '1px solid rgba(249,115,22,0.08)',
                borderLeftWidth: 3,
                borderLeftColor: 'rgba(249,115,22,0.3)',
              }}
              onClick={() => onSelectCharacter(manual[0].id)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'; e.currentTarget.style.borderLeftColor = '#f97316' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.08)'; e.currentTarget.style.borderLeftColor = 'rgba(249,115,22,0.3)' }}
            >
              <p className="text-[12.5px] leading-[1.8] italic" style={{ color: '#c8d4de', fontFamily: 'Georgia, "Times New Roman", serif', display: '-webkit-box', WebkitLineClamp: 9, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {manual[0].diary_entry}
              </p>
              <span className="text-[9px] font-mono uppercase tracking-widest block mt-2" style={{ color: 'rgba(249,115,22,0.5)', letterSpacing: '0.1em' }}>
                read more →
              </span>
            </div>
          )}
        </div>
      )}

      {/* NPCs section */}
      <NPCListSection npcs={npcs} locationName={locationName} onSelectCharacter={onSelectCharacter} />
    </div>
  )
}

/* ── NPC List with Home-group collapse ── */
function NPCListSection({ npcs, locationName, onSelectCharacter }) {
  const [homeExpanded, setHomeExpanded] = useState(false)

  const sorted = [...npcs].sort((a, b) => {
    const aHome = locationName(a.current_location).toLowerCase() === 'home'
    const bHome = locationName(b.current_location).toLowerCase() === 'home'
    if (aHome && !bHome) return 1
    if (!aHome && bHome) return -1
    return 0
  })

  const active = sorted.filter(c => locationName(c.current_location).toLowerCase() !== 'home')
  const atHome = sorted.filter(c => locationName(c.current_location).toLowerCase() === 'home')

  return (
    <div>
      <span className="font-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#22d3ee', letterSpacing: '0.12em' }}>
        Around Town
      </span>
      <div className="space-y-0.5">
        {active.map((char, idx) => (
          <div
            key={char.id}
            onClick={() => onSelectCharacter(char.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
            style={{
              background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              border: '1px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.04)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.12)'; e.currentTarget.style.transform = 'translateX(3px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)' }}
          >
            <div
              className="shrink-0 flex items-center justify-center rounded-lg font-bold"
              style={{ width: 30, height: 30, background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)', color: '#4a6a80', fontSize: 10 }}
            >
              {char.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-medium block truncate" style={{ color: '#cbd5e1' }}>{char.name}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span style={{ width: 4, height: 4, borderRadius: 2, background: '#22d3ee', opacity: 0.5, display: 'inline-block' }} />
                <span className="text-[9px] truncate" style={{ color: '#64748b' }}>{locationName(char.current_location)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Collapsed "at home" group */}
        {atHome.length > 0 && (
          <div>
            <button
              onClick={() => setHomeExpanded(e => !e)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{ color: '#3d3c5c', border: '1px solid transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#64748b' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3d3c5c' }}
            >
              <span style={{ fontSize: 9, transition: 'transform 0.2s', transform: homeExpanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▸</span>
              <span className="text-[10px]">{atHome.length} at home</span>
            </button>
            {homeExpanded && (
              <div className="space-y-0.5 animate-fade-in-up">
                {atHome.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => onSelectCharacter(char.id)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center rounded-lg font-bold"
                      style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', color: '#3d3c5c', fontSize: 10 }}
                    >
                      {char.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] block truncate" style={{ color: '#4a4970' }}>{char.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Selected Character Detail View ── */
function SelectedCharacterView({ char, characters, locationName, onSelectCharacter }) {
  const isManual = char.type === 'manual'
  const initials = char.name.split(' ').map(w => w[0]).join('')

  // For manual characters: show diary. For NPCs: show about inline
  const charIds = new Set(characters.map(c => c.id))
  const navigable = (char.relationships ?? []).filter(r => charIds.has(r.character_id))
  const external = (char.relationships ?? []).filter(r => !charIds.has(r.character_id))

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in-up">
      {/* Identity */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-full font-bold"
          style={{
            width: 44, height: 44,
            background: isManual ? 'rgba(249,115,22,0.12)' : 'rgba(34,211,238,0.08)',
            border: `2px solid ${isManual ? 'rgba(249,115,22,0.3)' : 'rgba(34,211,238,0.2)'}`,
            color: isManual ? '#f97316' : '#22d3ee',
            fontSize: 15,
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-base truncate" style={{ color: '#f1f5f9' }}>{char.name}</h4>
            {isManual && (
              <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>YOU</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5C2.5 7.25 6 11 6 11s3.5-3.75 3.5-6.5C9.5 2.57 7.93 1 6 1z" stroke={isManual ? '#f97316' : '#22d3ee'} strokeWidth="1.2" fill="none" />
              <circle cx="6" cy="4.5" r="1" fill={isManual ? '#f97316' : '#22d3ee'} />
            </svg>
            <span className="font-mono text-[10px]" style={{ color: isManual ? '#f97316' : '#22d3ee' }}>
              {locationName(char.current_location)}
            </span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto card-scroll space-y-3">

        {/* Manual character: show DIARY prominently, then brief info */}
        {isManual ? (
          <>
            {/* Diary — the hero content for manual characters */}
            {char.diary_entry && (
              <div className="rounded-xl p-3.5" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)' }}>
                <span className="font-mono text-[9px] uppercase tracking-widest block mb-2" style={{ color: '#f97316', letterSpacing: '0.1em' }}>
                  Diary
                </span>
                <p className="text-[12px] leading-[1.75] italic" style={{ color: '#cbd5e1', fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  {char.diary_entry}
                </p>
              </div>
            )}

            {/* Brief info */}
            {char.soul_summary && (
              <div className="pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span className="font-mono text-[9px] uppercase tracking-wider block mb-1.5" style={{ color: '#64748b' }}>About</span>
                <p className="text-[11px] leading-[1.6]" style={{ color: '#94a3b8' }}>
                  {char.soul_summary}
                </p>
              </div>
            )}
          </>
        ) : (
          /* NPC: show about and personality inline, no tabs */
          <>
            {char.soul_summary && (
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider block mb-1.5" style={{ color: '#64748b' }}>About</span>
                <p className="text-[11px] leading-[1.6]" style={{ color: '#94a3b8' }}>
                  {char.soul_summary}
                </p>
              </div>
            )}
            {char.personality_summary && (
              <div className="pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <span className="font-mono text-[9px] uppercase tracking-wider block mb-1.5" style={{ color: '#64748b' }}>Personality</span>
                <p className="text-[11px] leading-[1.6]" style={{ color: '#94a3b8' }}>
                  {char.personality_summary}
                </p>
              </div>
            )}
          </>
        )}

        {/* Relationships */}
        {(navigable.length > 0 || external.length > 0) && (
          <div className="pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <span className="font-mono text-[9px] uppercase tracking-wider block mb-2" style={{ color: '#64748b' }}>
              Connections
            </span>
            <div className="flex flex-wrap gap-1.5">
              {navigable.map(r => (
                <button
                  key={r.character_id}
                  onClick={() => onSelectCharacter(r.character_id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] cursor-pointer transition-all"
                  style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', color: '#94a3b8' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.transform = 'scale(1.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.15)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.transform = 'scale(1)' }}
                  title={r.dynamic}
                >
                  <span style={{ color: '#22d3ee', fontSize: 6 }}>●</span>
                  {r.name}
                </button>
              ))}
              {external.map(r => (
                <span key={r.character_id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]" style={{ color: '#5a5878', border: '1px solid rgba(100,116,139,0.08)', background: 'rgba(255,255,255,0.02)' }} title={r.dynamic}>
                  <span style={{ fontSize: 6, opacity: 0.5 }}>○</span>{r.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
