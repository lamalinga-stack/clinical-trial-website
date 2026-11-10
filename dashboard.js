// Keep the dashboard embed on the page and route the legacy map control to it.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

document.addEventListener('click', event => {
  const legacyMapButton = event.target.closest('#pactr-focus');
  if (!legacyMapButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.open(AFRICA_DASHBOARD_URL, '_blank', 'noopener,noreferrer');
}, true);
