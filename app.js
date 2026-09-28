const API_URL = 'https://clinicaltrials.gov/api/v2/studies';
const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const results = document.querySelector('#results');
const resultCount = document.querySelector('#result-count');
const resultsTitle = document.querySelector('#results-title');
const statusMessage = document.querySelector('#status-message');
const loadMore = document.querySelector('#load-more');
const sortSelect = document.querySelector('#sort-select');
let nextPageToken = '';
let currentQuery = '';

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const first = value => Array.isArray(value) ? value[0] : value;
const formatStatus = status => (status || 'Unknown').toLowerCase().replaceAll('_', ' ');

function showLoading(append = false) {
  if (!append) results.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  loadMore.hidden = true;
  statusMessage.hidden = true;
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
  return `<article class="trial-card">
    <div class="card-top"><span class="status${statusClass}">${escapeHTML(statusText)}</span><span class="nct">${escapeHTML(id.nctId || '')}</span></div>
    <h3>${escapeHTML(id.briefTitle || 'Untitled study')}</h3>
    <div class="meta"><span><span class="meta-icon">◈</span>${escapeHTML(studyType)}</span><span><span class="meta-icon">⌖</span>${escapeHTML(location)}</span></div>
    <a class="trial-link" href="https://clinicaltrials.gov/study/${encodeURIComponent(id.nctId || '')}" target="_blank" rel="noreferrer">View study details →</a>
  </article>`;
}

async function searchTrials({ append = false } = {}) {
  showLoading(append);
  const params = new URLSearchParams({ query.term: currentQuery || '*', pageSize: '12', format: 'json', countTotal: 'true', sort: `${sortSelect.value}:desc` });
  if (nextPageToken && append) params.set('pageToken', nextPageToken);
  try {
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    const studies = data.studies || [];
    if (!append) results.innerHTML = '';
    results.insertAdjacentHTML('beforeend', studies.length ? studies.map(trialCard).join('') : '<p class="muted">No studies matched your search. Try a broader term.</p>');
    nextPageToken = data.nextPageToken || '';
    loadMore.hidden = !nextPageToken;
    resultCount.textContent = data.totalCount ? `${data.totalCount.toLocaleString()} studies found` : `${studies.length} studies shown`;
    resultsTitle.textContent = currentQuery ? `Results for “${currentQuery}”` : 'Featured clinical trials';
  } catch (error) {
    if (!append) results.innerHTML = '';
    statusMessage.textContent = 'We could not load studies right now. Please check your connection and try again.';
    statusMessage.hidden = false;
    resultCount.textContent = 'Unable to load studies';
    console.error(error);
  }
}

function runSearch(query) {
  currentQuery = query.trim();
  nextPageToken = '';
  searchTrials();
}
form.addEventListener('submit', event => { event.preventDefault(); runSearch(input.value); });
document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => { input.value = button.dataset.query; runSearch(button.dataset.query); }));
loadMore.addEventListener('click', () => searchTrials({ append: true }));
sortSelect.addEventListener('change', () => { nextPageToken = ''; searchTrials(); });
runSearch('');
