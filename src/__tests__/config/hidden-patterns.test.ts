import { describe, it, expect } from 'vitest';
import { HIDDEN_PATTERNS } from '@/config/hidden-patterns';

describe('HIDDEN_PATTERNS', () => {
  const matchesPattern = (name: string): boolean => {
    return HIDDEN_PATTERNS.some(pattern => {
      if (typeof pattern === 'string') {
        return name === pattern;
      }
      return pattern.test(name);
    });
  };

  describe('configuration files', () => {
    it('should hide common config files', () => {
      expect(matchesPattern('package.json')).toBe(true);
      expect(matchesPattern('package-lock.json')).toBe(true);
      expect(matchesPattern('tsconfig.json')).toBe(true);
      expect(matchesPattern('vite.config.ts')).toBe(true);
      expect(matchesPattern('eslint.config.js')).toBe(true);
    });
  });

  describe('directories', () => {
    it('should hide development directories', () => {
      expect(matchesPattern('node_modules')).toBe(true);
      expect(matchesPattern('dist')).toBe(true);
      expect(matchesPattern('src')).toBe(true);
      expect(matchesPattern('.git')).toBe(true);
      expect(matchesPattern('.github')).toBe(true);
      expect(matchesPattern('.vscode')).toBe(true);
    });
  });

  describe('hidden files (dot prefix)', () => {
    it('should hide files starting with dot', () => {
      expect(matchesPattern('.gitignore')).toBe(true);
      expect(matchesPattern('.env')).toBe(true);
      expect(matchesPattern('.eslintrc')).toBe(true);
      expect(matchesPattern('.prettierrc')).toBe(true);
    });
  });

  describe('build artifacts', () => {
    it('should hide TypeScript declaration files', () => {
      expect(matchesPattern('types.d.ts')).toBe(true);
      expect(matchesPattern('index.d.ts')).toBe(true);
    });

    it('should hide source map files', () => {
      expect(matchesPattern('bundle.js.map')).toBe(true);
      expect(matchesPattern('styles.css.map')).toBe(true);
    });
  });

  describe('project specific', () => {
    it('should hide project meta files', () => {
      expect(matchesPattern('README.md')).toBe(true);
      expect(matchesPattern('LICENSE')).toBe(true);
    });
  });

  describe('allowed files', () => {
    it('should not hide regular document files', () => {
      expect(matchesPattern('document.md')).toBe(false);
      expect(matchesPattern('notes.txt')).toBe(false);
      expect(matchesPattern('report.pdf')).toBe(false);
    });

    it('should not hide regular code files', () => {
      expect(matchesPattern('app.ts')).toBe(false);
      expect(matchesPattern('component.tsx')).toBe(false);
      expect(matchesPattern('styles.css')).toBe(false);
    });

    it('should not hide image files', () => {
      expect(matchesPattern('photo.png')).toBe(false);
      expect(matchesPattern('image.jpg')).toBe(false);
      expect(matchesPattern('diagram.svg')).toBe(false);
    });
  });
});
