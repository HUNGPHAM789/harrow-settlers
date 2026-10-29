// usage: node tools/check_sprites.mjs art/foo.px.js name1 name2 ...  -> builds with pxl, verifies names exist
import { execSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const [art, ...names] = process.argv.slice(2);
const PXL = path.join(os.homedir(), '.claude/skills/pxl-pixel-art/bin/pxl.js');
const out = `art/out/${path.basename(art).replace('.px.js','')}`;
fs.rmSync(out, { recursive: true, force: true });
try { execSync(`node ${PXL} build ${art} --out ${out}`, { stdio: 'pipe' }); }
catch (e) { console.error(String(e.stdout) + String(e.stderr)); process.exit(1); }
const have = new Set(fs.readdirSync(path.join(out, 'sprites')).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)));
const missing = names.filter(n => !have.has(n));
if (missing.length) { console.error('MISSING sprites: ' + missing.join(', ')); process.exit(1); }
console.log('ok', names.length);
