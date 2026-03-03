/**
 * Validates a redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with /.
 */
export function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return "/";
  // Must start with /
  if (!redirect.startsWith("/")) return "/";
  // Must not contain protocol indicators
  if (redirect.includes("://")) return "/";
  // Must not start with // (protocol-relative URL)
  if (redirect.startsWith("//")) return "/";
  return redirect;
}
