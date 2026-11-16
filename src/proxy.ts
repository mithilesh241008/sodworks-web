import { NextResponse, type NextRequest } from "next/server";
import { ventures } from "@/components/ventures/data";

const known = new Set(ventures.map((v) => v.slug));

/**
 * Unknown venture slugs get a real 404.
 *
 * With Cache Components, a venture page's shell is prerendered and streamed
 * before the slug is read, so `notFound()` inside the page can no longer
 * change the status code (and `dynamicParams = false` is unavailable). The
 * list of ventures is fixed at build time, so anything outside it is
 * rewritten to a path that doesn't exist and served as the site's 404 page.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (slug && !known.has(decodeURIComponent(slug))) {
    return NextResponse.rewrite(new URL("/404-not-found", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/ventures/:slug",
};
