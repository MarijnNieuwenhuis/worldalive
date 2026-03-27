export default function ScenePanel({ scene }) {
  if (!scene) return (
    <div className="h-48 border-t border-gray-800 p-4 text-xs text-gray-600 flex items-center justify-center">
      No scene for this tick
    </div>
  )

  return (
    <div className="h-48 border-t border-gray-800 flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-800/50 text-[10px] text-gray-500 uppercase tracking-wide shrink-0">
        Scene
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs text-gray-300 leading-relaxed">{scene.narrative}</p>
        {scene.events?.length > 0 && (
          <ul className="mt-3 space-y-1">
            {scene.events.map((evt, i) => (
              <li key={i} className="text-[10px] text-gray-500 flex gap-2">
                <span className="text-purple-600">·</span>{evt}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
