// Keep the API request small, filter recruiting studies server-side, and cache
// identical searches briefly so repeated queries return without another network wait.
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
    // app.js requests 12 records; do not inflate this to 100, which made searches slower.
    params.set('pageSize', '12');
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
