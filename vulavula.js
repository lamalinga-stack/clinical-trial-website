// Vulavula AI translation helper
// Uses a conservative payload and graceful fallback so the website still works if the API is unavailable.

const VULAVULA_API_URL = 'https://api.vulavula.ai/v1/translate';

const countryLanguageMap = {
  'South Africa': ['zu', 'xh', 'st', 'af'],
  'Nigeria': ['yo', 'ig', 'ha'],
  'Kenya': ['sw'],
  'Uganda': ['sw', 'lg'],
  'Tanzania': ['sw'],
  'Ethiopia': ['am'],
  'Ghana': ['ak', 'ee'],
  'Cameroon': ['fr'],
  'Senegal': ['wo', 'fr'],
  'Zimbabwe': ['sn'],
  'Mozambique': ['pt'],
  'Rwanda': ['rw', 'sw'],
  'Malawi': ['ny'],
  'Egypt': ['ar'],
  'Tunisia': ['ar', 'fr'],
  'Morocco': ['ar', 'fr'],
  'Angola': ['pt'],
  'Botswana': ['tn'],
  'Namibia': ['af'],
  'Benin': ['fr', 'yo'],
  'Burundi': ['rn', 'fr'],
  'Congo': ['fr', 'ln'],
  'Democratic Republic of Congo': ['fr', 'ln', 'kg'],
  'Cote d\'Ivoire': ['fr', 'yo'],
  'Gambia': ['en', 'wo'],
  'Guinea': ['fr', 'wo'],
  'Guinea-Bissau': ['pt'],
  'Lesotho': ['st'],
  'Liberia': ['en'],
  'Libya': ['ar'],
  'Madagascar': ['mg', 'fr'],
  'Mali': ['fr', 'wo', 'bm'],
  'Mauritania': ['ar', 'fr'],
  'Mauritius': ['fr', 'en'],
  'Niger': ['fr', 'ha'],
  'Somalia': ['so'],
  'South Sudan': ['en'],
  'Sudan': ['ar'],
  'Togo': ['fr', 'ee']
};

const languageNames = {
  en: { name: 'English', nativeName: 'English' },
  zu: { name: 'Zulu', nativeName: 'isiZulu' },
  xh: { name: 'Xhosa', nativeName: 'isiXhosa' },
  st: { name: 'Sotho', nativeName: 'Sesotho' },
  af: { name: 'Afrikaans', nativeName: 'Afrikaans' },
  yo: { name: 'Yoruba', nativeName: 'Yorùbá' },
  ig: { name: 'Igbo', nativeName: 'Igbo' },
  ha: { name: 'Hausa', nativeName: 'Hausa' },
  sw: { name: 'Swahili', nativeName: 'Kiswahili' },
  lg: { name: 'Luganda', nativeName: 'Luganda' },
  am: { name: 'Amharic', nativeName: 'አማርኛ' },
  ak: { name: 'Akan', nativeName: 'Akan' },
  ee: { name: 'Ewe', nativeName: 'Eʋegbe' },
  wo: { name: 'Wolof', nativeName: 'Wolof' },
  sn: { name: 'Shona', nativeName: 'ChiShona' },
  rw: { name: 'Kinyarwanda', nativeName: 'Kinyarwanda' },
  ny: { name: 'Chichewa', nativeName: 'Chichewa' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  tn: { name: 'Tswana', nativeName: 'Setswana' },
  rn: { name: 'Kirundi', nativeName: 'Rundi' },
  ln: { name: 'Lingala', nativeName: 'Lingala' },
  kg: { name: 'Kikongo', nativeName: 'Kikongo' },
  mg: { name: 'Malagasy', nativeName: 'Malagasy' },
  bm: { name: 'Bambara', nativeName: 'Bamanankan' },
  so: { name: 'Somali', nativeName: 'Af-Soomaali' },
  fr: { name: 'French', nativeName: 'Français' },
  pt: { name: 'Portuguese', nativeName: 'Português' }
};

const translationCache = {};

function getLanguagesForCountry(countryName) {
  return countryLanguageMap[countryName] || [];
}

function getLanguageName(code) {
  return languageNames[code]?.name || code.toUpperCase();
}

function getNativeLanguageName(code) {
  return languageNames[code]?.nativeName || code.toUpperCase();
}

async function translateWithVulavula(text, targetLanguage) {
  if (!text || !text.trim()) return text;
  if (targetLanguage === 'en') return text;

  const safeText = String(text).trim();
  const cacheKey = `${targetLanguage}:${safeText}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    const response = await fetch(VULAVULA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        text: safeText,
        source_language: 'en',
        target_language: targetLanguage
      })
    });

    if (!response.ok) {
      console.warn('Vulavula translation failed:', response.status, response.statusText);
      return safeText;
    }

    const data = await response.json();
    const translated = data.translated_text || data.translation || data.text || safeText;
    translationCache[cacheKey] = translated;
    return translated;
  } catch (error) {
    console.warn('Vulavula API call failed:', error);
    return safeText;
  }
}

async function getCachedTranslation(text, languageCode) {
  const cacheKey = `${languageCode}:${text}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  const translated = await translateWithVulavula(text, languageCode);
  translationCache[cacheKey] = translated;
  return translated;
}

window.Vulavula = {
  getLanguagesForCountry,
  getLanguageName,
  getNativeLanguageName,
  translateWithVulavula,
  getCachedTranslation
};

console.log('Vulavula helper loaded');
