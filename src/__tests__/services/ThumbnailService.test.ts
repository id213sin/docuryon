import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThumbnailService } from '@/services/thumbnail/ThumbnailService';
import type { FileNode } from '@/types/file';

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

describe('ThumbnailService', () => {
  let service: ThumbnailService;

  // Mock canvas context
  const mockContext = {
    fillStyle: '',
    font: '',
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
  };

  // Mock canvas
  const mockCanvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => mockContext),
    toDataURL: vi.fn(() => 'data:image/jpeg;base64,mock'),
  };

  beforeEach(() => {
    service = new ThumbnailService();
    vi.clearAllMocks();

    // Mock document.createElement for canvas
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultService = new ThumbnailService();
      expect(defaultService).toBeDefined();
    });

    it('should accept custom options', () => {
      const customService = new ThumbnailService({
        width: 200,
        height: 300,
        quality: 0.9,
      });
      expect(customService).toBeDefined();
    });
  });

  describe('generateThumbnail', () => {
    const createMockFile = (name: string, sha: string = 'sha123'): FileNode => ({
      name,
      path: `folder/${name}`,
      type: 'file',
      sha,
      url: 'https://example.com',
    });

    it('should return cached thumbnail if available', async () => {
      const file = createMockFile('test.txt');
      const rawUrl = 'https://raw.githubusercontent.com/test.txt';

      // Generate thumbnail first time
      vi.mocked(global.fetch).mockResolvedValueOnce({
        text: async () => 'test content',
      } as Response);

      await service.generateThumbnail(file, rawUrl);

      // Second call should use cache
      const cached = await service.generateThumbnail(file, rawUrl);

      // fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(cached).toBe('data:image/jpeg;base64,mock');
    });

    it('should generate text thumbnail for .txt files', async () => {
      const file = createMockFile('document.txt');
      const rawUrl = 'https://raw.githubusercontent.com/document.txt';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        text: async () => 'Hello World\nThis is a test document.',
      } as Response);

      const thumbnail = await service.generateThumbnail(file, rawUrl);

      expect(thumbnail).toBe('data:image/jpeg;base64,mock');
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('should generate text thumbnail for .md files', async () => {
      const file = createMockFile('readme.md');
      const rawUrl = 'https://raw.githubusercontent.com/readme.md';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        text: async () => '# Hello\n\nMarkdown content',
      } as Response);

      const thumbnail = await service.generateThumbnail(file, rawUrl);

      expect(thumbnail).toBe('data:image/jpeg;base64,mock');
    });

    it('should generate default thumbnail for unknown extensions', async () => {
      const file = createMockFile('data.xyz');
      const rawUrl = 'https://raw.githubusercontent.com/data.xyz';

      const thumbnail = await service.generateThumbnail(file, rawUrl);

      expect(thumbnail).toContain('data:image/svg+xml;base64,');
      // Decode base64 to verify content
      const base64Content = thumbnail!.replace('data:image/svg+xml;base64,', '');
      const decodedContent = atob(base64Content);
      expect(decodedContent).toContain('.XYZ');
    });

    it('should handle errors gracefully', async () => {
      const file = createMockFile('broken.txt');
      const rawUrl = 'https://raw.githubusercontent.com/broken.txt';

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      const thumbnail = await service.generateThumbnail(file, rawUrl);

      // Should return null on error (based on catch block returning undefined/null)
      expect(thumbnail).toBeNull();
    });

    it('should generate image thumbnail for image files', async () => {
      const file = createMockFile('photo.png');
      const rawUrl = 'https://raw.githubusercontent.com/photo.png';

      // Mock Image constructor using class
      const originalImage = window.Image;
      let capturedSrc = '';

      class MockImage {
        crossOrigin = '';
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        width = 200;
        height = 150;
        private _src = '';

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          capturedSrc = value;
          // Trigger onload asynchronously
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }

      window.Image = MockImage as unknown as typeof Image;

      const thumbnail = await service.generateThumbnail(file, rawUrl);

      // Restore original Image
      window.Image = originalImage;

      expect(capturedSrc).toBe(rawUrl);
      expect(thumbnail).toBe('data:image/jpeg;base64,mock');
    });
  });

  describe('clearCache', () => {
    it('should clear the thumbnail cache', async () => {
      const file: FileNode = {
        name: 'test.txt',
        path: 'test.txt',
        type: 'file',
        sha: 'unique-sha',
        url: 'https://example.com',
      };
      const rawUrl = 'https://raw.githubusercontent.com/test.txt';

      vi.mocked(global.fetch).mockResolvedValue({
        text: async () => 'content',
      } as Response);

      // Generate thumbnail
      await service.generateThumbnail(file, rawUrl);

      // Clear cache
      service.clearCache();

      // Generate again - should call fetch again
      await service.generateThumbnail(file, rawUrl);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getDefaultThumbnail', () => {
    it('should return SVG data URL for various file types', async () => {
      // Test only file types that will generate default thumbnails (not previewable)
      const testCases = [
        { ext: 'doc', expectedText: '.DOC' },
        { ext: 'xls', expectedText: '.XLS' },
        { ext: 'unknown', expectedText: '.UNKNOWN' },
      ];

      for (const { ext, expectedText } of testCases) {
        const file: FileNode = {
          name: `file.${ext}`,
          path: `file.${ext}`,
          type: 'file',
          sha: `sha-${ext}`,
          url: 'https://example.com',
        };

        const thumbnail = await service.generateThumbnail(file, `https://example.com/file.${ext}`);

        expect(thumbnail).toContain('data:image/svg+xml;base64,');
        // Decode base64 to verify content
        const base64Content = thumbnail!.replace('data:image/svg+xml;base64,', '');
        const decodedContent = atob(base64Content);
        expect(decodedContent).toContain(expectedText);
      }
    });
  });
});
