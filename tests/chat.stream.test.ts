import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ streamText: vi.fn(), ollama: vi.fn((name: string) => name) }));
vi.mock('ai', () => ({ generateText: vi.fn(), streamText: mocks.streamText }));
vi.mock('ai-sdk-ollama', () => ({ ollama: mocks.ollama }));

import { streamChat } from '../chat';

async function* chunks(values: string[]) { for (const value of values) yield value; }

describe('streamChat', () => {
  it('emits chunks in order and returns their concatenation', async () => {
    mocks.streamText.mockReturnValue({ textStream: chunks(['hel', 'lo', '!']) });
    const seen: string[] = [];
    await expect(streamChat([{ role: 'user', content: 'hi' }], token => seen.push(token))).resolves.toEqual({ role: 'assistant', content: 'hello!' });
    expect(seen).toEqual(['hel', 'lo', '!']);
  });

  it('passes messages and the same configured Ollama model', async () => {
    mocks.streamText.mockReturnValue({ textStream: chunks([]) });
    const messages = [{ role: 'user' as const, content: 'hi' }];
    await streamChat(messages, () => undefined);
    expect(mocks.streamText).toHaveBeenCalledWith(expect.objectContaining({ messages }));
    expect(mocks.ollama).toHaveBeenCalled();
  });

  it('logs stream errors and rethrows', async () => {
    const error = new Error('stream failed');
    mocks.streamText.mockImplementation(() => { throw error; });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(streamChat([], () => undefined)).rejects.toBe(error);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
