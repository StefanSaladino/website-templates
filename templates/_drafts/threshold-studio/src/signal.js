// Breadth-first search over a tiny directed network, excluding disabled relays.
const graph=Object.freeze({S:['A','B'],A:['T'],B:['C'],C:['T'],T:[]});
export function signalRoute(online={A:true,B:true,C:true}){
 const queue=[['S']],visited=new Set(['S']);
 while(queue.length){
  const path=queue.shift(),last=path.at(-1);
  if(last==='T')return path;
  for(const next of graph[last]){
   if(visited.has(next)||(next!=='T'&&!online[next]))continue;
   visited.add(next);queue.push([...path,next]);
  }
 }
 return [];
}
export function mountSignal(section){
 const launch=section.querySelector('[data-signal-launch]'),study=section.querySelector('.signal-study');
 const back=study.querySelector('[data-signal-return]'),art=study.querySelector('svg'),output=study.querySelector('output');
 const buttons=[...study.querySelectorAll('[data-signal-relay]')],nodes=[...study.querySelectorAll('[data-relay-node]')],edges=[...study.querySelectorAll('[data-edge]')];
 const online={A:true,B:true,C:true};
 function update(){
  const path=signalRoute(online),active=new Set(path.slice(1).map((n,i)=>path[i]+n));
  edges.forEach(e=>e.dataset.active=String(active.has(e.dataset.edge)));
  nodes.forEach(n=>n.dataset.online=String(online[n.dataset.relayNode]));
  buttons.forEach(b=>{const on=online[b.dataset.signalRelay];b.setAttribute('aria-pressed',String(on));b.querySelector('span').textContent=on?'On':'Off'});
  const connected=path.length>0;study.dataset.route=path.join('');study.dataset.connected=String(connected);
  output.value=connected?path.join(' / ')+' · '+(path.length-1)+' links':'No available route';
  art.setAttribute('aria-label',(connected?'Connected route: '+path.join(', '):'No available route')+'. Relays: '+Object.keys(online).map(k=>k+' '+(online[k]?'on':'off')).join(', '));
 }
 function open(){study.hidden=false;section.dataset.study='signal';update();back.focus({preventScroll:true})}
 function close(){delete section.dataset.study;study.hidden=true;launch.focus({preventScroll:true})}
 function toggle(e){const k=e.currentTarget.dataset.signalRelay;online[k]=!online[k];update()}
 function key(e){if(e.key==='Escape'&&!study.hidden){e.preventDefault();close()}}
 launch.addEventListener('click',open);back.addEventListener('click',close);
 buttons.forEach(b=>b.addEventListener('click',toggle));section.addEventListener('keydown',key);
 launch.hidden=false;update();
 return {dispose(){launch.removeEventListener('click',open);back.removeEventListener('click',close);buttons.forEach(b=>b.removeEventListener('click',toggle));section.removeEventListener('keydown',key)}};
}
