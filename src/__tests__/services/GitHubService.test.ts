import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubService, getGitHubService, initGitHubService } from '@/services/github/GitHubService';
import type { GitHubConfig } from '@/types/github';

describe('GitHubService', () => {
  const mockConfig: GitHubConfig = {
    owner: 'test-owner',
    repo: 'test-repo',
    branch: 'main',
    basePath: 'docs',
  };

  const mockEnterpriseConfig: GitHubConfig = {
    ...mockConfig,
    apiUrl: 'https://github.company.com/api/v3',
    rawUrl: 'https://github.company.com/raw',
  };

  let service: GitHubService;

  beforeEach(() => {
    service = new GitHubService(mockConfig);
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default GitHub URLs', () => {
      const config = service.getConfig();
      expect(config).toEqual(mockConfig);
    });

    it('should initialize with custom enterprise URLs', () => {
      const enterpriseService = new GitHubService(mockEnterpriseConfig);
      expect(enterpriseService.getConfig()).toEqual(mockEnterpriseConfig);
    });
  });

  describe('getConfig', () => {
    it('should return the configuration', () => {
      expect(service.getConfig()).toEqual(mockConfig);
    });
  });

  describe('getRawUrl', () => {
    it('should build correct raw URL for default GitHub', () => {
      const url = service.getRawUrl('folder/file.txt');
      expect(url).toBe('https://raw.githubusercontent.com/test-owner/test-repo/main/docs/folder/file.txt');
    });

    it('should build correct raw URL for root path', () => {
      const url = service.getRawUrl('');
      expect(url).toBe('https://raw.githubusercontent.com/test-owner/test-repo/main/docs');
    });

    it('should build correct raw URL for enterprise', () => {
      const enterpriseService = new GitHubService(mockEnterpriseConfig);
      const url = enterpriseService.getRawUrl('file.txt');
      expect(url).toBe('https://github.company.com/raw/test-owner/test-repo/main/docs/file.txt');
    });

    it('should normalize paths with multiple slashes', () => {
      const url = service.getRawUrl('folder//subfolder///file.txt');
      expect(url).toContain('docs/folder/subfolder/file.txt');
    });
  });

  describe('getDirectoryContents', () => {
    it('should fetch directory contents from GitHub API', async () => {
      const mockResponse = [
        {
          name: 'file.txt',
          path: 'docs/file.txt',
          sha: 'abc123',
          size: 100,
          url: 'https://api.github.com/...',
          html_url: 'https://github.com/...',
          git_url: 'https://api.github.com/...',
          download_url: 'https://raw.githubusercontent.com/...',
          type: 'file',
        },
        {
          name: 'folder',
          path: 'docs/folder',
          sha: 'def456',
          size: 0,
          url: 'https://api.github.com/...',
          html_url: 'https://github.com/...',
          git_url: 'https://api.github.com/...',
          download_url: null,
          type: 'dir',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const items = await service.getDirectoryContents('');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/docs?ref=main',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
          }),
        })
      );

      expect(items).toHaveLength(2);
      expect(items[0]).toMatchObject({
        name: 'file.txt',
        path: 'file.txt',
        type: 'file',
        size: 100,
      });
      expect(items[1]).toMatchObject({
        name: 'folder',
        path: 'folder',
        type: 'directory',
      });
    });

    it('should throw error on API failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(service.getDirectoryContents('')).rejects.toThrow('GitHub API error: 404');
    });

    it('should use cache for repeated requests', async () => {
      const mockResponse = [
        {
          name: 'file.txt',
          path: 'docs/file.txt',
          sha: 'abc123',
          size: 100,
          url: '',
          html_url: '',
          git_url: '',
          download_url: '',
          type: 'file',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      await service.getDirectoryContents('test');
      // Second call (should use cache)
      await service.getDirectoryContents('test');

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFileContent', () => {
    it('should fetch file content from GitHub API', async () => {
      const mockContent = '# Hello World\n\nThis is a test file.';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        text: async () => mockContent,
      } as Response);

      const content = await service.getFileContent('readme.md');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/docs/readme.md?ref=main',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/vnd.github.raw+json',
          }),
        })
      );

      expect(content).toBe(mockContent);
    });

    it('should throw error on fetch failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      await expect(service.getFileContent('nonexistent.md')).rejects.toThrow('Failed to fetch file: 404');
    });
  });

  describe('getFullTree', () => {
    it('should fetch and build full tree from GitHub API', async () => {
      const mockRefResponse = {
        object: { sha: 'treeSha123' },
      };

      const mockTreeResponse = {
        sha: 'treeSha123',
        url: 'https://api.github.com/...',
        tree: [
          {
            path: 'docs/folder',
            mode: '040000',
            type: 'tree',
            sha: 'folderSha',
            url: 'https://api.github.com/...',
          },
          {
            path: 'docs/folder/file.txt',
            mode: '100644',
            type: 'blob',
            sha: 'fileSha',
            size: 100,
            url: 'https://api.github.com/...',
          },
          {
            path: 'docs/root.md',
            mode: '100644',
            type: 'blob',
            sha: 'rootSha',
            size: 50,
            url: 'https://api.github.com/...',
          },
        ],
        truncated: false,
      };

      vi.mocked(global.fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRefResponse,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTreeResponse,
        } as Response);

      const tree = await service.getFullTree();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(tree).toHaveLength(2); // folder and root.md

      const folder = tree.find(n => n.name === 'folder');
      expect(folder).toBeDefined();
      expect(folder?.type).toBe('directory');
      expect(folder?.children).toHaveLength(1);
      expect(folder?.children?.[0].name).toBe('file.txt');

      const rootFile = tree.find(n => n.name === 'root.md');
      expect(rootFile).toBeDefined();
      expect(rootFile?.type).toBe('file');
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', async () => {
      const mockResponse = [
        {
          name: 'file.txt',
          path: 'docs/file.txt',
          sha: 'abc123',
          size: 100,
          url: '',
          html_url: '',
          git_url: '',
          download_url: '',
          type: 'file',
        },
      ];

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      await service.getDirectoryContents('');

      // Clear cache
      service.clearCache();

      // Second call (should not use cache)
      await service.getDirectoryContents('');

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('GitHubService singleton functions', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    vi.resetModules();
  });

  describe('initGitHubService', () => {
    it('should initialize and return service instance', () => {
      const config: GitHubConfig = {
        owner: 'test',
        repo: 'repo',
        branch: 'main',
        basePath: 'docs',
      };

      const service = initGitHubService(config);
      expect(service).toBeInstanceOf(GitHubService);
      expect(service.getConfig()).toEqual(config);
    });
  });

  describe('getGitHubService', () => {
    it('should return initialized service', () => {
      const config: GitHubConfig = {
        owner: 'test',
        repo: 'repo',
        branch: 'main',
        basePath: 'docs',
      };

      initGitHubService(config);
      const service = getGitHubService();
      expect(service).toBeInstanceOf(GitHubService);
    });

    it('should initialize with config if provided and not initialized', () => {
      const config: GitHubConfig = {
        owner: 'test',
        repo: 'repo',
        branch: 'main',
        basePath: 'docs',
      };

      // First call with config initializes
      initGitHubService(config);
      const service = getGitHubService(config);
      expect(service.getConfig()).toEqual(config);
    });
  });
});
