export default function EventCreator({ characters, world, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center" onClick={onClose}>
      <div className="bg-gray-900 w-full max-w-2xl rounded-t-xl p-6" onClick={e => e.stopPropagation()}>
        <p className="text-gray-400 text-sm">Event creator stub</p>
        <button onClick={onClose} className="mt-4 text-xs text-gray-500 underline">Close</button>
      </div>
    </div>
  )
}
