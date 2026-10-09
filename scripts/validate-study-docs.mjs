import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('docs');
const files = fs.readdirSync(root).filter(name => name.endsWith('.md'));
const errors = [];
let links = 0;
let jsonBlocks = 0;

function anchors(text) {
  const counts = new Map();
  const result = new Set();
  let fence = false;
  for (const line of text.split('\n')) {
    if (/^```/.test(line)) { fence = !fence; continue; }
    if (fence) continue;
    const match = line.match(/^#{1,6}\s+(.+)/);
    if (!match) continue;
    const base = match[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/ /g, '-');
    const count = counts.get(base) || 0;
    counts.set(base, count + 1);
    result.add(base + (count ? `-${count}` : ''));
  }
  return result;
}

for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if ((text.match(/^```/gm) || []).length % 2) errors.push(`${file}: unbalanced fences`);
  const prose = text.replace(/```[\s\S]*?```/g, '');
  for (const match of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)\)/g)) {
    if (/^(https?:|mailto:)/.test(match[1])) continue;
    const [name, anchor] = match[1].split('#');
    if (name && !name.endsWith('.md')) continue;
    links++;
    const target = path.resolve(root, name || file);
    if (!fs.existsSync(target)) errors.push(`${file}: missing ${match[1]}`);
    else if (anchor && !anchors(fs.readFileSync(target, 'utf8')).has(decodeURIComponent(anchor))) {
      errors.push(`${file}: missing anchor ${match[1]}`);
    }
  }
  if (/^0[0-6]-/.test(file)) {
    for (const match of text.matchAll(/```json\n([\s\S]*?)\n```/g)) {
      jsonBlocks++;
      try { JSON.parse(match[1]); }
      catch (error) { errors.push(`${file}: ${error.message}`); }
    }
  }
}
console.log(JSON.stringify({ files: files.length, links, jsonBlocks, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
