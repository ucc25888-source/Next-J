import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/quote', '/api/auth/', '/api/daily-quote', '/_next/', '/favicon.ico'];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (isPublic) return NextResponse.next();

  const sessionCookie = request.cookies.get('tobe-nexus-session');
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
