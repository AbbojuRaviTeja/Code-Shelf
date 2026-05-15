import { memo } from 'react'
import { Code2 } from 'lucide-react'
import { useFileStore } from '@/store/fileStore'
import { findNodeById } from '@/utils/treeHelpers'
import { isFolder } from '@/types/file'
import { getFileIcon } from '@/utils/fileIcons'

export const FileEditor = memo(function FileEditor() {
  const openFileId = useFileStore((s) => s.openFileId)
  const tree = useFileStore((s) => s.tree)
  const updateFileContent = useFileStore((s) => s.updateFileContent)

  const found = openFileId ? findNodeById(tree, openFileId) : null
  const file = found && !isFolder(found) ? found : null

  if (!file) {
    return (
      <section className="flex h-full min-h-0 flex-1 flex-col bg-vsc-bg">
        <header className="flex h-[35px] shrink-0 items-center border-b border-vsc-border bg-vsc-sidebar px-3">
          <span className="rounded-t border border-b-0 border-vsc-border bg-vsc-bg px-3 py-1.5 text-[13px] text-vsc-muted">
            Welcome
          </span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-vsc-muted">
          <Code2 className="h-16 w-16 opacity-25" strokeWidth={1} />
          <p className="text-[13px]">Select a file to edit its contents</p>
        </div>
      </section>
    )
  }

  const { Icon, className } = getFileIcon(file.name)

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col bg-vsc-bg">
      <header className="flex h-[35px] shrink-0 items-center border-b border-vsc-border bg-vsc-sidebar px-3">
        <span className="flex items-center gap-1.5 rounded-t border border-b-0 border-vsc-border bg-vsc-bg px-3 py-1.5 text-[13px]">
          <Icon className={`h-3.5 w-3.5 ${className}`} strokeWidth={1.5} />
          {file.name}
        </span>
      </header>
      <textarea
        value={file.content ?? ''}
        onChange={(e) => updateFileContent(file.id, e.target.value)}
        spellCheck={false}
        aria-label={`Edit ${file.name}`}
        className="vsc-scrollbar min-h-0 flex-1 resize-none border-0 bg-vsc-bg p-4 font-mono text-[13px] leading-relaxed text-vsc-text outline-none"
        placeholder="Start typing…"
      />
    </section>
  )
})
