import { memo } from 'react'
import { ChevronDown, FilePlus, FolderPlus } from 'lucide-react'

interface ToolbarProps {
  sectionOpen: boolean
  onToggleSection: () => void
  onNewFile: () => void
  onNewFolder: () => void
}

export const Toolbar = memo(function Toolbar({
  sectionOpen,
  onToggleSection,
  onNewFile,
  onNewFolder,
}: ToolbarProps) {
  return (
    <header className="shrink-0 border-b border-vsc-border bg-vsc-sidebar">
      <div className="flex h-[35px] items-center justify-between px-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1 text-left"
          onClick={onToggleSection}
          aria-expanded={sectionOpen}
        >
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-vsc-muted transition-transform duration-200 ${
              sectionOpen ? '' : '-rotate-90'
            }`}
            strokeWidth={1.5}
          />
          <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-vsc-label">
            Explorer
          </span>
        </button>

        <div className="flex items-center gap-0.5" role="toolbar" aria-label="Explorer actions">
          <button
            type="button"
            title="New File"
            aria-label="New File"
            className="flex h-[22px] w-[22px] items-center justify-center rounded-sm text-vsc-muted transition hover:bg-white/10 hover:text-vsc-text"
            onClick={onNewFile}
          >
            <FilePlus className="h-[15px] w-[15px]" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title="New Folder"
            aria-label="New Folder"
            className="flex h-[22px] w-[22px] items-center justify-center rounded-sm text-vsc-muted transition hover:bg-white/10 hover:text-vsc-text"
            onClick={onNewFolder}
          >
            <FolderPlus className="h-[15px] w-[15px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  )
})
