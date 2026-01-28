import { useCallback, useEffect } from 'react';
import { useExplorerStore } from '@/store/useExplorerStore';
import { getGitHubService } from '@/services/github';
import { HIDDEN_PATTERNS } from '@/config/hidden-patterns';
import type { FileNode } from '@/types/file';

export function useGitHubApi() {
  const {
    currentPath,
    setFileTree,
    setCurrentItems,
    setLoading,
    setError,
    sortField,
    sortOrder,
    filter
  } = useExplorerStore();

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
    }
  }, [currentPath, filterItems, sortItems, setCurrentItems, setLoading, setError]);

  const loadFullTree = useCallback(async () => {
    setLoading(true);
    try {
      const githubService = getGitHubService();
      const tree = await githubService.getFullTree();
      const filteredTree = tree.filter(node => !isHidden(node.name, node.path));
      setFileTree(filteredTree);
    } catch (error) {
      console.error('Failed to load file tree:', error);
    } finally {
      setLoading(false);
    }
  }, [isHidden, setFileTree, setLoading]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  useEffect(() => {
    loadFullTree();
  }, []);

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
