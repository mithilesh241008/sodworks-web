/**
 * How the visitor arrived at the route that is mounting now.
 *
 *   "load"    the document was opened (typed URL, link from elsewhere)
 *   "reload"  the document was reloaded
 *   "push"    a client-side navigation inside the site (a link or button)
 *   "pop"     a history step — browser back / forward
 *
 * The cinematic openings decide whether to play from this, rather than from
 * the scroll position or the order of effects, both of which are unsettled
 * while a client-side navigation is being committed: Next.js resets the
 * scroll only after the new page's own effects have run.
 *
 * The value is updated by <RouteArrival/> in the root layout, which sits
 * before the page in the tree, so its layout effect runs before any page's.
 */
export type Arrival = "load" | "reload" | "push" | "pop";

let arrival: Arrival = "load";
let committedPath: string | null = null;
let historyStep = false;

if (typeof window !== "undefined") {
  // fires before the router renders the route it steps to
  window.addEventListener("popstate", () => {
    historyStep = true;
  });
}

/** The arrival of the current route. */
export function getArrival(): Arrival {
  return arrival;
}

/**
 * Record a committed route. Called once per pathname by RouteArrival; a
 * repeat call for the same pathname (a re-render, or React's development
 * double-invocation of effects) leaves the arrival unchanged.
 */
export function commitRoute(pathname: string): Arrival {
  if (pathname === committedPath) return arrival;
  if (committedPath === null) {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    arrival = nav?.type === "reload" ? "reload" : nav?.type === "back_forward" ? "pop" : "load";
  } else {
    arrival = historyStep ? "pop" : "push";
  }
  committedPath = pathname;
  historyStep = false;
  return arrival;
}

/** True when the document itself was opened scrolled part-way down the page. */
export const reopenedPartWay = () =>
  (arrival === "load" || arrival === "reload") && window.scrollY > window.innerHeight * 0.5;
