import { afterEach, describe, expect, it, vi } from 'vitest';
import { colorsEnabled, formatAI, formatError, formatUserPrompt } from '../ui';

const ttyDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
afterEach(() => {
  vi.unstubAllEnvs();
  if (ttyDescriptor) Object.defineProperty(process.stdout, 'isTTY', ttyDescriptor);
  else delete (process.stdout as { isTTY?: boolean }).isTTY;
});

describe('terminal formatting', () => {
  it('enables colors only for a TTY without NO_COLOR', () => {
    expect(colorsEnabled({}, true)).toBe(true);
    expect(colorsEnabled({ NO_COLOR: '1' }, true)).toBe(false);
    expect(colorsEnabled({}, false)).toBe(false);
  });

  it('returns the exact plain strings when color is disabled', () => {
    vi.stubEnv('NO_COLOR', '1');
    expect(formatUserPrompt()).toBe('User: ');
    expect(formatAI('hello')).toBe('AI: hello');
    expect(formatError('bad')).toBe('Error: bad');
  });

  it('uses ANSI escapes when color is enabled', () => {
    delete process.env.NO_COLOR;
    Object.defineProperty(process.stdout, 'isTTY', { value: true, configurable: true });
    expect(formatUserPrompt()).toMatch(/\x1b\[/);
    expect(formatAI('hello')).toMatch(/\x1b\[/);
    expect(formatError('bad')).toMatch(/\x1b\[/);
  });
});
