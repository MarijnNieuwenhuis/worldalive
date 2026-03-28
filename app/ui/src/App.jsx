import { useState } from 'react'
import { useCurrentTick } from './hooks/useCurrentTick'
import { useWorldData } from './hooks/useWorldData'
import TimelineScrubber from './components/TimelineScrubber'
import MapPanel from './components/MapPanel'
import ScenePanel from './components/ScenePanel'
import EventCreator from './components/EventCreator'
import CharacterPanel from './components/CharacterPanel'

export default function App() {
  const { currentTick, setTick } = useCurrentTick()
  const {
    index, world, characters, scene,
    loading, error,
    newTickAvailable, setNewTickAvailable
  } = useWorldData(currentTick, setTick)

  const [eventCreatorOpen, setEventCreatorOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const locationName = (id) =>
    world?.locations?.find(l => l.id === id)?.name ?? id

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#16152b' }}>
        <span className="font-mono text-sm font-bold tracking-widest" style={{ color: '#f97316' }}>
          BILLINGS WORLD
        </span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-full animate-glow-pulse" style={{
              width: 8, height: 8,
              background: '#f97316',
              animationDelay: `${i * 0.15}s`,
            }} />
          ))}
        </div>
        <span className="font-mono text-xs" style={{ color: '#64748b' }}>
          Loading world data...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#16152b' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: '#f87171', fontSize: 18 }}>&#9888;</span>
          <span className="font-mono text-sm font-bold" style={{ color: '#f87171' }}>Connection Error</span>
        </div>
        <span className="font-mono text-xs text-center max-w-md" style={{ color: '#94a3b8' }}>{error}</span>
        <button
          onClick={() => window.location.reload()}
          className="font-mono text-xs font-bold px-5 py-2 rounded-lg transition-all mt-2"
          style={{ background: '#f97316', color: '#fff', border: 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fb923c'}
          onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
        >
          Retry
        </button>
      </div>
    )
  }

  const eventCount = scene?.events?.length ?? 0

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#16152b' }}>

      {/* ── Header Bar ── */}
      <header
        className="shrink-0 flex items-center px-6 gap-8"
        style={{ height: 56, borderBottom: '1px solid #2a2a4a', background: 'linear-gradient(180deg, #1a1a36 0%, #16152b 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="font-bold text-lg" style={{ color: '#f97316' }}>◈</span>
          <span className="font-bold text-base tracking-wide" style={{ color: '#f1f5f9' }}>
            BILLINGS WORLD
          </span>
        </div>

        {/* Nav tabs */}
        <nav className="flex items-stretch h-full gap-1">
          {[
            { label: 'DASHBOARD', active: true },
            { label: 'CHARACTERS', active: false, onClick: () => setSelectedCharacter(null) },
            { label: 'EVENTS', active: false, onClick: () => setEventCreatorOpen(true) },
          ].map(tab => (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className="font-mono text-xs px-4 relative transition-colors"
              style={{
                color: tab.active ? '#f1f5f9' : '#64748b',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={e => { if (!tab.active) e.currentTarget.style.color = '#94a3b8' }}
              onMouseLeave={e => { if (!tab.active) e.currentTarget.style.color = '#64748b' }}
            >
              {tab.label}
              {tab.active && (
                <div className="absolute bottom-0 left-3 right-3" style={{ height: 2, background: '#f97316', borderRadius: 1 }} />
              )}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Right side: new tick + clock */}
        <div className="flex items-center gap-4">
          {newTickAvailable && (
            <button
              onClick={() => { setNewTickAvailable(false); setTick(null) }}
              className="font-mono text-xs px-3 py-1.5 rounded-lg animate-glow-pulse transition-colors"
              style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}
            >
              NEW TICK
            </button>
          )}
          <div className="flex items-center gap-3 font-mono text-xs" style={{ color: '#94a3b8' }}>
            <span className="font-bold text-sm" style={{ color: '#f1f5f9' }}>
              {world?.clock?.match(/(\d{1,2}:\d{2})/)?.[1] ?? '—'}
            </span>
            <span style={{ color: '#64748b' }}>
              {world?.clock?.replace(/\s+at\s+\d{1,2}:\d{2}/, '').replace(/,\s*\d{4}/, '') ?? ''}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Bento Grid ── */}
      <div
        className="flex-1 overflow-hidden p-4 gap-3"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr 0.8fr',
          gridTemplateRows: '1fr auto auto',
        }}
      >
        {/* ── Map Card (spans 2 cols) ── */}
        <div
          className="dash-card relative overflow-hidden"
          style={{ gridColumn: '1 / 3', gridRow: '1', padding: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}
        >
          <MapPanel
            world={world}
            characters={characters}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
            scene={scene}
          />
        </div>

        {/* ── Timeline (separate row, spans 2 cols under map) ── */}
        <div
          style={{
            gridColumn: '1 / 3', gridRow: '2',
            background: 'linear-gradient(145deg, #1f1f3a 0%, #1a1a34 100%)',
            borderRadius: '0 0 16px 16px',
            marginTop: -1,
            border: '1px solid #2a2a4a',
            borderTop: '1px solid rgba(42,42,74,0.3)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <TimelineScrubber
            index={index}
            currentTick={currentTick}
            onSelectTick={setTick}
          />
        </div>

        {/* ── Character Spotlight (right col, row 1) ── */}
        <div className="dash-card overflow-hidden flex flex-col" style={{ gridColumn: '3', gridRow: '1 / 3' }}>
          <CharacterPanel
            characters={characters}
            world={world}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
          />
        </div>

        {/* ── Scene Brief (bottom-left) ── */}
        <div className="dash-card overflow-hidden flex flex-col" style={{ gridColumn: '1', gridRow: '3', maxHeight: 260, padding: '16px 20px' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: 3, height: 14, background: '#f97316', borderRadius: 2 }} />
            <h3 className="font-bold text-xs uppercase tracking-widest" style={{ color: '#f1f5f9', letterSpacing: '0.12em' }}>
              SCENE BRIEF
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto card-scroll scroll-fade">
            <ScenePanel scene={scene} />
          </div>
        </div>

        {/* ── Character Roster (bottom-center) ── */}
        <div className="dash-card overflow-hidden flex flex-col" style={{ gridColumn: '2', gridRow: '3', maxHeight: 260, padding: '16px 20px' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: 3, height: 14, background: '#22d3ee', borderRadius: 2 }} />
            <h3 className="font-bold text-xs uppercase tracking-widest" style={{ color: '#f1f5f9', letterSpacing: '0.12em' }}>
              ROSTER
            </h3>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>
              {characters.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto card-scroll">
            <div className="space-y-1">
              {[...characters].sort((a, b) => {
                if (a.type === 'manual' && b.type !== 'manual') return -1
                if (b.type === 'manual' && a.type !== 'manual') return 1
                return 0
              }).map(char => {
                const isSelected = char.id === selectedCharacter
                const isManual = char.type === 'manual'
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharacter(char.id === selectedCharacter ? null : char.id)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: isSelected ? 'rgba(249,115,22,0.1)' : 'transparent',
                      border: `1px solid ${isSelected ? 'rgba(249,115,22,0.3)' : 'transparent'}`,
                      borderLeft: isManual ? '2px solid rgba(249,115,22,0.5)' : undefined,
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#3d3d5c' } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
                  >
                    {/* Initials */}
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full font-bold"
                      style={{
                        width: 24, height: 24,
                        background: isSelected ? 'rgba(249,115,22,0.2)' : isManual ? 'rgba(249,115,22,0.1)' : '#222240',
                        color: isSelected || isManual ? '#f97316' : '#64748b',
                        fontSize: 9,
                      }}
                    >
                      {char.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <span className="text-[11px] font-medium truncate flex-1" style={{ color: isSelected ? '#f1f5f9' : '#94a3b8' }}>
                      {char.name}
                      {isManual && <span className="ml-1 font-mono" style={{ fontSize: 8, color: '#f97316' }}>★</span>}
                    </span>
                    <span className="text-[10px] shrink-0" style={{ color: '#64748b' }}>
                      {locationName(char.current_location)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── World Status (bottom-right) ── */}
        <div className="dash-card flex flex-col" style={{ gridColumn: '3', gridRow: '3', maxHeight: 260, padding: '16px 20px' }}>
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: 3, height: 14, background: '#f97316', borderRadius: 2 }} />
            <h3 className="font-bold text-xs uppercase tracking-widest" style={{ color: '#f1f5f9', letterSpacing: '0.12em' }}>
              WORLD STATUS
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Clock */}
            <div className="rounded-lg px-3 py-2" style={{ background: '#222240' }}>
              <span className="font-mono text-[9px] uppercase tracking-wider block mb-0.5" style={{ color: '#64748b' }}>
                Clock
              </span>
              <span className="font-bold text-xl" style={{ color: '#f1f5f9' }}>
                {world?.clock?.match(/(\d{1,2}:\d{2})/)?.[1] ?? '—'}
              </span>
            </div>

            {/* Characters */}
            <div className="rounded-lg px-3 py-2" style={{ background: '#222240' }}>
              <span className="font-mono text-[9px] uppercase tracking-wider block mb-0.5" style={{ color: '#64748b' }}>
                Characters
              </span>
              <span className="font-bold text-xl" style={{ color: '#22d3ee' }}>
                {characters.length}
              </span>
            </div>

            {/* Events */}
            <div className="rounded-lg px-3 py-2" style={{ background: '#222240' }}>
              <span className="font-mono text-[9px] uppercase tracking-wider block mb-0.5" style={{ color: '#64748b' }}>
                Events
              </span>
              <span className="font-bold text-xl" style={{ color: '#f97316' }}>
                {eventCount}
              </span>
            </div>

            {/* Ticks */}
            <div className="rounded-lg px-3 py-2" style={{ background: '#222240' }}>
              <span className="font-mono text-[9px] uppercase tracking-wider block mb-0.5" style={{ color: '#64748b' }}>
                Ticks
              </span>
              <span className="font-bold text-xl" style={{ color: '#94a3b8' }}>
                {index?.ticks?.length ?? 0}
              </span>
            </div>
          </div>

          {/* New Event button — primary CTA */}
          <button
            onClick={() => setEventCreatorOpen(true)}
            className="mt-auto w-full font-mono text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              border: 'none',
              letterSpacing: '0.05em',
              boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.3)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7" y1="4" x2="7" y2="10" stroke="currentColor" strokeWidth="1.5" />
              <line x1="4" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            NEW EVENT
          </button>
        </div>
      </div>

      {/* ── Event creator modal ── */}
      {eventCreatorOpen && (
        <EventCreator
          characters={characters}
          world={world}
          onClose={() => setEventCreatorOpen(false)}
        />
      )}
    </div>
  )
}
