import { NextResponse, type NextRequest } from 'next/server';
import { getPublicLocale, isPublicPage } from '@/lib/site';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authRole = request.cookies.get('auth_role')?.value;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-public-locale');
  const publicLocale = getPublicLocale(pathname);
  if (publicLocale) requestHeaders.set('x-public-locale', publicLocale);

  const next = () => {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    if (!isPublicPage(pathname) && !isPublicStatic) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  };

  const isAuthRoute = pathname === '/login' || pathname === '/login/';
  const isPublicStatic =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    /^\/share\/(en|id)\/?$/.test(pathname) ||
    pathname.includes('.');

  if (isPublicStatic || isPublicPage(pathname)) {
    return next();
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
    const response = NextResponse.redirect(new URL(target, request.url));
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // If user is NOT authenticated and tries to access protected dashboard routes
  if (!isAuthRoute && !authRole) {
    const loginUrl = new URL('/login', request.url);
    const target = `${pathname}${request.nextUrl.search || ''}`;
    loginUrl.searchParams.set('redirect', target);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  return next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
