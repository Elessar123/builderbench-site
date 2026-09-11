import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.join(project, '_site');
const input = process.argv[2] || '/';
const base = input === '/' ? '/' : '/' + input.replace(/^\/+|\/+$/g, '') + '/';
const privacyPattern = /research by|our research|workspace\/|\b[A-Z]:[\\/]|\.json|sha256|session_id|api_key/i;
function scan(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    const file = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink());
    if (entry.isDirectory()) {scan(file);continue;}
    assert.ok(entry.name === '.nojekyll' || /\.(html|js|css|svg|webp|mp4)$/.test(entry.name));
    if (/\.(html|js|css|svg)$/.test(entry.name)) assert.ok(!privacyPattern.test(fs.readFileSync(file,'utf8')), 'Private detail in '+entry.name);
  }
}
scan(root);
function checkLinks(content) {
  for (const match of content.matchAll(/(?:src|poster|srcset|href)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)) {
    assert.ok(match[1].startsWith(base), 'URL escapes the project path: '+match[1]);
    const file = path.join(root, match[1].slice(base.length));
    assert.ok(fs.existsSync(file), 'Missing local target: '+match[1]);
  }
}
for (const route of ['', 'results', 'stories', 'films', 'report']) {
  const shell=fs.readFileSync(path.join(root,route,'index.html'),'utf8');
  checkLinks(shell);
  assert.ok(shell.includes('src="'+base+'site.js'));
}
const dataModule = new vm.SourceTextModule(fs.readFileSync(path.join(root,'display-data.js'),'utf8'));
await dataModule.link(()=>{throw Error('Data must not load other files');});
await dataModule.evaluate();
const {evidence, reported, comparisons, discoveries}=dataModule.namespace;
assert.equal(reported.solved,45);assert.equal(reported.total,51);
assert.equal(reported.unresolved.length,6);
assert.equal(reported.families.reduce((sum,item)=>sum+item.solved,0),45);
assert.deepEqual(Array.from(reported.checkpoints,row=>row.solved),[8,25,33,40,45]);
assert.deepEqual(Array.from(comparisons.methods,row=>row.total),[5,11,24]);
assert.equal(evidence.tasks.filter(t=>t.suite==='original'&&t.solved).length,45);
assert.equal(evidence.tasks.filter(t=>t.suite==='new'&&t.solved).length,7);
assert.equal(evidence.tasks.filter(t=>t.video).length,52);
for(const task of evidence.tasks) {
  assert.ok(!Object.hasOwn(task,'source')&&!Object.hasOwn(task,'errors'));
  if(task.solved)assert.ok(task.maxError <= 5);
  for(const url of [task.video,...Object.values(task.images),...task.storyFrames.map(f=>f.image)].filter(Boolean))checkLinks('src="'+url+'"');
}
for(const item of Object.values(discoveries.cases)) {
  assert.ok(!Object.hasOwn(item,'sources'));
  assert.equal(item.stages.length,4);
  assert.ok(item.final.maxErrorMm<=5);
}
const cases=[['',''],['results',''],['stories',''],['stories','?case=clamp'],['stories','?case=packing'],['stories','?case=new-arch'],['stories','?case=leaning'],['films',''],['films','?task=cube-9-task-4'],['films','?task=cube-10-task-4'],['report','']];
for(const [route,search] of cases){
  const elements=new Map();
  const element=id=>{
    if(!elements.has(id))elements.set(id,{innerHTML:'',value:'task',dataset:{},handlers:{},classList:{add(){},toggle(){}},setAttribute(){},addEventListener(name,fn){this.handlers[name]=fn;},scrollIntoView(){},play:()=>Promise.resolve()});
    return elements.get(id);
  };
  const all=selector=>{
    const fields={'[data-suite]':['suite',['original','new']],'[data-film-suite]':['filmSuite',['original','new']],'[data-case]':['case',['t-stack','clamp','packing','leaning','new-arch']]};
    if(fields[selector]){
      const [key,values]=fields[selector];
      return values.map(value=>{const e=element(`${selector}:${value}`); e.dataset[key]=value; return e;});
    }
    if(selector==='[data-film]')return [...element('#film-grid').innerHTML.matchAll(/data-film="([^"]+)"/g)].map(m=>{const e=element(`film:${m[1]}`);e.dataset.film=m[1];return e;});
    return [];
  };
  const ctx=vm.createContext({console,URLSearchParams,location:{pathname:`${base}${route ? route+'/' : ''}`,search,hash:''},
    history:{replaceState(){}},matchMedia:()=>({matches:true}),
    document:{querySelector:element,querySelectorAll:all,addEventListener(){},getElementById:element},
    fetch:async url=>({ok:fs.existsSync(path.join(root,url)),json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))})});
  const modules=new Map();
  async function module(file){
    if(modules.has(file))return modules.get(file);
    const m=new vm.SourceTextModule(fs.readFileSync(file,'utf8'),{context:ctx,identifier:file});modules.set(file,m);
    await m.link(spec=>module(path.resolve(path.dirname(file),spec.split('?')[0])));return m;
  }
  await (await module(path.join(root,'site.js'))).evaluate();
  const checkContent=()=>{
    const content=[...elements.values()].map(e=>e.innerHTML).join('\n');
    assert.ok(content.includes('<h1>')&&!content.includes('could not be loaded'));
    assert.ok(!/\.json|Research by|workspace\/|Read the supporting records|<pre>/i.test(content),'Raw evidence or attribution exposed');
    checkLinks(content);
    assert.ok(!/Final PPT|final PPT|43\/51|19\/27|Separate archive only/.test(content),'Stale PPT authority');
    return content;
  };
  let content=checkContent();
  if(route==='results'){
    for(const id of ['comparison','why-rl-fails','reflexion','retries','structures','task-records'])assert.ok(content.includes(`id="${id}"`));
    const rows=element('#task-rows').innerHTML;
    assert.equal((rows.match(/class="final-status pass"/g)||[]).length,45);
    assert.equal((rows.match(/>No registered pass<\/span>/g)||[]).length,6);
    for(const id of ['cube-9-task-2','cube-9-task-4'])assert.ok(rows.split('<tr ').find(r=>r.includes(id))?.includes('>Solved</span>'));
    all('[data-suite]')[1].handlers.click();
    assert.equal((element('#task-rows').innerHTML.match(/class="final-status pass"/g)||[]).length,7);
    checkContent();
    all('[data-suite]')[0].handlers.click();
    element('#task-sort').value='hardest';element('#task-sort').handlers.change();
    const expected=evidence.tasks.filter(t=>t.suite==='original'&&t.solved).sort((a,b)=>b.firstPass-a.firstPass)[0].id;
    assert.ok(element('#task-rows').innerHTML.split('</tr>')[0].includes(expected));
  }
  if(route==='films'){
    assert.equal(all('[data-film]').length,search.includes('cube-10-task-4')?7:45);
    all('[data-film-suite]')[1].handlers.click();assert.equal(all('[data-film]').length,7);checkContent();
    all('[data-film]')[0].handlers.click();assert.ok(element('#cinema').innerHTML.includes('Additional task set'));checkContent();
    all('[data-film-suite]')[0].handlers.click();assert.equal(all('[data-film]').length,45);
  }
  if(route==='stories')for(const b of all('[data-case]')){
    b.handlers.click();checkContent();const story=element('#story-content').innerHTML;
    assert.ok(story.includes('STRICT PASS'));
    assert.ok(story.includes(discoveries.cases[b.dataset.case].title));
    assert.equal((story.match(/class="trace-stage-label"/g)||[]).length,4);
    assert.ok(story.includes('Final execution result'));
    assert.ok(!story.includes('<pre>'));
  }
  console.log(`${route||'overview'}${search}: route, evidence links and controls passed`);
}
console.log('11 route states, project paths, result totals, media links and presentation-only output verified.');
