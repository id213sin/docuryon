import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { FileExplorer } from '@/components/explorer/FileExplorer';
import { useExplorerStore } from '@/store/useExplorerStore';
import { act } from 'react';
import type { FileNode } from '@/types/file';

// Mock the useGitHubApi hook
vi.mock('@/hooks/useGitHubApi', () => ({
  useGitHubApi: () => ({
    getRawUrl: vi.fn((path: string) => `https://raw.example.com/${path}`),
    loadDirectory: vi.fn(),
    loadFullTree: vi.fn(),
    getFileContent: vi.fn(),
  }),
}));

// Mock useKeyboardNavigation hook
vi.mock('@/hooks/useKeyboardNavigation', () => ({
  useKeyboardNavigation: vi.fn(),
}));

describe('FileExplorer', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useExplorerStore.getState().reset();
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      // Set loading state
      act(() => {
        useExplorerStore.getState().setLoading(true);
      });

      render(<FileExplorer />);

      // Check for loading indicator (Spinner component should be present)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show loading on initial mount before data loads', () => {
      // Initial state should have isLoading: true
      // Reset to get fresh initial state
      act(() => {
        // Simulate initial state by setting loading true
        useExplorerStore.setState({ isLoading: true, currentItems: [] });
      });

      render(<FileExplorer />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty folder message when currentItems is empty and not loading', () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setCurrentItems([]);
      });

      render(<FileExplorer />);

      expect(screen.getByText('This folder is empty')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error message when there is an error', () => {
      const errorMessage = 'Failed to load directory contents';

      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setError(errorMessage);
      });

      render(<FileExplorer />);

      expect(screen.getByText('Error loading directory')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('content display', () => {
    const mockItems: FileNode[] = [
      { name: 'folder1', path: 'folder1', type: 'directory', sha: 'sha1', url: '' },
      { name: 'file1.txt', path: 'file1.txt', type: 'file', sha: 'sha2', url: '' },
      { name: 'readme.md', path: 'readme.md', type: 'file', sha: 'sha3', url: '' },
    ];

    it('should display file items when loaded', async () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setCurrentItems(mockItems);
      });

      render(<FileExplorer />);

      await waitFor(() => {
        expect(screen.getByText('folder1')).toBeInTheDocument();
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('readme.md')).toBeInTheDocument();
      });
    });

    it('should render grid view by default', () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setCurrentItems(mockItems);
        useExplorerStore.getState().setViewMode('grid');
      });

      render(<FileExplorer />);

      // Grid view uses a grid layout
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render list view when viewMode is list', () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setCurrentItems(mockItems);
        useExplorerStore.getState().setViewMode('list');
      });

      render(<FileExplorer />);

      // List view shows column headers (Name, Size, Type)
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });
  });

  describe('breadcrumb navigation', () => {
    it('should show Root breadcrumb', () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setCurrentItems([]);
      });

      render(<FileExplorer />);

      expect(screen.getByText('Root')).toBeInTheDocument();
    });

    it('should show path parts in breadcrumb', () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.getState().setCurrentItems([]);
        useExplorerStore.setState({ currentPath: 'folder1/subfolder' });
      });

      render(<FileExplorer />);

      expect(screen.getByText('Root')).toBeInTheDocument();
      expect(screen.getByText('folder1')).toBeInTheDocument();
      expect(screen.getByText('subfolder')).toBeInTheDocument();
    });
  });
});
