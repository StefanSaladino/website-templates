const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#mobile-menu');
const cart=document.querySelector('[data-cart]');
const cartOpenButtons=document.querySelectorAll('[data-cart-open]');
const cartClose=document.querySelector('[data-cart-close]');
const backdrop=document.querySelector('[data-cart-backdrop]');
const cartItems=document.querySelector('[data-cart-items]');
const cartCount=document.querySelector('[data-cart-count]');
const cartTotal=document.querySelector('[data-cart-total]');
const siteHeader=document.querySelector('.site-header');
const siteMain=document.querySelector('main');
const siteFooter=document.querySelector('.site-footer');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let bag=[];
let lastBagTrigger=null;
function focusMenuDestination(link){
 const href=link.getAttribute('href')||'';
 if(!href.startsWith('#'))return false;
 const target=document.getElementById(decodeURIComponent(href.slice(1)));
 if(!target)return false;
 const temporary=!target.hasAttribute('tabindex');
 if(temporary)target.tabIndex=-1;
 target.focus({preventScroll:true});
 if(temporary)target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
 return true;
}
function setMenu(open){
 if(!menuButton||!menu)return;
 menuButton.setAttribute('aria-expanded',String(open));
 menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
 menu.hidden=!open;
 document.body.classList.toggle('menu-open',open);
}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
 setMenu(false);
 if(!focusMenuDestination(link))menuButton?.focus();
}));
window.addEventListener('resize',()=>{
 if(innerWidth<=900)return;
 const wasOpen=menuButton?.getAttribute('aria-expanded')==='true';
 setMenu(false);
 if(wasOpen)requestAnimationFrame(()=>document.querySelector('.desktop-nav a')?.focus());
});
function money(n){return '$'+n.toFixed(0);}
function renderBag(){
 if(!cartItems)return;
 cartCount.textContent=String(bag.length);
 cartTotal.textContent=money(bag.reduce((total,item)=>total+item.price,0));
 cartItems.innerHTML=bag.length
  ?bag.map((item,index)=>'<div class="cart-line"><strong>'+item.name+'</strong><span>'+money(item.price)+'</span><button type="button" data-remove="'+index+'">Remove</button></div>').join('')
  :'<p class="cart-empty">Your bag is empty.</p>';
 cartItems.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.remove);
  bag.splice(index,1);
  renderBag();
  const follow=cartItems.querySelectorAll('[data-remove]')[Math.min(index,bag.length-1)]||cartClose;
  follow?.focus();
 }));
}
function setCart(open,source=null){
 if(!cart)return;
 const wasOpen=document.body.classList.contains('cart-open');
 if(open){
  if(source)lastBagTrigger=source;
  else if(!wasOpen&&document.activeElement instanceof HTMLElement)lastBagTrigger=document.activeElement;
  setMenu(false);
  document.body.classList.add('cart-open');
  cart.removeAttribute('inert');
  cart.setAttribute('aria-hidden','false');
  if(siteHeader)siteHeader.inert=true;
  if(siteMain)siteMain.inert=true;
  if(siteFooter)siteFooter.inert=true;
  cartClose?.focus();
 }else{
  if(!wasOpen)return;
  document.body.classList.remove('cart-open');
  cart.setAttribute('aria-hidden','true');
  cart.setAttribute('inert','');
  if(siteHeader)siteHeader.inert=false;
  if(siteMain)siteMain.inert=false;
  if(siteFooter)siteFooter.inert=false;
  const destination=lastBagTrigger?.isConnected?lastBagTrigger:cartOpenButtons[0];
  destination?.focus();
  lastBagTrigger=null;
 }
}
document.querySelectorAll('[data-quick-add]').forEach(button=>button.addEventListener('click',()=>{
 bag.push({name:button.dataset.quickAdd,price:Number(button.dataset.price)});
 renderBag();
 setCart(true,button);
}));
cartOpenButtons.forEach(button=>button.addEventListener('click',()=>setCart(true,button)));
cartClose?.addEventListener('click',()=>setCart(false));
backdrop?.addEventListener('click',()=>setCart(false));
document.addEventListener('keydown',event=>{
 if(document.body.classList.contains('cart-open')){
  if(event.key==='Escape'){event.preventDefault();setCart(false);return;}
  if(event.key!=='Tab')return;
  const candidates=[...cart.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>el.getClientRects().length>0);
  if(!candidates.length)return;
  const first=candidates[0],last=candidates[candidates.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  return;
 }
 if(event.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true'){
  event.preventDefault();setMenu(false);menuButton.focus();
 }
});

/* ANIM-05: swatches actually change the product preview and selected finish. */
const finishColors={sage:'#b7c1ad',stone:'#d9c7a7',clay:'#c98b73',bone:'#e8e0d2',sand:'#d8c6a7',smoke:'#787c77',charcoal:'#555852',oat:'#d7c7a7'};
document.querySelectorAll('.swatches').forEach(group=>{
  const product=group.closest('.product-card'),media=product?.querySelector('.product-media'),buttons=[...group.querySelectorAll('button')];
  if(!product||!media||!buttons.length)return;
  const feedback=document.createElement('small');
  feedback.className='finish-feedback';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  group.insertAdjacentElement('afterend',feedback);
  let finishTimer;
  const choose=button=>{
    const finish=button.getAttribute('aria-label')||'Selected';
    buttons.forEach(x=>{const selected=x===button;x.classList.toggle('active',selected);x.setAttribute('aria-pressed',String(selected))});
    feedback.textContent='Selected finish: '+finish;
    const color=finishColors[finish.toLowerCase()];
    if(color)media.style.backgroundColor=color;
    clearTimeout(finishTimer);product.classList.remove('finish-changing');
    if(!reduced){void product.offsetWidth;product.classList.add('finish-changing');finishTimer=setTimeout(()=>product.classList.remove('finish-changing'),550);}
  };
  buttons.forEach(button=>{button.type='button';button.addEventListener('click',()=>choose(button))});
  choose(buttons.find(b=>b.classList.contains('active'))||buttons[0]);
});

const newsletter=document.querySelector('[data-newsletter]');newsletter?.addEventListener('submit',e=>{e.preventDefault();const note=document.querySelector('[data-newsletter-note]');if(note)note.textContent='Preview only — no email was sent, stored or added to a mailing list.'});
const fakeCheckout=document.querySelector('[data-demo-checkout]');
fakeCheckout?.addEventListener('click',()=>{
 const note=document.querySelector('[data-checkout-note]');
 if(note)note.textContent='Preview only: no payment was taken, no order was placed and no customer data was sent.';
});
const reveals=document.querySelectorAll('.reveal');if(reduced||!('IntersectionObserver'in window)){reveals.forEach(el=>el.classList.add('is-visible'))}else{const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}}),{threshold:.12});reveals.forEach(el=>io.observe(el))}renderBag();
