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

  // If user is authenticated and tries to access /login, redirect to target destination or /
  if (isAuthRoute && authRole) {
    const rawRedirect = request.nextUrl.searchParams.get('redirect');
    const isSafe =
      rawRedirect &&
      rawRedirect.startsWith('/') &&
      !rawRedirect.startsWith('//') &&
      !rawRedirect.includes('\\') &&
      !/^\/?[a-z][a-z0-9+.-]*:/i.test(rawRedirect);

    const target = isSafe ? rawRedirect : '/';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // If user is NOT authenticated and tries to access protected dashboard routes
  if (!isAuthRoute && !authRole) {
    const loginUrl = new URL('/login', request.url);
    const target = `${pathname}${request.nextUrl.search || ''}`;
    loginUrl.searchParams.set('redirect', target);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
