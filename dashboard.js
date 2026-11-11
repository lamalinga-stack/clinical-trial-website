// Correct public Power BI report URL supplied for the Africa research dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkYTZmNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

// Prevent duplicate fetch patching when the helper is included more than once.
if (!window.__africaTrialFetchOptimized) {
  window.__africaTrialFetchOptimized = true;

  (() => {
    const API_HOST = 'clinicaltrials.gov';
    const CACHE_TTL_MS = 120_000;
    const PAGE_SIZE = 50;
    const AFRICAN_COUNTRIES = [
      'South Africa', 'Nigeria', 'Kenya', 'Uganda', 'Ethiopia', 'Ghana', 'Tanzania',
      'Cameroon', 'Senegal', 'Zambia', 'Zimbabwe', 'Mozambique', 'Rwanda', 'Malawi',
      'Egypt', 'Tunisia', 'Morocco', 'Angola', 'Botswana', 'Namibia', 'Benin',
      'Burundi', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo',
      'Democratic Republic of Congo', "Cote d'Ivoire", 'Djibouti', 'Equatorial Guinea',
      'Eritrea', 'Eswatini', 'Gabon', 'Gambia', 'Guinea', 'Guinea-Bissau', 'Lesotho',
      'Liberia', 'Libya', 'Madagascar', 'Mali', 'Mauritania', 'Mauritius', 'Niger',
      'Sao Tome and Principe', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Sudan',
      'Sudan', 'Togo'
    ];
    const africanLocationQuery = `(${AFRICAN_COUNTRIES.map(country => `"${country}"`).join(' OR ')})`;
    const responseCache = new Map();
    const nativeFetch = window.fetch.bind(window);

    window.fetch = (resource, options = {}) => {
      const requestUrl = typeof resource === 'string' || resource instanceof URL
        ? new URL(resource.toString(), window.location.href)
        : new URL(resource.url);

      if (requestUrl.hostname !== API_HOST || !requestUrl.pathname.endsWith('/api/v2/studies')) {
        return nativeFetch(resource, options);
      }

      const params = requestUrl.searchParams;
      params.set('pageSize', String(PAGE_SIZE));
      params.set('filter.overallStatus', 'RECRUITING');

      const country = document.querySelector('#country-select')?.value?.trim();
      if (country) {
        params.set('query.locn', `"${country}"`);
        const term = params.get('query.term') || '*';
        const escapedCountry = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const withoutCountry = term.replace(new RegExp(`\\s+AND\\s+${escapedCountry}$`, 'i'), '').trim();
        params.set('query.term', withoutCountry || '*');
      } else {
        params.set('query.locn', africanLocationQuery);
      }

      const url = requestUrl.toString();
      const signal = options.signal || (resource instanceof Request ? resource.signal : undefined);
      const cached = responseCache.get(url);
      if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS && !signal?.aborted) {
        return Promise.resolve(cached.response.clone());
      }

      return nativeFetch(url, options).then(response => {
        if (response.ok && !signal?.aborted) {
          responseCache.set(url, { savedAt: Date.now(), response: response.clone() });
          if (responseCache.size > 40) responseCache.delete(responseCache.keys().next().value);
        }
        return response;
      });
    };
  })();
}

// Keep the report embedded on the site and make all dashboard links use the
// exact same URL. The report's map scope is configured in Power BI itself.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('iframe.powerbi-dashboard').forEach(frame => {
    frame.src = AFRICA_DASHBOARD_URL;
  });

  document.querySelectorAll('a[href*="app.powerbi.com/view"]').forEach(link => {
    link.href = AFRICA_DASHBOARD_URL;
  });
});
