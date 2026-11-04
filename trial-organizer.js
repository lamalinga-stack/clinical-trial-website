(() => {
  const results = document.querySelector('#results');
  const toolbar = document.querySelector('.results-toolbar');
  if (!results || !toolbar) return;

  const style = document.createElement('style');
  style.textContent = `
    .trial-organizer { display:grid; grid-template-columns:minmax(180px,1.5fr) minmax(150px,1fr) minmax(150px,1fr) auto; gap:10px; align-items:end; margin:0 0 20px; padding:16px; background:#fff; border:1px solid var(--line,#dce8e9); border-radius:14px; }
    .trial-organizer label { display:flex; flex-direction:column; gap:7px; color:var(--muted,#647d87); font-size:11px; font-weight:700; }
    .trial-organizer input, .trial-organizer select { min-width:0; width:100%; min-height:40px; padding:9px 11px; color:var(--ink,#12313f); background:#fbfdfd; border:1px solid var(--line,#dce8e9); border-radius:8px; outline:0; font-size:12px; }
    .trial-organizer input:focus, .trial-organizer select:focus { border-color:var(--blue,#087c91); box-shadow:0 0 0 3px rgba(8,124,145,.12); }
    .trial-organizer button { min-height:40px; padding:0 13px; color:var(--blue-dark,#075d70); background:#fff; border:1px solid var(--line,#dce8e9); border-radius:8px; font-size:11px; font-weight:700; cursor:pointer; }
    .trial-organizer button:hover { color:#fff; background:var(--blue,#087c91); border-color:var(--blue,#087c91); }
    .trial-organizer-summary { grid-column:1/-1; margin:0; color:var(--muted,#647d87); font-size:11px; }
    .trial-card[hidden] { display:none !important; }
    @media(max-width:700px) { .trial-organizer { grid-template-columns:1fr 1fr; } .trial-organizer label:first-child { grid-column:1/-1; } .trial-organizer-summary { grid-column:1/-1; } }
    @media(max-width:420px) { .trial-organizer { grid-template-columns:1fr; } .trial-organizer label:first-child, .trial-organizer-summary { grid-column:auto; } }
  `;
  document.head.appendChild(style);

  const controls = document.createElement('form');
  controls.className = 'trial-organizer';
  controls.setAttribute('role', 'search');
  controls.setAttribute('aria-label', 'Organize loaded clinical trials');
  controls.innerHTML = `
    <label>Find in loaded trials
      <input type="search" name="keyword" placeholder="Search titles, locations, or NCT IDs" autocomplete="off">
    </label>
    <label>Study type
      <select name="type"><option value="">All study types</option></select>
    </label>
    <label>Organize by
      <select name="sort">
        <option value="relevance">Relevance (default)</option>
        <option value="title">Title (A–Z)</option>
        <option value="location">Location (A–Z)</option>
        <option value="type">Study type</option>
      </select>
    </label>
    <button type="reset">Clear</button>
    <p class="trial-organizer-summary" aria-live="polite">Organize the trials currently loaded below. Use the main search above to find more records.</p>
  `;
  toolbar.insertAdjacentElement('afterend', controls);

  const keyword = controls.elements.keyword;
  const typeSelect = controls.elements.type;
  const sortSelect = controls.elements.sort;
  const summary = controls.querySelector('.trial-organizer-summary');
  let originalOrder = new WeakMap();
  let sequence = 0;
  let updateQueued = false;

  const getText = (card, selector) => card.querySelector(selector)?.textContent.trim() || '';
  const studyTypeOf = card => getText(card, '.meta > span:first-child').replace(/^◈\s*/, '');
  const locationOf = card => getText(card, '.meta > span:nth-child(2)').replace(/^⌖\s*/, '');

  function update() {
    updateQueued = false;
    const cards = [...results.querySelectorAll('.trial-card')];
    const availableTypes = [...new Set(cards.map(studyTypeOf).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const selectedType = typeSelect.value;
    const validTypes = new Set(availableTypes);
    typeSelect.replaceChildren(new Option('All study types', ''));
    availableTypes.forEach(type => typeSelect.add(new Option(type, type)));
    typeSelect.value = validTypes.has(selectedType) ? selectedType : '';

    const query = keyword.value.trim().toLocaleLowerCase();
    let visibleCount = 0;
    cards.forEach(card => {
      if (!originalOrder.has(card)) originalOrder.set(card, sequence++);
      const matchesText = !query || card.textContent.toLocaleLowerCase().includes(query);
      const matchesType = !typeSelect.value || studyTypeOf(card) === typeSelect.value;
      card.hidden = !(matchesText && matchesType);
      if (!card.hidden) visibleCount++;
    });

    const sortedCards = [...cards].sort((a, b) => {
      switch (sortSelect.value) {
        case 'title': return getText(a, 'h3').localeCompare(getText(b, 'h3'));
        case 'location': return locationOf(a).localeCompare(locationOf(b));
        case 'type': return studyTypeOf(a).localeCompare(studyTypeOf(b')) || getText(a, 'h3').localeCompare(getText(b, 'h3'));
        default: return originalOrder.get(a) - originalOrder.get(b);
      }
    });
    sortedCards.forEach(card => results.appendChild(card));

    summary.textContent = `${visibleCount} of ${cards.length} loaded trial${cards.length === 1 ? '' : 's'} shown. Use the main search above to fetch additional records.`;
  }

  function scheduleUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(update);
  }

  controls.addEventListener('input', scheduleUpdate);
  controls.addEventListener('change', scheduleUpdate);
  controls.addEventListener('reset', () => requestAnimationFrame(scheduleUpdate));
  new MutationObserver(scheduleUpdate).observe(results, { childList: true });
  update();
})();
