// Correct public Power BI report URL supplied for the Africa research dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkYTZmNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

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
