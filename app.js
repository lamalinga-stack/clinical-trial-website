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
  'Nigeria': ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
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

const excludedStudyStatuses = new Set(['COMPLETED', 'SUSPENDED']);

const escapeHTML = (value = '') => String(value).replace(/[&<>\'\"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
const formatStatus = status => (status || 'Unknown').toLowerCase().replaceAll('_', ' ');
const normalizeCountry = value => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();
const normalizeLocationValue = value => (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const isAfricanStudy = study => {
  const locations = study?.protocolSection?.contactsLocationsModule?.locations || [];
  const countries = locations
    .map(location => location?.country)
    .filter(Boolean)
    .map(normalizeCountry);

  if (!countries.length) return false;

  return countries.some(country =>
    AFRICAN_COUNTRIES.some(africanCountry => normalizeCountry(africanCountry) === country)
  );
};

const countryMatchesStudy = (study, country) => {
  if (!country) return true;
  const locations = study?.protocolSection?.contactsLocationsModule?.locations || [];
  return locations.some(location => normalizeCountry(location?.country) === normalizeCountry(country));
};

const provinceMatchesStudy = (study, province) => {
  if (!province) return true;
  const locations = study?.protocolSection?.contactsLocationsModule?.locations || [];
  return locations.some(location => {
    const locationProvince = location?.state || location?.province || location?.county || location?.region || '';
    return normalizeLocationValue(locationProvince) === normalizeLocationValue(province);
  });
};

const isVisibleStudy = study => {
  const status = (study?.protocolSection?.statusModule?.overallStatus || '').toUpperCase();
  if (excludedStudyStatuses.has(status)) return false;
  if (status !== 'RECRUITING') return false;
  return isAfricanStudy(study);
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

function updateResultsHeader() {
  const parts = [];

  if (currentCountry) parts.push(currentCountry);
  if (currentProvince) parts.push(currentProvince);
  if (currentQuery) parts.push(`"${currentQuery}"`);

  if (!parts.length) {
    resultsTitle.textContent = 'Recruiting African trials';
    return;
  }

  const label = parts.join(' • ');
  resultsTitle.textContent = `Recruiting trials in ${label}`;
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
    const studies = allStudies
      .filter(isVisibleStudy)
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
    updateLanguageTabStyles();
  } catch (error) {
    if (!append) results.innerHTML = '';
    statusMessage.textContent = 'We could not load trials right now. Please check your connection and try again.';
    statusMessage.hidden = false;
    resultCount.textContent = 'Unable to load trials';
    console.error(error);
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
