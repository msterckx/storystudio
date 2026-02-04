'use client'

import { useState, useEffect } from 'react'

interface EventTitleInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function EventTitleInput({ value, onChange, disabled }: EventTitleInputProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync with prop when it changes externally
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      disabled={disabled}
      placeholder="Event title"
      className={`
        w-full text-xl font-semibold text-gray-900
        bg-transparent border-none outline-none
        placeholder-gray-400
        ${disabled ? 'cursor-not-allowed opacity-75' : ''}
      `}
    />
  )
}
