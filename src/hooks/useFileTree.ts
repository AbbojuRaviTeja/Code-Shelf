import { useShallow } from 'zustand/react/shallow'
import { useFileStore } from '@/store/fileStore'

export const useFileTree = () =>
  useFileStore(
    useShallow((state) => ({
      tree: state.tree,
      selectedId: state.selectedId,
      openFileId: state.openFileId,
      renamingId: state.renamingId,
      pendingDelete: state.pendingDelete,
      dragNodeId: state.dragNodeId,
      addNode: state.addNode,
      renameNode: state.renameNode,
      requestDelete: state.requestDelete,
      confirmDelete: state.confirmDelete,
      cancelDelete: state.cancelDelete,
      moveNode: state.moveNode,
      toggleFolder: state.toggleFolder,
      reorderNodes: state.reorderNodes,
      selectNode: state.selectNode,
      openFile: state.openFile,
      updateFileContent: state.updateFileContent,
      setDragNodeId: state.setDragNodeId,
      startRename: state.startRename,
      cancelRename: state.cancelRename,
    })),
  )
