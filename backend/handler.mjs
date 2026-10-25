const allowedOrigins = new Set(['https://hwangdongtae.vercel.app', 'https://kasa500000-png.github.io', 'http://localhost:4318', 'http://127.0.0.1:4318']);

export function koreaDate(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function publicMenu(row, now = new Date()) {
  const date = koreaDate(now);
  return { date, menu: row?.service_date === date ? row : null, serverTime: now.toISOString() };
}

export function createHandler({ repository, verifyToken, now = () => new Date() }) {
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Cache-Control': 'no-store', Vary: 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (origin && allowedOrigins.has(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Headers'] = 'authorization, content-type';
      headers['Access-Control-Allow-Methods'] = 'GET, PUT, OPTIONS';
    }
    const json = (body, status = 200) => Response.json(body, { status, headers });
    if (origin && !allowedOrigins.has(origin)) return json({ error: '허용되지 않은 접근입니다.' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    const admin = path === '/admin/today-menu';
    if (path !== '/today-menu' && !admin) return json({ error: 'Not found' }, 404);
    if ((!admin && request.method !== 'GET') || (admin && !['GET', 'PUT'].includes(request.method))) return json({ error: 'Method not allowed' }, 405);
    try {
      let userId;
      if (admin) {
        const authorization = request.headers.get('authorization') || '';
        if (!authorization.startsWith('Bearer ')) return json({ error: '로그인이 필요합니다.' }, 401);
        try { userId = await verifyToken(authorization.slice(7)); } catch { return json({ error: '로그인이 만료되었습니다. 다시 로그인해 주세요.' }, 401); }
        if (!userId || !await repository.isAdmin(userId)) return json({ error: '매장 관리자만 이용할 수 있습니다.' }, 403);
      }
      if (request.method === 'GET') {
        const row = await repository.read();
        return json(admin ? { ...publicMenu(row, now()), latest: row } : publicMenu(row, now()));
      }
      if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'JSON 형식이 필요합니다.' }, 415);
      if (Number(request.headers.get('content-length')) > 2048) return json({ error: '입력 내용이 너무 깁니다.' }, 413);
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > 2048) return json({ error: '입력 내용이 너무 깁니다.' }, 413);
      let body;
      try { body = JSON.parse(raw); } catch { return json({ error: '입력 내용을 확인해 주세요.' }, 400); }
      const fishName = typeof body?.fishName === 'string' ? body.fishName.trim() : '';
      if (!fishName || [...fishName].length > 60 || /[\x00-\x1f\x7f]/.test(fishName) || !['available', 'sold_out'].includes(body?.status)) return json({ error: '생선 이름(1~60자)과 판매 상태를 확인해 주세요.' }, 400);
      const row = await repository.save({ fishName, status: body.status, userId });
      return json({ ...publicMenu(row, now()), latest: row });
    } catch (error) {
      console.error('Menu request failed', error.code || error.name);
      return json({ error: '저장소에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.' }, 503);
    }
  };
}
