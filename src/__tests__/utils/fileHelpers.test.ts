import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getFileExtension,
  getFileIcon,
  isPreviewable,
  isImageFile,
  isPdfFile,
  isTextFile,
} from '@/utils/fileHelpers';

describe('fileHelpers', () => {
  describe('formatFileSize', () => {
    it('should return "0 B" for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format terabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });
  });

  describe('getFileExtension', () => {
    it('should return the file extension in lowercase', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('file.PDF')).toBe('pdf');
      expect(getFileExtension('file.TXT')).toBe('txt');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileExtension('file.test.ts')).toBe('ts');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('README')).toBe('readme');
      expect(getFileExtension('.gitignore')).toBe('gitignore');
    });

    it('should handle empty filename', () => {
      expect(getFileExtension('')).toBe('');
    });
  });

  describe('getFileIcon', () => {
    it('should return correct icon for document files', () => {
      expect(getFileIcon('document.pdf')).toBe('file-text');
      expect(getFileIcon('notes.txt')).toBe('file-text');
      expect(getFileIcon('readme.md')).toBe('file-text');
    });

    it('should return correct icon for image files', () => {
      expect(getFileIcon('photo.png')).toBe('image');
      expect(getFileIcon('photo.jpg')).toBe('image');
      expect(getFileIcon('photo.jpeg')).toBe('image');
      expect(getFileIcon('image.gif')).toBe('image');
      expect(getFileIcon('logo.svg')).toBe('image');
      expect(getFileIcon('banner.webp')).toBe('image');
    });

    it('should return correct icon for code files', () => {
      expect(getFileIcon('script.js')).toBe('file-code');
      expect(getFileIcon('app.ts')).toBe('file-code');
      expect(getFileIcon('styles.css')).toBe('file-code');
      expect(getFileIcon('index.html')).toBe('file-code');
      expect(getFileIcon('config.json')).toBe('file-code');
    });

    it('should return correct icon for archive files', () => {
      expect(getFileIcon('archive.zip')).toBe('file-archive');
      expect(getFileIcon('backup.tar')).toBe('file-archive');
      expect(getFileIcon('compressed.gz')).toBe('file-archive');
    });

    it('should return correct icon for video files', () => {
      expect(getFileIcon('movie.mp4')).toBe('file-video');
      expect(getFileIcon('clip.avi')).toBe('file-video');
      expect(getFileIcon('video.webm')).toBe('file-video');
    });

    it('should return correct icon for audio files', () => {
      expect(getFileIcon('song.mp3')).toBe('file-audio');
      expect(getFileIcon('sound.wav')).toBe('file-audio');
      expect(getFileIcon('music.flac')).toBe('file-audio');
    });

    it('should return default icon for unknown extensions', () => {
      expect(getFileIcon('unknown.xyz')).toBe('file');
      expect(getFileIcon('data.bin')).toBe('file');
    });
  });

  describe('isPreviewable', () => {
    it('should return true for previewable text files', () => {
      expect(isPreviewable('readme.md')).toBe(true);
      expect(isPreviewable('notes.txt')).toBe(true);
      expect(isPreviewable('page.html')).toBe(true);
      expect(isPreviewable('config.json')).toBe(true);
    });

    it('should return true for previewable code files', () => {
      expect(isPreviewable('app.js')).toBe(true);
      expect(isPreviewable('component.ts')).toBe(true);
      expect(isPreviewable('styles.css')).toBe(true);
    });

    it('should return true for PDF files', () => {
      expect(isPreviewable('document.pdf')).toBe(true);
    });

    it('should return true for image files', () => {
      expect(isPreviewable('photo.png')).toBe(true);
      expect(isPreviewable('image.jpg')).toBe(true);
      expect(isPreviewable('icon.svg')).toBe(true);
    });

    it('should return false for non-previewable files', () => {
      expect(isPreviewable('archive.zip')).toBe(false);
      expect(isPreviewable('video.mp4')).toBe(false);
      expect(isPreviewable('song.mp3')).toBe(false);
      expect(isPreviewable('document.docx')).toBe(false);
    });
  });

  describe('isImageFile', () => {
    it('should return true for image extensions', () => {
      expect(isImageFile('photo.png')).toBe(true);
      expect(isImageFile('photo.jpg')).toBe(true);
      expect(isImageFile('photo.jpeg')).toBe(true);
      expect(isImageFile('animation.gif')).toBe(true);
      expect(isImageFile('logo.svg')).toBe(true);
      expect(isImageFile('banner.webp')).toBe(true);
      expect(isImageFile('favicon.ico')).toBe(true);
      expect(isImageFile('image.bmp')).toBe(true);
    });

    it('should return false for non-image files', () => {
      expect(isImageFile('document.pdf')).toBe(false);
      expect(isImageFile('script.js')).toBe(false);
      expect(isImageFile('readme.md')).toBe(false);
    });
  });

  describe('isPdfFile', () => {
    it('should return true for PDF files', () => {
      expect(isPdfFile('document.pdf')).toBe(true);
      expect(isPdfFile('report.PDF')).toBe(true);
    });

    it('should return false for non-PDF files', () => {
      expect(isPdfFile('document.doc')).toBe(false);
      expect(isPdfFile('image.png')).toBe(false);
    });
  });

  describe('isTextFile', () => {
    it('should return true for text/code files', () => {
      expect(isTextFile('readme.md')).toBe(true);
      expect(isTextFile('notes.txt')).toBe(true);
      expect(isTextFile('script.js')).toBe(true);
      expect(isTextFile('app.ts')).toBe(true);
      expect(isTextFile('component.jsx')).toBe(true);
      expect(isTextFile('styles.css')).toBe(true);
      expect(isTextFile('config.json')).toBe(true);
      expect(isTextFile('config.yml')).toBe(true);
      expect(isTextFile('script.py')).toBe(true);
      expect(isTextFile('code.go')).toBe(true);
      expect(isTextFile('main.rs')).toBe(true);
    });

    it('should return false for binary files', () => {
      expect(isTextFile('image.png')).toBe(false);
      expect(isTextFile('document.pdf')).toBe(false);
      expect(isTextFile('video.mp4')).toBe(false);
    });
  });
});
