import { createSafeStore } from './storage';

/** Shared persistent store for user preferences and records. */
export const appStore = createSafeStore();
