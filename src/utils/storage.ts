// Safe localStorage wrapper to bypass sandboxed iframe restrictions
const memoryStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      console.warn("[SafeStorage] Direct localStorage blocked, fallback to memory key:", key);
      return memoryStore[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn("[SafeStorage] Direct localStorage set blocked, cached to memory key:", key);
      memoryStore[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete memoryStore[key];
    }
  }
};
