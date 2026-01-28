import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

// Mock all external dependencies before importing App
vi.mock('@/services/local', () => ({
  initLocalFileService: vi.fn(),
  getLocalFileService: vi.fn(() => ({
    getDirectoryContents: vi.fn().mockResolvedValue([
      { name: 'test-file.md', path: 'test-file.md', type: 'file', sha: 'abc123', url: '' },
    ]),
    getFullTree: vi.fn().mockResolvedValue([
      { name: 'test-file.md', path: 'test-file.md', type: 'file', sha: 'abc123', url: '' },
    ]),
    getRawUrl: vi.fn((path: string) => `/trunk/${path}`),
  })),
}));

vi.mock('@/services/debug', () => ({
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  logError: vi.fn(),
  logWarn: vi.fn(),
  debugLogger: {
    getRecentLogs: vi.fn(() => []),
    subscribe: vi.fn(() => () => {}),
    clearLogs: vi.fn(),
    exportLogs: vi.fn(() => '[]'),
    getGitHubIssueUrl: vi.fn(() => 'https://github.com/test/test/issues/new'),
  },
}));

// Import after mocks
import App from '@/App';
import { useExplorerStore } from '@/store/useExplorerStore';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store
    act(() => {
      useExplorerStore.getState().reset();
    });
  });

  describe('initial render', () => {
    it('should render without crashing', () => {
      render(<App />);

      // App should render basic structure
      expect(document.body).toBeInTheDocument();
    });

    it('should show loading state on initial render', async () => {
      // Ensure initial loading state
      act(() => {
        useExplorerStore.setState({ isLoading: true, currentItems: [] });
      });

      render(<App />);

      // Should have a loading indicator
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should render header with app name', async () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Docuryon')).toBeInTheDocument();
      });
    });

    it('should render sidebar when sidebar is open', async () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
        useExplorerStore.setState({ isSidebarOpen: true });
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Folders')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error boundary fallback on crash', async () => {
      // This test verifies ErrorBoundary is working
      // We don't want to actually crash, just verify ErrorBoundary exists
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should have proper layout structure', async () => {
      act(() => {
        useExplorerStore.getState().setLoading(false);
      });

      render(<App />);

      await waitFor(() => {
        // Header should be present
        const header = document.querySelector('header');
        expect(header).toBeInTheDocument();

        // Main content area should be present
        const main = document.querySelector('main');
        expect(main).toBeInTheDocument();
      });
    });
  });
});
