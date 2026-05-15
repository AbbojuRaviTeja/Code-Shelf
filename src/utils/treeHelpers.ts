import type { FileNode } from '@/types/file'
import { isFolder } from '@/types/file'

const compareExplorerNodes = (a: FileNode, b: FileNode): number => {
  if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

export const sortExplorerSiblings = (nodes: FileNode[]): FileNode[] =>
  [...nodes].sort(compareExplorerNodes)

export const sortExplorerTree = (tree: FileNode[]): FileNode[] =>
  sortExplorerSiblings(tree).map((node) => {
    if (!isFolder(node) || !node.children?.length) return node
    return { ...node, children: sortExplorerTree(node.children) }
  })

export const findNodeById = (
  tree: FileNode[],
  id: string,
): FileNode | null => {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

export const isDescendant = (
  tree: FileNode[],
  ancestorId: string,
  nodeId: string,
): boolean => {
  const ancestor = findNodeById(tree, ancestorId)
  if (!ancestor?.children) return false

  const walk = (nodes: FileNode[]): boolean => {
    for (const node of nodes) {
      if (node.id === nodeId) return true
      if (node.children && walk(node.children)) return true
    }
    return false
  }

  return walk(ancestor.children)
}

export const updateNodeById = (
  tree: FileNode[],
  id: string,
  updater: (node: FileNode) => FileNode,
): FileNode[] =>
  tree.map((node) => {
    if (node.id === id) return updater(node)
    if (node.children) {
      return {
        ...node,
        children: updateNodeById(node.children, id, updater),
      }
    }
    return node
  })

export const insertNode = (
  tree: FileNode[],
  parentId: string | null,
  newNode: FileNode,
  index?: number,
): FileNode[] => {
  let next: FileNode[]

  if (parentId === null) {
    if (index === undefined) next = [...tree, newNode]
    else {
      next = [...tree]
      next.splice(index, 0, newNode)
    }
  } else {
    next = updateNodeById(tree, parentId, (parent) => {
      if (!isFolder(parent)) return parent
      const children = [...(parent.children ?? [])]
      if (index === undefined) children.push(newNode)
      else children.splice(index, 0, newNode)
      return { ...parent, children, expanded: true }
    })
  }

  return sortExplorerTree(next)
}

export const renameNodeById = (
  tree: FileNode[],
  id: string,
  name: string,
): FileNode[] =>
  sortExplorerTree(
    updateNodeById(tree, id, (node) => ({ ...node, name })),
  )

export const deleteNodeById = (tree: FileNode[], id: string): FileNode[] =>
  tree
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children
        ? { ...node, children: deleteNodeById(node.children, id) }
        : node,
    )

export const extractNode = (
  tree: FileNode[],
  id: string,
): { tree: FileNode[]; node: FileNode | null } => {
  const node = findNodeById(tree, id)
  if (!node) return { tree, node: null }
  return { tree: deleteNodeById(tree, id), node }
}

export const moveNodeById = (
  tree: FileNode[],
  nodeId: string,
  targetParentId: string | null,
  targetIndex?: number,
): FileNode[] => {
  if (nodeId === targetParentId) return tree
  if (targetParentId && isDescendant(tree, nodeId, targetParentId)) {
    return tree
  }

  const { tree: withoutNode, node } = extractNode(tree, nodeId)
  if (!node) return tree

  const moved: FileNode = {
    ...node,
    parentId: targetParentId,
    children: isFolder(node) ? node.children ?? [] : undefined,
  }

  return insertNode(withoutNode, targetParentId, moved, targetIndex)
}

export const reorderTree = (
  tree: FileNode[],
  parentId: string | null,
  fromIndex: number,
  toIndex: number,
): FileNode[] => {
  const reorder = (siblings: FileNode[]): FileNode[] => {
    const next = [...siblings]
    const [item] = next.splice(fromIndex, 1)
    if (!item) return siblings
    next.splice(toIndex, 0, item)
    return next
  }

  if (parentId === null) return sortExplorerTree(reorder(tree))

  return sortExplorerTree(
    updateNodeById(tree, parentId, (parent) => {
      if (!isFolder(parent) || !parent.children) return parent
      return { ...parent, children: reorder(parent.children) }
    }),
  )
}

export const toggleExpandedById = (
  tree: FileNode[],
  id: string,
): FileNode[] =>
  updateNodeById(tree, id, (node) => {
    if (!isFolder(node)) return node
    return { ...node, expanded: !node.expanded }
  })

export const updateContentById = (
  tree: FileNode[],
  id: string,
  content: string,
): FileNode[] =>
  updateNodeById(tree, id, (node) => {
    if (isFolder(node)) return node
    return { ...node, content }
  })

export const countDescendants = (node: FileNode): number => {
  if (!isFolder(node) || !node.children?.length) return 0
  return node.children.reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0,
  )
}
