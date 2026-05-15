import { memo, useEffect, useRef, type KeyboardEvent } from 'react'

interface RenameInputProps {
  value: string
  onSubmit: (value: string) => void
  onCancel: () => void
}

export const RenameInput = memo(function RenameInput({
  value,
  onSubmit,
  onCancel,
}: RenameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cancelledRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      onSubmit(inputRef.current?.value ?? value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      cancelledRef.current = true
      onCancel()
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={value}
      aria-label={`Rename ${value}`}
      className="h-[18px] min-w-0 flex-1 rounded-sm border border-vsc-accent bg-[#3c3c3c] px-1.5 text-[13px] text-vsc-text outline-none ring-1 ring-vsc-accent/40"
      onBlur={() => {
        if (cancelledRef.current) return
        onSubmit(inputRef.current?.value ?? value)
      }}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    />
  )
})
