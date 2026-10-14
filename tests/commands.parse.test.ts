import { describe, expect, it } from 'vitest';
import { parseCommand } from '../commands';

describe('parseCommand', () => {
  it('parses save and load names', () => {
    expect(parseCommand('/save draft-one')).toEqual({ type: 'save', arg: 'draft-one' });
    expect(parseCommand(' /LOAD old_session ')).toEqual({ type: 'load', arg: 'old_session' });
  });

  it('parses sessions and both exit forms', () => {
    expect(parseCommand('/sessions')).toEqual({ type: 'sessions' });
    expect(parseCommand('/exit')).toEqual({ type: 'exit' });
    expect(parseCommand('/quit')).toEqual({ type: 'exit' });
  });

  it('returns none for ordinary or incomplete input', () => {
    expect(parseCommand('hello')).toEqual({ type: 'none' });
    expect(parseCommand('/save')).toEqual({ type: 'none' });
    expect(parseCommand('/unknown')).toEqual({ type: 'none' });
  });
});
