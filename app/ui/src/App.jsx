import { useState, useEffect, useRef } from 'react'
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
  const [contentKey, setContentKey] = useState(0) // for crossfade on tick change
  const prevTick = useRef(currentTick)

  // Trigger crossfade animation when tick changes
  useEffect(() => {
    if (prevTick.current !== currentTick) {
      setContentKey(k => k + 1)
      prevTick.current = currentTick
    }
  }, [currentTick])

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg-body)' }}>
        <div className="animate-fade-in" style={{ animationDuration: '0.6s' }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-bold text-2xl" style={{ color: '#f97316' }}>◈</span>
            <span className="font-bold text-xl tracking-wide" style={{ color: '#f1f5f9' }}>
              BILLINGS WORLD
            </span>
          </div>
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: '#1e1d38', width: 200 }}>
            <div className="h-full rounded-full animate-glow-pulse" style={{
              width: '60%',
              background: 'linear-gradient(90deg, #f97316, #22d3ee)',
            }} />
          </div>
        </div>
        <span className="text-[11px] animate-fade-in" style={{ color: '#4a4970', animationDelay: '0.3s', animationFillMode: 'both' }}>
          Billings, Montana
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-body)' }}>
        <span className="text-sm font-bold" style={{ color: '#f87171' }}>Connection Error</span>
        <span className="text-xs text-center max-w-md" style={{ color: '#94a3b8' }}>{error}</span>
        <button
          onClick={() => window.location.reload()}
          className="text-xs font-bold px-5 py-2 rounded-xl"
          style={{ background: '#f97316', color: '#fff' }}
        >
          Retry
        </button>
      </div>
    )
  }

  // Parse date/time from clock string for Scene Brief title
  const clockTime = world?.clock?.match(/(\d{1,2}:\d{2})/)?.[1] ?? ''
  const clockDate = world?.clock?.replace(/\s+at\s+\d{1,2}:\d{2}/, '') ?? ''

  // Short punchy scene header format: "THURSDAY, MAR 26 · 09:00"
  const sceneTimeLabel = (() => {
    const m = world?.clock?.match(/(\w+), (\w+) (\d+), (\d+) at (\d{1,2}:\d{2})/)
    if (!m) return world?.clock ?? ''
    const [, day, month, date, , time] = m
    return `${day.toUpperCase()}, ${month.slice(0, 3).toUpperCase()} ${date} · ${time}`
  })()

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-body)' }}>

      {/* ── Top progress indicator — shows position in timeline ── */}
      {index?.ticks?.length > 1 && (() => {
        const tickIdx = index.ticks.findIndex(t => t.timestamp === (currentTick ?? index.ticks[index.ticks.length - 1].timestamp))
        const progress = tickIdx >= 0 ? ((tickIdx + 1) / index.ticks.length) * 100 : 100
        return (
          <div style={{ height: 2, background: 'var(--border-subtle)' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #f97316, #22d3ee)',
              borderRadius: 1,
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        )
      })()}

      {/* ── Header ── */}
      <header
        className="shrink-0 flex items-center px-5 gap-6"
        style={{ height: 52, borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-base" style={{ color: '#f97316' }}>◈</span>
          <span className="font-bold text-sm tracking-wide" style={{ color: '#f1f5f9' }}>
            BILLINGS WORLD
          </span>
        </div>

        {/* World clock — center, chip style */}
        <div className="flex-1 flex items-center justify-center">
          {world?.clock && (
            <div
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(34,211,238,0.05)',
                border: '1px solid rgba(34,211,238,0.12)',
              }}
            >
              <span className="font-mono font-bold text-sm" style={{ color: '#22d3ee' }}>{clockTime}</span>
              <span style={{ width: 1, height: 12, background: 'rgba(34,211,238,0.2)', display: 'inline-block' }} />
              <span className="font-mono text-[11px]" style={{ color: '#64748b' }}>{sceneTimeLabel.split(' · ')[0]}</span>
            </div>
          )}
        </div>

        {newTickAvailable && (
          <button
            onClick={() => { setNewTickAvailable(false); setTick(null) }}
            className="text-xs font-bold px-3 py-1.5 rounded-lg animate-glow-pulse"
            style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', border: '1px solid rgba(249,115,22,0.25)' }}
          >
            NEW TICK AVAILABLE
          </button>
        )}

        <button
          onClick={() => setEventCreatorOpen(true)}
          className="btn-shimmer text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
          style={{
            color: '#fff',
            boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(249,115,22,0.3)' }}
        >
          <span style={{ fontSize: 15, lineHeight: 1, fontWeight: 300 }}>+</span>
          New Event
        </button>
      </header>

      {/* ── Main Layout: 2 columns ── */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">

        {/* ── LEFT COLUMN: Map + Timeline + Scene ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Map card */}
          <div
            className="dash-card relative overflow-hidden animate-card-enter stagger-1 flex-1"
            style={{ padding: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none', minHeight: 0 }}
          >
            <MapPanel
              world={world}
              characters={characters}
              selectedCharacter={selectedCharacter}
              onSelectCharacter={setSelectedCharacter}
              scene={scene}
            />
          </div>

          {/* Timeline bar */}
          <div
            className="animate-card-enter stagger-2"
            style={{
              background: 'linear-gradient(160deg, #1c1b38 0%, #18172e 100%)',
              borderRadius: '0 0 var(--radius-card) var(--radius-card)',
              marginTop: -14,
              border: '1px solid var(--border-card)',
              borderTop: '1px solid var(--border-subtle)',
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

          {/* Scene Brief card */}
          <div
            className="dash-card overflow-hidden flex flex-col animate-card-enter stagger-3"
            style={{ maxHeight: 380, padding: '16px 20px' }}
          >
            {/* Scene header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div style={{ width: 3, height: 18, background: 'linear-gradient(180deg, #f97316 0%, #fb923c 100%)', borderRadius: 2, boxShadow: '0 0 8px rgba(249,115,22,0.4)' }} />
                <div>
                  <span className="font-bold text-[11px] uppercase tracking-widest block" style={{ color: '#f97316', letterSpacing: '0.12em' }}>
                    Scene Brief
                  </span>
                  <span className="font-mono text-[13px] font-bold block leading-tight" style={{ color: '#f1f5f9' }}>
                    {sceneTimeLabel}
                  </span>
                </div>
              </div>
              {(scene?.events?.length ?? 0) > 0 && (
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-lg" style={{ background: 'rgba(249,115,22,0.08)', color: '#f97316', border: '1px solid rgba(249,115,22,0.15)' }}>
                  {scene.events.length} {scene.events.length === 1 ? 'event' : 'events'}
                </span>
              )}
            </div>
            <div key={contentKey} className="flex-1 overflow-y-auto card-scroll scroll-fade animate-crossfade">
              <ScenePanel scene={scene} />
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Characters ── */}
        <div
          className="dash-card overflow-hidden flex flex-col animate-card-enter stagger-2"
          style={{ width: 340, flexShrink: 0, padding: '20px' }}
        >
          <CharacterPanel
            key={contentKey}
            characters={characters}
            world={world}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
          />
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
