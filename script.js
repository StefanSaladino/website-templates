const templateGrid = document.querySelector('.template-grid');

if (templateGrid && !document.querySelector('[data-template="woodworker"]')) {
  templateGrid.insertAdjacentHTML('beforeend', `
    <article class="template-card is-live" data-category="business creative" data-template="woodworker">
      <a aria-label="Open Woodworker template" class="thumb-link" href="templates/woodworker/">
        <div class="thumb thumb--woodworker-sync">
          <div class="woodworker-thumb-rail" aria-hidden="true"><span>0</span><i></i><i></i><i></i><span>12</span><i></i><i></i><i></i><span>24</span></div>
          <div class="woodworker-thumb-copy">
            <div class="woodworker-thumb-brand"><span aria-hidden="true"></span><div><b>GRAIN &amp; GABLE</b><small>WOODWORKING</small></div></div>
            <p>SMALL-BATCH WOODWORK · SOUTHERN ONTARIO</p>
            <strong>Built one<br/><em>at a time.</em></strong>
            <i>Request a build</i>
          </div>
          <div class="woodworker-thumb-media">
            <img alt="" src="https://images.unsplash.com/photo-1769353086138-19ee65291a04?auto=format&amp;fit=crop&amp;fm=jpg&amp;q=76&amp;w=1200"/>
            <div><small>ON THE BENCH</small><b>White oak wall shelf · 36 in.</b></div>
          </div>
          <div class="woodworker-thumb-note"><small>SHOP NOTE / 017</small><b>Measure twice.</b></div>
          <span class="live-badge">Live</span>
        </div>
      </a>
      <div class="card-copy"><div><h3>Woodworker</h3></div><p>Business · Creative</p><a class="card-live-link" href="templates/woodworker/">View template ↗</a></div>
    </article>
  `);
}

if (templateGrid && !document.querySelector('[data-template="landscaping"]')) {
  templateGrid.insertAdjacentHTML('beforeend', `
    <article class="template-card is-live" data-category="business creative" data-template="landscaping">
      <a aria-label="Open Landscaping template" class="thumb-link" href="templates/landscaping/">
        <div class="thumb thumb--landscape-sync">
          <div class="landscape-thumb-plan" aria-hidden="true">
            <span class="landscape-thumb-lot"></span>
            <span class="landscape-thumb-house"></span>
            <span class="landscape-thumb-bed landscape-thumb-bed--one"></span>
            <span class="landscape-thumb-bed landscape-thumb-bed--two"></span>
            <i></i><i></i><i></i>
          </div>
          <div class="landscape-thumb-copy">
            <div class="landscape-thumb-brand"><span></span><div><b>BED &amp; BORDER</b><small>LANDSCAPES</small></div></div>
            <p>RESIDENTIAL LANDSCAPING · HALTON + HAMILTON</p>
            <strong>A yard should<br/>feel <em>settled in.</em></strong>
            <i>Book a site walk</i>
          </div>
          <div class="landscape-thumb-media">
            <img alt="" src="https://images.unsplash.com/photo-1722103155234-5e83b3effe03?auto=format&amp;fit=crop&amp;fm=jpg&amp;q=78&amp;w=1200"/>
            <div><small>GARDEN 024</small><b>Stone underfoot. Green at the edges.</b></div>
          </div>
          <span class="live-badge">Live</span>
        </div>
      </a>
      <div class="card-copy"><div><h3>Landscaping</h3></div><p>Business · Creative</p><a class="card-live-link" href="templates/landscaping/">View template ↗</a></div>
    </article>
  `);
}

const galleryStyle = document.createElement('style');
galleryStyle.textContent = `
  .thumb--woodworker-sync{position:relative;display:grid;grid-template-columns:7% 48% 45%;overflow:hidden;background:#efe4cf;color:#26231f}.woodworker-thumb-rail{padding:12% 0 10%;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;border-right:1px solid rgba(38,35,31,.24);color:#736b60;font:700 3px ui-monospace,monospace}.woodworker-thumb-rail span{padding-left:18%}.woodworker-thumb-rail i{width:50%;height:1px;background:rgba(38,35,31,.24)}.woodworker-thumb-rail i:nth-of-type(3n+1){width:76%}.woodworker-thumb-copy{min-width:0;padding:9% 7% 8%;display:flex;flex-direction:column}.woodworker-thumb-brand{display:flex;align-items:center;gap:6px}.woodworker-thumb-brand>span{width:12px;height:12px;border:1px solid #573724;transform:rotate(45deg);position:relative}.woodworker-thumb-brand>span::after{content:'';position:absolute;width:5px;height:1px;left:3px;top:5px;background:#b24d36;box-shadow:0 -3px 0 #3f5146,0 3px 0 #3f5146}.woodworker-thumb-brand div{display:grid;gap:1px}.woodworker-thumb-brand b{font-size:4px;letter-spacing:.04em}.woodworker-thumb-brand small{color:#736b60;font:700 2.5px ui-monospace,monospace;letter-spacing:.11em}.woodworker-thumb-copy>p{margin:17% 0 0;color:#573724;font:800 3px ui-monospace,monospace;letter-spacing:.08em}.woodworker-thumb-copy>strong{margin-top:7%;font:400 clamp(16px,2.1vw,29px)/.82 Georgia,serif;letter-spacing:-.055em}.woodworker-thumb-copy>strong em{color:#b24d36;font-weight:400}.woodworker-thumb-copy>i{width:fit-content;margin-top:auto;padding:5px 7px;background:#573724;color:#fff;font-size:3.5px;font-style:normal;font-weight:800}.woodworker-thumb-media{min-width:0;margin:8% 6% 8% 0;display:grid;grid-template-rows:1fr auto;border-left:5px solid #3f5146;background:#ddd0b8}.woodworker-thumb-media img{width:100%;height:100%;min-height:0;object-fit:cover;filter:saturate(.78) contrast(1.02)}.woodworker-thumb-media div{padding:6px 7px;display:grid;gap:2px;background:#f8f2e6;border-top:1px solid rgba(38,35,31,.18)}.woodworker-thumb-media small{color:#b24d36;font:800 2.5px ui-monospace,monospace;letter-spacing:.08em}.woodworker-thumb-media b{font:400 4px Georgia,serif}.woodworker-thumb-note{position:absolute;left:39%;bottom:6%;z-index:4;min-width:27%;padding:5px 6px;display:grid;gap:2px;background:#f8f2e6;border-top:1px solid #26231f;transform:rotate(-1deg)}.woodworker-thumb-note small{color:#b24d36;font:800 2.4px ui-monospace,monospace;letter-spacing:.08em}.woodworker-thumb-note b{font:400 4px Georgia,serif}
  .thumb--landscape-sync{position:relative;display:grid;grid-template-columns:55% 45%;overflow:hidden;background:linear-gradient(rgba(39,53,45,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(39,53,45,.055) 1px,transparent 1px),#f2efe5;background-size:18px 18px;color:#27352d}.landscape-thumb-plan{position:absolute;inset:0 42% 0 0;opacity:.55;pointer-events:none}.landscape-thumb-lot,.landscape-thumb-house,.landscape-thumb-bed,.landscape-thumb-plan i{position:absolute;display:block;border:1px solid #65785d}.landscape-thumb-lot{inset:12% 8% 12% 10%}.landscape-thumb-house{left:16%;top:20%;width:42%;height:29%;border-color:#27352d}.landscape-thumb-bed{border-radius:48% 54% 43% 57%;background:rgba(135,157,114,.15)}.landscape-thumb-bed--one{left:16%;bottom:14%;width:34%;height:24%;transform:rotate(-12deg)}.landscape-thumb-bed--two{right:11%;bottom:17%;width:24%;height:19%;transform:rotate(17deg)}.landscape-thumb-plan i{width:7px;height:7px;border-radius:50%;background:#879d72}.landscape-thumb-plan i:nth-of-type(1){left:20%;bottom:25%}.landscape-thumb-plan i:nth-of-type(2){left:32%;bottom:20%}.landscape-thumb-plan i:nth-of-type(3){right:19%;bottom:24%}.landscape-thumb-copy{position:relative;z-index:2;padding:9% 6% 8%;display:flex;flex-direction:column;min-width:0}.landscape-thumb-brand{display:flex;align-items:center;gap:5px}.landscape-thumb-brand>span{width:12px;height:12px;border:1px solid #27352d;border-radius:50% 44% 48% 36%;transform:rotate(-13deg)}.landscape-thumb-brand div{display:grid;gap:1px}.landscape-thumb-brand b{font-size:4px;letter-spacing:.04em}.landscape-thumb-brand small{color:#65785d;font-size:2.5px;font-weight:800;letter-spacing:.12em}.landscape-thumb-copy>p{margin:17% 0 0;color:#ba6f4f;font:800 3px Arial,sans-serif;letter-spacing:.08em}.landscape-thumb-copy>strong{margin-top:7%;font:400 clamp(15px,2vw,28px)/.84 Georgia,serif;letter-spacing:-.055em}.landscape-thumb-copy>strong em{color:#65785d;font-weight:400}.landscape-thumb-copy>i{width:fit-content;margin-top:auto;padding:5px 7px;background:#27352d;color:#fff;font-size:3.5px;font-style:normal;font-weight:800}.landscape-thumb-media{position:relative;z-index:2;min-width:0;margin:7% 5% 7% 0;overflow:hidden;clip-path:ellipse(78% 82% at 62% 50%);background:#b9c5a8}.landscape-thumb-media img{width:100%;height:100%;object-fit:cover;filter:saturate(.78) brightness(.94)}.landscape-thumb-media div{position:absolute;right:7%;bottom:7%;width:70%;padding:5px 6px;background:rgba(250,248,241,.94);border-left:3px solid #ba6f4f}.landscape-thumb-media small{display:block;color:#ba6f4f;font-size:2.4px;font-weight:800;letter-spacing:.08em}.landscape-thumb-media b{display:block;margin-top:2px;font:400 3.7px Georgia,serif}
`;
document.head.appendChild(galleryStyle);

const statValues = document.querySelectorAll('.intro-stats strong');
if (statValues[0]) statValues[0].textContent = '18';
if (statValues[1]) statValues[1].textContent = '18';

const libraryHeadCopy = document.querySelector('.library-head > p');
if (libraryHeadCopy) {
  libraryHeadCopy.textContent = 'The remaining fifteen templates live here. Use the filters to browse by direction without repeating the featured picks above.';
}

const libraryNoteStrong = document.querySelector('.library-note strong');
if (libraryNoteStrong) libraryNoteStrong.textContent = '15 more templates';

const filterCounts = {
  all: '15',
  minimal: '2',
  business: '8',
  product: '6',
  creative: '9',
  experimental: '3'
};

document.querySelectorAll('.filter').forEach((button) => {
  const count = filterCounts[button.dataset.filter];
  const span = button.querySelector('span');
  if (count && span) span.textContent = count;
});

const filters = [...document.querySelectorAll('.filter')];
const cards = [...document.querySelectorAll('.template-card')];

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle('active', item === button));
    cards.forEach((card) => {
      const categories = card.dataset.category.split(' ');
      card.classList.toggle('is-hidden', category !== 'all' && !categories.includes(category));
    });
  });
});
