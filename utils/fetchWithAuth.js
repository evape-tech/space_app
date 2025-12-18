// Minimal fetch wrapper that attaches Bearer token and handles 401/403 uniformly
export default async function fetchWithAuth(url, { method = 'GET', headers = {}, body, token } = {}) {
  const opts = { method, headers: { ...headers } };

  if (body !== undefined) {
    if (!opts.headers['Content-Type']) opts.headers['Content-Type'] = 'application/json';
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  const resp = await fetch(url, opts);

  // handle unauthorized/forbidden
  if (resp.status === 401 || resp.status === 403) {
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
    } catch (e) {
      console.error('signOut failed', e);
    }
    if (typeof window !== 'undefined') {
      const callback = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/auth/login?callbackUrl=${callback}`;
    }
    const err = new Error('Unauthorized');
    err.status = resp.status;
    throw err;
  }

  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    const err = new Error((data && (data.message || data.error)) || resp.statusText || 'Request failed');
    err.status = resp.status;
    err.data = data;
    throw err;
  }

  return data;
}
