import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'site');
const output = path.join(root, '_site');
const input = process.argv[2] || '/';
const base = input === '/' ? '/' : `/${input.replace(/^\/+|\/+$/g, '')}/`;
if (!/^\/(?:[A-Za-z0-9_][A-Za-z0-9_.-]*\/)*$/.test(base)) throw Error('Invalid Pages base path');
if (path.dirname(output) !== root || path.basename(output) !== '_site') throw Error('Unexpected build destination');
fs.rmSync(output, {recursive: true, force: true});

let count = 0;
function copy(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw Error(`Links are not supported: ${file}`);
    if (entry.isDirectory()) {copy(file); continue;}
    const relative = path.relative(source, file);
    if (!/\.(html|js|css|svg|webp|mp4)$/.test(relative)) throw Error(`Unexpected website file: ${relative}`);
    const target = path.join(output, relative);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    if (/\.(html|js|css)$/.test(relative)) {
      let text = fs.readFileSync(file, 'utf8');
      text = text.replace(/\b(href|src|poster|srcset)="\/(?!\/)/g, `$1="${base}`)
        .replace(/\blink\('\/(?!\/)/g, `link('${base}`)
        .replace(/(["'])\/assets\//g, `$1${base}assets/`);
      if (relative === 'site.js') {
        const routing = "const route = location.pathname.split('/').filter(Boolean)[0] || 'overview';";
        if (!text.includes(routing)) throw Error('Update the route adapter for the current site.js');
        text = text.replace(routing, `const route = location.pathname.slice(${base.length - 1}).split('/').filter(Boolean)[0] || 'overview';`);
      }
      fs.writeFileSync(target, text);
    } else fs.copyFileSync(file, target);
    count++;
  }
}
copy(source);
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Built ${count} website files for ${base}`);
