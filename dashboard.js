// The existing app keeps the legacy button hook for compatibility. Capture its
// click before the app handler so it opens the replacement Power BI dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

document.addEventListener('click', event => {
  const legacyMapButton = event.target.closest('#pactr-focus');
  if (!legacyMapButton) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  window.open(AFRICA_DASHBOARD_URL, '_blank', 'noopener,noreferrer');
}, true);
