/**
 * Validates and resolves a safe internal application redirect path.
 * Prevents Open Redirect vulnerabilities (protocol-relative URLs, schemes, backslashes).
 */
export function getSafeRedirectPath(rawRedirect: string | null | undefined): string {
  if (!rawRedirect || typeof rawRedirect !== 'string') {
    return '/';
  }

  const trimmed = rawRedirect.trim();

  // Must start with a single leading forward slash
  if (!trimmed.startsWith('/')) {
    return '/';
  }

  // Reject protocol-relative URLs (e.g. //evil.com)
  if (trimmed.startsWith('//')) {
    return '/';
  }

  // Reject paths with backslashes (e.g. /\evil.com, \evil.com, /foo\bar)
  if (trimmed.includes('\\')) {
    return '/';
  }

  // Reject URLs containing URI schemes (e.g. javascript:, http:, https:, data:, etc.)
  if (/^\/?[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return '/';
  }

  return trimmed;
}
