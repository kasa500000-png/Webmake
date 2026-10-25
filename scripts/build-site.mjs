import './build.mjs';
import { mkdir, copyFile, cp, readdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
for (const file of await readdir('.')) {
  if (/\.(html|css|js)$/.test(file)) await copyFile(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true, filter: path => !path.endsWith('.md') });
