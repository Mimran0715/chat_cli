import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateText: vi.fn(), ollama: vi.fn(() => 'model') }));
vi.mock('ai', () => ({ generateText: mocks.generateText }));
vi.mock('ai-sdk-ollama', () => ({ ollama: mocks.ollama }));

import { messageChat } from '../chat';

describe('messageChat', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns an assistant message built from generated text', async () => {
    mocks.generateText.mockResolvedValue({ text: 'hello back' });
    await expect(messageChat([{ role: 'user', content: 'hello' }])).resolves.toEqual({ role: 'assistant', content: 'hello back' });
  });

  it('passes the complete message history to generateText', async () => {
    mocks.generateText.mockResolvedValue({ text: 'ok' });
    const messages = [{ role: 'user' as const, content: 'one' }, { role: 'assistant' as const, content: 'two' }, { role: 'user' as const, content: 'three' }];
    await messageChat(messages);
    expect(mocks.generateText).toHaveBeenCalledWith(expect.objectContaining({ messages }));
  });

  it('logs generation errors and rethrows them', async () => {
    const error = new Error('offline');
    mocks.generateText.mockRejectedValue(error);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(messageChat([])).rejects.toBe(error);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Error'), error);
    spy.mockRestore();
  });
});
