const API_URL = 'https://clinicaltrials.gov/api/v2/studies';
const PACTR_URL = 'https://pactr.samrc.ac.za/GIS_Viewer.aspx';
const AFRICAN_COUNTRIES = [
  'South Africa', 'Nigeria', 'Kenya', 'Uganda', 'Ethiopia', 'Ghana', 'Tanzania',
  'Cameroon', 'Senegal', 'Zambia', 'Zimbabwe', 'Mozambique', 'Rwanda', 'Malawi',
  'Egypt', 'Tunisia', 'Morocco', 'Angola', 'Botswana', 'Namibia', 'Benin',
  'Burundi', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
  'Congo', 'Democratic Republic of Congo', 'Cote d\'Ivoire', 'Djibouti',
  'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Gabon', 'Gambia', 'Guinea',
  'Guinea-Bissau', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Mali',
  'Mauritania', 'Mauritius', 'Niger', 'Sao Tome and Principe', 'Seychelles',
  'Sierra Leone', 'Somalia', 'South Sudan', 'Sudan', 'Togo'
];

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const countrySelect = document.querySelector('#country-select');
const results = document.querySelector('#results');
const resultCount = document.querySelector('#result-count');
const resultsTitle = document.querySelector('#results-title');
const statusMessage = document.querySelector('#status-message');
const loadMore = document.querySelector('#load-more');
const sortSelect = document.querySelector('#sort-select');
const pactrButton = document.querySelector('#pactr-focus');
const participantForm = document.querySelector('#participant-form');
let nextPageToken = '';
let currentQuery = '';
let currentCountry = '';
let currentTranslationLanguage = 'en';
let currentAfricanLanguages = [];

const excludedStudyStatuses = new Set(['COMPLETED', 'SUSPENDED']);

const escapeHTML = (value = '') => String(value).replace(/[&<>\'\"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const formatStatus = status => (status || 'Unknown').toLowerCase().replaceAll('_', ' ');

const isVisibleStudy = study => {
  const status = study?.protocolSection?.statusModule?.overallStatus;
  return !excludedStudyStatuses.has((status || '').toUpperCase());
};

function showLoading(append = false) {
  if (!append) results.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  loadMore.hidden = true;
  statusMessage.hidden = true;
}

function createLanguageTabs() {
  const existing = document.querySelector('.african-language-tabs');
  if (existing) existing.remove();

  const tabs = document.createElement('div');
  tabs.className = 'african-language-tabs';

  const english = document.createElement('button');
  english.type = 'button';
  english.className = 'language-tab active';
  english.textContent = 'English';
  english.dataset.language = 'en';
  english.addEventListener('click', () => {
    currentTranslationLanguage = 'en';
    updateLanguageTabStyles();
    renderTranslatedResults();
  });
  tabs.appendChild(english);

  currentAfricanLanguages.forEach(code => {
    const langBtn = document.createElement('button');
    langBtn.type = 'button';
    langBtn.className = 'language-tab';
    langBtn.dataset.language = code;
    langBtn.textContent = `${window.Vulavula?.getLanguageName(code) || code.toUpperCase()} (${window.Vulavula?.getNativeLanguageName(code) || code.toUpperCase()})`;
    langBtn.addEventListener('click', async () => {
      currentTranslationLanguage = code;
      updateLanguageTabStyles();
      await renderTranslatedResults();
    });
    tabs.appendChild(langBtn);
  });

  const resultsSection = document.querySelector('.results-section');
  if (resultsSection) {
    resultsSection.insertBefore(tabs, resultsSection.querySelector('#results'));
  }
}

function updateLanguageTabStyles() {
  document.querySelectorAll('.language-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.language === currentTranslationLanguage);
  });
}

async function renderTranslatedResults() {
  const cards = [...document.querySelectorAll('.trial-card')];
  if (!cards.length) return;

  const targetLanguage = currentTranslationLanguage || 'en';
  const originalTitles = cards.map(card => card.dataset.originalTitle || card.querySelector('h3')?.textContent || '');

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const titleEl = card.querySelector('h3');
    const linkEl = card.querySelector('.trial-link');
    const originalTitle = originalTitles[i] || titleEl?.textContent || '';

    if (titleEl) {
      titleEl.textContent = targetLanguage === 'en'
        ? originalTitle
        : await window.Vulavula.getCachedTranslation(originalTitle, targetLanguage);
    }

    if (linkEl) {
      const originalLinkText = linkEl.dataset.originalText || 'View study details';
      linkEl.textContent = targetLanguage === 'en'
        ? originalLinkText
        : await window.Vulavula.getCachedTranslation(originalLinkText, targetLanguage) + ' →';
    }
  }
}

function trialCard(study) {
  const p = study.protocolSection || {};
  const id = p.identificationModule || {};
  const status = p.statusModule || {};
  const design = p.designModule || {};
  const contacts = p.contactsLocationsModule || {};
  const locations = contacts.locations || [];
  const location = locations[0]?.city ? `${locations[0].city}, ${locations[0].country || ''}` : 'Location not specified';
  const statusText = formatStatus(status.overallStatus);
  const statusClass = statusText.includes('recruit') ? ' recruiting' : '';
  const studyType = design.studyType ? `${design.studyType.charAt(0)}${design.studyType.slice(1).toLowerCase()} study` : 'Clinical study';
  const title = id.briefTitle || 'Untitled study';

  return `<article class="trial-card" data-original-title="${escapeHTML(title)}">
    <div class="card-top"><span class="status${statusClass}">${escapeHTML(statusText)}</span><span class="nct">${escapeHTML(id.nctId || '')}</span></div>
    <h3>${escapeHTML(title)}</h3>
    <div class="meta"><span><span class="meta-icon">◈</span>${escapeHTML(studyType)}</span><span><span class="meta-icon">⌖</span>${escapeHTML(location)}</span></div>
    <a class="trial-link" data-original-text="View study details" href="https://clinicaltrials.gov/study/${encodeURIComponent(id.nctId || '')}" target="_blank" rel="noreferrer">View study details →</a>
  </article>`;
}

function buildSearchQuery() {
  let query = currentQuery || '*';
  if (currentCountry) {
    query = query === '*' ? currentCountry : `${query} AND ${currentCountry}`;
  }
  return query;
}

async function searchTrials({ append = false } = {}) {
  showLoading(append);
  const searchQuery = buildSearchQuery();
  const params = new URLSearchParams({
    'query.term': searchQuery,
    pageSize: '12',
    format: 'json',
    countTotal: 'true',
    sort: `${sortSelect.value}:desc`
  });
  if (nextPageToken && append) params.set('pageToken', nextPageToken);

  try {
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    const allStudies = data.studies || [];
    const studies = allStudies.filter(isVisibleStudy);
    const hiddenStatusCount = allStudies.length - studies.length;

    if (!append) results.innerHTML = '';
    results.insertAdjacentHTML('beforeend', studies.length ? studies.map(trialCard).join('') : '<p class="muted">No trials found for your search. Try a different condition or country.</p>');

    nextPageToken = data.nextPageToken || '';
    loadMore.hidden = !nextPageToken;
    const visibleCount = studies.length;
    const totalCount = data.totalCount ? Math.max(data.totalCount - hiddenStatusCount, visibleCount) : visibleCount;
    resultCount.textContent = data.totalCount ? `${totalCount.toLocaleString()} trials found` : `${visibleCount} trials shown`;
    resultsTitle.textContent = currentCountry ? `Trials in ${currentCountry}` : (currentQuery ? `Results for "${currentQuery}"` : 'Featured African trials');

    currentAfricanLanguages = currentCountry ? (window.Vulavula?.getLanguagesForCountry(currentCountry) || []) : [];
    createLanguageTabs();
    updateLanguageTabStyles();
  } catch (error) {
    if (!append) results.innerHTML = '';
    statusMessage.textContent = 'We could not load trials right now. Please check your connection and try again.';
    statusMessage.hidden = false;
    resultCount.textContent = 'Unable to load trials';
    console.error(error);
  }
}

function runSearch(query) {
  currentQuery = query.trim();
  nextPageToken = '';
  searchTrials();
}

participantForm.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(participantForm);
  const country = formData.get('country')?.toString().trim();
  const diseaseArea = formData.get('diseaseArea')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const address = formData.get('address')?.toString().trim();
  const code = formData.get('code')?.toString().trim();
  const telephone = formData.get('telephone')?.toString().trim();

  if (!country || !diseaseArea || !email || !address || !code || !telephone) {
    statusMessage.textContent = 'Please complete all fields so your contact details can be submitted.';
    statusMessage.hidden = false;
    return;
  }

  const summary = `Country: ${country}\nDisease area: ${diseaseArea}\nEmail: ${email}\nAddress: ${address}\nCode: ${code}\nTelephone: ${telephone}`;
  const mailtoLink = `mailto:info@africatrialus.com?subject=${encodeURIComponent('New participant contact submission')}&body=${encodeURIComponent(summary)}`;
  window.location.href = mailtoLink;
  participantForm.reset();
  statusMessage.textContent = 'Thank you. Your contact details have been prepared for submission.';
  statusMessage.hidden = false;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  runSearch(input.value);
});

countrySelect.addEventListener('change', () => {
  currentCountry = countrySelect.value;
  nextPageToken = '';
  searchTrials();
});

document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => {
  input.value = button.dataset.query;
  runSearch(button.dataset.query);
}));

pactrButton.addEventListener('click', () => {
  window.open(PACTR_URL, '_blank', 'noopener,noreferrer');
});

loadMore.addEventListener('click', () => searchTrials({ append: true }));
sortSelect.addEventListener('change', () => {
  nextPageToken = '';
  searchTrials();
});

window.addEventListener('load', () => {
  if (window.Vulavula) {
    console.log('Vulavula helper available');
  } else {
    console.warn('Vulavula helper is missing');
  }
});

runSearch('');
