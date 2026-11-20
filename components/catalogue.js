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
  const [categories,components]=await Promise.all([loadJSON('./data/categories.json'),loadJSON('./data/components.json')]);
  const live=components.filter(c=>c.status==='live');
  const visible=planningMode?components:live;
  if(planningMode)elements.hint.textContent='Planning view: unreleased examples are labelled Draft or In review and are not yet selectable.';
  elements.stats.innerHTML='<span><strong>'+categories.length+'</strong>section families</span><span><strong>'+components.length+'</strong>planned options</span><span><strong>'+live.length+'</strong>ready to explore</span>';
  const labelById=new Map(categories.map(category=>[category.id,category.title]));
  const showCategories=()=>{
    elements.categories.replaceChildren();
    const options=[{id:'all',title:'All sections',plannedCount:components.length},...categories];
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
      const haystack=[item.id,item.title,item.exampleContext,labelById.get(item.category),...(item.designTags||[])].join(' ').toLocaleLowerCase();
      return byCategory&&haystack.includes(query);
    });
    elements.resultsHeading.textContent=state.category==='all'?'Available examples':labelById.get(state.category);
    elements.resultsCount.textContent=matches.length+' '+(planningMode?'catalogue entries':'ready examples');
    elements.grid.replaceChildren();
    for(const item of matches){
      const article=document.createElement('article');
      article.className='cs-item'+(item.status!=='live'?' cs-item--draft':'');
      const previewable=item.previewRoute&&(item.status==='live'||(planningMode&&item.status==='in-review'));
      const destination=planningMode&&item.status==='in-review'&&item.reviewRoute?item.reviewRoute:item.previewRoute;
      const cta=previewable?'<a href="'+escapeText(destination)+'">'+(item.status==='live'?'Open working example':'Compare development previews')+'</a>':'';
      article.innerHTML='<div class="cs-item-top"><span>'+escapeText(item.id)+'</span><span class="cs-item-status">'+(item.status==='live'?'Reviewed':item.status==='in-review'?'In review · not published':'Draft · not available')+'</span></div><h4>'+escapeText(item.title)+'</h4><p>'+escapeText(item.exampleContext)+'</p>'+cta;
      elements.grid.append(article);
    }
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