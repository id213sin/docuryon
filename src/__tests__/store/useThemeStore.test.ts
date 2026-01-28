import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useThemeStore } from '@/store/useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    // Clear document classes
    document.documentElement.classList.remove('light', 'dark');
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have default theme as system', () => {
      const { result } = renderHook(() => useThemeStore());
      expect(result.current.theme).toBe('system');
    });

    it('should have default resolved theme as light', () => {
      const { result } = renderHook(() => useThemeStore());
      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  describe('setTheme', () => {
    it('should set theme to light', () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should set theme to dark', () => {
      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('should set theme to system and resolve based on media query (light)', () => {
      // Mock matchMedia to return light preference
      vi.mocked(window.matchMedia).mockImplementation((query) => ({
        matches: false, // prefers-color-scheme: dark is false
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('should set theme to system and resolve based on media query (dark)', () => {
      // Mock matchMedia to return dark preference
      vi.mocked(window.matchMedia).mockImplementation((query) => ({
        matches: true, // prefers-color-scheme: dark is true
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { result } = renderHook(() => useThemeStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove previous theme class when changing themes', () => {
      const { result } = renderHook(() => useThemeStore());

      // Set to dark first
      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Switch to light
      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });
});
