import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateText: vi.fn(), ollama: vi.fn((name: string) => `model:${name}`) }));
vi.mock('ai', () => ({ generateText: mocks.generateText }));
vi.mock('ai-sdk-ollama', () => ({ ollama: mocks.ollama }));

import { DEFAULT_MODEL, getModelName, messageChat } from '../chat';

describe('model selection', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.generateText.mockResolvedValue({ text: 'ok' }); });

  it('exports llama3.1 as the default and ignores empty overrides', () => {
    expect(DEFAULT_MODEL).toBe('llama3.1');
    expect(getModelName({} as NodeJS.ProcessEnv)).toBe(DEFAULT_MODEL);
    expect(getModelName({ OLLAMA_MODEL: '' } as NodeJS.ProcessEnv)).toBe(DEFAULT_MODEL);
  });

  it('reads a non-empty OLLAMA_MODEL override', () => {
    expect(getModelName({ OLLAMA_MODEL: 'qwen' } as NodeJS.ProcessEnv)).toBe('qwen');
  });

  it('messageChat resolves its model through getModelName', async () => {
    const previous = process.env.OLLAMA_MODEL;
    process.env.OLLAMA_MODEL = 'fixture-model';
    await messageChat([{ role: 'user', content: 'hi' }]);
    expect(mocks.ollama).toHaveBeenCalledWith('fixture-model');
    previous === undefined ? delete process.env.OLLAMA_MODEL : process.env.OLLAMA_MODEL = previous;
  });
});
