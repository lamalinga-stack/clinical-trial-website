(() => {
  const results = document.querySelector('#results');
  const resultsToolbar = document.querySelector('.results-toolbar');
  if (!results || !resultsToolbar) return;

  const styles = document.createElement('style');
  styles.textContent = `
    .trial-organizer-shell { margin:18px 0 24px; padding:18px; border:1px solid rgba(15,76,88,.12); border-radius:18px; background:linear-gradient(180deg,#fff,#eaf7f9); box-shadow:0 12px 30px rgba(20,54,64,.05); }
    .trial-organizer-toolbar { display:grid; grid-template-columns:minmax(180px,2fr) minmax(150px,1fr) minmax(160px,1fr); gap:12px; align-items:end; }
    .trial-organizer-field { display:flex; flex-direction:column; gap:8px; color:var(--muted,#56737d); font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
    .trial-organizer-field input,.trial-organizer-field select { width:100%; min-height:42px; padding:10px 12px; border:1px solid rgba(13,84,97,.16); border-radius:10px; background:#fff; color:var(--ink,#12313f); font:inherit; font-size:13px; }
    .trial-organizer-summary { display:grid; grid-template-columns:repeat(4,minmax(110px,1fr)); gap:10px; margin-top:16px; }
    .trial-organizer-metric { padding:12px 14px; border:1px solid rgba(15,76,88,.08); border-radius:12px; background:rgba(255,255,255,.75); }
    .trial-organizer-metric .label { display:block; color:var(--muted,#56737d); font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
    .trial-organizer-metric strong { display:block; margin-top:7px; color:var(--ink,#12313f); font-size:1.15rem; }
    .trial-organizer-groups { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:10px; margin-top:14px; }
    .trial-organizer-group { padding:11px; border:1px solid rgba(15,76,88,.08); border-radius:12px; background:rgba(255,255,255,.75); }
    .trial-organizer-group-header { display:flex; justify-content:space-between; gap:8px; margin-bottom:8px; color:var(--ink,#12313f); font-size:12px; font-weight:700; }
    .trial-organizer-group-header span:last-child { color:var(--muted,#56737d); font-weight:600; }
    .trial-organizer-group button { width:100%; margin-top:5px; padding:8px 9px; border:0; border-radius:8px; background:rgba(8,124,145,.07); color:var(--ink,#12313f); text-align:left; font:inherit; font-size:11px; cursor:pointer; }
    .trial-organizer-group button:hover { background:rgba(8,124,145,.14); }
    .trial-organizer-more { margin:8px 0 0; color:var(--muted,#56737d); font-size:10px; }
    .trial-organizer-empty { grid-column:1/-1; margin:0; color:var(--muted,#56737d); font-size:12px; }
    .trial-card.organizer-highlight { outline:3px solid rgba(8,124,145,.35); outline-offset:3px; }
    @media(max-width:700px) { .trial-organizer-toolbar { grid-template-columns:1fr; } .trial-organizer-summary { grid-template-columns:repeat(2,minmax(0,1fr)); } }
  `;
  document.head.appendChild(styles);

  const shell = document.createElement('section');
  shell.className = 'trial-organizer-shell';
  shell.setAttribute('aria-label', 'Find and organize loaded trials');
  shell.innerHTML = `
    <div class="trial-organizer-toolbar">
      <label class="trial-organizer-field">Find in these results
        <input type="search" id="trial-organizer-search" placeholder="Condition, location, or study ID" autocomplete="off">
      </label>
      <label class="trial-organizer-field">Show studies
        <select id="trial-organizer-status">
          <option value="all">All loaded studies</option>
          <option value="recruiting">Recruiting only</option>
        </select>
      </label>
      <label class="trial-organizer-field">Browse by
        <select id="trial-organizer-group">
          <option value="country">Country</option>
          <option value="disease">Health condition</option>
          <option value="status">Recruitment status</option>
          <option value="type">Study type</option>
        </select>
      </label>
    </div>
    <div class="trial-organizer-summary" aria-live="polite">
      <div class="trial-organizer-metric"><span class="label">Studies shown</span><strong data-metric="total">0</strong></div>
      <div class="trial-organizer-metric"><span class="label">Countries</span><strong data-metric="countries">0</strong></div>
      <div class="trial-organizer-metric"><span class="label">Recruiting</span><strong data-metric="recruiting">0</strong></div>
      <div class="trial-organizer-metric"><span class="label">Most common topic</span><strong data-metric="focus">—</strong></div>
    </div>
    <div class="trial-organizer-groups" id="trial-organizer-groups"></div>
  `;
  resultsToolbar.insertAdjacentElement('afterend', shell);

  const searchInput = shell.querySelector('#trial-organizer-search');
  const statusFilter = shell.querySelector('#trial-organizer-status');
  const groupFilter = shell.querySelector('#trial-organizer-group');
  const groupsContainer = shell.querySelector('#trial-organizer-groups');
  const metric = name => shell.querySelector(`[data-metric="${name}"]`);
  const metadata = new WeakMap();
  let refreshTimer;
  let scheduledFrame = false;

  const normalize = value => (value || '').trim().replace(/\s+/g, ' ');
  const getMeta = card => {
    if (metadata.has(card)) return metadata.get(card);

    const title = normalize(card.querySelector('h3')?.textContent) || 'Study details';
    const meta = [...card.querySelectorAll('.meta > span')].map(item => normalize(item.textContent));
    const studyType = meta[0]?.replace(/^◈\s*/, '') || 'Study type not listed';
    const location = meta[1]?.replace(/^⌖\s*/, '') || 'Location not listed';
    const country = location.includes(',') ? location.split(',').pop().trim() : location;
    const status = normalize(card.querySelector('.status')?.textContent) || 'Status not listed';
    const studyId = normalize(card.querySelector('.nct')?.textContent);
    // Use the registry's condition field when available; the title is only a rough browsing category.
    const condition = normalize(card.dataset.condition) || 'Health topic not specified';
    const value = { title, studyType, location, country, status, studyId, condition };
    metadata.set(card, value);
    return value;
  };

  const groupName = meta => {
    switch (groupFilter.value) {
      case 'disease': return meta.condition;
      case 'status': return meta.status;
      case 'type': return meta.studyType;
      default: return meta.country || 'Location not listed';
    }
  };

  function refresh() {
    scheduledFrame = false;
    const cards = [...results.querySelectorAll('.trial-card')];
    const query = normalize(searchInput.value).toLocaleLowerCase();
    const groups = new Map();
    let shown = 0;
    let recruiting = 0;
    const countries = new Set();
    const topics = new Map();

    cards.forEach(card => {
      const meta = getMeta(card);
      const text = `${meta.title} ${meta.location} ${meta.studyId} ${meta.condition}`.toLocaleLowerCase();
      const matchesQuery = !query || text.includes(query);
      const isRecruiting = /recruit/i.test(meta.status);
      const matchesStatus = statusFilter.value !== 'recruiting' || isRecruiting;
      card.hidden = !(matchesQuery && matchesStatus);
      if (card.hidden) return;

      shown++;
      if (isRecruiting) recruiting++;
      if (meta.country && meta.country !== 'Location not listed') countries.add(meta.country);
      topics.set(meta.condition, (topics.get(meta.condition) || 0) + 1);
      const key = groupName(meta);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({ card, meta });
    });

    metric('total').textContent = String(shown);
    metric('countries').textContent = String(countries.size);
    metric('recruiting').textContent = String(recruiting);
    const mostCommonTopic = [...topics.entries()].sort((a, b) => b[1] - a[1])[0];
    metric('focus').textContent = mostCommonTopic && mostCommonTopic[0] !== 'Health topic not specified' ? mostCommonTopic[0] : '—';

    const fragment = document.createDocumentFragment();
    const groupKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    groupKeys.forEach(key => {
      const studies = groups.get(key);
      const group = document.createElement('div');
      group.className = 'trial-organizer-group';
      const heading = document.createElement('div');
      heading.className = 'trial-organizer-group-header';
      const name = document.createElement('span');
      name.textContent = key;
      const count = document.createElement('span');
      count.textContent = `${studies.length} ${studies.length === 1 ? 'study' : 'studies'}`;
      heading.append(name, count);
      group.appendChild(heading);

      // Keep the overview compact; users can use the main results cards for the full list.
      studies.slice(0, 3).forEach(({ card, meta }) => {
        const jump = document.createElement('button');
        jump.type = 'button';
        jump.textContent = meta.title;
        jump.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('organizer-highlight');
          window.setTimeout(() => card.classList.remove('organizer-highlight'), 1400);
        }, { once: true });
        group.appendChild(jump);
      });

      if (studies.length > 3) {
        const more = document.createElement('p');
        more.className = 'trial-organizer-more';
        more.textContent = `And ${studies.length - 3} more in the results below`;
        group.appendChild(more);
      }
      fragment.appendChild(group);
    });

    if (!shown) {
      const empty = document.createElement('p');
      empty.className = 'trial-organizer-empty';
      empty.textContent = cards.length ? 'No loaded studies match those filters. Try changing your search.' : 'Studies will appear here after results load.';
      fragment.appendChild(empty);
    }
    groupsContainer.replaceChildren(fragment);
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      if (scheduledFrame) return;
      scheduledFrame = true;
      window.requestAnimationFrame(refresh);
    }, 100);
  }

  searchInput.addEventListener('input', scheduleRefresh);
  statusFilter.addEventListener('change', scheduleRefresh);
  groupFilter.addEventListener('change', scheduleRefresh);

  // Watch only direct result-list changes. Do not observe subtree or move cards here:
  // that previously caused observer callbacks to retrigger themselves and freeze the page.
  const observer = new MutationObserver(records => {
    if (records.some(record => record.addedNodes.length || record.removedNodes.length)) scheduleRefresh();
  });
  observer.observe(results, { childList: true });
  refresh();
})();
