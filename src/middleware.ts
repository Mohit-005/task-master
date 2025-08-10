
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromMiddleware } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/signup'];

  // Check if the current path is a public path or an internal Next.js asset/API path
   const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/signup') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico');


  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = await getSessionFromMiddleware(request);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/` routes
  matcher: ['/((?!api/login|api/signup|_next/static|_next/image|favicon.ico).*)'],
};
