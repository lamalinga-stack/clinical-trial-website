// Public Power BI report URL for the Africa research dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

// Keep the report collapsed until requested, while preserving social media feeds.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dashboard-section').forEach((section, index) => {
    const frameWrap = section.querySelector('.dashboard-frame-wrap');
    const frame = section.querySelector('iframe.powerbi-dashboard');
    if (!frameWrap || !frame) return;

    // Delay loading the large Power BI embed until the visitor chooses to show it.
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
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      const show = !expanded;
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
