'use client'

interface AddEventButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function AddEventButton({ onClick, disabled }: AddEventButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full p-2 mt-2 text-sm text-gray-500
        border border-dashed border-gray-300 rounded-lg
        hover:bg-gray-50 hover:border-gray-400 hover:text-gray-600
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-150
      "
    >
      + Add Event
    </button>
  )
}
