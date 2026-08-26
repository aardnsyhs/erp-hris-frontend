import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authRole = request.cookies.get('auth_role')?.value;

  const isAuthRoute = pathname.startsWith('/login');
  const isPublicStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.');

  if (isPublicStatic) {
    return NextResponse.next();
  }

  // If user is authenticated and tries to access /login, redirect to dashboard
  if (isAuthRoute && authRole) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is NOT authenticated and tries to access protected dashboard routes
  if (!isAuthRoute && !authRole) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
