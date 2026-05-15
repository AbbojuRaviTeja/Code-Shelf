import type { FileNode } from '@/types/file'
import { isFileType } from '@/types/file'
import { sortExplorerTree } from '@/utils/treeHelpers'

export const STORAGE_KEY = 'file-explorer-tree'

const parseNode = (value: unknown): FileNode | null => {
  if (!value || typeof value !== 'object') return null
  const record = value as Record<string, unknown>

  if (
    typeof record.id !== 'string' ||
    typeof record.name !== 'string' ||
    !isFileType(record.type) ||
    (record.parentId !== null && typeof record.parentId !== 'string') ||
    typeof record.createdAt !== 'number'
  ) {
    return null
  }

  const base: FileNode = {
    id: record.id,
    name: record.name,
    type: record.type,
    parentId: record.parentId as string | null,
    createdAt: record.createdAt,
  }

  if (record.type === 'folder') {
    return {
      ...base,
      expanded: Boolean(record.expanded),
      children: Array.isArray(record.children)
        ? record.children
            .map(parseNode)
            .filter((n): n is FileNode => n !== null)
        : [],
    }
  }

  return {
    ...base,
    content: typeof record.content === 'string' ? record.content : '',
  }
}

export const parseTree = (value: unknown): FileNode[] => {
  if (!Array.isArray(value)) return []
  const nodes = value.map(parseNode).filter((n): n is FileNode => n !== null)
  return sortExplorerTree(nodes)
}

export const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      const raw = localStorage.getItem(name)
      if (!raw) return null
      JSON.parse(raw)
      return raw
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value)
    } catch {
      return
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name)
    } catch {
      return
    }
  },
}
