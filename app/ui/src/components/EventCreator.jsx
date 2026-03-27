import { useState } from 'react'

const healthColor = (status) => ({
  healthy: 'text-green-400',
  injured: 'text-yellow-400',
  hospitalized: 'text-red-400',
  deceased: 'text-gray-500',
  absent: 'text-gray-500',
}[status] ?? 'text-gray-400')

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

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 border-t border-gray-700 w-full max-w-2xl rounded-t-xl p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-100">Propose clock event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xs">✕ Close</button>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Target time (YYYY-MM-DD-HHmm)</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            placeholder="2026-03-27-1400"
            value={targetTime}
            onChange={e => setTargetTime(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">What happens</label>
          <textarea
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500 resize-none"
            rows={3}
            placeholder="Describe the event…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-2">Characters involved</label>
          <div className="grid grid-cols-2 gap-2">
            {characters.map(char => (
              <div
                key={char.id}
                onClick={() => toggleChar(char.id)}
                className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${
                  selectedChars.includes(char.id)
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-100 truncate">{char.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {world?.locations?.find(l => l.id === char.current_location)?.name ?? char.current_location}
                  </p>
                </div>
                <span className={`text-[10px] ${healthColor(char.health_status)}`}>
                  {char.health_status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide block mb-1">Location</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-purple-500"
            value={location}
            onChange={e => setLocation(e.target.value)}
          >
            <option value="">Select location…</option>
            {world?.locations?.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        {validating && (
          <p className="text-xs text-purple-400">Running validation skill… (refresh after running validate-events in Claude Code)</p>
        )}
        {validationResult && (
          <div className="space-y-2">
            {hardConflicts.map((c, i) => (
              <div key={i} className="bg-red-950/50 border border-red-800 rounded px-3 py-2 text-xs text-red-300">
                ✗ {c.character}: {c.reason}
              </div>
            ))}
            {warnings.map((c, i) => (
              <div key={i} className="bg-yellow-950/50 border border-yellow-800 rounded px-3 py-2 text-xs text-yellow-300">
                ⚠ {c.character}: {c.reason}
              </div>
            ))}
            {validationResult.status === 'validated' && (
              <div className="bg-green-950/50 border border-green-800 rounded px-3 py-2 text-xs text-green-300">
                ✓ Validated — run world-clock skill to advance
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || !targetTime || !description}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 rounded"
          >
            {submitting ? 'Saving…' : 'Save & validate'}
          </button>
          {validationResult?.status === 'validated' && (
            <div className="text-xs text-gray-500 self-center">
              Then run: <code className="bg-gray-800 px-2 py-1 rounded">validate-events</code> → <code className="bg-gray-800 px-2 py-1 rounded">world-clock</code>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
