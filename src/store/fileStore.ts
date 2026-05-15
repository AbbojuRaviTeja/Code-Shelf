import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { FileNode, FileType } from '@/types/file'
import { isFolder } from '@/types/file'
import {
  countDescendants,
  deleteNodeById,
  findNodeById,
  insertNode,
  moveNodeById,
  renameNodeById,
  reorderTree,
  toggleExpandedById,
  updateContentById,
} from '@/utils/treeHelpers'
import { parseTree, safeStorage, STORAGE_KEY } from '@/utils/localStorage'
import {
  generateDefaultName,
  isGeneratedDefaultName,
  sanitizeNodeName,
} from '@/utils/nodeNames'

interface PendingDelete {
  id: string
  name: string
  type: FileType
  childCount: number
}

interface FileStore {
  tree: FileNode[]
  selectedId: string | null
  openFileId: string | null
  renamingId: string | null
  pendingDelete: PendingDelete | null
  dragNodeId: string | null
  addNode: (parentId: string | null, type: FileType) => void
  renameNode: (id: string, name: string) => void
  deleteNode: (id: string) => void
  requestDelete: (node: FileNode) => void
  confirmDelete: () => void
  cancelDelete: () => void
  moveNode: (
    nodeId: string,
    targetParentId: string | null,
    targetIndex?: number,
  ) => void
  toggleFolder: (id: string) => void
  reorderNodes: (
    parentId: string | null,
    fromIndex: number,
    toIndex: number,
  ) => void
  selectNode: (id: string | null) => void
  openFile: (id: string) => void
  updateFileContent: (id: string, content: string) => void
  setDragNodeId: (id: string | null) => void
  startRename: (id: string) => void
  cancelRename: () => void
}

const getSiblings = (
  tree: FileNode[],
  parentId: string | null,
): FileNode[] => {
  if (parentId === null) return tree
  const parent = findNodeById(tree, parentId)
  return parent && isFolder(parent) ? (parent.children ?? []) : []
}

const createNode = (
  type: FileType,
  parentId: string | null,
  siblings: FileNode[],
): FileNode => {
  const base = {
    id: uuid(),
    name: generateDefaultName(siblings, type),
    type,
    parentId,
    createdAt: Date.now(),
  }
  if (type === 'folder') {
    return { ...base, type: 'folder', children: [], expanded: true }
  }
  return { ...base, type: 'file', content: '' }
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      tree: [],
      selectedId: null,
      openFileId: null,
      renamingId: null,
      pendingDelete: null,
      dragNodeId: null,

      addNode: (parentId, type) => {
        const { tree } = get()
        const newNode = createNode(type, parentId, getSiblings(tree, parentId))
        set((state) => ({
          tree: insertNode(state.tree, parentId, newNode),
          selectedId: newNode.id,
          renamingId: newNode.id,
          openFileId: type === 'file' ? newNode.id : state.openFileId,
        }))
      },

      renameNode: (id, name) => {
        const { tree } = get()
        const node = findNodeById(tree, id)
        const sanitized = sanitizeNodeName(name)

        if (!sanitized) {
          if (node && isGeneratedDefaultName(node.name, node.type)) {
            get().deleteNode(id)
          }
          set({ renamingId: null })
          return
        }

        set((state) => ({
          tree: renameNodeById(state.tree, id, sanitized),
          renamingId: null,
        }))
      },

      deleteNode: (id) => {
        const { tree, selectedId, openFileId, renamingId } = get()
        set({
          tree: deleteNodeById(tree, id),
          selectedId: selectedId === id ? null : selectedId,
          openFileId: openFileId === id ? null : openFileId,
          renamingId: renamingId === id ? null : renamingId,
        })
      },

      requestDelete: (node) => {
        if (!isFolder(node)) {
          get().deleteNode(node.id)
          return
        }
        set({
          pendingDelete: {
            id: node.id,
            name: node.name,
            type: node.type,
            childCount: countDescendants(node),
          },
        })
      },

      confirmDelete: () => {
        const { pendingDelete } = get()
        if (!pendingDelete) return
        get().deleteNode(pendingDelete.id)
        set({ pendingDelete: null })
      },

      cancelDelete: () => set({ pendingDelete: null }),

      moveNode: (nodeId, targetParentId, targetIndex) =>
        set((state) => ({
          tree: moveNodeById(
            state.tree,
            nodeId,
            targetParentId,
            targetIndex,
          ),
        })),

      toggleFolder: (id) =>
        set((state) => ({ tree: toggleExpandedById(state.tree, id) })),

      reorderNodes: (parentId, fromIndex, toIndex) =>
        set((state) => ({
          tree: reorderTree(state.tree, parentId, fromIndex, toIndex),
        })),

      selectNode: (id) => {
        const node = id ? findNodeById(get().tree, id) : null
        set({
          selectedId: id,
          openFileId:
            node && !isFolder(node) ? node.id : get().openFileId,
        })
      },

      openFile: (id) => {
        const node = findNodeById(get().tree, id)
        if (!node || isFolder(node)) return
        set({ selectedId: id, openFileId: id })
      },

      updateFileContent: (id, content) =>
        set((state) => ({
          tree: updateContentById(state.tree, id, content),
        })),

      setDragNodeId: (id) => set({ dragNodeId: id }),

      startRename: (id) => set({ renamingId: id, selectedId: id }),

      cancelRename: () => {
        const { renamingId, tree } = get()
        if (renamingId) {
          const node = findNodeById(tree, renamingId)
          if (node && isGeneratedDefaultName(node.name, node.type)) {
            get().deleteNode(renamingId)
            return
          }
        }
        set({ renamingId: null })
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ tree: state.tree }),
      merge: (persisted, current) => ({
        ...current,
        tree: parseTree(
          (persisted as { tree?: unknown } | undefined)?.tree,
        ),
      }),
    },
  ),
)

export type { FileStore, PendingDelete }
