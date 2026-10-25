import { defineConfig } from '@neon/config/v1';
export default defineConfig({
  auth: true,
  functions: { menu: { name: '황동태 오늘의 조림', source: 'backend/index.mjs' } },
});
