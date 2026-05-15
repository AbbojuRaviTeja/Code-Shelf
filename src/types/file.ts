export type FileType = 'file' | 'folder'

export interface FileNode {
  id: string
  name: string
  type: FileType
  parentId: string | null
  createdAt: number
  expanded?: boolean
  content?: string
  children?: FileNode[]
}

export const isFileType = (value: unknown): value is FileType =>
  value === 'file' || value === 'folder'

export const isFolder = (node: FileNode): boolean => node.type === 'folder'

export const isFile = (node: FileNode): boolean => node.type === 'file'
