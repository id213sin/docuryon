import { describe, it, expect } from 'vitest';
import {
  getParentPath,
  getFileName,
  joinPath,
  splitPath,
  normalizePath,
  isSubPath,
} from '@/utils/pathHelpers';

describe('pathHelpers', () => {
  describe('getParentPath', () => {
    it('should return parent path for nested paths', () => {
      expect(getParentPath('folder/subfolder/file.txt')).toBe('folder/subfolder');
      expect(getParentPath('a/b/c/d')).toBe('a/b/c');
    });

    it('should return parent folder for single level path', () => {
      expect(getParentPath('folder/file.txt')).toBe('folder');
    });

    it('should return empty string for root level', () => {
      expect(getParentPath('file.txt')).toBe('');
    });

    it('should handle empty path', () => {
      expect(getParentPath('')).toBe('');
    });

    it('should handle paths with leading slashes', () => {
      expect(getParentPath('/folder/file.txt')).toBe('folder');
    });
  });

  describe('getFileName', () => {
    it('should return filename from path', () => {
      expect(getFileName('folder/file.txt')).toBe('file.txt');
      expect(getFileName('a/b/c/document.pdf')).toBe('document.pdf');
    });

    it('should return the path itself if no slashes', () => {
      expect(getFileName('file.txt')).toBe('file.txt');
    });

    it('should handle paths ending with slash', () => {
      expect(getFileName('folder/')).toBe('');
    });

    it('should handle empty path', () => {
      expect(getFileName('')).toBe('');
    });
  });

  describe('joinPath', () => {
    it('should join path segments', () => {
      expect(joinPath('folder', 'file.txt')).toBe('folder/file.txt');
      expect(joinPath('a', 'b', 'c', 'd')).toBe('a/b/c/d');
    });

    it('should handle empty segments', () => {
      expect(joinPath('', 'folder', '', 'file.txt')).toBe('folder/file.txt');
    });

    it('should normalize multiple slashes', () => {
      expect(joinPath('folder/', '/file.txt')).toBe('folder/file.txt');
      expect(joinPath('a//', '//b')).toBe('a/b');
    });

    it('should handle single segment', () => {
      expect(joinPath('file.txt')).toBe('file.txt');
    });

    it('should handle no segments', () => {
      expect(joinPath()).toBe('');
    });
  });

  describe('splitPath', () => {
    it('should split path into segments', () => {
      expect(splitPath('folder/subfolder/file.txt')).toEqual(['folder', 'subfolder', 'file.txt']);
    });

    it('should handle single segment', () => {
      expect(splitPath('file.txt')).toEqual(['file.txt']);
    });

    it('should filter out empty segments', () => {
      expect(splitPath('/folder//file.txt/')).toEqual(['folder', 'file.txt']);
    });

    it('should return empty array for empty path', () => {
      expect(splitPath('')).toEqual([]);
    });
  });

  describe('normalizePath', () => {
    it('should remove duplicate slashes', () => {
      expect(normalizePath('folder//subfolder///file.txt')).toBe('folder/subfolder/file.txt');
    });

    it('should remove leading and trailing slashes', () => {
      expect(normalizePath('/folder/file.txt/')).toBe('folder/file.txt');
      expect(normalizePath('///a/b/c///')).toBe('a/b/c');
    });

    it('should handle already normalized paths', () => {
      expect(normalizePath('folder/file.txt')).toBe('folder/file.txt');
    });

    it('should return empty string for root paths', () => {
      expect(normalizePath('/')).toBe('');
      expect(normalizePath('//')).toBe('');
    });
  });

  describe('isSubPath', () => {
    it('should return true when child is under parent', () => {
      expect(isSubPath('folder', 'folder/file.txt')).toBe(true);
      expect(isSubPath('a/b', 'a/b/c/d')).toBe(true);
    });

    it('should return true when paths are equal', () => {
      expect(isSubPath('folder', 'folder')).toBe(true);
      expect(isSubPath('a/b/c', 'a/b/c')).toBe(true);
    });

    it('should return true for empty parent (root)', () => {
      expect(isSubPath('', 'folder/file.txt')).toBe(true);
      expect(isSubPath('', 'any/path')).toBe(true);
    });

    it('should return false when child is not under parent', () => {
      expect(isSubPath('folder', 'other/file.txt')).toBe(false);
      expect(isSubPath('a/b', 'a/c/d')).toBe(false);
    });

    it('should not match partial folder names', () => {
      expect(isSubPath('fold', 'folder/file.txt')).toBe(false);
      expect(isSubPath('test', 'testing/file.txt')).toBe(false);
    });

    it('should handle paths with different normalization', () => {
      expect(isSubPath('/folder/', '/folder/file.txt')).toBe(true);
      expect(isSubPath('folder/', 'folder/subfolder/')).toBe(true);
    });
  });
});
