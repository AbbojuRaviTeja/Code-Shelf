import { memo, useState, type DragEvent } from 'react'
import {
  ChevronRight,
  FilePlus,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
} from 'lucide-react'
import type { FileNode } from '@/types/file'
import { isFolder } from '@/types/file'
import { useFileStore } from '@/store/fileStore'
import { findNodeById } from '@/utils/treeHelpers'
import { getFileIcon } from '@/utils/fileIcons'
import { RenameInput } from './RenameInput'

interface TreeNodeProps {
  node: FileNode
  depth?: number
  siblingIndex?: number
  siblingCount?: number
}

type DropPosition = 'before' | 'inside' | 'after'

export const TreeNode = memo(function TreeNode({
  node,
  depth = 0,
  siblingIndex = 0,
}: TreeNodeProps) {
  const [dropHint, setDropHint] = useState<DropPosition | null>(null)

  const renamingId = useFileStore((s) => s.renamingId)
  const selectedId = useFileStore((s) => s.selectedId)
  const dragNodeId = useFileStore((s) => s.dragNodeId)

  const folder = isFolder(node)
  const expanded = folder ? Boolean(node.expanded) : false
  const isRenaming = renamingId === node.id
  const isSelected = selectedId === node.id
  const isDragging = dragNodeId === node.id
  const indent = depth * 12 + 8

  const handleSelect = () => useFileStore.getState().selectNode(node.id)

  const handleDelete = () => {
    const store = useFileStore.getState()
    if (folder) store.requestDelete(node)
    else store.deleteNode(node.id)
  }

  const handleDragStart = (e: DragEvent) => {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', node.id)
    useFileStore.getState().setDragNodeId(node.id)
  }

  const handleDragEnd = () => {
    useFileStore.getState().setDragNodeId(null)
    setDropHint(null)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const draggedId = useFileStore.getState().dragNodeId
    if (!draggedId || draggedId === node.id) return

    if (folder) {
      e.dataTransfer.dropEffect = 'move'
      setDropHint('inside')
      return
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    setDropHint(e.clientY < mid ? 'before' : 'after')
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const draggedId = useFileStore.getState().dragNodeId
    if (!draggedId || draggedId === node.id) return

    const store = useFileStore.getState()
    const tree = store.tree

    if (folder && dropHint === 'inside') {
      const parent = findNodeById(tree, node.id)
      const index = parent?.children?.length ?? 0
      store.moveNode(draggedId, node.id, index)
    } else {
      const parentId = node.parentId
      const targetIndex =
        dropHint === 'before' ? siblingIndex : siblingIndex + 1
      store.moveNode(draggedId, parentId, targetIndex)
    }

    setDropHint(null)
    store.setDragNodeId(null)
  }

  const { Icon, className: iconClass } = folder
    ? { Icon: expanded ? FolderOpen : Folder, className: 'text-vsc-icon-folder' }
    : getFileIcon(node.name)

  return (
    <>
      <div
        role="treeitem"
        aria-expanded={folder ? expanded : undefined}
        aria-selected={isSelected}
        aria-level={depth + 1}
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={() => setDropHint(null)}
        onDrop={handleDrop}
        className={`group relative mx-1 flex h-[22px] cursor-pointer items-center gap-1 rounded-sm pr-1 text-[13px] transition-colors ${
          isSelected
            ? 'bg-vsc-active text-vsc-text'
            : 'text-vsc-text hover:bg-vsc-hover'
        } ${isDragging ? 'opacity-40' : ''} ${
          dropHint === 'inside' ? 'ring-1 ring-inset ring-vsc-accent' : ''
        }`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => {
          if (isRenaming) return
          handleSelect()
          if (folder) useFileStore.getState().toggleFolder(node.id)
        }}
      >
        <span className="flex h-[22px] w-4 shrink-0 items-center justify-center">
          {folder ? (
            <ChevronRight
              className={`h-4 w-4 text-vsc-muted transition-transform duration-200 ${
                expanded ? 'rotate-90' : ''
              }`}
              strokeWidth={1.5}
            />
          ) : (
            <span className="w-4" />
          )}
        </span>

        <Icon
          className={`h-4 w-4 shrink-0 ${iconClass}`}
          strokeWidth={1.5}
          fill={folder ? 'currentColor' : 'none'}
          fillOpacity={folder ? 0.15 : 0}
        />

        {isRenaming ? (
          <RenameInput
            value={node.name}
            onSubmit={(name) =>
              useFileStore.getState().renameNode(node.id, name)
            }
            onCancel={() => useFileStore.getState().cancelRename()}
          />
        ) : (
          <>
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
            <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
              {folder && (
                <>
                  <button
                    type="button"
                    title="New file in folder"
                    aria-label={`New file in ${node.name}`}
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-sm hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      useFileStore.getState().addNode(node.id, 'file')
                    }}
                  >
                    <FilePlus className="h-3 w-3 text-vsc-muted" />
                  </button>
                  <button
                    type="button"
                    title="New folder in folder"
                    aria-label={`New folder in ${node.name}`}
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-sm hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      useFileStore.getState().addNode(node.id, 'folder')
                    }}
                  >
                    <FolderPlus className="h-3 w-3 text-vsc-muted" />
                  </button>
                </>
              )}
              <button
                type="button"
                title="Rename"
                aria-label={`Rename ${node.name}`}
                className="flex h-[18px] w-[18px] items-center justify-center rounded-sm hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  useFileStore.getState().startRename(node.id)
                }}
              >
                <Pencil className="h-3 w-3 text-vsc-muted" />
              </button>
              <button
                type="button"
                title="Delete"
                aria-label={`Delete ${node.name}`}
                className="flex h-[18px] w-[18px] items-center justify-center rounded-sm hover:bg-white/10 hover:text-[#f14c4c]"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          </>
        )}
      </div>

      {folder && (
        <div className="tree-collapse" data-open={expanded}>
          <div className="tree-collapse-inner">
            {node.children && node.children.length > 0 ? (
              node.children.map((child, index) => (
                <TreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  siblingIndex={index}
                  siblingCount={node.children!.length}
                />
              ))
            ) : (
              expanded && (
                <p className="py-1 pl-10 text-[12px] italic text-vsc-muted">
                  Empty folder
                </p>
              )
            )}
          </div>
        </div>
      )}
    </>
  )
})
