import { useState, useEffect, useRef, useCallback } from 'react'

const POLL_INTERVAL_MS = 15000

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

export function useWorldData(currentTick, setTick) {
  const [index, setIndex] = useState(null)
  const [world, setWorld] = useState(null)
  const [characters, setCharacters] = useState([])
  const [scene, setScene] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTickAvailable, setNewTickAvailable] = useState(false)

  const lastModifiedRef = useRef(null)

  const resolveActiveTick = useCallback((idx, tick) => {
    if (tick) return tick
    return idx.ticks[idx.ticks.length - 1]?.timestamp ?? null
  }, [])

  const loadTick = useCallback(async (timestamp) => {
    const base = `/dist/ticks/${timestamp}`
    const [worldData, sceneData] = await Promise.all([
      fetchJSON(`${base}/world.json`),
      fetchJSON(`${base}/scenes/${timestamp}.json`),
    ])

    const idx = await fetchJSON('/dist/index.json')
    const tickMeta = idx.ticks.find(t => t.timestamp === timestamp)
    const allCharIds = tickMeta?.all_characters ?? []

    const charData = await Promise.all(
      allCharIds.map(id => fetchJSON(`${base}/characters/${id}.json`))
    )

    return { worldData, sceneData, charData }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJSON('/dist/index.json')
      .then(async (idx) => {
        if (cancelled) return
        lastModifiedRef.current = idx.last_modified
        setIndex(idx)

        const activeTick = resolveActiveTick(idx, currentTick)
        if (!activeTick) { setLoading(false); return }

        const { worldData, sceneData, charData } = await loadTick(activeTick)
        if (cancelled) return
        setWorld(worldData)
        setScene(sceneData)
        setCharacters(charData)
        setLoading(false)
      })
      .catch(err => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [currentTick])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const idx = await fetchJSON('/dist/index.json')
        if (idx.last_modified === lastModifiedRef.current) return

        lastModifiedRef.current = idx.last_modified
        setIndex(idx)

        const isOnLatest = !currentTick ||
          currentTick === index?.ticks[index.ticks.length - 1]?.timestamp

        if (isOnLatest) {
          const newLatest = idx.ticks[idx.ticks.length - 1]?.timestamp
          if (newLatest) {
            const { worldData, sceneData, charData } = await loadTick(newLatest)
            setWorld(worldData)
            setScene(sceneData)
            setCharacters(charData)
            setTick(newLatest)
          }
        } else {
          setNewTickAvailable(true)
        }
      } catch (_) {
        // Silent fail on poll
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [currentTick, index, loadTick, setTick])

  return { index, world, characters, scene, loading, error, newTickAvailable, setNewTickAvailable }
}
