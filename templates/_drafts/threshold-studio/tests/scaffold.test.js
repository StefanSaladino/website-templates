import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { RELEASE, DRAFT_ID, worldPoint } from '../src/config.js';
const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
test('release and local assets agree', () => {
  const html = read('index.html');
  assert.equal(DRAFT_ID, 'threshold-studio');
  assert.match(html, new RegExp('data-release="' + RELEASE + '"'));
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /id="main"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  for (const [, path, version] of html.matchAll(/(?:href|src)="((?:styles|src)\/[^?]+)\?v=([^"]+)"/g)) {
    assert.equal(version, RELEASE);
    assert.ok(existsSync(new URL(path, root)));
  }
  assert.equal([...html.matchAll(/(?:href|src)="(?:styles|src)\//g)].length, 3);
  assert.match(read('src/main.js'), /config\.js\?v=T17/);
  assert.match(html, /<canvas[^>]+hidden/);
  assert.doesNotMatch(html, /(?:src|href)="https?:\/\//i);
});
test('storyboard forward depth converts to world Z', () => {
  assert.deepEqual(worldPoint(-2.4, 2.4, -12), [-2.4, 2.4, 12]);
  assert.deepEqual(worldPoint(0, 0, 0), [0, 0, 0]);
  assert.deepEqual(worldPoint(0, 2.2, 1), [0, 2.2, -1]);
  assert.throws(() => worldPoint(0, NaN, 1), TypeError);
});
