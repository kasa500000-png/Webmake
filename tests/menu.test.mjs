import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler, koreaDate, publicMenu } from '../backend/handler.mjs';
import { menuPresentation } from '../today-menu.js';
const now = new Date('2026-10-25T03:00:00Z');
function fixture() {
  let row = null;
  const repository = {
    isAdmin: async id => id === 'admin', read: async () => row,
    save: async ({ fishName, status }) => (row = { fish_name: fishName, status, service_date: koreaDate(now), updated_at: now.toISOString() })
  };
  const fetch = createHandler({ repository, verifyToken: async token => { if (token === 'expired') throw Error(); return token; }, now: () => now });
  const request = (path, method = 'GET', token, body) => fetch(new Request('https://test.local' + path, { method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }));
  return { request, repository };
}
test('Korean midnight removes yesterday’s fish', () => {
  assert.equal(koreaDate(new Date('2026-10-25T14:59:59Z')), '2026-10-25');
  assert.equal(koreaDate(new Date('2026-10-25T15:00:00Z')), '2026-10-26');
  assert.equal(publicMenu({ service_date: '2026-10-25' }, new Date('2026-10-25T15:00:00Z')).menu, null);
});
test('public read, admin write and sold out are shared through repository', async () => {
  const { request } = fixture();
  assert.equal((await (await request('/today-menu')).json()).menu, null);
  let response = await request('/admin/today-menu', 'PUT', 'admin', { fishName: '  가자미  ', status: 'available', service_date: '2099-01-01' });
  assert.equal(response.status, 200);
  let data = await (await request('/today-menu')).json();
  assert.equal(data.menu.fish_name, '가자미');
  assert.equal(data.menu.service_date, '2026-10-25');
  assert.equal(menuPresentation(data, data.date).title, '오늘의 조림 · 가자미');
  await request('/admin/today-menu', 'PUT', 'admin', { fishName: '가자미', status: 'sold_out' });
  data = await (await request('/today-menu')).json();
  assert.match(menuPresentation(data, data.date).title, /품절/);
  await request('/admin/today-menu', 'PUT', 'admin', { fishName: '가자미', status: 'available' });
  assert.equal((await (await request('/today-menu')).json()).menu.status, 'available');
});
test('anonymous, expired and non-admin writes are blocked', async () => {
  const { request } = fixture();
  for (const [token, status] of [[undefined, 401], ['expired', 401], ['visitor', 403]]) {
    assert.equal((await request('/admin/today-menu', 'PUT', token, { fishName: '갈치', status: 'available' })).status, status);
    assert.equal((await request('/admin/today-menu', 'GET', token)).status, status);
  }
});
test('invalid bodies never reach storage', async () => {
  const { request } = fixture();
  for (const body of [null, {}, { fishName: ' ', status: 'available' }, { fishName: '가'.repeat(61), status: 'available' }, { fishName: '갈치', status: 'unknown' }]) {
    const response = await request('/admin/today-menu', 'PUT', 'admin', body);
    assert.equal(response.status, 400);
  }
  assert.equal((await (await request('/today-menu')).json()).menu, null);
});
test('missing, stale and unavailable responses show telephone fallback', () => {
  for (const data of [null, { date: '2026-10-24', menu: { service_date: '2026-10-24', fish_name: '갈치' } }, { date: '2026-10-25', menu: null }]) assert.match(menuPresentation(data, '2026-10-25').title, /전화/);
});
test('database failure is a retryable service error', async () => {
  const { request, repository } = fixture(); repository.read = async () => { throw new Error('offline'); };
  assert.equal((await request('/today-menu')).status, 503);
});
test('CORS allows site and rejects unrelated origins', async () => {
  const fetch = createHandler({ repository: {}, verifyToken: async () => '' });
  const allowed = await fetch(new Request('https://api.test/today-menu', { method: 'OPTIONS', headers: { origin: 'https://kasa500000-png.github.io' } }));
  assert.equal(allowed.status, 204); assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://kasa500000-png.github.io');
  const denied = await fetch(new Request('https://api.test/today-menu', { headers: { origin: 'https://evil.example' } }));
  assert.equal(denied.status, 403);
});
