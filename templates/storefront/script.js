const menuButton=document.querySelector('.menu-toggle');const menu=document.querySelector('#mobile-menu');const cart=document.querySelector('[data-cart]');const cartOpenButtons=document.querySelectorAll('[data-cart-open]');const cartClose=document.querySelector('[data-cart-close]');const backdrop=document.querySelector('[data-cart-backdrop]');const cartItems=document.querySelector('[data-cart-items]');const cartCount=document.querySelector('[data-cart-count]');const cartTotal=document.querySelector('[data-cart-total]');const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let bag=[];
function setMenu(open){if(!menuButton||!menu)return;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');menu.hidden=!open;document.body.classList.toggle('menu-open',open)}
menuButton?.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));window.addEventListener('resize',()=>{if(innerWidth>900)setMenu(false)});
function money(n){return `$${n.toFixed(0)}`}function renderBag(){if(!cartItems)return;cartCount.textContent=String(bag.length);cartTotal.textContent=money(bag.reduce((s,i)=>s+i.price,0));cartItems.innerHTML=bag.length?bag.map((item,index)=>`<div class="cart-line"><strong>${item.name}</strong><span>${money(item.price)}</span><button type="button" data-remove="${index}">Remove</button></div>`).join(''):'<p class="cart-empty">Your bag is empty.</p>';cartItems.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{bag.splice(Number(btn.dataset.remove),1);renderBag()}))}
function setCart(open){document.body.classList.toggle('cart-open',open);cart?.setAttribute('aria-hidden',String(!open))}document.querySelectorAll('[data-quick-add]').forEach(btn=>btn.addEventListener('click',()=>{bag.push({name:btn.dataset.quickAdd,price:Number(btn.dataset.price)});renderBag();setCart(true)}));cartOpenButtons.forEach(btn=>btn.addEventListener('click',()=>setCart(true)));cartClose?.addEventListener('click',()=>setCart(false));backdrop?.addEventListener('click',()=>setCart(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);setCart(false)}});/* ANIM-05: swatches actually change the product preview and selected finish. */
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
