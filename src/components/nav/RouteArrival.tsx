"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { commitRoute } from "@/lib/arrival";

/**
 * Records how each route was entered (see lib/arrival) and, for a link
 * navigation, starts the new page at the top.
 *
 * It renders nothing and sits in the root layout before the page, so its
 * layout effect runs before the new page's: by the time a page builds its
 * timelines and ScrollTriggers, the arrival is known and the scroll position
 * is already the one the page will be seen at — not the previous page's.
 * History steps keep the position the browser restores.
 */
export default function RouteArrival() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (commitRoute(pathname) === "push" && !window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
