// Vulavula translation client. Requests go through Firebase so the API key stays server-side.
const VULAVULA_API_URL = '/api/translate';

// Only expose languages supported by the configured Vulavula translation model.
const countryLanguageMap = {
  'South Africa': ['zu', 'xh', 'af', 'nso', 'st', 'ssw', 'tso', 'tn'],
  'Botswana': ['tn'],
  'Lesotho': ['st'],
  'Kenya': ['sw'],
  'Tanzania': ['sw'],
};

const languageNames = {
  en: { name: 'English', nativeName: 'English' },
  zu: { name: 'Zulu', nativeName: 'isiZulu' },
  xh: { name: 'Xhosa', nativeName: 'isiXhosa' },
  af: { name: 'Afrikaans', nativeName: 'Afrikaans' },
  nso: { name: 'Northern Sotho', nativeName: 'Sesotho sa Leboa' },
  st: { name: 'Southern Sotho', nativeName: 'Sesotho' },
  ssw: { name: 'Swati', nativeName: 'siSwati' },
  tso: { name: 'Tsonga', nativeName: 'Xitsonga' },
  tn: { name: 'Tswana', nativeName: 'Setswana' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili' },
};

const translationCache = new Map();
const normalizeCountry = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

function getLanguagesForCountry(countryName) {
  const normalized = normalizeCountry(countryName);
  const country = Object.keys(countryLanguageMap).find(name => normalizeCountry(name) === normalized);
  return country ? [...countryLanguageMap[country]] : [];
}

function getLanguageName(code) {
  return languageNames[code]?.name || code.toUpperCase();
}

function getNativeLanguageName(code) {
  return languageNames[code]?.nativeName || code.toUpperCase();
}

async function translateWithVulavula(text, targetLanguage, sourceLanguage = 'en') {
  const safeText = String(text || '').trim();
  if (!safeText || targetLanguage === sourceLanguage) return safeText;
  if (!languageNames[targetLanguage] || !languageNames[sourceLanguage]) {
    console.warn('Unsupported Vulavula language:', { sourceLanguage, targetLanguage });
    return safeText;
  }

  const cacheKey = `${sourceLanguage}:${targetLanguage}:${safeText}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const request = (async () => {
    try {
      const response = await fetch(VULAVULA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ text: safeText, sourceLanguage, targetLanguage }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.translatedText !== 'string' || !data.translatedText.trim()) {
        throw new Error(data.error || `Translation request failed (${response.status}).`);
      }
      return data.translatedText.trim();
    } catch (error) {
      console.warn('Vulavula translation failed; keeping original text.', error);
      return safeText;
    }
  })();

  translationCache.set(cacheKey, request);
  const translated = await request;
  if (translated === safeText) translationCache.delete(cacheKey);
  else translationCache.set(cacheKey, translated);
  return translated;
}

async function getCachedTranslation(text, languageCode) {
  return translateWithVulavula(text, languageCode);
}

window.Vulavula = {
  getLanguagesForCountry,
  getLanguageName,
  getNativeLanguageName,
  translateWithVulavula,
  getCachedTranslation,
};
