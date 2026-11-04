(() => {
  const results = document.querySelector('#results');
  const resultsToolbar = document.querySelector('.results-toolbar');

  if (!results || !resultsToolbar) return;

  const sheet = document.createElement('style');
  sheet.textContent = `
    .trial-organizer-shell {
      margin: 18px 0 24px;
      padding: 18px;
      border: 1px solid rgba(15, 76, 88, 0.12);
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(234,247,249,0.92));
      box-shadow: 0 18px 40px rgba(20, 54, 64, 0.06);
    }
    .trial-organizer-toolbar {
      display: grid;
      grid-template-columns: minmax(180px, 2fr) minmax(150px, 1fr) minmax(160px, 1fr);
      gap: 12px;
      align-items: end;
    }
    .trial-organizer-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      color: var(--muted, #56737d);
    }
    .trial-organizer-field input,
    .trial-organizer-field select {
      width: 100%;
      min-height: 42px;
      padding: 10px 12px;
      border: 1px solid rgba(13, 84, 97, 0.16);
      border-radius: 10px;
      background: rgba(255,255,255,0.9);
      color: var(--ink, #12313f);
      font-size: 13px;
      font-family: inherit;
      outline: none;
    }
    .trial-organizer-field input:focus,
    .trial-organizer-field select:focus {
      border-color: rgba(8,124,145,0.55);
      box-shadow: 0 0 0 3px rgba(8,124,145,0.12);
    }
    .trial-organizer-summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(120px, 1fr));
      gap: 12px;
      margin-top: 18px;
    }
    .trial-organizer-metric {
      padding: 14px 16px;
      border-radius: 14px;
      background: rgba(255,255,255,0.7);
      border: 1px solid rgba(15, 76, 88, 0.08);
    }
    .trial-organizer-metric .label {
      display: block;
      color: var(--muted, #56737d);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .trial-organizer-metric strong {
      display: block;
      margin-top: 8px;
      color: var(--ink, #12313f);
      font-size: 1.25rem;
      line-height: 1.1;
    }
    .trial-organizer-groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-top: 18px;
    }
    .trial-organizer-group {
      padding: 12px;
      border: 1px solid rgba(15, 76, 88, 0.08);
      border-radius: 12px;
      background: rgba(255,255,255,0.7);
    }
    .trial-organizer-group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 700;
      color: var(--ink, #12313f);
    }
    .trial-organizer-group-header span:last-child {
      color: var(--muted, #56737d);
      font-size: 11px;
      font-weight: 600;
    }
    .trial-organizer-group button {
      width: 100%;
      border: 0;
      background: rgba(8,124,145,0.07);
      color: var(--ink, #12313f);
      padding: 9px 10px;
      border-radius: 8px;
      text-align: left;
      cursor: pointer;
      transition: background .2s ease, transform .2s ease;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
    }
    .trial-organizer-group button:hover {
      background: rgba(8,124,145,0.12);
      transform: translateY(-1px);
    }
    @media (max-width: 700px) {
      .trial-organizer-toolbar,
      .trial-organizer-summary {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(sheet);

  const shell = document.createElement('section');
  shell.className = 'trial-organizer-shell';
  shell.innerHTML = `
    <div class="trial-organizer-toolbar">
      <label class="trial-organizer-field">
        Search loaded trials
        <input type="search" id="trial-organizer-search" placeholder="Title, location, or NCT ID" />
      </label>
      <label class="trial-organizer-field">
        Status filter
        <select id="trial-organizer-status">
          <option value="all">All statuses</option>
          <option value="recruiting">Recruiting only</option>
          <option value="active">Active / ongoing</option>
        </select>
      </label>
      <label class="trial-organizer-field">
        Group by
        <select id="trial-organizer-group">
          <option value="country">Country</option>
          <option value="disease">Disease area</option>
          <option value="status">Status</option>
          <option value="type">Study type</option>
        </select>
      </label>
    </div>
    <div class="trial-organizer-summary">
      <div class="trial-organizer-metric"><span class="label">Total</span><strong data-organizer-metric="total">0</strong></div>
      <div class="trial-organizer-metric"><span class="label">Countries</span><strong data-organizer-metric="countries">0</strong></div>
      <div class="trial-organizer-metric"><span class="label">Recruiting</span><strong data-organizer-metric="recruiting">0</strong></div>
      <div class="trial-organizer-metric"><span class="label">Focus</span><strong data-organizer-metric="focus">—</strong></div>
    </div>
    <div class="trial-organizer-groups" id="trial-organizer-groups"></div>
  `;

  resultsToolbar.insertAdjacentElement('afterend', shell);

  const searchInput = shell.querySelector('#trial-organizer-search');
  const statusFilter = shell.querySelector('#trial-organizer-status');
  const groupFilter = shell.querySelector('#trial-organizer-group');
  const groupsContainer = shell.querySelector('#trial-organizer-groups');

  const metricEls = {
    total: shell.querySelector('[data-organizer-metric="total"]'),
    countries: shell.querySelector('[data-organizer-metric="countries"]'),
    recruiting: shell.querySelector('[data-organizer-metric="recruiting"]'),
    focus: shell.querySelector('[data-organizer-metric="focus"]')
  };

  const normalize = value => (value || '').toString().trim().replace(/\s+/g, ' ');

  const inferDisease = title => {
    const haystack = normalize(title).toLowerCase();
    const rules = [
      ['malaria', 'Malaria'],
      ['hiv', 'HIV'],
      ['aids', 'HIV/AIDS'],
      ['tuberculosis', 'Tuberculosis'],
      ['tb', 'Tuberculosis'],
      ['covid', 'COVID-19'],
      ['diabetes', 'Diabetes'],
      ['hypertension', 'Hypertension'],
      ['cancer', 'Cancer'],
      ['oncology', 'Cancer'],
      ['breast', 'Breast cancer'],
      ['lung', 'Lung disease'],
      ['asthma', 'Asthma'],
      ['stroke', 'Stroke'],
      ['pneumonia', 'Pneumonia'],
      ['sepsis', 'Sepsis'],
      ['anemia', 'Anemia'],
      ['pregnancy', 'Maternal health'],
      ['maternal', 'Maternal health'],
      ['hepatitis', 'Hepatitis'],
      ['lymphoma', 'Lymphoma'],
      ['nash', 'NASH'],
      ['alzheimer', 'Alzheimer\'s'],
      ['parkinson', 'Parkinson\'s'],
      ['infectious', 'Infectious disease'],
      ['immunotherapy', 'Immunotherapy'],
      ['cardio', 'Cardiovascular disease'],
      ['arthritis', 'Arthritis'],
      ['sickle', 'Sickle cell disease']
    ];

    for (const [keyword, label] of rules) {
      if (haystack.includes(keyword)) return label;
    }

    return 'General research';
  };

  const parseCardMeta = card => {
    const title = card.querySelector('h3')?.textContent.trim() || 'Untitled study';
    const metaItems = [...card.querySelectorAll('.meta > span')].map(el => normalize(el.textContent));
    const studyType = metaItems[0]?.replace(/^◈\s*/, '') || 'Clinical study';
    const location = metaItems[1]?.replace(/^⌖\s*/, '') || 'Location not specified';
    const country = location.includes(',') ? location.split(',').map(part => part.trim()).filter(Boolean).at(-1) : location.trim();
    const status = card.querySelector('.status')?.textContent.trim() || 'Unknown';
    const nct = card.querySelector('.nct')?.textContent.trim() || 'NCT unknown';
    const disease = inferDisease(title);

    return { title, studyType, location, country, status, disease, nct };
  };

  const getGroupValue = (meta, groupBy) => {
    if (groupBy === 'country') return meta.country || 'Unspecified';
    if (groupBy === 'disease') return meta.disease || 'General research';
    if (groupBy === 'status') return meta.status || 'Unknown';
    if (groupBy === 'type') return meta.studyType || 'Clinical study';
    return 'All';
  };

  const applyLocalFilters = () => {
    const searchTerm = normalize(searchInput.value).toLowerCase();
    const statusTerm = statusFilter.value;

    [...results.querySelectorAll('.trial-card')].forEach(card => {
      const meta = parseCardMeta(card);
      const matchesSearch = !searchTerm || `${meta.title} ${meta.location} ${meta.nct}`.toLowerCase().includes(searchTerm);
      const matchesStatus = statusTerm === 'all' || (statusTerm === 'recruiting' && /recruit/i.test(meta.status)) || (statusTerm === 'active' && !/completed|withdrawn|terminated|suspended|unknown/i.test(meta.status));
      card.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  };

  const renderGroups = () => {
    const cards = [...results.querySelectorAll('.trial-card')].filter(card => card.style.display !== 'none');
    const groups = new Map();

    cards.forEach(card => {
      const meta = parseCardMeta(card);
      const key = getGroupValue(meta, groupFilter.value);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(card);
    });

    const orderedKeys = [...groups.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const groupedOrder = [];
    orderedKeys.forEach(key => {
      const groupCards = [...groups.get(key)].sort((a, b) => {
        const titleA = parseCardMeta(a).title.toLowerCase();
        const titleB = parseCardMeta(b).title.toLowerCase();
        return titleA.localeCompare(titleB);
      });
      groupedOrder.push(...groupCards);
    });

    groupedOrder.forEach(card => results.appendChild(card));

    const summary = {
      total: cards.length,
      countries: new Set(cards.map(card => parseCardMeta(card).country).filter(Boolean)).size,
      recruiting: cards.filter(card => /recruit/i.test(parseCardMeta(card).status)).length,
      focus: cards.length ? inferDisease(cards[0].querySelector('h3')?.textContent || '') : '—'
    };

    metricEls.total.textContent = summary.total;
    metricEls.countries.textContent = summary.countries;
    metricEls.recruiting.textContent = summary.recruiting;

    const topFocus = cards.reduce((acc, card) => {
      const disease = parseCardMeta(card).disease;
      acc[disease] = (acc[disease] || 0) + 1;
      return acc;
    }, {});

    const focusLabel = Object.entries(topFocus).sort((a, b) => b[1] - a[1])[0];
    metricEls.focus.textContent = focusLabel ? focusLabel[0] : '—';

    groupsContainer.innerHTML = '';
    orderedKeys.forEach(key => {
      const bucket = groups.get(key);
      const header = document.createElement('div');
      header.className = 'trial-organizer-group';
      const label = document.createElement('div');
      label.className = 'trial-organizer-group-header';
      label.innerHTML = `<span>${key}</span><span>${bucket.length}</span>`;
      header.appendChild(label);
      bucket.forEach(card => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.textContent = parseCardMeta(card).title;
        chip.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('is-highlighted');
          setTimeout(() => card.classList.remove('is-highlighted'), 1800);
        });
        header.appendChild(chip);
      });
      groupsContainer.appendChild(header);
    });
  };

  const refresh = () => {
    applyLocalFilters();
    renderGroups();
  };

  searchInput.addEventListener('input', refresh);
  statusFilter.addEventListener('change', refresh);
  groupFilter.addEventListener('change', refresh);

  const observer = new MutationObserver(() => refresh());
  observer.observe(results, { childList: true, subtree: true });

  refresh();
})();
