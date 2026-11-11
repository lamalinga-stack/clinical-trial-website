// Apply API-side recruiting/location filters, request enough candidates for the
// client-side African-location check, and cache repeat searches. A timeout keeps
// stalled registry requests from leaving the results area loading indefinitely.
(() => {
  const API_HOST = 'clinicaltrials.gov';
  const CACHE_TTL_MS = 120_000;
  const REQUEST_TIMEOUT_MS = 25_000;
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
    const externalSignal = options.signal || (resource instanceof Request ? resource.signal : undefined);
    const cached = responseCache.get(url);
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS && !externalSignal?.aborted) {
      return Promise.resolve(cached.response.clone());
    }

    const controller = new AbortController();
    let timedOut = false;
    const abortFromCaller = () => controller.abort(externalSignal.reason);
    if (externalSignal?.aborted) abortFromCaller();
    else externalSignal?.addEventListener('abort', abortFromCaller, { once: true });
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    return nativeFetch(url, { ...options, signal: controller.signal }).then(response => {
      if (response.ok && !controller.signal.aborted) {
        responseCache.set(url, { savedAt: Date.now(), response: response.clone() });
        if (responseCache.size > 40) responseCache.delete(responseCache.keys().next().value);
      }
      return response;
    }).catch(error => {
      if (timedOut && !externalSignal?.aborted) {
        const status = document.querySelector('#status-message');
        const resultCount = document.querySelector('#result-count');
        const results = document.querySelector('#results');
        if (results) results.innerHTML = '';
        if (status) {
          status.textContent = 'The trial registry took too long to respond. Please try your search again.';
          status.hidden = false;
        }
        if (resultCount) resultCount.textContent = 'Search timed out';
      }
      throw error;
    }).finally(() => {
      window.clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortFromCaller);
    });
  };
})();

// Correct public Power BI report URL supplied for the Africa research dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

// Keep the report collapsed until requested, while preserving social media feeds.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dashboard-section').forEach((section, index) => {
    const frameWrap = section.querySelector('.dashboard-frame-wrap');
    const frame = section.querySelector('iframe.powerbi-dashboard');
    if (!frameWrap || !frame) return;

    const dashboardUrl = frame.getAttribute('src') || AFRICA_DASHBOARD_URL;
    frame.dataset.dashboardSrc = AFRICA_DASHBOARD_URL || dashboardUrl;
    frame.removeAttribute('src');
    frameWrap.hidden = true;

    const controls = document.createElement('div');
    controls.className = 'dashboard-controls';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'dashboard-toggle';
    toggle.textContent = 'Show dashboard';
    toggle.setAttribute('aria-expanded', 'false');
    const frameId = frame.id || `africa-dashboard-${index + 1}`;
    frame.id = frameId;
    toggle.setAttribute('aria-controls', frameId);
    toggle.addEventListener('click', () => {
      const show = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(show));
      toggle.textContent = show ? 'Hide dashboard' : 'Show dashboard';
      frameWrap.hidden = !show;
      if (show && !frame.src) frame.src = frame.dataset.dashboardSrc;
    });

    const link = document.createElement('a');
    link.className = 'dashboard-open-link';
    link.href = AFRICA_DASHBOARD_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open dashboard in Power BI';

    controls.append(toggle, link);
    frameWrap.before(controls);
  });

  document.querySelectorAll('a[href*="app.powerbi.com/view"]').forEach(link => {
    link.href = AFRICA_DASHBOARD_URL;
  });

  const feeds = document.querySelector('.social-feeds');
  if (!feeds) return;

  feeds.innerHTML = `
    <div class="social-feed">
      <div class="feed-header"><span class="feed-icon">f</span><span class="feed-label" data-i18n="facebook">Facebook</span></div>
      <div class="feed-content">
        <iframe title="AfricaTrialUs Facebook updates" src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FAfricaTrialUs&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true" width="100%" height="500" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" loading="lazy"></iframe>
      </div>
    </div>
    <div class="social-feed">
      <div class="feed-header"><span class="feed-icon">𝕏</span><span class="feed-label" data-i18n="xTwitter">X (Twitter)</span></div>
      <div class="feed-content">
        <a class="twitter-timeline" href="https://twitter.com/AfricaTrialUs?ref_src=twsrc%5Etfw" data-height="500">Tweets by AfricaTrialUs</a>
      </div>
    </div>
    <div class="social-feed">
      <div class="feed-header"><span class="feed-icon">📷</span><span class="feed-label" data-i18n="instagram">Instagram</span></div>
      <div class="feed-content">
        <iframe title="AfricaTrialUs Instagram updates" src="https://www.instagram.com/africatrialus/embed" width="100%" height="500" frameborder="0" scrolling="no" loading="lazy" allowtransparency="true"></iframe>
      </div>
    </div>`;

  if (window.twttr?.widgets?.load) {
    window.twttr.widgets.load(feeds);
  } else if (!document.querySelector('script[data-twitter-widgets]')) {
    const twitterScript = document.createElement('script');
    twitterScript.src = 'https://platform.twitter.com/widgets.js';
    twitterScript.async = true;
    twitterScript.dataset.twitterWidgets = 'true';
    document.head.appendChild(twitterScript);
  }
});
