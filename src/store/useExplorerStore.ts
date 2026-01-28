import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileNode, ViewMode, SortField, SortOrder, FileFilter } from '@/types/file';

interface ExplorerState {
  // Navigation
  currentPath: string;
  pathHistory: string[];
  historyIndex: number;

  // File tree
  fileTree: FileNode[];
  currentItems: FileNode[];
  isLoading: boolean;
  error: string | null;

  // Selection
  selectedItems: Set<string>;
  focusedItem: string | null;

  // View settings
  viewMode: ViewMode;
  sortField: SortField;
  sortOrder: SortOrder;
  filter: FileFilter;

  // Preview
  previewFile: FileNode | null;
  isPreviewOpen: boolean;

  // Sidebar
  isSidebarOpen: boolean;
  expandedFolders: Set<string>;

  // Actions
  setCurrentPath: (path: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;

  setFileTree: (tree: FileNode[]) => void;
  setCurrentItems: (items: FileNode[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  selectItem: (path: string, isMulti?: boolean) => void;
  clearSelection: () => void;
  setFocusedItem: (path: string | null) => void;

  setViewMode: (mode: ViewMode) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  setFilter: (filter: Partial<FileFilter>) => void;

  setPreviewFile: (file: FileNode | null) => void;
  togglePreview: () => void;

  toggleSidebar: () => void;
  toggleFolderExpand: (path: string) => void;

  reset: () => void;
}

const initialState = {
  currentPath: '',
  pathHistory: [''],
  historyIndex: 0,
  fileTree: [] as FileNode[],
  currentItems: [] as FileNode[],
  isLoading: false,
  error: null as string | null,
  selectedItems: new Set<string>(),
  focusedItem: null as string | null,
  viewMode: 'grid' as ViewMode,
  sortField: 'name' as SortField,
  sortOrder: 'asc' as SortOrder,
  filter: {
    searchQuery: '',
    fileTypes: [] as string[],
    showHidden: false
  },
  previewFile: null as FileNode | null,
  isPreviewOpen: false,
  isSidebarOpen: true,
  expandedFolders: new Set<string>()
};

export const useExplorerStore = create<ExplorerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentPath: (path) => {
        const { pathHistory, historyIndex } = get();
        const newHistory = pathHistory.slice(0, historyIndex + 1);
        newHistory.push(path);
        set({
          currentPath: path,
          pathHistory: newHistory,
          historyIndex: newHistory.length - 1,
          selectedItems: new Set(),
          focusedItem: null
        });
      },

      navigateBack: () => {
        const { historyIndex, pathHistory } = get();
        if (historyIndex > 0) {
          set({
            historyIndex: historyIndex - 1,
            currentPath: pathHistory[historyIndex - 1],
            selectedItems: new Set()
          });
        }
      },

      navigateForward: () => {
        const { historyIndex, pathHistory } = get();
        if (historyIndex < pathHistory.length - 1) {
          set({
            historyIndex: historyIndex + 1,
            currentPath: pathHistory[historyIndex + 1],
            selectedItems: new Set()
          });
        }
      },

      navigateUp: () => {
        const { currentPath, setCurrentPath } = get();
        const parts = currentPath.split('/').filter(Boolean);
        if (parts.length > 0) {
          parts.pop();
          setCurrentPath(parts.join('/'));
        }
      },

      setFileTree: (tree) => set({ fileTree: tree }),
      setCurrentItems: (items) => set({ currentItems: items }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      selectItem: (path, isMulti = false) => {
        const { selectedItems } = get();
        const newSelection = new Set(isMulti ? selectedItems : []);

        if (newSelection.has(path)) {
          newSelection.delete(path);
        } else {
          newSelection.add(path);
        }

        set({ selectedItems: newSelection, focusedItem: path });
      },

      clearSelection: () => set({ selectedItems: new Set() }),
      setFocusedItem: (path) => set({ focusedItem: path }),

      setViewMode: (mode) => set({ viewMode: mode }),
      setSortField: (field) => set({ sortField: field }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setFilter: (filter) => set(state => ({
        filter: { ...state.filter, ...filter }
      })),

      setPreviewFile: (file) => set({ previewFile: file, isPreviewOpen: !!file }),
      togglePreview: () => set(state => ({ isPreviewOpen: !state.isPreviewOpen })),

      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleFolderExpand: (path) => {
        const { expandedFolders } = get();
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
          newExpanded.delete(path);
        } else {
          newExpanded.add(path);
        }
        set({ expandedFolders: newExpanded });
      },

      reset: () => set({
        ...initialState,
        selectedItems: new Set(),
        expandedFolders: new Set()
      })
    }),
    {
      name: 'explorer-storage',
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
        isSidebarOpen: state.isSidebarOpen
      })
    }
  )
);
