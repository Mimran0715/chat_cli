import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../cli';

describe('CLI chat options', () => {
  it('parses system and model flags', () => {
    expect(parseCliArgs(['--system', 'Be brief', '--model', 'qwen'])).toEqual({ system: 'Be brief', model: 'qwen' });
  });

  it('uses CHAT_SYSTEM only as the system fallback', () => {
    const previous = process.env.CHAT_SYSTEM;
    process.env.CHAT_SYSTEM = 'from env';
    expect(parseCliArgs([])).toEqual({ system: 'from env' });
    expect(parseCliArgs(['--system', 'flag'])).toEqual({ system: 'flag' });
    previous === undefined ? delete process.env.CHAT_SYSTEM : process.env.CHAT_SYSTEM = previous;
  });

  it('does not invent values for absent options', () => {
    const previous = process.env.CHAT_SYSTEM;
    delete process.env.CHAT_SYSTEM;
    expect(parseCliArgs([])).toEqual({});
    previous === undefined ? delete process.env.CHAT_SYSTEM : process.env.CHAT_SYSTEM = previous;
  });
});
