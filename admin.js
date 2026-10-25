import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthVanillaAdapter } from '@neondatabase/auth/vanilla/adapters';
import { siteConfig } from './site-config.js';
import { menuPresentation } from './today-menu.js';
const $ = id => document.getElementById(id);
let latest = null, busy = false;
const tokenParam = new URL(location.href).searchParams.get('token');
const auth = siteConfig.authUrl ? createAuthClient(siteConfig.authUrl, { adapter: BetterAuthVanillaAdapter({ fetchOptions: { timeout: 12000 } }) }) : null;
function message(text, error = false) { $('admin-message').textContent = text; $('admin-message').dataset.error = String(error); }
function panel(name) { for (const id of ['login-panel', 'editor-panel', 'reset-panel']) $(id).hidden = id !== name; }
function setBusy(value) { busy = value; document.querySelectorAll('button').forEach(el => { el.disabled = value; }); $('same-fish').disabled = value || !latest; }
function authError(result) {
  if (result?.error) {
    const code = result.error.code || '';
    if (/INVALID_EMAIL_OR_PASSWORD|USER_NOT_FOUND/.test(code)) throw new Error('이메일과 비밀번호를 확인해 주세요. 처음이라면 비밀번호 재설정을 이용하세요.');
    if (/TOKEN/.test(code)) throw new Error('설정 링크가 만료되었거나 올바르지 않습니다. 새 링크를 요청해 주세요.');
    throw new Error(result.error.message || '요청을 완료하지 못했습니다.');
  }
  return result?.data;
}
async function api(method = 'GET', body) {
  // Pinned Neon SDK 0.6 shares /token and /get-session caches. Force a real
  // token response; the SDK consumes this header before sending the request.
  const token = authError(await auth.token({ fetchOptions: { headers: { 'X-Force-Fetch': 'true' } } }))?.token;
  if (!token) { panel('login-panel'); throw new Error('로그인이 만료되었습니다. 다시 로그인해 주세요.'); }
  const response = await fetch(`${siteConfig.apiUrl.replace(/\/$/, '')}/admin/today-menu`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: AbortSignal.timeout(12000)
  });
  const result = await response.json();
  if (!response.ok) { if (response.status === 401) panel('login-panel'); throw new Error(result.error || '요청에 실패했습니다.'); }
  return result;
}
function showPublished(result) {
  latest = result.latest;
  const view = menuPresentation(result, result.date);
  $('published-title').textContent = view.title;
  $('published-date').textContent = `${result.date} · ${view.status}${latest ? ` / 마지막 저장: ${new Date(latest.updated_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` : ''}`;
  $('same-fish').disabled = !latest || busy;
}
async function enterEditor(user) {
  const result = await api();
  showPublished(result);
  $('account-name').textContent = user.email;
  if (latest) { $('fish-name').value = latest.fish_name; document.querySelector(`input[name="sale-status"][value="${latest.status}"]`).checked = true; }
  panel('editor-panel'); message('오늘 준비한 생선을 확인한 뒤 저장해 주세요.');
}
async function action(fn) {
  if (busy) return;
  setBusy(true);
  try { await fn(); } catch (error) { message(error.name === 'TimeoutError' ? '연결이 지연되고 있습니다. 입력 내용은 유지됩니다. 다시 시도해 주세요.' : error.message || '연결을 확인한 뒤 다시 시도해 주세요.', true); }
  finally { setBusy(false); }
}
$('login-form').addEventListener('submit', event => { event.preventDefault(); action(async () => {
  if (!auth) throw new Error('관리자 연결을 준비하고 있습니다.');
  const data = authError(await auth.signIn.email({ email: $('email').value.trim(), password: $('password').value }));
  $('password').value = ''; await enterEditor(data.user);
}); });
$('forgot-password').addEventListener('click', () => action(async () => {
  if (!$('email').reportValidity() || !$('email').value) { message('먼저 관리자 이메일을 입력해 주세요.', true); return; }
  const redirectTo = new URL('admin.html', location.href).href;
  authError(await auth.requestPasswordReset({ email: $('email').value.trim(), redirectTo }));
  message('등록된 이메일이라면 비밀번호 설정 링크가 전송됩니다. 받은편지함과 스팸함을 확인해 주세요.');
}));
$('reset-form').addEventListener('submit', event => { event.preventDefault(); action(async () => {
  if ($('new-password').value !== $('confirm-password').value) throw new Error('두 비밀번호가 일치하지 않습니다.');
  authError(await auth.resetPassword({ newPassword: $('new-password').value, token: tokenParam }));
  history.replaceState(null, '', location.pathname); $('reset-form').reset(); panel('login-panel'); message('비밀번호를 저장했습니다. 새 비밀번호로 로그인해 주세요.');
}); });
$('logout').addEventListener('click', () => action(async () => { authError(await auth.signOut()); latest = null; $('menu-form').reset(); panel('login-panel'); message('로그아웃했습니다.'); }));
$('menu-form').addEventListener('submit', event => { event.preventDefault(); action(async () => {
  const result = await api('PUT', { fishName: $('fish-name').value.trim(), status: document.querySelector('input[name="sale-status"]:checked').value });
  showPublished(result); message('오늘 메뉴로 저장했습니다. 홈페이지에 1분 이내 반영됩니다.');
}); });
$('same-fish').addEventListener('click', () => action(async () => {
  if (!latest) return;
  const result = await api('PUT', { fishName: latest.fish_name, status: 'available' });
  showPublished(result); $('fish-name').value = latest.fish_name; document.querySelector('input[value="available"]').checked = true;
  message('같은 생선을 오늘 판매 중으로 등록했습니다.');
}));
action(async () => {
  if (!auth || !siteConfig.apiUrl) { panel('login-panel'); throw new Error('관리자 연결을 준비하고 있습니다. 잠시 후 다시 이용해 주세요.'); }
  if (tokenParam) { panel('reset-panel'); message('새 비밀번호를 설정해 주세요.'); return; }
  panel('login-panel');
  const session = authError(await auth.getSession());
  if (session?.user) await enterEditor(session.user); else message('매장 관리자 계정으로 로그인해 주세요.');
});
