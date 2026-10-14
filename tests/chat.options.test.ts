import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateText: vi.fn(), ollama: vi.fn((name: string) => name) }));
vi.mock('ai', () => ({ generateText: mocks.generateText }));
vi.mock('ai-sdk-ollama', () => ({ ollama: mocks.ollama }));

import { messageChat } from '../chat';

describe('chat options', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.generateText.mockResolvedValue({ text: 'ok' }); });

  it('passes an optional system prompt to generateText', async () => {
    await messageChat([], { system: 'be concise' });
    expect(mocks.generateText).toHaveBeenCalledWith(expect.objectContaining({ system: 'be concise' }));
  });

  it('allows an explicit model to override the default', async () => {
    await messageChat([], { model: 'custom' });
    expect(mocks.ollama).toHaveBeenCalledWith('custom');
  });

  it('keeps options optional for existing call sites', async () => {
    await expect(messageChat([])).resolves.toEqual({ role: 'assistant', content: 'ok' });
  });
});
