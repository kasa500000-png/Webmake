import { siteConfig } from './site-config.js';
export function koreaDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function menuPresentation(data, date = koreaDate()) {
  const menu = data?.date === date && data.menu?.service_date === date ? data.menu : null;
  if (!menu) return { title: '오늘의 생선은 전화로 확인해 주세요', status: '방문 전 문의', available: false, date };
  return { title: menu.status === 'sold_out' ? `오늘의 ${menu.fish_name} 조림은 품절되었습니다` : `오늘의 조림 · ${menu.fish_name}`, status: menu.status === 'sold_out' ? '오늘 품절' : '판매 중', available: menu.status === 'available', date };
}
export function startTodayMenu() {
  let data = null, pending = false, offset = 0, date = koreaDate();
  const render = () => {
    const value = menuPresentation(data, koreaDate(new Date(Date.now() + offset)));
    document.querySelectorAll('[data-today-title]').forEach(el => { el.textContent = value.title; });
    document.querySelectorAll('[data-today-date]').forEach(el => { el.textContent = `${value.date.replaceAll('-', '.')} 기준`; });
    document.querySelectorAll('[data-today-status]').forEach(el => { el.textContent = value.status; el.dataset.available = String(value.available); });
  };
  async function refresh() {
    if (pending) return;
    pending = true;
    try {
      if (!siteConfig.apiUrl) throw new Error('Not configured');
      const response = await fetch(`${siteConfig.apiUrl.replace(/\/$/, '')}/today-menu`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Unavailable');
      const result = await response.json();
      if (!result.serverTime || !result.date) throw new Error('Invalid response');
      offset = Date.parse(result.serverTime) - Date.now();
      data = result;
    } catch { data = null; } finally { pending = false; render(); }
  }
  render(); refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 60000);
  setInterval(() => {
    const current = koreaDate(new Date(Date.now() + offset));
    if (date !== current) { date = current; data = null; render(); refresh(); }
  }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); refresh(); } });
  window.addEventListener('online', refresh);
  window.addEventListener('pageshow', () => { render(); refresh(); });
}
if (typeof document !== 'undefined' && document.querySelector('[data-today-title]')) startTodayMenu();
