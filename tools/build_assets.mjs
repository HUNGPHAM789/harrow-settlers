// Runs pxl on every art/*.px.js, copies sprites to public/assets/sprites and writes manifest.json {name:{w,h,frames?}}
import { execSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const localPXL = path.resolve('tools/pxl/bin/pxl.js');
const PXL = fs.existsSync(localPXL) ? localPXL : path.join(os.homedir(), '.claude/skills/pxl-pixel-art/bin/pxl.js');
const dest = 'public/assets/sprites'; fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true });
const man = {};
for (const f of fs.readdirSync('art').filter(f => f.endsWith('.px.js') && !f.startsWith('_'))) {
  const out = `art/out/${f.replace('.px.js','')}`; fs.rmSync(out, { recursive: true, force: true });
  execSync(`node ${PXL} build art/${f} --out ${out}`, { stdio: 'inherit' });
  for (const sub of ['sprites', 'anims']) {
    const sd = path.join(out, sub);
    if (!fs.existsSync(sd)) continue;
    for (const p of fs.readdirSync(sd).filter(p => p.endsWith('.png'))) {
      const b = fs.readFileSync(path.join(sd, p)); const name = p.slice(0, -4);
      man[name] = { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; fs.copyFileSync(path.join(sd, p), path.join(dest, p));
    }
  }
}
fs.writeFileSync('public/assets/manifest.json', JSON.stringify(man, null, 1)); console.log(Object.keys(man).length, 'sprites');
