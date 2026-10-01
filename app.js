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
let currentAfricanLanguages = []; // Track available languages for selected country
let currentTranslationLanguage = null; // Track current translation language

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const formatStatus = status => (status || 'Unknown').toLowerCase().replaceAll('_', ' ');

function showLoading(append = false) {
  if (!append) results.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  loadMore.hidden = true;
  statusMessage.hidden = true;
}

function createLanguageTabs() {
  // Remove existing language tabs if any
  const existingTabs = document.querySelector('.african-language-tabs');
  if (existingTabs) {
    existingTabs.remove();
  }

  if (!currentAfricanLanguages || currentAfricanLanguages.length === 0) {
    return; // No languages for this country
  }

  const tabContainer = document.createElement('div');
  tabContainer.className = 'african-language-tabs';
  tabContainer.setAttribute('aria-label', 'African language translation tabs');

  // Create tabs for each available language
  currentAfricanLanguages.forEach((langCode) => {
    const tab = document.createElement('button');
    tab.className = 'language-tab';
    tab.dataset.language = langCode;
    tab.textContent = `${getLanguageName(langCode)} (${getNativeLanguageName(langCode)})`;
    tab.setAttribute('title', `Translate to ${getLanguageName(langCode)}`);

    tab.addEventListener('click', async () => {
      currentTranslationLanguage = langCode;
      await translateResultsToLanguage(langCode);
      updateLanguageTabStyles();
    });

    tabContainer.appendChild(tab);
  });

  // Add "English" tab to switch back
  const englishTab = document.createElement('button');
  englishTab.className = 'language-tab active';
  englishTab.dataset.language = 'en';
  englishTab.textContent = 'English';
  englishTab.addEventListener('click', () => {
    currentTranslationLanguage = null;
    // Re-render results in English
    searchTrials({ append: false });
    updateLanguageTabStyles();
  });
  tabContainer.insertBefore(englishTab, tabContainer.firstChild);

  // Insert tabs before results
  const resultsSection = document.querySelector('.results-section');
  if (resultsSection) {
    resultsSection.insertBefore(tabContainer, results);
  }
}

function updateLanguageTabStyles() {
  const tabs = document.querySelectorAll('.language-tab');
  tabs.forEach((tab) => {
    if (tab.dataset.language === (currentTranslationLanguage || 'en')) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

async function translateResultsToLanguage(languageCode) {
  const resultCards = document.querySelectorAll('.trial-card');
  statusMessage.textContent = `Translating results to ${getLanguageName(languageCode)}...`;
  statusMessage.hidden = false;

  for (const card of resultCards) {
    const titleElement = card.querySelector('h3');
    const linkElement = card.querySelector('.trial-link');

    if (titleElement) {
      const originalTitle = titleElement.dataset.originalTitle || titleElement.textContent;
      titleElement.dataset.originalTitle = originalTitle;
      const translatedTitle = await getCachedTranslation(originalTitle, languageCode);
      titleElement.textContent = translatedTitle;
    }

    if (linkElement) {
      const linkText = t('viewStudyDetails');
      const translatedLink = await getCachedTranslation(linkText, languageCode);
      linkElement.textContent = translatedLink + ' →';
    }
  }

  statusMessage.hidden = true;
}

function trialCard(study) {
  const p = study.protocolSection || {};
  const id = p.identificationModule || {};
  const status = p.statusModule || {};
  const design = p.designModule || {};
  const contacts = p.contactsLocationsModule || {};
  const locations = contacts.locations || [];
  const location = locations[0]?.city ? `${locations[0].city}, ${locations[0].country || ''}` : t('locationNotSpecified');
  const statusText = formatStatus(status.overallStatus);
  const statusClass = statusText.includes('recruit') ? ' recruiting' : '';
  const studyType = design.studyType ? `${design.studyType.charAt(0)}${design.studyType.slice(1).toLowerCase()} study` : t('clinicalStudy');
  return `<article class="trial-card">
    <div class="card-top"><span class="status${statusClass}">${escapeHTML(statusText)}</span><span class="nct">${escapeHTML(id.nctId || '')}</span></div>
    <h3 data-original-title="${escapeHTML(id.briefTitle || 'Untitled study')}">${escapeHTML(id.briefTitle || 'Untitled study')}</h3>
    <div class="meta"><span><span class="meta-icon">◈</span>${escapeHTML(studyType)}</span><span><span class="meta-icon">⌖</span>${escapeHTML(location)}</span></div>
    <a class="trial-link" href="https://clinicaltrials.gov/study/${encodeURIComponent(id.nctId || '')}" target="_blank" rel="noreferrer">${t('viewStudyDetails')} →</a>
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
    results.insertAdjacentHTML('beforeend', studies.length ? studies.map(trialCard).join('') : `<p class="muted">${t('noTrialsFound')}</p>`);
    nextPageToken = data.nextPageToken || '';
    loadMore.hidden = !nextPageToken;
    resultCount.textContent = data.totalCount ? `${data.totalCount.toLocaleString()} ${t('trialsFound')}` : `${studies.length} ${t('trialsShown')}`;
    resultsTitle.textContent = currentCountry ? `${t('trialsIn')} ${currentCountry}` : (currentQuery ? `${t('resultsFor')} "${currentQuery}"` : t('featuredAfricanTrials'));

    // Reset translation
    currentTranslationLanguage = null;
  } catch (error) {
    if (!append) results.innerHTML = '';
    statusMessage.textContent = t('unableLoadTrials');
    statusMessage.hidden = false;
    resultCount.textContent = `Unable to load trials`;
    console.error(error);
  }
}

window.updateSearchResults = searchTrials;

function runSearch(query) {
  currentQuery = query.trim();
  nextPageToken = '';
  searchTrials();
}

participantForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(participantForm);
  const country = formData.get('country')?.toString().trim();
  const diseaseArea = formData.get('diseaseArea')?.toString().trim();
  const email = formData.get('email')?.toString().trim();
  const address = formData.get('address')?.toString().trim();
  const code = formData.get('code')?.toString().trim();
  const telephone = formData.get('telephone')?.toString().trim();

  if (!country || !diseaseArea || !email || !address || !code || !telephone) {
    statusMessage.textContent = t('pleaseCompleteFields');
    statusMessage.hidden = false;
    return;
  }

  try {
    await firebase.firestore().collection('participantContacts').add({
      country,
      diseaseArea,
      email,
      address,
      code,
      telephone,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    participantForm.reset();
    statusMessage.textContent = t('contactSaved');
    statusMessage.hidden = false;
  } catch (error) {
    statusMessage.textContent = t('errorSaving');
    statusMessage.hidden = false;
    console.error(error);
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  runSearch(input.value);
});

countrySelect.addEventListener('change', () => {
  currentCountry = countrySelect.value;
  nextPageToken = '';

  // Update available African languages for this country
  currentAfricanLanguages = getLanguagesForCountry(currentCountry);
  createLanguageTabs();

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
