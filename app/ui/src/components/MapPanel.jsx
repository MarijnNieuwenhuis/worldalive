export default function MapPanel({ world, characters }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }}
    >
      <img
        src="/map.jpg"
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
          borderRadius: 'var(--radius-card)',
          opacity: 0.96,
        }}
      />

      {/* Active count chip */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        {(() => {
          const active = characters.filter(c => {
            const locName = world?.locations?.find(l => l.id === c.current_location)?.name ?? ''
            return locName.toLowerCase() !== 'home'
          }).length
          return (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(18,17,31,0.72)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(38,37,69,0.5)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22d3ee', display: 'inline-block', boxShadow: '0 0 5px rgba(34,211,238,0.5)', flexShrink: 0 }} />
              <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>
                {active} <span style={{ color: '#4a4970' }}>out in Billings</span>
              </span>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
