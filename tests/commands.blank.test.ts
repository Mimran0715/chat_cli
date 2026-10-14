import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { shouldSend, USER_PROMPT } from '../commands';

describe('blank input', () => {
  it('exports the exact prompt including its trailing space', () => {
    expect(USER_PROMPT).toBe('User: ');
  });

  it('rejects blank input and accepts visible input', () => {
    expect(shouldSend('')).toBe(false);
    expect(shouldSend(' \n\t ')).toBe(false);
    expect(shouldSend(' hello ')).toBe(true);
  });

  it('uses shouldSend before mutating history or calling the model', () => {
    const source = readFileSync('index.ts', 'utf8');
    const guard = source.search(/shouldSend\s*\(/);
    expect(source).toContain('USER_PROMPT');
    expect(guard).toBeGreaterThan(-1);
    expect(source.indexOf('messages.push', guard)).toBeGreaterThan(guard);
  });
});
