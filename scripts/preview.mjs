import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../_site');
const input = process.argv[2] || '/';
const base = input === '/' ? '/' : `/${input.replace(/^\/+|\/+$/g,'')}/`;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4'};
const server = http.createServer((req,res)=>{
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400).end();return;}
  if(!pathname.startsWith(base)){res.writeHead(404).end();return;}
  let file = path.resolve(root,pathname.slice(base.length));
  if(file !== root && !file.startsWith(root+path.sep)){res.writeHead(404).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  const size=fs.statSync(file).size;
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(range){
    const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),size-1):size-1;
    if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}
    res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
  }else{
    res.writeHead(200,{...headers,'Content-Length':size});
    if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
  }
});
server.listen(8766,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:8766${base}`));
