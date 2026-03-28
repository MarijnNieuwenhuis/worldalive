export default function ScenePanel({ scene }) {
  if (!scene) return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <span className="font-mono text-xs" style={{ color: '#64748b' }}>No scene data available</span>
    </div>
  )

  return (
    <div className="space-y-4 pb-8">
      {/* Narrative */}
      <div style={{ borderLeft: '3px solid rgba(249,115,22,0.4)', paddingLeft: 14 }}>
        <p className="text-xs leading-[1.75]" style={{ color: '#94a3b8' }}>
          {scene.narrative}
        </p>
      </div>

      {/* Events */}
      {scene.events?.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div style={{ width: 3, height: 10, background: '#f97316', borderRadius: 1 }} />
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: '#f97316', letterSpacing: '0.1em' }}
            >
              EVENTS
            </span>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
              {scene.events.length}
            </span>
          </div>
          <ul className="space-y-1.5">
            {scene.events.map((evt, i) => (
              <li
                key={i}
                className="flex gap-2 items-start px-3 py-2 rounded-lg"
                style={{ background: 'rgba(249,115,22,0.04)', borderLeft: '2px solid rgba(249,115,22,0.4)' }}
              >
                <span className="shrink-0" style={{ color: '#f97316', fontSize: 10, lineHeight: '16px' }}>▸</span>
                <span className="text-[11px] leading-relaxed" style={{ color: '#94a3b8' }}>{evt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
