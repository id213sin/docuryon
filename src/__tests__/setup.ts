import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock DOMMatrix for pdfjs-dist in Node.js environment
class DOMMatrixMock {
  a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  m11 = 1; m12 = 0; m13 = 0; m14 = 0;
  m21 = 0; m22 = 1; m23 = 0; m24 = 0;
  m31 = 0; m32 = 0; m33 = 1; m34 = 0;
  m41 = 0; m42 = 0; m43 = 0; m44 = 1;
  is2D = true;
  isIdentity = true;

  constructor() {}

  inverse() { return new DOMMatrixMock(); }
  multiply() { return new DOMMatrixMock(); }
  translate() { return new DOMMatrixMock(); }
  scale() { return new DOMMatrixMock(); }
  rotate() { return new DOMMatrixMock(); }
  rotateAxisAngle() { return new DOMMatrixMock(); }
  rotateFromVector() { return new DOMMatrixMock(); }
  skewX() { return new DOMMatrixMock(); }
  skewY() { return new DOMMatrixMock(); }
  flipX() { return new DOMMatrixMock(); }
  flipY() { return new DOMMatrixMock(); }
  transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
  toFloat32Array() { return new Float32Array(16); }
  toFloat64Array() { return new Float64Array(16); }
  toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
  toJSON() { return {}; }
}

// @ts-ignore
global.DOMMatrix = DOMMatrixMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch globally
global.fetch = vi.fn();

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
