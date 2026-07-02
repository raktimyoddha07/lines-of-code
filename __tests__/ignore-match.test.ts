import { describe, it, expect } from 'vitest';
import { globToRegex, isDefaultFolderIgnored, isDefaultFileIgnored, isManuallyIgnored } from '../lib/ignore-match';

describe('ignore-match', () => {
  describe('globToRegex', () => {
    it('matches basic wildcards', () => {
      const rx = globToRegex('*.js');
      expect(rx.test('index.js')).toBe(true);
      expect(rx.test('src/index.js')).toBe(true);
      expect(rx.test('index.jsx')).toBe(false);
    });

    it('matches recursive directories (**)', () => {
      const rx = globToRegex('src/**/*.test.ts');
      expect(rx.test('src/index.test.ts')).toBe(true);
      expect(rx.test('src/components/button.test.ts')).toBe(true);
      expect(rx.test('components/button.test.ts')).toBe(false);
    });

    it('matches direct paths', () => {
      const rx = globToRegex('scripts/legacy.js');
      expect(rx.test('scripts/legacy.js')).toBe(true);
      expect(rx.test('src/scripts/legacy.js')).toBe(false);
    });
  });

  describe('isDefaultFolderIgnored', () => {
    it('ignores default build and config folders', () => {
      expect(isDefaultFolderIgnored('node_modules/react/index.js')).toBe(true);
      expect(isDefaultFolderIgnored('.git/config')).toBe(true);
      expect(isDefaultFolderIgnored('.next/server/page.js')).toBe(true);
      expect(isDefaultFolderIgnored('src/components')).toBe(false);
    });
  });

  describe('isDefaultFileIgnored', () => {
    it('ignores default locked files, logs, and docs', () => {
      expect(isDefaultFileIgnored('package-lock.json')).toBe(true);
      expect(isDefaultFileIgnored('yarn.lock')).toBe(true);
      expect(isDefaultFileIgnored('README.md')).toBe(true);
      expect(isDefaultFileIgnored('logo.svg')).toBe(true);
      expect(isDefaultFileIgnored('src/index.ts')).toBe(false);
    });
  });

  describe('isManuallyIgnored', () => {
    it('applies custom patterns correctly', () => {
      const rules = ['src/generated/', 'scripts/legacy.js', '**/*.test.ts'];
      expect(isManuallyIgnored('src/generated/index.ts', rules)).toBe(true);
      expect(isManuallyIgnored('scripts/legacy.js', rules)).toBe(true);
      expect(isManuallyIgnored('src/components/button.test.ts', rules)).toBe(true);
      expect(isManuallyIgnored('src/components/button.ts', rules)).toBe(false);
    });
  });
});
