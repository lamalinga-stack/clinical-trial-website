// Speed up ClinicalTrials.gov queries by letting the API filter recruiting studies
// and selected country before downloading study records. Cache identical queries
// briefly to make repeat searches and returning to filters feel instant.
(() => {
  const API_HOST = 'clinicaltrials.gov';
  const CACHE_TTL_MS = 30_000;
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
    params.set('pageSize', '100');
    params.set('filter.overallStatus', 'RECRUITING');

    const country = document.querySelector('#country-select')?.value?.trim();
    if (country) {
      params.set('query.locn', country);
      const term = params.get('query.term') || '*';
      const escapedCountry = country.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const withoutCountry = term.replace(new RegExp(`\\s+AND\\s+${escapedCountry}$`, 'i'), '').trim();
      params.set('query.term', withoutCountry || '*');
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
        if (responseCache.size > 20) responseCache.delete(responseCache.keys().next().value);
      }
      return response;
    });
  };
})();
