import { useCallback, useEffect, useRef } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { getGitHubService } from '@/services/github';
import { HIDDEN_PATTERNS } from '@/config/hidden-patterns';
import type { FileNode } from '@/types/file';

export function useGitHubApi() {
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
      const githubService = getGitHubService();
      const items = await githubService.getDirectoryContents(currentPath);
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
      const githubService = getGitHubService();
      const tree = await githubService.getFullTree();
      const filteredTree = tree.filter(node => !isHidden(node.name, node.path));
      setFileTree(filteredTree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
      hasLoadedTreeRef.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  }, [isHidden, setFileTree, setLoading]);

  // Load directory when path changes - use currentPath directly to avoid infinite loop
  useEffect(() => {
    const loadData = async () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const githubService = getGitHubService();
        const items = await githubService.getDirectoryContents(currentPath);
        // Apply filter and sort inline to avoid dependency on callbacks
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

        setCurrentItems(sortedItems);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load directory');
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadData();
  }, [currentPath, filter.showHidden, filter.searchQuery, filter.fileTypes, sortField, sortOrder, setCurrentItems, setLoading, setError]);

  // Load full tree once on mount
  useEffect(() => {
    if (hasLoadedTreeRef.current) return;
    hasLoadedTreeRef.current = true;

    const loadTree = async () => {
      try {
        const githubService = getGitHubService();
        const tree = await githubService.getFullTree();
        const filteredTree = tree.filter(node => {
          return !HIDDEN_PATTERNS.some(pattern => {
            if (typeof pattern === 'string') {
              return node.name === pattern || node.path.startsWith(pattern);
            }
            return pattern.test(node.name) || pattern.test(node.path);
          });
        });
        setFileTree(filteredTree);
      } catch (error) {
        console.error('Failed to load file tree:', error);
        hasLoadedTreeRef.current = false; // Allow retry on error
      }
    };

    loadTree();
  }, [setFileTree]);

  const getRawUrl = useCallback((path: string) => {
    const githubService = getGitHubService();
    return githubService.getRawUrl(path);
  }, []);

  const getFileContent = useCallback((path: string) => {
    const githubService = getGitHubService();
    return githubService.getFileContent(path);
  }, []);

  return {
    loadDirectory,
    loadFullTree,
    getRawUrl,
    getFileContent
  };
}
