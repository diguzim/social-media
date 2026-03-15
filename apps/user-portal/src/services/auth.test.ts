import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('auth service email verification deduplication', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('sends only one request for concurrent confirmation calls with the same token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: 'verified',
        emailVerifiedAt: '2026-03-15T00:00:00.000Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { confirmEmailVerification } = await import('./auth');

    const [a, b] = await Promise.all([
      confirmEmailVerification('same-token'),
      confirmEmailVerification('same-token'),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a.status).toBe('verified');
    expect(b.status).toBe('verified');
  });

  it('reuses a short-lived cached success response for immediate repeated confirmation', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        status: 'verified',
        emailVerifiedAt: '2026-03-15T00:00:00.000Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { confirmEmailVerification } = await import('./auth');

    const first = await confirmEmailVerification('cached-token');
    const second = await confirmEmailVerification('cached-token');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first.status).toBe('verified');
    expect(second.status).toBe('verified');
  });
});
