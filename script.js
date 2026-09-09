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

if (templateGrid && !document.querySelector('[data-template="pools"]')) {
  templateGrid.insertAdjacentHTML('beforeend', `
    <article class="template-card is-live" data-category="business creative" data-template="pools">
      <a aria-label="Open Pool Company template" class="thumb-link" href="templates/pools/">
        <div class="thumb thumb--tideform-sync">
          <img class="tideform-thumb-bg" alt="" src="https://images.unsplash.com/photo-1783125127199-860da9744dcc?auto=format&amp;fit=crop&amp;fm=jpg&amp;q=78&amp;w=1200"/>
          <div class="tideform-thumb-shade"></div>
          <div class="tideform-thumb-caustics" aria-hidden="true"></div>
          <div class="tideform-thumb-brand"><span><i></i><i></i></span><b>TIDEFORM</b><small>POOLS</small></div>
          <div class="tideform-thumb-copy">
            <small>CUSTOM POOLS · HALTON + WEST GTA</small>
            <strong>Where the yard<br/><em>turns to water.</em></strong>
            <i>Plan your pool</i>
          </div>
          <div class="tideform-thumb-depth"><span>3′6″</span><b></b><span>5′0″</span><b></b><span>7′0″</span></div>
          <div class="tideform-thumb-wave" aria-hidden="true"><svg viewBox="0 0 500 75" preserveAspectRatio="none"><path d="M0 31 C58 7 101 53 161 31 C222 8 260 50 319 28 C382 6 423 50 500 22 L500 75 L0 75 Z"></path></svg></div>
          <span class="live-badge">Live</span>
        </div>
      </a>
      <div class="card-copy"><div><h3>Pool Company</h3></div><p>Business · Creative</p><a class="card-live-link" href="templates/pools/">View template ↗</a></div>
    </article>
  `);
}

const galleryStyle = document.createElement('style');
galleryStyle.textContent = `
  .thumb--woodworker-sync{position:relative;display:grid;grid-template-columns:7% 48% 45%;overflow:hidden;background:#efe4cf;color:#26231f}.woodworker-thumb-rail{padding:12% 0 10%;display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;border-right:1px solid rgba(38,35,31,.24);color:#736b60;font:700 3px ui-monospace,monospace}.woodworker-thumb-rail span{padding-left:18%}.woodworker-thumb-rail i{width:50%;height:1px;background:rgba(38,35,31,.24)}.woodworker-thumb-rail i:nth-of-type(3n+1){width:76%}.woodworker-thumb-copy{min-width:0;padding:9% 7% 8%;display:flex;flex-direction:column}.woodworker-thumb-brand{display:flex;align-items:center;gap:6px}.woodworker-thumb-brand>span{width:12px;height:12px;border:1px solid #573724;transform:rotate(45deg);position:relative}.woodworker-thumb-brand>span::after{content:'';position:absolute;width:5px;height:1px;left:3px;top:5px;background:#b24d36;box-shadow:0 -3px 0 #3f5146,0 3px 0 #3f5146}.woodworker-thumb-brand div{display:grid;gap:1px}.woodworker-thumb-brand b{font-size:4px;letter-spacing:.04em}.woodworker-thumb-brand small{color:#736b60;font:700 2.5px ui-monospace,monospace;letter-spacing:.11em}.woodworker-thumb-copy>p{margin:17% 0 0;color:#573724;font:800 3px ui-monospace,monospace;letter-spacing:.08em}.woodworker-thumb-copy>strong{margin-top:7%;font:400 clamp(16px,2.1vw,29px)/.82 Georgia,serif;letter-spacing:-.055em}.woodworker-thumb-copy>strong em{color:#b24d36;font-weight:400}.woodworker-thumb-copy>i{width:fit-content;margin-top:auto;padding:5px 7px;background:#573724;color:#fff;font-size:3.5px;font-style:normal;font-weight:800}.woodworker-thumb-media{min-width:0;margin:8% 6% 8% 0;display:grid;grid-template-rows:1fr auto;border-left:5px solid #3f5146;background:#ddd0b8}.woodworker-thumb-media img{width:100%;height:100%;min-height:0;object-fit:cover;filter:saturate(.78) contrast(1.02)}.woodworker-thumb-media div{padding:6px 7px;display:grid;gap:2px;background:#f8f2e6;border-top:1px solid rgba(38,35,31,.18)}.woodworker-thumb-media small{color:#b24d36;font:800 2.5px ui-monospace,monospace;letter-spacing:.08em}.woodworker-thumb-media b{font:400 4px Georgia,serif}.woodworker-thumb-note{position:absolute;left:39%;bottom:6%;z-index:4;min-width:27%;padding:5px 6px;display:grid;gap:2px;background:#f8f2e6;border-top:1px solid #26231f;transform:rotate(-1deg)}.woodworker-thumb-note small{color:#b24d36;font:800 2.4px ui-monospace,monospace;letter-spacing:.08em}.woodworker-thumb-note b{font:400 4px Georgia,serif}
  .thumb--landscape-sync{position:relative;display:grid;grid-template-columns:55% 45%;overflow:hidden;background:linear-gradient(rgba(39,53,45,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(39,53,45,.055) 1px,transparent 1px),#f2efe5;background-size:18px 18px;color:#27352d}.landscape-thumb-plan{position:absolute;inset:0 42% 0 0;opacity:.55;pointer-events:none}.landscape-thumb-lot,.landscape-thumb-house,.landscape-thumb-bed,.landscape-thumb-plan i{position:absolute;display:block;border:1px solid #65785d}.landscape-thumb-lot{inset:12% 8% 12% 10%}.landscape-thumb-house{left:16%;top:20%;width:42%;height:29%;border-color:#27352d}.landscape-thumb-bed{border-radius:48% 54% 43% 57%;background:rgba(135,157,114,.15)}.landscape-thumb-bed--one{left:16%;bottom:14%;width:34%;height:24%;transform:rotate(-12deg)}.landscape-thumb-bed--two{right:11%;bottom:17%;width:24%;height:19%;transform:rotate(17deg)}.landscape-thumb-plan i{width:7px;height:7px;border-radius:50%;background:#879d72}.landscape-thumb-plan i:nth-of-type(1){left:20%;bottom:25%}.landscape-thumb-plan i:nth-of-type(2){left:32%;bottom:20%}.landscape-thumb-plan i:nth-of-type(3){right:19%;bottom:24%}.landscape-thumb-copy{position:relative;z-index:2;padding:9% 6% 8%;display:flex;flex-direction:column;min-width:0}.landscape-thumb-brand{display:flex;align-items:center;gap:5px}.landscape-thumb-brand>span{width:12px;height:12px;border:1px solid #27352d;border-radius:50% 44% 48% 36%;transform:rotate(-13deg)}.landscape-thumb-brand div{display:grid;gap:1px}.landscape-thumb-brand b{font-size:4px;letter-spacing:.04em}.landscape-thumb-brand small{color:#65785d;font-size:2.5px;font-weight:800;letter-spacing:.12em}.landscape-thumb-copy>p{margin:17% 0 0;color:#ba6f4f;font:800 3px Arial,sans-serif;letter-spacing:.08em}.landscape-thumb-copy>strong{margin-top:7%;font:400 clamp(15px,2vw,28px)/.84 Georgia,serif;letter-spacing:-.055em}.landscape-thumb-copy>strong em{color:#65785d;font-weight:400}.landscape-thumb-copy>i{width:fit-content;margin-top:auto;padding:5px 7px;background:#27352d;color:#fff;font-size:3.5px;font-style:normal;font-weight:800}.landscape-thumb-media{position:relative;z-index:2;min-width:0;margin:7% 5% 7% 0;overflow:hidden;clip-path:ellipse(78% 82% at 62% 50%);background:#b9c5a8}.landscape-thumb-media img{width:100%;height:100%;object-fit:cover;filter:saturate(.78) brightness(.94)}.landscape-thumb-media div{position:absolute;right:7%;bottom:7%;width:70%;padding:5px 6px;background:rgba(250,248,241,.94);border-left:3px solid #ba6f4f}.landscape-thumb-media small{display:block;color:#ba6f4f;font-size:2.4px;font-weight:800;letter-spacing:.08em}.landscape-thumb-media b{display:block;margin-top:2px;font:400 3.7px Georgia,serif}
  .thumb--tideform-sync{position:relative;overflow:hidden;background:#006d78;color:#fff}.tideform-thumb-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.04)}.tideform-thumb-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,48,56,.88) 0%,rgba(2,48,56,.52) 55%,rgba(2,48,56,.08) 100%)}.tideform-thumb-caustics{position:absolute;inset:-25%;opacity:.32;mix-blend-mode:screen;background:repeating-radial-gradient(ellipse at 18% 28%,transparent 0 13px,rgba(211,255,251,.18) 15px 17px,transparent 20px 34px),repeating-radial-gradient(ellipse at 72% 64%,transparent 0 19px,rgba(255,255,255,.13) 21px 23px,transparent 26px 43px);transform:rotate(-10deg)}.tideform-thumb-brand{position:absolute;z-index:3;left:6%;top:8%;display:flex;align-items:center;gap:5px}.tideform-thumb-brand>span{width:14px;height:11px;position:relative;overflow:hidden}.tideform-thumb-brand>span i{position:absolute;width:12px;height:7px;left:0;border:1px solid #8ee0df;border-color:#8ee0df transparent transparent transparent;border-radius:50%;transform:rotate(8deg)}.tideform-thumb-brand>span i:first-child{top:2px}.tideform-thumb-brand>span i:last-child{top:6px;left:3px;opacity:.7}.tideform-thumb-brand b{font-size:4px;letter-spacing:.05em}.tideform-thumb-brand small{color:#9edfe0;font-size:2.4px;font-weight:800;letter-spacing:.15em}.tideform-thumb-copy{position:absolute;z-index:3;left:6%;top:33%;max-width:65%}.tideform-thumb-copy>small{display:block;color:#a8ebea;font-size:2.8px;font-weight:850;letter-spacing:.09em}.tideform-thumb-copy>strong{display:block;margin-top:7%;font:400 clamp(16px,2.2vw,30px)/.82 Georgia,serif;letter-spacing:-.06em}.tideform-thumb-copy>strong em{font-style:italic;background:linear-gradient(to bottom,#fff 0 46%,#9ce8e5 46% 57%,#33c2c7 57% 100%);-webkit-background-clip:text;background-clip:text;color:transparent}.tideform-thumb-copy>i{display:inline-flex;margin-top:12%;padding:5px 8px;border-radius:999px;background:#f6fbf8;color:#073c46;font-size:3.3px;font-style:normal;font-weight:850}.tideform-thumb-depth{position:absolute;z-index:3;right:5%;top:31%;display:flex;flex-direction:column;align-items:center;gap:4px;color:#d3efed;font:700 2.5px Arial,sans-serif}.tideform-thumb-depth b{width:1px;height:20px;background:rgba(255,255,255,.45)}.tideform-thumb-wave{position:absolute;z-index:2;left:0;right:0;bottom:-1px;height:24%}.tideform-thumb-wave svg{width:100%;height:100%}.tideform-thumb-wave path{fill:#f6fbf8}
`;
document.head.appendChild(galleryStyle);

const statValues = document.querySelectorAll('.intro-stats strong');
if (statValues[0]) statValues[0].textContent = '19';
if (statValues[1]) statValues[1].textContent = '19';

const libraryHeadCopy = document.querySelector('.library-head > p');
if (libraryHeadCopy) {
  libraryHeadCopy.textContent = 'The remaining sixteen templates live here. Use the filters to browse by direction without repeating the featured picks above.';
}

const libraryNoteStrong = document.querySelector('.library-note strong');
if (libraryNoteStrong) libraryNoteStrong.textContent = '16 more templates';

const filterCounts = {
  all: '16',
  minimal: '2',
  business: '9',
  product: '6',
  creative: '10',
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
