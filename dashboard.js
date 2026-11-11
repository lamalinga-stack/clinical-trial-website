// Keep the full dashboard collapsed on the page and provide a direct link to open it.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

const dashboardSection = document.querySelector('.dashboard-section');
if (dashboardSection) {
  const dashboardFrame = dashboardSection.querySelector('.powerbi-dashboard');
  const dashboardFrameWrap = dashboardSection.querySelector('.dashboard-frame-wrap');
  const dashboardHeading = dashboardSection.querySelector('.dashboard-heading');
  const dashboardUrl = dashboardFrame?.src || AFRICA_DASHBOARD_URL;

  // Do not load the embedded report when the page loads; let visitors open it on demand.
  if (dashboardFrame) dashboardFrame.removeAttribute('src');
  if (dashboardFrameWrap) dashboardFrameWrap.hidden = true;

  if (dashboardHeading && !dashboardHeading.querySelector('.dashboard-link')) {
    const dashboardLink = document.createElement('a');
    dashboardLink.className = 'dashboard-link';
    dashboardLink.href = dashboardUrl;
    dashboardLink.target = '_blank';
    dashboardLink.rel = 'noopener noreferrer';
    dashboardLink.textContent = 'Open interactive dashboard ↗';
    dashboardHeading.append(dashboardLink);
  }
}

document.addEventListener('click', event => {
  const legacyMapButton = event.target.closest('#pactr-focus');
  if (!legacyMapButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.open(AFRICA_DASHBOARD_URL, '_blank', 'noopener,noreferrer');
}, true);
