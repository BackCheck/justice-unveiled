import { lazy, type ComponentType } from "react";

/**
 * Wraps React.lazy with auto-recovery for stale chunk errors.
 * After a redeploy, old hashed chunk filenames stop existing — this catches
 * the "Failed to fetch dynamically imported module" error and force-reloads
 * once so the browser picks up the new index.html (and new chunk names).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const STORAGE_KEY = "chunk-reload-attempted";
    try {
      const mod = await factory();
      sessionStorage.removeItem(STORAGE_KEY);
      return mod;
    } catch (err: any) {
      const msg = String(err?.message || "");
      const isChunkError =
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("error loading dynamically imported module");

      const alreadyTried = sessionStorage.getItem(STORAGE_KEY);
      if (isChunkError && !alreadyTried) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        window.location.reload();
        // Return a never-resolving promise while the page reloads
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
