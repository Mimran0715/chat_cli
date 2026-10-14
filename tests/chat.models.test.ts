import { describe, expect, it, vi } from 'vitest';
import { listModels } from '../chat';

describe('installed Ollama models', () => {
  it('requests the configured host and returns model names', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ models: [{ name: 'a' }, { name: 'b:latest' }] }) });
    const old = process.env.OLLAMA_HOST;
    process.env.OLLAMA_HOST = 'http://ollama.test:9999';
    await expect(listModels(fetchFn as typeof fetch)).resolves.toEqual(['a', 'b:latest']);
    expect(fetchFn).toHaveBeenCalledWith('http://ollama.test:9999/api/tags');
    old === undefined ? delete process.env.OLLAMA_HOST : process.env.OLLAMA_HOST = old;
  });

  it('uses the documented localhost default', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ models: [] }) });
    const old = process.env.OLLAMA_HOST; delete process.env.OLLAMA_HOST;
    await listModels(fetchFn as typeof fetch);
    expect(fetchFn).toHaveBeenCalledWith('http://127.0.0.1:11434/api/tags');
    old === undefined ? delete process.env.OLLAMA_HOST : process.env.OLLAMA_HOST = old;
  });

  it('rejects unsuccessful HTTP responses', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(listModels(fetchFn as typeof fetch)).rejects.toThrow(/500|Ollama/i);
  });
});
