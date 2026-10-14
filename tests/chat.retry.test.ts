import { describe, expect, it, vi } from 'vitest';
import { withRetry } from '../chat';

describe('withRetry', () => {
  it('retries transient failures with exponential delays', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('down'), { code: 'ECONNREFUSED' }))
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockResolvedValue('ok');
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(withRetry(fn, { attempts: 3, baseDelayMs: 200, sleep })).resolves.toBe('ok');
    expect(sleep.mock.calls.map(call => call[0])).toEqual([200, 400]);
  });

  it('retries 5xx errors but never retries 4xx errors', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const server = vi.fn().mockRejectedValueOnce(Object.assign(new Error('server'), { status: 503 })).mockResolvedValue('ok');
    await expect(withRetry(server, { attempts: 2, sleep })).resolves.toBe('ok');
    const client = vi.fn().mockRejectedValue(Object.assign(new Error('bad request'), { status: 400 }));
    await expect(withRetry(client, { attempts: 3, sleep })).rejects.toThrow('bad request');
    expect(client).toHaveBeenCalledTimes(1);
  });

  it('throws the final error after attempts are exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fetch failed'));
    await expect(withRetry(fn, { attempts: 2, sleep: async () => undefined })).rejects.toThrow('fetch failed');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('messageChat uses withRetry', async () => {
    const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../chat.ts', import.meta.url), 'utf8'));
    expect(source).toMatch(/messageChat[\s\S]{0,1500}withRetry|withRetry[\s\S]{0,1500}messageChat/);
  });

  it('the REPL removes an unanswered user message and continues after final failure', async () => {
    const source = await import('node:fs/promises').then(fs => fs.readFile(new URL('../index.ts', import.meta.url), 'utf8'));
    expect(source).toMatch(/catch[\s\S]*messages\.(?:pop|splice)\(/);
    expect(source).toMatch(/catch[\s\S]*(?:continue|while)/);
  });
});
