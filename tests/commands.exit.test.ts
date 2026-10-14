import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isExitCommand } from '../commands';

describe('exit commands', () => {
  it.each(['/exit', '/quit', '  /EXIT  ', '\t/QuIt\n'])('accepts %j', value => {
    expect(isExitCommand(value)).toBe(true);
  });

  it.each(['exit', '/quit now', '', '/save'])('rejects %j', value => {
    expect(isExitCommand(value)).toBe(false);
  });

  it('checks the command before adding history or calling the model', () => {
    const source = readFileSync('index.ts', 'utf8');
    const check = source.search(/isExitCommand\s*\(/);
    expect(check).toBeGreaterThan(-1);
    expect(source.indexOf('Goodbye!', check)).toBeGreaterThan(check);
    expect(source.indexOf('messages.push', check)).toBeGreaterThan(source.indexOf('Goodbye!', check));
  });
});
