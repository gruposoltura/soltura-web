#!/usr/bin/env node
// Stelt worker/worker.js samen: worker/worker.template.js + js/routes.js + js/resolve.js (dezelfde code als de site gebruikt).
// node scripts/make-worker.mjs  -> worker/worker.js, plakklaar in Cloudflare (gruposoltura-legacy).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const shared = ['// ---- js/routes.js ----', rd('js/routes.js'), '// ---- js/resolve.js ----', rd('js/resolve.js'), 'const solturaResolve = self.solturaResolve;'].join('\n');
const out = rd('worker/worker.template.js').replace('/*__SHARED__*/', shared);
if (out.includes('/*__SHARED__*/')) throw new Error('placeholder niet vervangen');
fs.writeFileSync(path.join(ROOT, 'worker/worker.js'), out);
console.log('worker/worker.js', out.length, 'bytes');
