import { describe, expect, it, vi } from 'vitest';
import { createSafeStore } from './storage';

function createFakeStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => {
      data.clear();
    },
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe('createSafeStore', () => {
  it('reads and writes through the backend', () => {
    const backend = createFakeStorage();
    const store = createSafeStore(() => backend);
    store.write('k', 'v');
    expect(backend.getItem('k')).toBe('v');
    expect(store.read('k')).toBe('v');
  });

  it('returns null for missing keys', () => {
    expect(createSafeStore(() => createFakeStorage()).read('missing')).toBeNull();
  });

  it('falls back to memory when accessing storage throws (privacy mode)', () => {
    const store = createSafeStore(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(() => {
      store.write('k', 'v');
    }).not.toThrow();
    expect(store.read('k')).toBe('v');
  });

  it('keeps the value in memory when the quota is exceeded', () => {
    const backend = createFakeStorage();
    vi.spyOn(backend, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const store = createSafeStore(() => backend);
    store.write('k', 'v');
    expect(store.read('k')).toBe('v');
  });

  it('works without any storage available', () => {
    const store = createSafeStore(() => null);
    store.write('k', 'v');
    expect(store.read('k')).toBe('v');
  });
});
