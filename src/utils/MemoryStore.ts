type MemoryStoreOptions = {
  /**
   * The time to live for the store in milliseconds.
   */
  ttl?: number;
};

type MemoryStoreEntry<T> = {
  value: T;
  expiresAt: number;
};

export class MemoryStore<T> {
  private store: Record<string, MemoryStoreEntry<T>> = {};
  private ttl: number;

  constructor(options: MemoryStoreOptions = {}) {
    this.ttl = options.ttl ?? 0;
  }

  /**
   * Prune the store of expired entries.
   */
  prune() {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].expiresAt < now) {
        delete this.store[key];
      }
    });
  }

  /**
   * Get an entry from the store.
   */
  get(key: string) {
    const entry = this.store[key];
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      delete this.store[key];
      return null;
    }
    return entry.value;
  }

  /**
   * Set an entry in the store.
   */
  set(key: string, value: T) {
    this.store[key] = {
      value,
      expiresAt: Date.now() + this.ttl,
    };
  }

  /**
   * Delete an entry from the store.
   */
  delete(key: string) {
    delete this.store[key];
  }

  /**
   * Get all keys in the store.
   */
  keys() {
    this.prune();
    return Object.keys(this.store);
  }
}
