import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listSessions, loadSession, saveSession } from '../sessions';

let root = '';
afterEach(async () => { if (root) await rm(root, { recursive: true, force: true }); delete process.env.CHAT_CLI_HOME; });
async function home() { root = await mkdtemp(join(tmpdir(), 'chat-cli-')); process.env.CHAT_CLI_HOME = root; }

describe('session persistence', () => {
  it('round-trips messages and returns the JSON path', async () => {
    await home();
    const messages = [{ role: 'user' as const, content: 'hello' }];
    const path = await saveSession('demo', messages);
    expect(path).toBe(join(root, 'sessions', 'demo.json'));
    expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(messages);
    await expect(loadSession('demo')).resolves.toEqual(messages);
  });

  it('lists session names in sorted order', async () => {
    await home();
    await saveSession('zeta', []); await saveSession('alpha', []);
    await expect(listSessions()).resolves.toEqual(['alpha', 'zeta']);
  });

  it('rejects invalid names', async () => {
    await home();
    for (const name of ['', '../escape', 'has space', 'x'.repeat(65)]) {
      await expect(saveSession(name, [])).rejects.toThrow('Invalid session name');
    }
  });

  it('reports a missing session clearly', async () => {
    await home();
    await expect(loadSession('missing')).rejects.toThrow(/missing|not found/i);
  });

  it('uses a temporary file and atomic rename when saving', async () => {
    const source = await readFile(new URL('../sessions.ts', import.meta.url), 'utf8');
    expect(source).toMatch(/(?:\.tmp|temp)/i);
    expect(source).toMatch(/rename\s*\(/);
  });
});
