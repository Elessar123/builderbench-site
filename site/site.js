import {explorationHistory} from './discoveries.js?v=9';
import {overviewComparison, comparisonSections} from './project-comparisons.js?v=9';
import {outcomeSummary, attemptChart, structureChart, studyConditions, studyReport} from './project-study.js?v=9';

const main = document.querySelector('#main');
const route = location.pathname.split('/').filter(Boolean)[0] || 'overview';
const params = new URLSearchParams(location.search);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const intro = (number, label, title, text) => `<div class="page-intro"><p class="eyebrow">${number} / ${label}</p><h1>${title}</h1><p>${text}</p></div>`;
const link = (url, text) => `<a class="text-link" href="${url}">${text} ${arrow}</a>`;
// Only presentation data is shipped; raw experiment records stay outside dist.
import {evidence, comparisons, reported, discoveries} from './display-data.js?v=9';
if (evidence) {
  const {meta, tasks} = evidence;
  const task = id => tasks.find(t => t.id === id);
      const video = (t, options = {}) => `<div class="media-stage ${options.className || ''}"><video ${options.id ? `id="${options.id}"` : ''} src="${t.video}" ${options.poster === false ? '' : `poster="${t.images.poster||t.images.final}"`} controls playsinline ${options.loop ? 'muted loop' : ''} preload="${options.preload || 'metadata'}" aria-label="${escape(t.name)} construction video"></video>${options.label ? `<span class="play-note">${options.label}</span>` : ''}</div>`;
  const firstText = t => t.firstPass == null ? 'No recorded pass' : `Attempt ${t.firstPass}`;
  const titleMap = {overview:'How far can an Agent get with vision and retries?',results:'Agent vs. Reflexion and RL',stories:'Inside a retry',films:'Watch the builds',report:'Experiment notes'};
  document.title = `${titleMap[route] || titleMap.overview} — Agent Builds`;
  const active = document.querySelector(`[data-nav="${Object.hasOwn(titleMap,route) ? route : 'overview'}"]`);
  if (active) { active.classList.add('active'); active.setAttribute('aria-current','page'); }

  function overview() {
    const featured=task('cube-10-task-1');
    main.innerHTML=`
<div class="wrap">
  <section class="hero">
    <div><p class="eyebrow">BUILDERBENCH · AN EXPLORATORY STUDY</p><h1>Give an agent vision.<br>Let it try again.<br><em>See what it can build.</em></h1><p class="lead">With visual feedback and repeated plan revision, Claude Code Agent completes ${reported.solved} of ${reported.total} construction tasks. The solutions include towers, bridges, overhangs, and held assemblies.</p>${link('/results/','Explore the results')}</div>
    <div>${video(featured,{className:'hero-media',label:'SUCCESSFUL BUILD',loop:true})}<div class="film-label"><b>Temple · 10 cubes</b><span>Completed by Claude Code Agent</span></div></div>
  </section>
  <section class="benchmark-intro" aria-labelledby="benchmark-title">
    <div><p class="overline">WHAT IS BUILDERBENCH?</p><h2 id="benchmark-title">A robot. Building blocks.<br>A structure to figure out.</h2></div>
    <div><p>BuilderBench is a simulated block-building benchmark for AI agents. A robot arm must arrange cubes into target structures, from simple stacks to bridges and overhangs.</p><p>Success requires choosing a build order, finding stable supports, and controlling grasp and release. The experiments here use its 51-task suite and a separate set of 16 additional tasks.</p><a class="text-link" href="https://rajghugare19.github.io/builderbench/">About the benchmark ${arrow}</a></div>
  </section>
  <section class="metrics" aria-label="Claude Code Agent results"><div class="metric"><strong>${reported.solved}<small> / ${reported.total}</small></strong><p><b>Original tasks completed</b><br>${reported.unresolved.length} have no registered pass</p></div><div class="metric"><strong>${reported.beyondThird}<small> / ${reported.solved}</small></strong><p><b>Solved beyond revision 3</b><br>Earliest retained passing record</p></div><div class="metric"><strong>5<small> mm</small></strong><p><b>Strict position tolerance</b><br>Every active cube · fixed identity</p></div></section>
  <section class="section">
    <div class="section-heading"><div><p class="overline">THE CENTRAL FINDING</p><h2>The Agent can change<br>how a task is solved.</h2></div><p>Visual and numerical feedback support more than small corrections. The saved plans change support geometry, grasp, order, and release.</p></div>
    <div class="feature-row">
      ${video(task('cube-3-task-2'),{className:'feature-video',preload:'none'})}
      <div><span class="feature-index">01 / REASON ABOUT SUPPORT</span><h3>Rotate the base.<br>Widen the support.</h3><p>Earlier retries called the build impossible. A test of base orientation changes that conclusion; the winning plan reuses a paired grasp from a failed attempt.</p>${link('/stories/?case=t-stack','Follow the revisions')}</div>
    </div>
    <div class="feature-row reverse">
      <div><span class="feature-index">02 / REVISE THE GRASP</span><h3>Assemble on the table.<br>Lift the blocks together.</h3><p>The Agent adapts a grasp learned on a three-cube task, fills a gap with a spare, and calibrates the heavier assembly.</p>${link('/stories/?case=clamp','See how the grasp evolved')}</div>
      ${video(task('cube-4-task-4'),{className:'feature-video',preload:'none'})}
    </div>
  </section>
  ${overviewComparison()}${studyConditions()}
</div>
<section class="dark-section"><div class="wrap dark-inner">
  <div><p class="eyebrow">WATCH THE SUCCESSFUL BUILDS</p><h2>Towers. Bridges.<br>Held assemblies.<br><em>Built through exploration.</em></h2><p>Watch the ${meta.originalSolved} successful builds behind the 45/51 result, plus ${meta.newSolved} successes from a separate 16-task set. The additional tasks are counted separately.</p>${link('/films/','Browse all 52 videos')}</div>
  <div class="mini-film-grid">${['cube-10-task-1','cube-8-task-3','cube-4-task-4','cube-3-task-2'].map(id=>{const t=task(id);return `<article>${video(t,{className:'overview-clip',preload:'none'})}<a class="mini-film-caption" href="/films/?task=${id}"><span>${escape(t.name)}</span>${arrow}</a></article>`}).join('')}</div>
</div></section>
<div class="wrap closing-note"><p>How far can an Agent get when it can see the result and try again? The project records offer a concrete answer—and a clear account of the conditions.</p>${link('/report/','Read the findings')}</div>`;
  }

  function results() {
    main.innerHTML=`<div class="wrap">${intro('02','COMPARISONS &amp; RESULTS','More revisions.<br>More complex tasks completed.','Claude Code Agent completes 45/51 tasks through visual feedback and repeated plan revision under the experimental conditions below.')}<div class="results-jumps" aria-label="On this page"><a href="#reported-result">Completion</a><a href="#retries">Revision progress</a><a href="#structures">Structures</a><a href="#comparison">RL &amp; Reflexion</a><a href="#why-rl-fails">Why RL stalls</a><a href="#task-records">Task evidence</a></div>${outcomeSummary(reported)}<section class="results-chart" id="retries"><div><p class="overline">COMPARISON 01 / EARLY AND LATER REVISIONS</p>${attemptChart(reported)}</div><div class="chart-takeaway"><strong>${reported.beyondThird} <span>of</span> ${reported.solved}</strong><h2>Solutions appear<br>beyond revision 3.</h2><p>Saved coverage grows from 25 tasks by revision 3 to 45 across the retained run. Later revisions include changes to build order, grasp geometry, support, and release.</p><p class="small-note">These are numbered plan revisions, not exact retry counts or a controlled budget ablation. Auxiliary searches and missing records prevent uniform attempt accounting.</p><a class="text-link" href="/assets/comparisons/revision-coverage.svg" download>Download the figure ↗</a></div></section>${structureChart(reported)}${comparisonSections(comparisons)}<section class="task-section" id="task-records"><div class="section-heading"><div><p class="overline">TASK-LEVEL EVIDENCE</p><h2>Every task.<br>Every registered outcome.</h2></div><p>Final outcomes, worst-cube errors, and successful replays summarize each task.</p></div><div class="table-toolbar"><div class="suite-switch" aria-label="Task suite"><button class="selected" data-suite="original" aria-pressed="true">Original tasks <span>51</span></button><button data-suite="new" aria-pressed="false">Additional tasks <span>16</span></button></div><label class="sort-label">Order by <select id="task-sort" aria-label="Order tasks"><option value="task">Task ID</option><option value="attempt">First saved pass, earliest</option><option value="hardest">First saved pass, latest</option></select></label></div><div class="table-meta" id="table-meta"></div><div class="task-table-wrap"><table class="task-table"><thead><tr><th scope="col">Task / structure</th><th scope="col">Project outcome</th><th scope="col">First saved pass<span>Numbered revision</span></th><th scope="col">Passing plan error<span>Worst active cube</span></th><th scope="col">Evidence</th></tr></thead><tbody id="task-rows"></tbody></table></div><p class="small-note table-footnote">Attempt labels are retained revision numbers. “No registered pass” does not establish that the same budget was exhausted on every task. Additional tasks are a separate exploratory set and are excluded from 45/51.</p></section></div>`;
    let suite='original';
    const renderRows=()=>{
      let filtered=tasks.filter(t=>t.suite===suite);
      const sort=document.querySelector('#task-sort').value;
      if(sort!=='task')filtered.sort((a,b)=>a.firstPass==null?1:b.firstPass==null?-1:sort==='attempt'?a.firstPass-b.firstPass:b.firstPass-a.firstPass);
      const n=filtered.filter(t=>t.solved).length;
      document.querySelector('#table-meta').innerHTML=`<p><b>${n} / ${filtered.length}</b> tasks completed · <b>${filtered.length-n} without a registered pass</b></p><span>Saved strict results · 5 mm · fixed identities</span>`;
      document.querySelector('#task-rows').innerHTML=filtered.map(t=>`<tr class="${t.solved?'':'unsolved'}"><th scope="row"><span class="task-id">${escape(t.id)}</span><span class="task-name">${escape(t.name)}</span><span class="task-extra">${t.active} active${t.spare?` · ${t.spare} spare`:''}</span></th><td><span class="final-status ${t.solved?'pass':''}">${t.solved?'Solved':'No registered pass'}</span><span class="cell-note">${t.solved?'Saved strict result':'Task ledger'}</span></td><td>${t.firstPass==null?'—':`#${t.firstPass}`}<span class="cell-note">${t.firstPass==null?'No saved pass':t.completePrefix?'Preceding records present':'Incomplete earlier trace'}</span></td><td>${t.maxError==null?'—':`${t.maxError.toFixed(2)} <span class="unit">mm</span>`}<span class="cell-note">${t.winner?'Plan #'+Number(t.winner.split('_')[1]):'—'}</span></td><td>${t.video?`<a class="watch-link" href="/films/?task=${t.id}" aria-label="Watch ${escape(t.name)}">Replay ${arrow}</a>`:''}${t.video?'':'—'}</td></tr>`).join('');
    };
    document.querySelectorAll('[data-suite]').forEach(button=>button.addEventListener('click',()=>{suite=button.dataset.suite;document.querySelectorAll('[data-suite]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});renderRows();}));
    document.querySelector('#task-sort').addEventListener('change',renderRows);renderRows();
  }

  const stories = {
    't-stack': {id:'cube-3-task-2',label:'The T-stack',title:'A 45° turn changes<br>what the base can support.',summary:'Earlier notes declared the build infeasible while assuming an unrotated base. Claude Code Agent tests the free base orientation, then combines a 45° rotation with a paired grasp retained from a failed plan.',steps:[{attempt:1,title:'The upper cubes tip.',text:'The initial arrangement leaves one active cube within tolerance. The worst position error is 45.57 mm.'},{attempt:13,title:'Move the pair together.',text:'A paired grasp avoids placing one cube into the other. The structure still fails when released on the flat base.'},{attempt:19,title:'Rotate, lower, release.',text:'A 45° base rotation supports both upper centers of mass. The pair survives release and the arm returns home.'}],insight:'The successful change is structural: widen the support footprint by rotating the same cube.'},
    'clamp': {id:'cube-4-task-4',label:'The held assembly',title:'Build on the table.<br>Lift the whole assembly.',summary:'The target includes floating blocks. The Agent adapts a grasp from an earlier three-cube task: fill the missing corner with a spare, build a 2 × 2 assembly, then clamp and lift it.',steps:[{attempt:1,title:'Almost aligned.',text:'The hold is stable, but the worst active cube misses the 5 mm threshold: its error is 5.82 mm.'},{attempt:2,title:'A lower hold slips.',text:'Lowering the hold destabilizes the assembly. The worst error grows to 10.32 mm.'},{attempt:3,title:'Keep the grip. Shift 2 mm.',text:'Restore the stable hold height and shift the build 2 mm in y to compensate for drift. All three active cubes pass.'}],insight:'A failed placement can be a calibration problem. The agent preserves the useful grasp and adjusts the build.'},
    'packing': {id:'cube-9-task-2',label:'The packed grid',title:'The last cube goes<br>where the gripper cannot.',summary:'A dense 3 × 3 grid leaves little clearance for the fingers. The agent builds the corners and edges first, then explores how to place the enclosed center cube.',steps:[{attempt:1,title:'Exact spacing jams.',text:'The close-packed placements disturb the grid. No active cube passes; the worst error reaches 69.81 mm.'},{attempt:7,title:'Pressing spreads the walls.',text:'A tamp seats the center but pushes its neighbors outward. Six of nine cubes pass; the worst error is 9.28 mm.'},{attempt:9,title:'Drop from higher up.',text:'A higher center release and a correction to an edge placement produce a strict pass, with 4.41 mm worst error.'}],insight:'The successful plan changes both order and release: make the pocket first, then drop the center into it.'},
    'leaning': {id:'cube-9-task-4',label:'The leaning tower',title:'Change the approach.<br>Reach the stable configuration.',summary:'A stable resting configuration exists, but direct placement collides with a neighbor. The successful plan changes the approach, support sequence, and release.',steps:[{attempt:64,title:'The scaffold disturbs the build.',text:'The support helps hold the overhang, but its removal disrupts the structure. Four active cubes pass the final check.'},{attempt:66,title:'A promising shift breaks the base.',text:'Changes intended to make room for the upper cube destabilize the coupled structure. Only three active cubes remain within tolerance.'},{attempt:77,title:'Descend clear, shift, release.',text:'The plan seats the cube before shifting it sideways, retracts in stages, and relocates temporary walls at the right time. All nine active cubes pass.'}],insight:'Find a stable resting configuration, then design a trajectory that can enter it without disturbing the surrounding build.'},
    'new-arch': {id:'cube-10-task-4',label:'A new arch',title:'A new structure.<br>A very narrow margin.',summary:'This added task combines tilted roof cubes, supporting towers, and spare-cube scaffolding. The successful plan emerges after many recorded revisions.',steps:[{attempt:18,title:'Six cubes pass; one roof misses.',text:'The form-supported arch already places six of seven active cubes within tolerance. The remaining roof has an 8.23 mm error.'},{attempt:99,title:'The arch finally holds.',text:'Roof corrections, tower positioning, and a 1 mm scaffold asymmetry bring all seven active cubes inside tolerance.'}],insight:'The registered winning plan passes by a small margin: the worst active cube is 4.990 mm from its target.'},
  };

  function storiesPage() {
    main.innerHTML=`<div class="wrap">${intro('03','INSIDE A RETRY','A failed build<br>can reveal the next move.','Five exploration histories show how Claude Code Agent tests assumptions, reuses partial solutions, and develops construction strategies. Compare selected revisions and their strategy summaries.')}<div class="story-tabs" aria-label="Choose a retry story">${Object.entries(stories).map(([key,s])=>`<button data-case="${key}" aria-pressed="false">${s.label}</button>`).join('')}</div><section id="story-content" aria-live="polite"></section></div>`;
    const initial=Object.hasOwn(stories,params.get('case'))?params.get('case'):'t-stack';
    const renderStory=key=>{
      document.querySelectorAll('[data-case]').forEach(b=>{const selected=b.dataset.case===key;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
      const story=stories[key];
      const t=task(story.id);
      const scopeNote=t.suite==='new'?'Additional task set · 7/16 completed · excluded from the original 51.':'Original task set · saved strict passing plan.';
      document.querySelector('#story-content').innerHTML=`<p class="archive-provenance">${scopeNote}</p><div class="story-title"><div><p class="overline">${t.id.toUpperCase()} · ${t.suite==='new'?'NEW STRUCTURE':'CLAUDE CODE AGENT'}</p><h2>${story.title}</h2></div><p>${story.summary}</p></div><div class="story-stages ${story.steps.length===2?'two':''}">${story.steps.map((step,i)=>{const frame=t.storyFrames.find(f=>f.attempt===step.attempt);const record=t.records.find(r=>r.attempt===step.attempt);return `<article><div class="step-image"><img src="${frame?.image||t.images.final}" alt="${escape(t.name)}, attempt ${step.attempt}: ${escape(step.title)}"><span class="frame-status ${record?.strict?'pass':''}">${record?.strict?'STRICT PASS':'NOT YET'}</span></div><p class="step-label">${String(i+1).padStart(2,'0')} / ATTEMPT ${step.attempt}</p><h3>${step.title}</h3><p>${step.text}</p><span class="error-value">${record?.maxError?.toFixed(2)||'—'} <small>mm worst error</small></span></article>`}).join('')}</div><div class="story-insight"><span>WHAT THE AGENT FOUND</span><p>${story.insight}</p></div>${explorationHistory(discoveries,key)}<div class="story-film"><div>${video(t)}<p class="small-note">Project replay · ${t.winner.replace('_',' ')} · fixed initial scene</p></div><div><p class="overline">WATCH THE EXECUTION</p><h2>From a revised plan<br>to a physical build.</h2><dl class="case-numbers"><div><dt>First retained passing revision</dt><dd>#${t.firstPass}</dd></div><div><dt>Active cubes passing</dt><dd>${t.active} / ${t.active}</dd></div><div><dt>Worst position error</dt><dd>${t.maxError.toFixed(2)} mm</dd></div><div><dt>Terminal condition</dt><dd>${t.returnHome?'Arm returned home':'Holding permitted'}</dd></div></dl>${link('/results/','Compare all tasks')}</div></div><p class="small-note source-note">Strategy summaries are reconstructed from experiment notes and plans; they are not verbatim reasoning transcripts. ${!t.completePrefix?'Some intermediate evaluation files are absent; attempt numbers are retained revision labels.':''}</p>`;
    };
    document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{history.replaceState(null,'',`?case=${b.dataset.case}`);renderStory(b.dataset.case);}));
    renderStory(initial);
  }

  function films() {
    const available=tasks.filter(t=>t.video);
    const requested=task(params.get('task'));
    let selected=requested?.video?requested:task('cube-10-task-1');
    let suite=selected.suite;
    main.innerHTML=`<div class="wrap">${intro('04','WATCH THE BUILDS','Watch the behaviors<br>discovered through exploration.','Claude Code Agent in action: passing plans for 45 original tasks and seven additional structures.')}<section class="cinema" id="cinema"></section><section class="film-library"><div class="library-heading"><h2>The build collection</h2><div class="suite-switch" aria-label="Video collection"><button data-film-suite="original" aria-pressed="false">Original tasks <span>45</span></button><button data-film-suite="new" aria-pressed="false">Additional tasks <span>7</span></button></div></div><div id="film-grid" class="film-grid"></div></section></div>`;
    const setFilm=t=>{
      selected=t;
      document.querySelector('#cinema').innerHTML=`<div>${video(t,{id:'main-film',className:'cinema-video'})}</div><div class="cinema-copy"><p class="eyebrow">${t.id.toUpperCase()}</p><h2>${escape(t.name)}</h2><div class="film-tags"><span>${t.cubes} cubes</span><span>${t.suite==='new'?'Additional task set':'Original task set'}</span></div><div class="cinema-score"><span>First retained passing revision</span><strong>${t.firstPass}<small>revision</small></strong></div><dl class="film-facts"><div><dt>Replay plan</dt><dd>#${Number(t.winner.split('_')[1])}</dd></div><div><dt>Active / spare cubes</dt><dd>${t.active} / ${t.spare}</dd></div><div><dt>Saved worst-cube error</dt><dd>${t.maxError.toFixed(2)} mm</dd></div><div><dt>Terminal condition</dt><dd>${t.returnHome?'Return home':'Hold allowed'}</dd></div></dl><p class="small-note">Replay of the registered winning plan. Revision numbers may span missing records and auxiliary searches. Clips may be accelerated; duration does not measure exploration cost.</p>${Object.entries(stories).find(([,s])=>s.id===t.id)?link('/stories/?case='+Object.entries(stories).find(([,s])=>s.id===t.id)[0],'Read the retry story'):link('/results/','See the task record')}</div>`;
      document.querySelectorAll('[data-film]').forEach(b=>{const chosen=b.dataset.film===t.id;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});
    };
    const renderGrid=()=>{
      document.querySelectorAll('[data-film-suite]').forEach(b=>{const chosen=b.dataset.filmSuite===suite;b.classList.toggle('selected',chosen);b.setAttribute('aria-pressed',String(chosen));});
      document.querySelector('#film-grid').innerHTML=available.filter(t=>t.suite===suite).map(t=>`<button class="film-item ${t.id===selected.id?'selected':''}" data-film="${t.id}" aria-pressed="${t.id===selected.id}" aria-label="Watch ${escape(t.name)}, ${t.id}"><span class="film-thumb"><img src="${t.images.poster||t.images.final}" alt="" loading="lazy"><span class="film-play" aria-hidden="true">▶</span><span class="film-attempt">#${t.firstPass}</span></span><span class="film-item-title">${escape(t.name)}</span><span class="film-item-meta">${t.short} <span>${t.active} active cubes</span></span></button>`).join('');
      document.querySelectorAll('[data-film]').forEach(b=>b.addEventListener('click',()=>{const t=task(b.dataset.film);history.replaceState(null,'',`?task=${t.id}`);setFilm(t);document.querySelector('#cinema').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});const v=document.querySelector('#main-film');v.play().catch(()=>{});}));
    };
    document.querySelectorAll('[data-film-suite]').forEach(b=>b.addEventListener('click',()=>{suite=b.dataset.filmSuite;renderGrid();}));
    setFilm(selected);renderGrid();
  }

  function report() {
    main.innerHTML=studyReport(reported,tasks);
  }

  if(route==='results')results();else if(route==='stories')storiesPage();else if(route==='films')films();else if(route==='report')report();else overview();
  if(location.hash) requestAnimationFrame(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
  document.addEventListener('play',event=>{if(event.target.tagName==='VIDEO')document.querySelectorAll('video').forEach(v=>{if(v!==event.target)v.pause();});},true);
}
