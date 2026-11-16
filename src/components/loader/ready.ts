/**
 * The handshake between the first-visit loader and the page intros.
 *
 * The loader marks <html data-sw-loaded> and fires `sw:loaded` the moment it
 * starts to lift. The cinematic openings (home, studio, contact) wait for it,
 * so they never play unseen beneath the loader. After a client-side
 * navigation the loader is long gone and they start at once.
 */

export const LOADED_EVENT = "sw:loaded";

const isLoaded = () =>
  document.documentElement.hasAttribute("data-sw-loaded") || !document.querySelector("[data-sw-loader]");

/** Called by the loader as it begins to lift. */
export function markLoaded() {
  document.documentElement.setAttribute("data-sw-loaded", "");
  window.dispatchEvent(new Event(LOADED_EVENT));
}

/** Resolves once the loader has lifted. Never waits longer than `maxMs`. */
export function afterLoader(maxMs = 7000): Promise<void> {
  if (isLoaded()) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener(LOADED_EVENT, done);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, maxMs);
    window.addEventListener(LOADED_EVENT, done);
  });
}
