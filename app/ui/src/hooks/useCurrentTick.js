import { useState } from 'react'

// Reads ?tick=YYYY-MM-DD-HHmm from URL, defaults to null (= latest)
export function useCurrentTick() {
  const getTickFromUrl = () => new URLSearchParams(window.location.search).get('tick')

  const [currentTick, setCurrentTick] = useState(getTickFromUrl)

  const setTick = (timestamp) => {
    const url = new URL(window.location)
    if (timestamp) {
      url.searchParams.set('tick', timestamp)
    } else {
      url.searchParams.delete('tick')
    }
    window.history.pushState({}, '', url)
    setCurrentTick(timestamp)
  }

  return { currentTick, setTick }
}
