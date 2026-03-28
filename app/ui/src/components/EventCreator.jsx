import { useState } from 'react'

export default function EventCreator({ characters, world, onClose }) {
  const [targetTime, setTargetTime] = useState('')
  const [description, setDescription] = useState('')
  const [selectedChars, setSelectedChars] = useState([])
  const [location, setLocation] = useState('')
  const [validationResult, setValidationResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [validating, setValidating] = useState(false)

  const toggleChar = (id) =>
    setSelectedChars(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])

  const handleSubmit = async () => {
    if (!targetTime || !description) return
    setSubmitting(true)
    const payload = {
      schema_version: 1,
      target_time: targetTime,
      events: [{
        id: 'evt-' + Date.now(),
        description,
        characters: selectedChars,
        location,
      }],
      status: 'pending',
      conflicts: [],
    }
    await fetch('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setValidationResult(null)
    setSubmitting(false)
    setValidating(true)
    const poll = setInterval(async () => {
      try {
        const data = await fetch('/dist/pending-events.json').then(r => r.json())
        if (data.status !== 'pending') {
          clearInterval(poll)
          setValidating(false)
          setValidationResult(data)
        }
      } catch (_) {}
    }, 1500)
  }

  const hardConflicts = validationResult?.conflicts?.filter(c => c.level === 'hard') ?? []
  const warnings = validationResult?.conflicts?.filter(c => c.level === 'warning') ?? []

  const inputStyle = {
    background: '#151428',
    border: '1px solid #262545',
    color: '#f1f5f9',
    fontFamily: 'inherit',
    fontSize: 13,
    outline: 'none',
    borderRadius: 14,
    padding: '12px 16px',
    width: '100%',
    boxSizing: 'border-box',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-backdrop"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[82vh] overflow-y-auto card-scroll animate-slide-up-spring"
        style={{
          background: 'linear-gradient(160deg, #1c1b38 0%, #18172e 100%)',
          border: '1px solid #262545',
          borderRadius: 24,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#f1f5f9', letterSpacing: '0.1em' }}>
              Propose Event
            </h2>
            <button
              onClick={onClose}
              className="font-mono text-xs transition-colors rounded-lg px-2 py-1"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent' }}
            >
              Close
            </button>
          </div>

          {/* Target time */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: '#64748b' }}>
              Target Time (YYYY-MM-DD-HHmm)
            </label>
            <input
              style={inputStyle}
              placeholder="2026-03-27-1400"
              value={targetTime}
              onChange={e => setTargetTime(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: '#64748b' }}>
              What Happens
            </label>
            <textarea
              style={{ ...inputStyle, resize: 'none' }}
              rows={3}
              placeholder="Describe the event..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Characters */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-2" style={{ color: '#64748b' }}>
              Characters Involved
            </label>
            <div className="grid grid-cols-2 gap-2">
              {characters.map(char => {
                const isSelected = selectedChars.includes(char.id)
                const initials = char.name.split(' ').map(w => w[0]).join('')
                return (
                  <div
                    key={char.id}
                    onClick={() => toggleChar(char.id)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${isSelected ? 'rgba(249,115,22,0.4)' : '#2a2a4a'}`,
                      background: isSelected ? 'rgba(249,115,22,0.08)' : 'transparent',
                    }}
                  >
                    <div
                      className="shrink-0 flex items-center justify-center rounded-full font-bold"
                      style={{
                        width: 24, height: 24,
                        background: isSelected ? 'rgba(249,115,22,0.2)' : '#222240',
                        color: isSelected ? '#f97316' : '#64748b',
                        fontSize: 9,
                      }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate" style={{ color: '#f1f5f9' }}>{char.name}</p>
                      <p className="text-[10px] truncate" style={{ color: '#64748b' }}>
                        {world?.locations?.find(l => l.id === char.current_location)?.name ?? char.current_location}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest block mb-1.5" style={{ color: '#64748b' }}>
              Location
            </label>
            <select
              style={{ ...inputStyle, appearance: 'none' }}
              value={location}
              onChange={e => setLocation(e.target.value)}
            >
              <option value="">Select location...</option>
              {world?.locations?.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Validation status */}
          {validating && (
            <div className="flex items-center gap-2 py-2">
              <span className="rounded-full animate-glow-pulse" style={{ width: 6, height: 6, background: '#f97316' }} />
              <span className="font-mono text-xs" style={{ color: '#f97316' }}>
                Validating... run validate-events skill to process
              </span>
            </div>
          )}

          {validationResult && (
            <div className="space-y-2">
              {hardConflicts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-2 font-mono text-xs rounded-lg"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
                >
                  <span>x</span><span>{c.character}: {c.reason}</span>
                </div>
              ))}
              {warnings.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-3 py-2 font-mono text-xs rounded-lg"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
                >
                  <span>!</span><span>{c.character}: {c.reason}</span>
                </div>
              ))}
              {validationResult.status === 'validated' && (
                <div
                  className="flex items-center gap-2 px-3 py-2 font-mono text-xs rounded-lg"
                  style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' }}
                >
                  <span>OK</span><span>Validated - run world-clock to advance</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pb-1">
            <button
              onClick={onClose}
              className="font-mono text-xs px-4 py-2 rounded-lg transition-colors"
              style={{ color: '#94a3b8', border: '1px solid #2a2a4a' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#64748b'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a4a'}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !targetTime || !description}
              className="font-mono font-bold text-xs px-5 py-2 rounded-lg transition-all disabled:opacity-40"
              style={{
                background: '#f97316',
                color: '#000',
                border: 'none',
                cursor: (!targetTime || !description) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#fb923c' }}
              onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
            >
              {submitting ? 'Saving...' : 'Save & Validate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
