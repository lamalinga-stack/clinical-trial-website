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

const provinceOptions = {
  'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'],
  'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Federal Capital Territory'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kajiado', 'Kiambu', 'Machakos', 'Uasin Gishu', 'Kakamega', 'Meru'],
  'Uganda': ['Central', 'Eastern', 'Western', 'Northern'],
  'Ethiopia': ['Addis Ababa', 'Amhara', 'Oromia', 'Somali', 'Tigray', 'Afar', 'SNNPR', 'Harari', 'Dire Dawa'],
  'Ghana': ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Volta', 'Central', 'Upper East', 'Upper West', 'Bono', 'Ahafo', 'Bono East'],
  'Tanzania': ['Dar es Salaam', 'Dodoma', 'Arusha', 'Kilimanjaro', 'Mwanza', 'Mbeya', 'Tabora', 'Iringa', 'Morogoro'],
  'Cameroon': ['Centre', 'Littoral', 'Northwest', 'Southwest', 'West', 'Adamawa', 'North', 'Far North', 'East', 'South'],
  'Senegal': ['Dakar', 'Saint-Louis', 'Thiès', 'Kolda', 'Tambacounda', 'Kaolack', 'Ziguinchor'],
  'Zambia': ['Lusaka', 'Copperbelt', 'Eastern', 'Central', 'North-Western', 'Southern', 'Western', 'Muchinga', 'Luapula', 'Northern'],
  'Zimbabwe': ['Harare', 'Bulawayo', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'],
  'Mozambique': ['Maputo', 'Sofala', 'Nampula', 'Zambezia', 'Manica', 'Gaza', 'Tete', 'Cabo Delgado', 'Niassa', 'Inhambane'],
  'Rwanda': ['Kigali', 'Eastern', 'Southern', 'Western', 'Northern'],
  'Malawi': ['Lilongwe', 'Blantyre', 'Mzuzu', 'Kasungu', 'Mangochi'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Dakahlia', 'Asyut', 'Minya', 'Sohag'],
  'Tunisia': ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte'],
  'Morocco': ['Casablanca-Settat', 'Rabat-Salé-Kénitra', 'Fès-Meknès', 'Tangier-Tetouan-Al Hoceima', 'Marrakesh-Safi', 'Laayoune-Sakia El Hamra'],
  'Angola': ['Luanda', 'Benguela', 'Huíla', 'Cabinda', 'Lunda Norte'],
  'Botswana': ['Gaborone', 'Francistown', 'Maun', 'Serowe'],
  'Namibia': ['Khomas', 'Erongo', 'Kavango East', 'Otjozondjupa', 'Hardap'],
  'Benin': ['Cotonou', 'Borgou', 'Atlantique', 'Mono', 'Atakora'],
  'Burundi': ['Bujumbura', 'Gitega', 'Ngozi', 'Muyinga'],
  'Cape Verde': ['Praia', 'São Vicente', 'Sal', 'Boa Vista'],
  'Chad': ['N\'djamena', 'Moyen-Chari', 'Logone Occidental', 'Tibesti'],
  'Congo': ['Brazzaville', 'Pointe-Noire', 'Pool'],
  'Democratic Republic of Congo': ['Kinshasa', 'Goma', 'Lubumbashi', 'Kisangani'],
  'Cote d\'Ivoire': ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa']
};

const form = document.querySelector('#search-form');
const input = document.querySelector('#search-input');
const countrySelect = document.querySelector('#country-select');
const provinceSelect = document.querySelector('#province-select');
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
let currentProvince = '';
let currentTranslationLanguage = 'en';
let currentAfricanLanguages = [];
let requestController = null;
let searchSequence = 0;

const excludedStudyStatuses = new Set(['COMPLETED', 'SUSPENDED']);
const escapeHTML = (value = '') => String(value).replace(/[&<>\'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const formatStatus = status => (status || 'Unknown').toLowerCase().replaceAll('_', ' ');
const normalizeCountry = value => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
const normalizeLocationValue = value => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const isAfricanStudy = study => {
  const locations = study?.protocolSection?.contactsLocationsModule?.locations || [];
  return locations.some(location => AFRICAN_COUNTRIES.some(country => normalizeCountry(country) === normalizeCountry(location?.country)));
};

const countryMatchesStudy = (study, country) => {
  if (!country) return true;
  const locations = study?.protocolSection?.contactsLocationsModule?.locations || [];
  return locations.some(location => normalizeCountry(location?.country) === normalizeCountry(country));
};

const provinceMatchesStudy = (study, province) => {
  if (!province) return true;
  const locations = study?.protocolSection?.contactsLocationsModule?.locations || [];
  return locations.some(location => normalizeLocationValue(location?.state || location?.province || location?.county || location?.region) === normalizeLocationValue(province));
};

const isVisibleStudy = study => {
  const status = (study?.protocolSection?.statusModule?.overallStatus || '').toUpperCase();
  return !excludedStudyStatuses.has(status) && status === 'RECRUITING' && isAfricanStudy(study);
};

const africanLocationsOnly = (locations = []) =>
  locations.filter(location => {
    const countryName = location?.country || '';
    return AFRICAN_COUNTRIES.some(africanCountry => normalizeCountry(africanCountry) === normalizeCountry(countryName));
  });

function showLoading(append = false) {
  if (!append) results.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
  loadMore.hidden = true;
  statusMessage.hidden = true;
}

function createLanguageTabs() {
  document.querySelector('.african-language-tabs')?.remove();
  const tabs = document.createElement('div');
  tabs.className = 'african-language-tabs';
  const english = document.createElement('button');
  english.type = 'button';
  english.className = 'language-tab';
  english.textContent = 'English';
  english.dataset.language = 'en';
  english.addEventListener('click', () => {
    currentTranslationLanguage = 'en';
    updateLanguageTabStyles();
    renderTranslatedResults();
  });
  tabs.appendChild(english);

  currentAfricanLanguages.forEach(code => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-tab';
    button.dataset.language = code;
    button.textContent = `${window.Vulavula?.getLanguageName(code) || code.toUpperCase()} (${window.Vulavula?.getNativeLanguageName(code) || code.toUpperCase()})`;
    button.addEventListener('click', async () => {
      currentTranslationLanguage = code;
      updateLanguageTabStyles();
      await renderTranslatedResults();
    });
    tabs.appendChild(button);
  });
  document.querySelector('.results-section')?.insertBefore(tabs, results);
  updateLanguageTabStyles();
}

function updateLanguageTabStyles() {
  document.querySelectorAll('.language-tab').forEach(button => button.classList.toggle('active', button.dataset.language === currentTranslationLanguage));
}

async function renderTranslatedResults() {
  if (currentTranslationLanguage !== 'en' && !window.Vulavula) return;
  const cards = [...document.querySelectorAll('.trial-card')];
  const translations = cards.map(async card => {
    const title = card.querySelector('h3');
    const link = card.querySelector('.trial-link');
    const originalTitle = card.dataset.originalTitle || title?.textContent || '';
    if (title) title.textContent = currentTranslationLanguage === 'en' ? originalTitle : await window.Vulavula.getCachedTranslation(originalTitle, currentTranslationLanguage);
    if (link) link.textContent = currentTranslationLanguage === 'en' ? 'View study details' : `${await window.Vulavula.getCachedTranslation('View study details', currentTranslationLanguage)} →`;
  });
  await Promise.all(translations);
}

function trialCard(study) {
  const p = study.protocolSection || {};
  const id = p.identificationModule || {};
  const status = p.statusModule || {};
  const design = p.designModule || {};
  const contacts = p.contactsLocationsModule || {};
  const rawLocations = contacts.locations || [];
  const locations = africanLocationsOnly(rawLocations);
  const studyType = design.studyType ? `${design.studyType.charAt(0)}${design.studyType.slice(1).toLowerCase()} study` : 'Study type not listed';
  const title = id.briefTitle || 'Study title not listed';
  const statusText = formatStatus(status.overallStatus);
  const statusClass = statusText.includes('recruit') ? ' recruiting' : '';
  const studyId = id.nctId || '';
  const conditionModule = p.conditionsModule || {};
  const condition = (conditionModule.conditions || []).join(', ') || 'Health condition not listed';

  const locationMarkup = locations.length
    ? locations.map(location => {
        const parts = [location.facility, location.city, location.state || location.province, location.country].filter(Boolean);
        const address = parts.length ? parts.join(', ') : 'African site not listed';
        const siteContact = location?.contacts?.[0] || {};
        const siteName = siteContact.name || '';
        const sitePhone = siteContact.phone || '';
        const siteEmail = siteContact.email || '';
        const contactMarkup = [
          siteName ? `<span class="site-contact-name">${escapeHTML(siteName)}</span>` : '',
          sitePhone ? `<a href="tel:${escapeHTML(sitePhone.replace(/[^\d+]/g, ''))}">${escapeHTML(sitePhone)}</a>` : '',
          siteEmail ? `<a href="mailto:${escapeHTML(siteEmail)}">${escapeHTML(siteEmail)}</a>` : ''
        ].filter(Boolean).join(' · ');
        return `<li><span class="site-location">${escapeHTML(address)}</span>${contactMarkup ? `<span class="site-contact">${contactMarkup}</span>` : '<span class="site-contact">Contact details not listed.</span>'}</li>`;
      }).join('')
    : '<li><span class="site-location">African study sites are not listed in the registry.</span><span class="site-contact">Open the official trial record for the latest site updates.</span></li>';

  return `<article class="trial-card" data-original-title="${escapeHTML(title)}" data-condition="${escapeHTML(condition)}">
    <div class="card-top"><span class="status${statusClass}">${escapeHTML(statusText)}</span><span class="nct">${escapeHTML(studyId)}</span></div>
    <h3>${escapeHTML(title)}</h3>
    <p class="trial-condition"><strong>About this study:</strong> ${escapeHTML(condition)}</p>
    <div class="meta"><span><span class="meta-icon">◈</span>${escapeHTML(studyType)}</span></div>
    <details class="trial-sites"><summary>African site details (${locations.length || 0})</summary><ul>${locationMarkup}</ul></details>
    <a class="trial-link" data-original-text="View study details" href="https://clinicaltrials.gov/study/${encodeURIComponent(studyId)}" target="_blank" rel="noopener noreferrer">View official study details →</a>
  </article>`;
}

function buildSearchQuery() {
  let query = currentQuery || '*';
  if (currentCountry) query = query === '*' ? currentCountry : `${query} AND ${currentCountry}`;
  return query;
}

function updateResultsHeader() {
  const parts = [];
  if (currentCountry) parts.push(currentCountry);
  if (currentProvince) parts.push(currentProvince);
  if (currentQuery) parts.push(`"${currentQuery}"`);
  resultsTitle.textContent = parts.length ? `Recruiting trials in ${parts.join(' • ')}` : 'Recruiting African trials';
}

async function searchTrials({ append = false } = {}) {
  const thisSearch = ++searchSequence;
  if (requestController) requestController.abort();
  requestController = new AbortController();
  const signal = requestController.signal;
  showLoading(append);
  const params = new URLSearchParams({
    'query.term': buildSearchQuery(),
    pageSize: '12',
    format: 'json',
    countTotal: 'false',
    fields: 'NCTId,BriefTitle,OverallStatus,StudyType,Condition,LocationFacility,LocationCity,LocationState,LocationCountry,LocationContactName,LocationContactPhone,LocationContactEMail,CentralContactName,CentralContactPhone,CentralContactEMail',
    sort: `${sortSelect.value}:desc`
  });
  if (nextPageToken && append) params.set('pageToken', nextPageToken);

  try {
    const response = await fetch(`${API_URL}?${params}`, { signal });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);
    const data = await response.json();
    if (thisSearch !== searchSequence) return;

    const studies = (data.studies || []).filter(isVisibleStudy)
      .filter(study => countryMatchesStudy(study, currentCountry))
      .filter(study => provinceMatchesStudy(study, currentProvince));
    if (!append) results.innerHTML = '';
    results.insertAdjacentHTML('beforeend', studies.length ? studies.map(trialCard).join('') : '<p class="muted">No recruiting African trials found for your search.</p>');
    nextPageToken = data.nextPageToken || '';
    loadMore.hidden = !nextPageToken;
    resultCount.textContent = `${studies.length.toLocaleString()} recruiting African trials found`;
    updateResultsHeader();
    currentAfricanLanguages = currentCountry ? (window.Vulavula?.getLanguagesForCountry(currentCountry) || []) : [];
    createLanguageTabs();
  } catch (error) {
    if (error.name === 'AbortError' || thisSearch !== searchSequence) return;
    if (!append) results.innerHTML = '';
    statusMessage.textContent = 'We could not load studies right now. Please check your connection and try again.';
    statusMessage.hidden = false;
    resultCount.textContent = 'Unable to load studies';
    console.error(error);
  } finally {
    if (thisSearch === searchSequence) requestController = null;
  }
}

function clearFilters() {
  currentCountry = '';
  currentProvince = '';
  countrySelect.value = '';
  provinceSelect.innerHTML = '<option value="">All provinces/states</option>';
  provinceSelect.disabled = true;
  nextPageToken = '';
  searchTrials();
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
  window.location.href = `mailto:info@africatrialus.com?subject=${encodeURIComponent('New participant contact submission')}&body=${encodeURIComponent(summary)}`;
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
  currentProvince = '';
  provinceSelect.innerHTML = '<option value="">All provinces/states</option>';
  provinceSelect.disabled = true;
  if (currentCountry && provinceOptions[currentCountry]) {
    provinceOptions[currentCountry].forEach(province => {
      const option = document.createElement('option');
      option.value = province;
      option.textContent = province;
      provinceSelect.appendChild(option);
    });
    provinceSelect.disabled = false;
  }
  nextPageToken = '';
  searchTrials();
});

provinceSelect.addEventListener('change', () => {
  currentProvince = provinceSelect.value;
  nextPageToken = '';
  searchTrials();
});

document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => {
  input.value = button.dataset.query;
  runSearch(button.dataset.query);
}));

pactrButton?.addEventListener('click', () => window.open(PACTR_URL, '_blank', 'noopener,noreferrer'));
loadMore.addEventListener('click', () => searchTrials({ append: true }));
sortSelect.addEventListener('change', () => {
  nextPageToken = '';
  searchTrials();
});

const clearBtn = document.createElement('button');
clearBtn.type = 'button';
clearBtn.className = 'clear-filters';
clearBtn.textContent = 'Clear filters';
clearBtn.addEventListener('click', clearFilters);
const formActions = document.createElement('div');
formActions.className = 'filter-actions';
formActions.appendChild(clearBtn);
form.querySelector('.filter-row:last-of-type')?.after(formActions);

runSearch('');
