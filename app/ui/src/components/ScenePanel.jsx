export default function ScenePanel({ scene }) {
  if (!scene) return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <span className="font-mono text-xs" style={{ color: '#64748b' }}>No scene data available</span>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Narrative */}
      <div style={{ borderLeft: '3px solid rgba(249,115,22,0.4)', paddingLeft: 14 }}>
        <p className="text-[11px] leading-[1.7]" style={{ color: '#94a3b8' }}>
          {scene.narrative}
        </p>
      </div>

      {/* Events */}
      {scene.events?.length > 0 && (
        <div>
          <span
            className="font-mono text-[10px] uppercase tracking-widest block mb-2"
            style={{ color: '#64748b', letterSpacing: '0.1em' }}
          >
            EVENTS
          </span>
          <ul className="space-y-1.5">
            {scene.events.map((evt, i) => (
              <li
                key={i}
                className="flex gap-2 items-start px-3 py-2 rounded-lg"
                style={{ background: '#222240', borderLeft: '2px solid #f97316' }}
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
