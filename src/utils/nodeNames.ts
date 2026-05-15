import type { FileNode, FileType } from '@/types/file'

export const NEW_FILE_BASE = 'New File'
export const NEW_FOLDER_BASE = 'New Folder'

const INVALID_NAME_CHARS = /[\\/:*?"<>|]/g

const baseForType = (type: FileType) =>
  type === 'folder' ? NEW_FOLDER_BASE : NEW_FILE_BASE

export const sanitizeNodeName = (raw: string): string =>
  raw.trim().replace(INVALID_NAME_CHARS, '').trim()

export const isGeneratedDefaultName = (name: string, type: FileType): boolean => {
  const base = baseForType(type)
  if (name === base) return true
  const match = name.match(/^(.+?) (\d+)$/)
  return match?.[1] === base
}

export const generateDefaultName = (
  siblings: FileNode[],
  type: FileType,
): string => {
  const base = baseForType(type)
  const taken = new Set(siblings.map((n) => n.name.toLowerCase()))
  if (!taken.has(base.toLowerCase())) return base
  let index = 2
  while (taken.has(`${base} ${index}`.toLowerCase())) index += 1
  return `${base} ${index}`
}
