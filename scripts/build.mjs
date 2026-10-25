import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
await mkdir('.build/function', { recursive: true });
await build({ entryPoints: ['admin.js'], outfile: 'assets/admin.bundle.js', bundle: true, format: 'esm', platform: 'browser', target: 'es2022', minify: true });
await build({ entryPoints: ['backend/index.mjs'], outfile: '.build/function/index.mjs', bundle: true, format: 'esm', platform: 'node', target: 'node24', external: ['pg-native'], banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" } });
