const templateGrid = document.querySelector('.template-grid');

if (templateGrid && !document.querySelector('[data-template="woodworker"]')) {
  templateGrid.insertAdjacentHTML('beforeend', `
    <article class="template-card is-live" data-category="business creative" data-template="woodworker">
      <a aria-label="Open Woodworker template" class="thumb-link" href="templates/woodworker/">
        <div class="thumb thumb--woodworker-sync">
          <div class="woodworker-thumb-rail" aria-hidden="true">
            <span>0</span><i></i><i></i><i></i><span>12</span><i></i><i></i><i></i><span>24</span>
          </div>
          <div class="woodworker-thumb-copy">
            <div class="woodworker-thumb-brand">
              <span aria-hidden="true"></span>
              <div><b>GRAIN &amp; GABLE</b><small>WOODWORKING</small></div>
            </div>
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

const galleryStyle = document.createElement('style');
galleryStyle.textContent = `
  .thumb--woodworker-sync {
    position: relative;
    display: grid;
    grid-template-columns: 7% 48% 45%;
    overflow: hidden;
    background: #efe4cf;
    color: #26231f;
  }
  .woodworker-thumb-rail {
    padding: 12% 0 10%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    border-right: 1px solid rgba(38,35,31,.24);
    color: #736b60;
    font: 700 3px ui-monospace,monospace;
  }
  .woodworker-thumb-rail span { padding-left: 18%; }
  .woodworker-thumb-rail i { width: 50%; height: 1px; background: rgba(38,35,31,.24); }
  .woodworker-thumb-rail i:nth-of-type(3n+1) { width: 76%; }
  .woodworker-thumb-copy {
    min-width: 0;
    padding: 9% 7% 8%;
    display: flex;
    flex-direction: column;
  }
  .woodworker-thumb-brand { display: flex; align-items: center; gap: 6px; }
  .woodworker-thumb-brand > span {
    width: 12px; height: 12px; border: 1px solid #573724; transform: rotate(45deg); position: relative;
  }
  .woodworker-thumb-brand > span::after {
    content: ''; position: absolute; width: 5px; height: 1px; left: 3px; top: 5px; background: #b24d36;
    box-shadow: 0 -3px 0 #3f5146, 0 3px 0 #3f5146;
  }
  .woodworker-thumb-brand div { display: grid; gap: 1px; }
  .woodworker-thumb-brand b { font-size: 4px; letter-spacing: .04em; }
  .woodworker-thumb-brand small { color: #736b60; font: 700 2.5px ui-monospace,monospace; letter-spacing: .11em; }
  .woodworker-thumb-copy > p {
    margin: 17% 0 0; color: #573724; font: 800 3px ui-monospace,monospace; letter-spacing: .08em;
  }
  .woodworker-thumb-copy > strong {
    margin-top: 7%; font: 400 clamp(16px,2.1vw,29px)/.82 Georgia,serif; letter-spacing: -.055em;
  }
  .woodworker-thumb-copy > strong em { color: #b24d36; font-weight: 400; }
  .woodworker-thumb-copy > i {
    width: fit-content; margin-top: auto; padding: 5px 7px; background: #573724; color: #fff; font-size: 3.5px; font-style: normal; font-weight: 800;
  }
  .woodworker-thumb-media {
    min-width: 0; margin: 8% 6% 8% 0; display: grid; grid-template-rows: 1fr auto; border-left: 5px solid #3f5146; background: #ddd0b8;
  }
  .woodworker-thumb-media img { width: 100%; height: 100%; min-height: 0; object-fit: cover; filter: saturate(.78) contrast(1.02); }
  .woodworker-thumb-media div { padding: 6px 7px; display: grid; gap: 2px; background: #f8f2e6; border-top: 1px solid rgba(38,35,31,.18); }
  .woodworker-thumb-media small { color: #b24d36; font: 800 2.5px ui-monospace,monospace; letter-spacing: .08em; }
  .woodworker-thumb-media b { font: 400 4px Georgia,serif; }
  .woodworker-thumb-note {
    position: absolute; left: 39%; bottom: 6%; z-index: 4; min-width: 27%; padding: 5px 6px; display: grid; gap: 2px;
    background: #f8f2e6; border-top: 1px solid #26231f; transform: rotate(-1deg);
  }
  .woodworker-thumb-note small { color: #b24d36; font: 800 2.4px ui-monospace,monospace; letter-spacing: .08em; }
  .woodworker-thumb-note b { font: 400 4px Georgia,serif; }
`;
document.head.appendChild(galleryStyle);

const statValues = document.querySelectorAll('.intro-stats strong');
if (statValues[0]) statValues[0].textContent = '17';
if (statValues[1]) statValues[1].textContent = '17';

const libraryHeadCopy = document.querySelector('.library-head > p');
if (libraryHeadCopy) {
  libraryHeadCopy.textContent = 'The remaining fourteen templates live here. Use the filters to browse by direction without repeating the featured picks above.';
}

const libraryNoteStrong = document.querySelector('.library-note strong');
if (libraryNoteStrong) libraryNoteStrong.textContent = '14 more templates';

const filterCounts = {
  all: '14',
  minimal: '2',
  business: '7',
  product: '6',
  creative: '8',
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
