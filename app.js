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

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
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
  const params = new URLSearchParams({ 'query.term': searchQuery, pageSize: '12', format: 'json', countTotal: 'true', sort: `${sortSelect.value}:desc` });
  if (nextPageToken && append) params.set('pageToken', nextPageToken);
  try {
    const response = await fetch(`${API_URL}?${params}`);
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    const studies = data.studies || [];
    if (!append) results.innerHTML = '';
    results.insertAdjacentHTML('beforeend', studies.length ? studies.map(trialCard).join('') : '<p class="muted">No trials found for your search. Try a different condition or country.</p>');
    nextPageToken = data.nextPageToken || '';
    loadMore.hidden = !nextPageToken;
    resultCount.textContent = data.totalCount ? `${data.totalCount.toLocaleString()} trials found` : `${studies.length} trials shown`;
    resultsTitle.textContent = currentCountry ? `Trials in ${currentCountry}` : (currentQuery ? `Results for \"${currentQuery}\"` : 'Featured African trials');
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

runSearch('');
