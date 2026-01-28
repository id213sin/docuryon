import { useCallback, useEffect, useRef } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { getLocalFileService } from '@/services/local';
import { HIDDEN_PATTERNS } from '@/config/hidden-patterns';
import { logDebug, logInfo, logError, logWarn } from '@/services/debug';
import type { FileNode } from '@/types/file';

let effectRunCount = 0;
let lastEffectTime = Date.now();

export function useLocalFiles() {
  const currentPath = useExplorerStore((state) => state.currentPath);
  const setFileTree = useExplorerStore((state) => state.setFileTree);
  const setCurrentItems = useExplorerStore((state) => state.setCurrentItems);
  const setLoading = useExplorerStore((state) => state.setLoading);
  const setError = useExplorerStore((state) => state.setError);
  const sortField = useExplorerStore((state) => state.sortField);
  const sortOrder = useExplorerStore((state) => state.sortOrder);
  const filter = useExplorerStore((state) => state.filter);

  const isLoadingRef = useRef(false);
  const hasLoadedTreeRef = useRef(false);

  const isHidden = useCallback((name: string, path: string): boolean => {
    return HIDDEN_PATTERNS.some(pattern => {
      if (typeof pattern === 'string') {
        return name === pattern || path.startsWith(pattern);
      }
      return pattern.test(name) || pattern.test(path);
    });
  }, []);

  const filterItems = useCallback(
    (items: FileNode[]): FileNode[] => {
      return items.filter(item => {
        if (!filter.showHidden && isHidden(item.name, item.path)) {
          return false;
        }

        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase();
          if (!item.name.toLowerCase().includes(query)) {
            return false;
          }
        }

        if (filter.fileTypes.length > 0 && item.type === 'file') {
          const ext = item.name.split('.').pop()?.toLowerCase();
          if (!ext || !filter.fileTypes.includes(ext)) {
            return false;
          }
        }

        return true;
      });
    },
    [filter, isHidden]
  );

  const sortItems = useCallback(
    (items: FileNode[]): FileNode[] => {
      const sorted = [...items].sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }

        let comparison = 0;
        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'size':
            comparison = (a.size || 0) - (b.size || 0);
            break;
          case 'type': {
            const extA = a.name.split('.').pop() || '';
            const extB = b.name.split('.').pop() || '';
            comparison = extA.localeCompare(extB);
            break;
          }
          default:
            comparison = a.name.localeCompare(b.name);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      return sorted;
    },
    [sortField, sortOrder]
  );

  const loadDirectory = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const localService = getLocalFileService();
      const items = await localService.getDirectoryContents(currentPath);
      const filteredItems = filterItems(items as FileNode[]);
      const sortedItems = sortItems(filteredItems);
      setCurrentItems(sortedItems);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load directory');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [currentPath, filterItems, sortItems, setCurrentItems, setLoading, setError]);

  const loadFullTree = useCallback(async () => {
    if (hasLoadedTreeRef.current) return;
    hasLoadedTreeRef.current = true;
    setLoading(true);
    try {
      const localService = getLocalFileService();
      const tree = await localService.getFullTree();
      const filteredTree = tree.filter(node => !isHidden(node.name, node.path));
      setFileTree(filteredTree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
      hasLoadedTreeRef.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [isHidden, setFileTree, setLoading]);

  // Load directory when path changes
  useEffect(() => {
    const abortController = new AbortController();

    effectRunCount++;
    const now = Date.now();
    const timeSinceLastRun = now - lastEffectTime;
    lastEffectTime = now;

    logDebug('useLocalFiles', `Effect triggered #${effectRunCount}`, {
      currentPath,
      timeSinceLastRun,
      isLoading: isLoadingRef.current,
      filter: { showHidden: filter.showHidden, searchQuery: filter.searchQuery, fileTypes: filter.fileTypes },
      sortField,
      sortOrder,
    });

    // Detect rapid re-renders (potential infinite loop)
    if (timeSinceLastRun < 50 && effectRunCount > 5) {
      logWarn('useLocalFiles', `Rapid effect execution detected! Run #${effectRunCount}, ${timeSinceLastRun}ms since last run`, {
        effectRunCount,
        timeSinceLastRun,
      });
    }

    const loadData = async () => {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      logInfo('useLocalFiles', `Loading directory: "${currentPath || '(root)'}"`, { currentPath });

      try {
        const localService = getLocalFileService();
        logDebug('useLocalFiles', 'Fetching directory contents from local file service');
        const items = await localService.getDirectoryContents(currentPath);

        if (abortController.signal.aborted) {
          logDebug('useLocalFiles', 'Effect aborted, skipping directory update');
          return;
        }

        logDebug('useLocalFiles', `Received ${items.length} items`);

        const filteredItems = (items as FileNode[]).filter(item => {
          if (!filter.showHidden) {
            const hidden = HIDDEN_PATTERNS.some(pattern => {
              if (typeof pattern === 'string') {
                return item.name === pattern || item.path.startsWith(pattern);
              }
              return pattern.test(item.name) || pattern.test(item.path);
            });
            if (hidden) return false;
          }

          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            if (!item.name.toLowerCase().includes(query)) {
              return false;
            }
          }

          if (filter.fileTypes.length > 0 && item.type === 'file') {
            const ext = item.name.split('.').pop()?.toLowerCase();
            if (!ext || !filter.fileTypes.includes(ext)) {
              return false;
            }
          }

          return true;
        });

        const sortedItems = [...filteredItems].sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }

          let comparison = 0;
          switch (sortField) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'size':
              comparison = (a.size || 0) - (b.size || 0);
              break;
            case 'type': {
              const extA = a.name.split('.').pop() || '';
              const extB = b.name.split('.').pop() || '';
              comparison = extA.localeCompare(extB);
              break;
            }
            default:
              comparison = a.name.localeCompare(b.name);
          }

          return sortOrder === 'asc' ? comparison : -comparison;
        });

        logInfo('useLocalFiles', `Directory loaded successfully: ${sortedItems.length} items`, {
          path: currentPath,
          totalItems: items.length,
          filteredItems: filteredItems.length,
          sortedItems: sortedItems.length,
        });
        setCurrentItems(sortedItems);
        setLoading(false);
        isLoadingRef.current = false;
        logDebug('useLocalFiles', 'Load complete, isLoadingRef reset');
      } catch (error) {
        if (!abortController.signal.aborted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load directory';
          logError('useLocalFiles', `Failed to load directory: ${errorMessage}`, { error, currentPath });
          setError(errorMessage);
          setLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadData();

    return () => {
      abortController.abort();
      isLoadingRef.current = false;
    };
  }, [currentPath, filter.showHidden, filter.searchQuery, filter.fileTypes, sortField, sortOrder, setCurrentItems, setLoading, setError]);

  // Load full tree once on mount
  useEffect(() => {
    const abortController = new AbortController();

    if (hasLoadedTreeRef.current) {
      logDebug('useLocalFiles', 'Tree already loaded, skipping');
      return;
    }

    logInfo('useLocalFiles', 'Loading full file tree on mount');

    const loadTree = async () => {
      try {
        const localService = getLocalFileService();
        logDebug('useLocalFiles', 'Fetching full tree from local file service');
        const tree = await localService.getFullTree();

        if (abortController.signal.aborted) {
          logDebug('useLocalFiles', 'Effect aborted, skipping tree update');
          return;
        }

        logDebug('useLocalFiles', `Received ${tree.length} tree items`);

        const filteredTree = tree.filter(node => {
          return !HIDDEN_PATTERNS.some(pattern => {
            if (typeof pattern === 'string') {
              return node.name === pattern || node.path.startsWith(pattern);
            }
            return pattern.test(node.name) || pattern.test(node.path);
          });
        });

        logInfo('useLocalFiles', `File tree loaded: ${filteredTree.length} items after filtering`, {
          total: tree.length,
          filtered: filteredTree.length,
        });
        setFileTree(filteredTree);
        hasLoadedTreeRef.current = true;
      } catch (error) {
        if (!abortController.signal.aborted) {
          logError('useLocalFiles', 'Failed to load file tree', { error });
        }
      }
    };

    loadTree();

    return () => {
      abortController.abort();
    };
  }, [setFileTree]);

  const getRawUrl = useCallback((path: string) => {
    const localService = getLocalFileService();
    return localService.getRawUrl(path);
  }, []);

  const getFileContent = useCallback((path: string) => {
    const localService = getLocalFileService();
    return localService.getFileContent(path);
  }, []);

  return {
    loadDirectory,
    loadFullTree,
    getRawUrl,
    getFileContent
  };
}
