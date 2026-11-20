const elements={
  categories:document.querySelector('#cs-categories'),
  grid:document.querySelector('#cs-grid'),
  empty:document.querySelector('#cs-empty'),
  search:document.querySelector('#cs-search'),
  resultsHeading:document.querySelector('#cs-results-heading'),
  resultsCount:document.querySelector('#cs-result-count'),
  stats:document.querySelector('#cs-stats'),
  hint:document.querySelector('#cs-mode-hint')
};
const planningMode=new URLSearchParams(location.search).get('planning')==='1';
const state={category:'all',query:''};
const escapeText=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const loadJSON=async path=>{
  const response=await fetch(path,{cache:'no-cache'});
  if(!response.ok)throw new Error('Cannot load '+path+' ('+response.status+')');
  return response.json();
};
try{
  const [categories,components]=await Promise.all([loadJSON('./data/categories.json?v20261120e'),loadJSON('./data/components.json?v20261120e')]);
  const built=components.filter(item=>item.previewRoute&&['in-review','approved','live'].includes(item.status));
  const live=built.filter(item=>item.status==='live');
  const visible=planningMode?components:built;
  elements.hint.textContent=planningMode
    ? 'Planning mode shows all options, including concepts not yet built. Remove ?planning=1 to browse only working designs.'
    : 'Browse and open these working design examples. They are still being developed, with final visual review pending.';
  elements.stats.innerHTML='<span><strong>'+built.length+'</strong>working examples</span><span><strong>'+categories.length+'</strong>categories planned</span><span><strong>'+components.length+'</strong>total concepts</span>';
  const labelById=new Map(categories.map(category=>[category.id,category.title]));
  let resizeObserver=null;
  function fitPreviewFrames(){
    if(resizeObserver)resizeObserver.disconnect();
    const windows=[...elements.grid.querySelectorAll('.cs-preview-window')];
    if('ResizeObserver' in window){
      resizeObserver=new ResizeObserver(entries=>{
        for(const entry of entries){
          const width=entry.target.getBoundingClientRect().width;
          entry.target.style.setProperty('--cs-preview-scale',String(Math.max(.12,width/1280)));
        }
      });
      windows.forEach(el=>resizeObserver.observe(el));
    }else{
      windows.forEach(el=>el.style.setProperty('--cs-preview-scale',String(Math.max(.12,el.getBoundingClientRect().width/1280))));
    }
  }
  const showCategories=()=>{
    elements.categories.replaceChildren();
    const options=[{id:'all',title:'All sections',plannedCount:components.length},...categories.filter(c=>planningMode||built.some(item=>item.category===c.id))];
    for(const category of options){
      const button=document.createElement('button');
      button.type='button';
      button.dataset.category=category.id;
      button.setAttribute('aria-pressed',String(state.category===category.id));
      const count=visible.filter(item=>category.id==='all'||item.category===category.id).length;
      button.innerHTML=escapeText(category.title)+' <small>'+count+'</small>';
      button.addEventListener('click',()=>{
        state.category=category.id;showCategories();render();
      });
      elements.categories.append(button);
    }
  };
  const render=()=>{
    const query=state.query.toLocaleLowerCase();
    const matches=visible.filter(item=>{
      const byCategory=state.category==='all'||item.category===state.category;
      const haystack=[item.id,item.title,item.exampleContext,item.showcase?.focus,item.showcase?.summary,item.showcase?.label,labelById.get(item.category),...(item.designTags||[])].join(' ').toLocaleLowerCase();
      return byCategory&&haystack.includes(query);
    });
    elements.resultsHeading.textContent=state.category==='all'?(planningMode?'All planned components':'Explore working designs'):labelById.get(state.category);
    elements.resultsCount.textContent=matches.length+' '+(planningMode?'catalogue entries':'working examples');
    elements.grid.replaceChildren();
    for(const item of matches){
      const article=document.createElement('article');
      const working=Boolean(item.previewRoute&&['in-review','approved','live'].includes(item.status));
      article.className='cs-item'+(working?' cs-item--preview':' cs-item--draft');
      const previewRoute=working?item.previewRoute:'';
      const reviewRoute=working?(item.reviewRoute||item.previewRoute):'';
      const reviewUrl=reviewRoute+(reviewRoute.includes('?')?'&':'?')+'v20261120e';
      const stateLabel=item.status==='live'?'Ready':item.status==='in-review'?'In review':item.status==='approved'?'Awaiting release':'Planned';
      const focus=item.showcase;
      const targetUrl=previewRoute;
      // Keep embedded iframe URLs fragment-free; section hashes can scroll the parent page on load.
      const categoryLabel=focus?.label||labelById.get(item.category)||'Component';
      const frame=working
        ? '<div class="cs-preview-window"><iframe title="Preview of '+escapeText(item.id)+' focusing on '+escapeText(categoryLabel)+'" src="'+escapeText(targetUrl)+'" loading="lazy" tabindex="-1" aria-hidden="true"></iframe><a class="cs-preview-cover" href="'+escapeText(targetUrl)+'" aria-label="View showcased '+escapeText(categoryLabel)+' in '+escapeText(item.id)+'"></a></div>'
        : '';
      const actions=working
        ? '<div class="cs-item-actions"><a class="cs-action-primary" href="'+escapeText(reviewUrl)+'">Explore this design</a></div>'
        : '';
      const focusContent=focus
        ? '<div class="cs-focus-info"><span class="cs-focus-label">WHAT THIS SHOWCASES</span><strong>'+escapeText(focus.focus)+'</strong><p>'+escapeText(focus.summary)+'</p><div class="cs-focus-cues"><span>'+escapeText(focus.lookFor[0])+'</span><span>'+escapeText(focus.lookFor[1])+'</span></div></div>'
        : '<p class="cs-example-context">'+escapeText(item.exampleContext)+'</p>';
      article.innerHTML='<p class="cs-card-category">'+escapeText(categoryLabel)+'</p>'+frame+'<div class="cs-item-top"><span>'+escapeText(item.id)+'</span><span class="cs-item-status">'+stateLabel+'</span></div><h4>'+escapeText(item.title)+'</h4>'+focusContent+actions;
      const smallPreview=article.querySelector('.cs-preview-window iframe');
      if(smallPreview && focus?.focusAnchor){
        smallPreview.addEventListener('load',()=>{
          try{
            const child=smallPreview.contentWindow;
            const doc=smallPreview.contentDocument;
            const target=doc?.getElementById(focus.focusAnchor);
            if(!target)return;
            const root=doc.documentElement;
            const previous=root.style.scrollBehavior;
            root.style.scrollBehavior='auto';
            // Only move inside the iframe. No hash navigation or outer scrollIntoView.
            child.scrollTo(0,Math.max(0,Math.round(target.getBoundingClientRect().top+child.scrollY-12)));
            root.style.scrollBehavior=previous;
          }catch(error){console.warn('Preview focus positioning unavailable for '+item.id,error);}
        });
      }
      elements.grid.append(article);
    }
    fitPreviewFrames();
    elements.empty.hidden=matches.length!==0;
    if(matches.length===0&&visible.length>0)elements.empty.querySelector('h3').textContent='Nothing matches these filters.';
    else elements.empty.querySelector('h3').textContent='Examples are being prepared.';
  };
  elements.search.addEventListener('input',event=>{state.query=event.target.value.trim();render();});
  showCategories();render();
}catch(error){
  console.error('Component catalogue failed to load',error);
  elements.stats.textContent='Catalogue temporarily unavailable.';
  elements.empty.hidden=false;
  elements.empty.querySelector('h3').textContent='The catalogue could not be loaded.';
  elements.empty.querySelector('p').textContent='Please refresh or try again later. The complete website template gallery is still available.';
}