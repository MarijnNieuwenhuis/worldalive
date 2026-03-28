function EventCard({ evt, i }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 transition-all animate-fade-in-up"
      style={{
        background: `linear-gradient(135deg, rgba(249,115,22,${0.05 - i * 0.01}) 0%, rgba(249,115,22,0.01) 100%)`,
        border: '1px solid rgba(249,115,22,0.1)',
        borderLeft: '3px solid rgba(249,115,22,0.4)',
        animationDelay: `${i * 0.08}s`,
        animationFillMode: 'both',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'
        e.currentTarget.style.borderLeftColor = '#f97316'
        e.currentTarget.style.transform = 'translateX(4px)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(249,115,22,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.1)'
        e.currentTarget.style.borderLeftColor = 'rgba(249,115,22,0.4)'
        e.currentTarget.style.transform = 'translateX(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 mt-0.5 flex items-center justify-center rounded-full font-bold"
          style={{ width: 22, height: 22, background: 'rgba(249,115,22,0.12)', color: '#f97316', fontSize: 10 }}
        >
          {i + 1}
        </div>
        <p className="text-[12px] leading-[1.7] flex-1" style={{ color: '#cbd5e1' }}>
          {evt}
        </p>
      </div>
    </div>
  )
}

export default function ScenePanel({ scene, layout = 'auto' }) {
  if (!scene) return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <span className="text-xs" style={{ color: '#64748b' }}>No scene data available</span>
    </div>
  )

  const hasEvents = scene.events?.length > 0
  const hasNarrative = !!scene.narrative

  // 'wide' layout: events column left, narrative right (used when container is wide enough)
  // 'auto' or 'narrow': stack narrative on top, events below
  const useWide = layout === 'wide'

  if (hasEvents && hasNarrative && useWide) {
    return (
      <div className="flex gap-0 pb-6" style={{ minHeight: 0 }}>
        {/* Left: Events */}
        <div className="space-y-2 shrink-0" style={{ width: 340, paddingRight: 24 }}>
          {scene.events.map((evt, i) => (
            <EventCard key={i} evt={evt} i={i} />
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: 'rgba(100,116,139,0.12)', flexShrink: 0 }} />

        {/* Right: Narrative prose */}
        <p
          className="text-[13px] leading-[1.9] animate-fade-in-up"
          style={{
            color: '#b0bec8',
            fontFamily: 'Georgia, "Times New Roman", serif',
            paddingLeft: 24,
            flex: '1 1 0',
            maxWidth: 900,
            animationDelay: `${scene.events.length * 0.08 + 0.1}s`,
            animationFillMode: 'both',
          }}
        >
          {scene.narrative}
        </p>
      </div>
    )
  }

  // Narrow / stacked layout: narrative first, events below
  return (
    <div className="space-y-3 pb-6">
      {hasNarrative && (
        <p
          className="text-[13px] leading-[1.85] animate-fade-in-up"
          style={{ color: '#b0bec8', fontFamily: 'Georgia, "Times New Roman", serif', animationDelay: '0.05s', animationFillMode: 'both' }}
        >
          {scene.narrative}
        </p>
      )}
      {hasEvents && (
        <div className="space-y-2" style={{ marginTop: hasNarrative ? 12 : 0 }}>
          {scene.events.map((evt, i) => <EventCard key={i} evt={evt} i={i} />)}
        </div>
      )}
    </div>
  )
}
