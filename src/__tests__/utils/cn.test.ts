import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'active')).toBe('base active');
    expect(cn('base', false && 'active')).toBe('base');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
    expect(cn('base', ['nested1', 'nested2'])).toBe('base nested1 nested2');
  });

  it('should handle object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
    expect(cn('base', { highlight: true, hidden: false })).toBe('base highlight');
  });

  it('should merge Tailwind classes correctly', () => {
    // twMerge should handle conflicting classes
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle complex Tailwind merges', () => {
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('text-sm font-bold', 'text-lg')).toBe('font-bold text-lg');
  });

  it('should return empty string for no input', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should handle mixed input types', () => {
    expect(cn(
      'base-class',
      { conditional: true },
      ['array-class'],
      undefined,
      'final-class'
    )).toBe('base-class conditional array-class final-class');
  });
});
