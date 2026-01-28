import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalFileService, initLocalFileService, getLocalFileService } from '@/services/local';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    BASE_URL: '/docuryon/'
  }
});

describe('LocalFileService', () => {
  let service: LocalFileService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LocalFileService('/trunk');
  });

  describe('initialization', () => {
    it('should create service with default base path', () => {
      const defaultService = new LocalFileService();
      expect(defaultService.getBasePath()).toBe('/trunk');
    });

    it('should create service with custom base path', () => {
      const customService = new LocalFileService('/docs');
      expect(customService.getBasePath()).toBe('/docs');
    });
  });

  describe('getFullTree', () => {
    it('should fetch and parse file tree', async () => {
      const mockTree = [
        { name: 'folder1', path: 'folder1', type: 'directory', children: [] },
        { name: 'file1.md', path: 'file1.md', type: 'file', size: 100 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTree),
      });

      const result = await service.getFullTree();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('folder1');
      expect(result[1].name).toBe('file1.md');
    });

    it('should throw error on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.getFullTree()).rejects.toThrow('Failed to load file tree: 404');
    });
  });

  describe('getFileContent', () => {
    it('should fetch file content', async () => {
      const mockContent = '# Hello World';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockContent),
      });

      const result = await service.getFileContent('readme.md');

      expect(result).toBe(mockContent);
    });

    it('should throw error on fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(service.getFileContent('nonexistent.md')).rejects.toThrow('Failed to fetch file: 404');
    });
  });

  describe('getRawUrl', () => {
    it('should generate correct raw URL', () => {
      // Note: In test environment, window.location.origin may not be set
      const url = service.getRawUrl('folder/file.md');
      expect(url).toContain('/trunk/folder/file.md');
    });
  });

  describe('caching', () => {
    it('should cache full tree results', async () => {
      const mockTree = [{ name: 'file.md', path: 'file.md', type: 'file', size: 50 }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTree),
      });

      // First call
      await service.getFullTree();
      // Second call should use cache
      await service.getFullTree();

      // Only one fetch call should be made
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should clear cache', async () => {
      const mockTree = [{ name: 'file.md', path: 'file.md', type: 'file', size: 50 }];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTree),
      });

      await service.getFullTree();
      service.clearCache();
      await service.getFullTree();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Service singleton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and return singleton', () => {
    const instance = initLocalFileService('/trunk');
    const retrieved = getLocalFileService();

    expect(retrieved).toBe(instance);
  });
});
