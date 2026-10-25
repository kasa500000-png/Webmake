import pg from 'pg';
import { attachDatabasePool } from '@neon/functions';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { createHandler } from './handler.mjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 8000, statement_timeout: 8000 });
attachDatabasePool(pool);
const jwks = createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL));
const issuer = new URL(process.env.NEON_AUTH_BASE_URL).origin;
const columns = 'fish_name, service_date::text, status, updated_at';
const repository = {
  async isAdmin(id) { return (await pool.query('SELECT 1 FROM public.menu_admins WHERE user_id = $1', [id])).rowCount === 1; },
  async read() { return (await pool.query(`SELECT ${columns} FROM public.today_menu WHERE id = 1`)).rows[0] || null; },
  async save({ fishName, status, userId }) {
    return (await pool.query(`INSERT INTO public.today_menu (id, fish_name, service_date, status, updated_by)
      VALUES (1, $1, (now() AT TIME ZONE 'Asia/Seoul')::date, $2, $3)
      ON CONFLICT (id) DO UPDATE SET fish_name = EXCLUDED.fish_name, service_date = EXCLUDED.service_date,
      status = EXCLUDED.status, updated_at = now(), updated_by = EXCLUDED.updated_by RETURNING ${columns}`, [fishName, status, userId])).rows[0];
  }
};
export default { fetch: createHandler({ repository, verifyToken: async token => (await jwtVerify(token, jwks, { issuer, algorithms: ['EdDSA'] })).payload.sub }) };
