// Keep the report collapsed and expose a permanent direct link instead of loading an embed.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

const dashboardSection = document.querySelector('.dashboard-section');
if (dashboardSection) {
  // Remove the embedded report so it never takes up space or loads in the background.
  dashboardSection.querySelector('.dashboard-frame-wrap')?.remove();
  dashboardSection.querySelector('.powerbi-dashboard')?.remove();

  const dashboardHeading = dashboardSection.querySelector('.dashboard-heading');
  if (dashboardHeading && !dashboardHeading.querySelector('.dashboard-link')) {
    const dashboardLink = document.createElement('a');
    dashboardLink.className = 'dashboard-link';
    dashboardLink.href = AFRICA_DASHBOARD_URL;
    dashboardLink.target = '_blank';
    dashboardLink.rel = 'noopener noreferrer';
    dashboardLink.textContent = 'Open interactive dashboard ↗';
    dashboardHeading.append(dashboardLink);
  }
}

// Keep the legacy map control pointing to the same full dashboard.
document.addEventListener('click', event => {
  const legacyMapButton = event.target.closest('#pactr-focus');
  if (!legacyMapButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.open(AFRICA_DASHBOARD_URL, '_blank', 'noopener,noreferrer');
}, true);
