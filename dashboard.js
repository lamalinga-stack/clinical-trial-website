// Correct public Power BI report URL supplied for the Africa research dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

// Restore the social media embeds while keeping the dashboard link behavior.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('iframe.powerbi-dashboard').forEach(frame => {
    frame.src = AFRICA_DASHBOARD_URL;
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

  // Twitter's widget script may have loaded before the timeline was inserted.
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
