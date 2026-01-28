import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useExplorerStore } from '@/store/useExplorerStore';
import type { FileNode } from '@/types/file';

describe('useExplorerStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useExplorerStore.getState().reset();
    });
  });

  describe('navigation', () => {
    describe('setCurrentPath', () => {
      it('should set current path', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentPath('folder/subfolder');
        });

        expect(result.current.currentPath).toBe('folder/subfolder');
      });

      it('should update path history', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentPath('folder1');
          result.current.setCurrentPath('folder1/subfolder');
          result.current.setCurrentPath('folder2');
        });

        expect(result.current.pathHistory).toEqual(['', 'folder1', 'folder1/subfolder', 'folder2']);
        expect(result.current.historyIndex).toBe(3);
      });

      it('should clear selection when navigating', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.selectItem('file1.txt');
          result.current.selectItem('file2.txt', true);
        });

        expect(result.current.selectedItems.size).toBe(2);

        act(() => {
          result.current.setCurrentPath('new/path');
        });

        expect(result.current.selectedItems.size).toBe(0);
      });
    });

    describe('navigateBack', () => {
      it('should navigate to previous path in history', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentPath('folder1');
          result.current.setCurrentPath('folder2');
          result.current.navigateBack();
        });

        expect(result.current.currentPath).toBe('folder1');
        expect(result.current.historyIndex).toBe(1);
      });

      it('should not navigate back beyond history start', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.navigateBack();
        });

        expect(result.current.currentPath).toBe('');
        expect(result.current.historyIndex).toBe(0);
      });
    });

    describe('navigateForward', () => {
      it('should navigate forward in history', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentPath('folder1');
          result.current.setCurrentPath('folder2');
          result.current.navigateBack();
          result.current.navigateForward();
        });

        expect(result.current.currentPath).toBe('folder2');
      });

      it('should not navigate forward beyond history end', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentPath('folder1');
          result.current.navigateForward();
        });

        expect(result.current.currentPath).toBe('folder1');
      });
    });

    describe('navigateUp', () => {
      it('should navigate to parent directory', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentPath('folder/subfolder/deep');
          result.current.navigateUp();
        });

        expect(result.current.currentPath).toBe('folder/subfolder');
      });

      it('should handle root directory', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.navigateUp();
        });

        expect(result.current.currentPath).toBe('');
      });
    });
  });

  describe('file tree management', () => {
    const mockTree: FileNode[] = [
      { name: 'folder1', path: 'folder1', type: 'directory', sha: 'sha1', url: '' },
      { name: 'file1.txt', path: 'file1.txt', type: 'file', sha: 'sha2', url: '' },
    ];

    describe('setFileTree', () => {
      it('should set file tree', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setFileTree(mockTree);
        });

        expect(result.current.fileTree).toEqual(mockTree);
      });
    });

    describe('setCurrentItems', () => {
      it('should set current items', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setCurrentItems(mockTree);
        });

        expect(result.current.currentItems).toEqual(mockTree);
      });
    });
  });

  describe('loading and error state', () => {
    describe('setLoading', () => {
      it('should set loading state', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setLoading(true);
        });

        expect(result.current.isLoading).toBe(true);

        act(() => {
          result.current.setLoading(false);
        });

        expect(result.current.isLoading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error message', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setError('Something went wrong');
        });

        expect(result.current.error).toBe('Something went wrong');
      });

      it('should clear error', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setError('Error');
          result.current.setError(null);
        });

        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('selection', () => {
    describe('selectItem', () => {
      it('should select a single item', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.selectItem('file1.txt');
        });

        expect(result.current.selectedItems.has('file1.txt')).toBe(true);
        expect(result.current.focusedItem).toBe('file1.txt');
      });

      it('should replace selection without multi-select', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.selectItem('file1.txt');
          result.current.selectItem('file2.txt');
        });

        expect(result.current.selectedItems.size).toBe(1);
        expect(result.current.selectedItems.has('file2.txt')).toBe(true);
      });

      it('should add to selection with multi-select', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.selectItem('file1.txt');
          result.current.selectItem('file2.txt', true);
        });

        expect(result.current.selectedItems.size).toBe(2);
        expect(result.current.selectedItems.has('file1.txt')).toBe(true);
        expect(result.current.selectedItems.has('file2.txt')).toBe(true);
      });

      it('should toggle selection with multi-select', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.selectItem('file1.txt');
          result.current.selectItem('file2.txt', true);
          result.current.selectItem('file1.txt', true);
        });

        expect(result.current.selectedItems.size).toBe(1);
        expect(result.current.selectedItems.has('file2.txt')).toBe(true);
      });
    });

    describe('clearSelection', () => {
      it('should clear all selections', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.selectItem('file1.txt');
          result.current.selectItem('file2.txt', true);
          result.current.clearSelection();
        });

        expect(result.current.selectedItems.size).toBe(0);
      });
    });

    describe('setFocusedItem', () => {
      it('should set focused item', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setFocusedItem('file1.txt');
        });

        expect(result.current.focusedItem).toBe('file1.txt');
      });
    });
  });

  describe('view settings', () => {
    describe('setViewMode', () => {
      it('should set view mode to grid', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setViewMode('grid');
        });

        expect(result.current.viewMode).toBe('grid');
      });

      it('should set view mode to list', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setViewMode('list');
        });

        expect(result.current.viewMode).toBe('list');
      });
    });

    describe('setSortField', () => {
      it('should set sort field', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setSortField('size');
        });

        expect(result.current.sortField).toBe('size');
      });
    });

    describe('setSortOrder', () => {
      it('should set sort order', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setSortOrder('desc');
        });

        expect(result.current.sortOrder).toBe('desc');
      });
    });

    describe('setFilter', () => {
      it('should update filter partially', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setFilter({ searchQuery: 'test' });
        });

        expect(result.current.filter.searchQuery).toBe('test');
        expect(result.current.filter.showHidden).toBe(false); // unchanged
      });

      it('should update multiple filter properties', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setFilter({
            searchQuery: 'readme',
            fileTypes: ['md', 'txt'],
            showHidden: true,
          });
        });

        expect(result.current.filter.searchQuery).toBe('readme');
        expect(result.current.filter.fileTypes).toEqual(['md', 'txt']);
        expect(result.current.filter.showHidden).toBe(true);
      });
    });
  });

  describe('preview', () => {
    const mockFile: FileNode = {
      name: 'readme.md',
      path: 'readme.md',
      type: 'file',
      sha: 'sha123',
      url: 'https://example.com',
    };

    describe('setPreviewFile', () => {
      it('should set preview file and open preview', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setPreviewFile(mockFile);
        });

        expect(result.current.previewFile).toEqual(mockFile);
        expect(result.current.isPreviewOpen).toBe(true);
      });

      it('should close preview when file is null', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.setPreviewFile(mockFile);
          result.current.setPreviewFile(null);
        });

        expect(result.current.previewFile).toBeNull();
        expect(result.current.isPreviewOpen).toBe(false);
      });
    });

    describe('togglePreview', () => {
      it('should toggle preview state', () => {
        const { result } = renderHook(() => useExplorerStore());

        expect(result.current.isPreviewOpen).toBe(false);

        act(() => {
          result.current.togglePreview();
        });

        expect(result.current.isPreviewOpen).toBe(true);

        act(() => {
          result.current.togglePreview();
        });

        expect(result.current.isPreviewOpen).toBe(false);
      });
    });
  });

  describe('sidebar', () => {
    describe('toggleSidebar', () => {
      it('should toggle sidebar visibility', () => {
        const { result } = renderHook(() => useExplorerStore());

        expect(result.current.isSidebarOpen).toBe(true); // default

        act(() => {
          result.current.toggleSidebar();
        });

        expect(result.current.isSidebarOpen).toBe(false);

        act(() => {
          result.current.toggleSidebar();
        });

        expect(result.current.isSidebarOpen).toBe(true);
      });
    });

    describe('toggleFolderExpand', () => {
      it('should expand folder', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.toggleFolderExpand('folder1');
        });

        expect(result.current.expandedFolders.has('folder1')).toBe(true);
      });

      it('should collapse expanded folder', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.toggleFolderExpand('folder1');
          result.current.toggleFolderExpand('folder1');
        });

        expect(result.current.expandedFolders.has('folder1')).toBe(false);
      });

      it('should handle multiple folders', () => {
        const { result } = renderHook(() => useExplorerStore());

        act(() => {
          result.current.toggleFolderExpand('folder1');
          result.current.toggleFolderExpand('folder2');
        });

        expect(result.current.expandedFolders.has('folder1')).toBe(true);
        expect(result.current.expandedFolders.has('folder2')).toBe(true);
      });
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useExplorerStore());

      // Make various changes
      act(() => {
        result.current.setCurrentPath('some/path');
        result.current.setViewMode('list');
        result.current.setSortField('size');
        result.current.selectItem('file.txt');
        result.current.toggleFolderExpand('folder');
        result.current.setError('Some error');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.currentPath).toBe('');
      expect(result.current.viewMode).toBe('grid');
      expect(result.current.sortField).toBe('name');
      expect(result.current.selectedItems.size).toBe(0);
      expect(result.current.expandedFolders.size).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });
});
