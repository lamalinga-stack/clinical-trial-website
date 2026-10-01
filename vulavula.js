// Vulavula API integration for African language translations
// Free tier: https://api.vulavula.ai/docs

const VULAVULA_API_URL = 'https://api.vulavula.ai/v1/translate';

// Map African countries to their primary spoken languages
const countryLanguageMap = {
  'South Africa': ['zu', 'xh', 'st', 'af'], // Zulu, Xhosa, Sotho, Afrikaans
  'Nigeria': ['yo', 'ig', 'ha'], // Yoruba, Igbo, Hausa
  'Kenya': ['sw', 'en'], // Swahili, English
  'Uganda': ['sw', 'lg'], // Swahili, Luganda
  'Tanzania': ['sw'], // Swahili
  'Ethiopia': ['am'], // Amharic
  'Ghana': ['ak', 'ee'], // Akan, Ewe
  'Cameroon': ['fr', 'en'], // French, English (but fr already supported)
  'Senegal': ['wo', 'fr'], // Wolof, French
  'Zimbabwe': ['sn', 'en'], // Shona, English
  'Mozambique': ['pt'], // Portuguese already supported
  'Rwanda': ['rw', 'sw'], // Kinyarwanda, Swahili
  'Malawi': ['ny', 'en'], // Chichewa, English
  'Egypt': ['ar'], // Arabic
  'Tunisia': ['ar', 'fr'], // Arabic, French
  'Morocco': ['ar', 'fr'], // Arabic, French
  'Angola': ['pt'], // Portuguese already supported
  'Botswana': ['tn', 'en'], // Tswana, English
  'Namibia': ['af', 'en', 'oshiwambo'], // Afrikaans, English, Oshiwambo
  'Benin': ['fr', 'yo'], // French, Yoruba
  'Burundi': ['rn', 'fr'], // Kirundi, French
  'Congo': ['fr', 'ln'], // French, Lingala
  'Democratic Republic of Congo': ['fr', 'ln', 'kg'], // French, Lingala, Kikongo
  'Cote d\'Ivoire': ['fr', 'yo'], // French, Yoruba
  'Gambia': ['wo', 'en'], // Wolof, English
  'Guinea': ['fr', 'wo'], // French, Wolof
  'Guinea-Bissau': ['pt'], // Portuguese
  'Lesotho': ['st', 'en'], // Sotho, English
  'Liberia': ['en', 'va'], // English, Vai
  'Libya': ['ar'], // Arabic
  'Madagascar': ['mg', 'fr'], // Malagasy, French
  'Mali': ['fr', 'wo', 'bm'], // French, Wolof, Bambara
  'Mauritania': ['ar', 'fr'], // Arabic, French
  'Mauritius': ['mr', 'en', 'fr'], // Mauritian Creole, English, French
  'Niger': ['fr', 'ha'], // French, Hausa
  'Somalia': ['so'], // Somali
  'South Sudan': ['en'], // English
  'Sudan': ['ar'], // Arabic
  'Togo': ['fr', 'ee'], // French, Ewe
};

// Language metadata
const languageNames = {
  'zu': { name: 'Zulu', nativeName: 'isiZulu', country: 'South Africa' },
  'xh': { name: 'Xhosa', nativeName: 'isiXhosa', country: 'South Africa' },
  'st': { name: 'Sotho', nativeName: 'Sesotho', country: 'South Africa' },
  'af': { name: 'Afrikaans', nativeName: 'Afrikaans', country: 'South Africa/Namibia' },
  'yo': { name: 'Yoruba', nativeName: 'Yorùbá', country: 'Nigeria' },
  'ig': { name: 'Igbo', nativeName: 'Igbo', country: 'Nigeria' },
  'ha': { name: 'Hausa', nativeName: 'Hausa', country: 'Nigeria/Niger' },
  'sw': { name: 'Swahili', nativeName: 'Kiswahili', country: 'Kenya/Tanzania/Uganda' },
  'lg': { name: 'Luganda', nativeName: 'Luganda', country: 'Uganda' },
  'am': { name: 'Amharic', nativeName: 'አማርኛ', country: 'Ethiopia' },
  'ak': { name: 'Akan', nativeName: 'Akan', country: 'Ghana' },
  'ee': { name: 'Ewe', nativeName: 'Eʋegbe', country: 'Ghana/Togo' },
  'wo': { name: 'Wolof', nativeName: 'Wolof', country: 'Senegal' },
  'sn': { name: 'Shona', nativeName: 'ChiShona', country: 'Zimbabwe' },
  'rw': { name: 'Kinyarwanda', nativeName: 'Kinyarwanda', country: 'Rwanda' },
  'ny': { name: 'Chichewa', nativeName: 'Chichewa', country: 'Malawi' },
  'ar': { name: 'Arabic', nativeName: 'العربية', country: 'Egypt/Tunisia/Morocco' },
  'tn': { name: 'Tswana', nativeName: 'Setswana', country: 'Botswana' },
  'rn': { name: 'Kirundi', nativeName: 'Rundi', country: 'Burundi' },
  'ln': { name: 'Lingala', nativeName: 'Lingala', country: 'Congo/DRC' },
  'kg': { name: 'Kikongo', nativeName: 'Kikongo', country: 'DRC' },
  'va': { name: 'Vai', nativeName: 'Vai', country: 'Liberia' },
  'mg': { name: 'Malagasy', nativeName: 'Malagasy', country: 'Madagascar' },
  'bm': { name: 'Bambara', nativeName: 'Bamanankan', country: 'Mali' },
  'mr': { name: 'Mauritian Creole', nativeName: 'Morisyen', country: 'Mauritius' },
  'so': { name: 'Somali', nativeName: 'Af-Soomaali', country: 'Somalia' },
};

async function translateWithVulavula(text, targetLanguage) {
  try {
    const response = await fetch(VULAVULA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input_text: text,
        source_language: 'en', // Translate from English
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      console.warn(`Vulavula translation failed for ${targetLanguage}:`, response.status);
      return text; // Return original text if translation fails
    }

    const data = await response.json();
    return data.translated_text || text;
  } catch (error) {
    console.warn(`Vulavula API error for ${targetLanguage}:`, error);
    return text; // Return original text if API is unavailable
  }
}

function getLanguagesForCountry(countryName) {
  return countryLanguageMap[countryName] || [];
}

function getLanguageName(languageCode) {
  return languageNames[languageCode]?.name || languageCode.toUpperCase();
}

function getNativeLanguageName(languageCode) {
  return languageNames[languageCode]?.nativeName || languageCode.toUpperCase();
}

// Cache for translated content to avoid repeated API calls
const translationCache = {};

async function getCachedTranslation(text, languageCode) {
  const cacheKey = `${languageCode}:${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }
  const translated = await translateWithVulavula(text, languageCode);
  translationCache[cacheKey] = translated;
  return translated;
}
