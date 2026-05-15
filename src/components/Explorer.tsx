import { useState, useCallback } from 'react'
import type { FileNode } from '@/types/file'
import { isFolder } from '@/types/file'
import { useFileTree } from '@/hooks/useFileTree'
import { useStoreHydration } from '@/hooks/useStoreHydration'
import { Toolbar } from './Toolbar'
import { TreeNode } from './TreeNode'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'
import { useFileStore } from '@/store/fileStore'

type ContextTarget = { x: number; y: number; node: FileNode | null }

export function Explorer() {
  const [sectionOpen, setSectionOpen] = useState(true)
  const [menu, setMenu] = useState<ContextTarget | null>(null)

  const hydrated = useStoreHydration()
  const {
    tree,
    pendingDelete,
    confirmDelete,
    cancelDelete,
    addNode,
    requestDelete,
    startRename,
  } = useFileTree()

  const openContextMenu = useCallback((e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    useFileStore.getState().selectNode(node.id)
    setMenu({ x: e.clientX, y: e.clientY, node })
  }, [])

  const openRootContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY, node: null })
  }, [])

  const buildMenuItems = (node: FileNode | null): ContextMenuItem[] => {
    const parentId = node
      ? isFolder(node)
        ? node.id
        : node.parentId
      : null

    const items: ContextMenuItem[] = [
      { label: 'New File', onClick: () => addNode(parentId, 'file') },
      { label: 'New Folder', onClick: () => addNode(parentId, 'folder') },
    ]

    if (node) {
      items.push(
        { label: 'Rename', onClick: () => startRename(node.id) },
        {
          label: 'Delete',
          danger: true,
          onClick: () => {
            if (isFolder(node)) requestDelete(node)
            else useFileStore.getState().deleteNode(node.id)
          },
        },
      )
    }

    return items
  }

  return (
    <aside className="relative flex h-full min-h-0 w-full flex-col bg-vsc-sidebar">
      <Toolbar
        sectionOpen={sectionOpen}
        onToggleSection={() => setSectionOpen((v) => !v)}
        onNewFile={() => addNode(null, 'file')}
        onNewFolder={() => addNode(null, 'folder')}
      />

      <div
        className="tree-collapse flex min-h-0 flex-1 flex-col"
        data-open={sectionOpen}
      >
        <div className="tree-collapse-inner flex min-h-0 flex-1 flex-col">
          <ul
            role="tree"
            aria-label="Files"
            className="vsc-scrollbar m-0 min-h-0 flex-1 list-none overflow-y-auto px-1 py-2"
            onContextMenu={openRootContextMenu}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const draggedId = useFileStore.getState().dragNodeId
              if (!draggedId) return
              useFileStore.getState().moveNode(draggedId, null)
              useFileStore.getState().setDragNodeId(null)
            }}
          >
            {!hydrated ? (
              <li className="list-none px-3 py-8 text-center text-[12px] text-vsc-muted">
                Loading workspace…
              </li>
            ) : tree.length === 0 ? (
              <li className="list-none px-3 py-8 text-center text-[12px] leading-relaxed text-vsc-muted">
                No files yet.
                <br />
                Use New File or New Folder above.
              </li>
            ) : (
              tree.map((node, index) => (
                <li
                  key={node.id}
                  className="list-none"
                  onContextMenu={(e) => openContextMenu(e, node)}
                >
                  <TreeNode
                    node={node}
                    depth={0}
                    siblingIndex={index}
                    siblingCount={tree.length}
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={buildMenuItems(menu.node)}
          onClose={() => setMenu(null)}
        />
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={cancelDelete}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-lg border border-vsc-border bg-vsc-sidebar p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[13px] font-semibold text-vsc-text">
              Delete folder?
            </h2>
            <p className="mt-2 text-[13px] text-vsc-muted">
              {pendingDelete.childCount > 0
                ? `Delete "${pendingDelete.name}" and ${pendingDelete.childCount} item(s) inside?`
                : `Delete "${pendingDelete.name}"?`}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded px-3 py-1.5 text-[13px] hover:bg-vsc-hover"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-[#c72e2e] px-3 py-1.5 text-[13px] text-white hover:bg-[#a82626]"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
