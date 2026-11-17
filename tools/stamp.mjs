// CSS ve JS dosyalarının adresine içerik özetinden bir sürüm etiketi ekler (site.css?v=1a2b3c4d).
// Dosya değişince adres de değişir; tarayıcılar eski kopyayı önbellekten kullanamaz.
// Kullanım: node tools/stamp.mjs   (site.css veya site.js değiştikten sonra, commit öncesi)
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const assets = ['/assets/css/site.css', '/assets/js/site.js'];
const hash = (p) => createHash('sha1').update(readFileSync(join(root, p))).digest('hex').slice(0, 8);
const stamps = Object.fromEntries(assets.map((a) => [a, hash(a)]));

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'tools' || name === 'assets') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) pages.push(p);
  }
})(root);

for (const file of pages) {
  let s = readFileSync(file, 'utf8');
  const before = s;
  for (const [a, h] of Object.entries(stamps)) {
    s = s.split(`"${a}"`).join(`"${a}?v=${h}"`);
    s = s.replace(new RegExp(`"${a.replace(/[.]/g, '[.]')}[?]v=[0-9a-f]+"`, 'g'), `"${a}?v=${h}"`);
  }
  if (s !== before) writeFileSync(file, s);
}
console.log(stamps, pages.length + ' sayfa');
