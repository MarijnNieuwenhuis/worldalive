import { useState } from 'react'
import { useCurrentTick } from './hooks/useCurrentTick'
import { useWorldData } from './hooks/useWorldData'
import TimelineScrubber from './components/TimelineScrubber'
import CharacterPanel from './components/CharacterPanel'
import ScenePanel from './components/ScenePanel'
import MapPanel from './components/MapPanel'
import EventCreator from './components/EventCreator'

export default function App() {
  const { currentTick, setTick } = useCurrentTick()
  const {
    index, world, characters, scene,
    loading, error,
    newTickAvailable, setNewTickAvailable
  } = useWorldData(currentTick, setTick)

  const [eventCreatorOpen, setEventCreatorOpen] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-purple-400 text-lg">Loading world…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-4 shrink-0">
        <span className="text-purple-400 font-semibold text-sm">The World</span>
        <span className="text-gray-500 text-xs">{world?.clock}</span>
        <div className="ml-auto flex items-center gap-3">
          {newTickAvailable && (
            <button
              onClick={() => { setNewTickAvailable(false); setTick(null) }}
              className="text-xs bg-purple-900 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-800"
            >
              New tick available →
            </button>
          )}
          <button
            onClick={() => setEventCreatorOpen(true)}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
          >
            + Propose event
          </button>
        </div>
      </header>

      {/* Timeline scrubber */}
      <TimelineScrubber
        index={index}
        currentTick={currentTick}
        onSelectTick={setTick}
      />

      {/* Main layout: map + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <MapPanel
          world={world}
          characters={characters}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
        />
        <aside className="w-80 shrink-0 flex flex-col border-l border-gray-800 overflow-hidden">
          <CharacterPanel
            characters={characters}
            world={world}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={setSelectedCharacter}
          />
          <ScenePanel scene={scene} />
        </aside>
      </div>

      {/* Event creator drawer */}
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
