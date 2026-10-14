import { describe, expect, it } from 'vitest';
import { trimHistory, type Message } from '../chat';

const m = (role: Message['role'], content: string): Message => ({ role, content });

describe('trimHistory', () => {
  it('returns the newest messages without mutating input', () => {
    const input = [m('user', '1'), m('assistant', '2'), m('user', '3'), m('assistant', '4')];
    const snapshot = structuredClone(input);
    expect(trimHistory(input, 2)).toEqual([m('user', '3'), m('assistant', '4')]);
    expect(input).toEqual(snapshot);
  });

  it('always preserves a leading system message within the limit', () => {
    const input = [m('system', 'rules'), m('user', '1'), m('assistant', '2'), m('user', '3')];
    expect(trimHistory(input, 3)).toEqual([m('system', 'rules'), m('user', '3')]);
  });

  it('never starts the non-system history with an assistant', () => {
    const result = trimHistory([m('user', 'old'), m('assistant', 'orphan'), m('user', 'new'), m('assistant', 'reply')], 3);
    expect(result[0].role).toBe('user');
    expect(result).toEqual([m('user', 'new'), m('assistant', 'reply')]);
  });

  it('handles non-positive limits with an empty result', () => {
    expect(trimHistory([m('system', 'rules')], 0)).toEqual([]);
  });
});
