// Correct public Power BI report URL supplied for the Africa research dashboard.
const AFRICA_DASHBOARD_URL = 'https://app.powerbi.com/view?r=eyJrIjoiMTQ0MGYxNTktOTQ4Zi00NzBmLWFhYzEtY2QzM2FkYTZmNGFlIiwidCI6ImYxOTMwYmZmLTliNTEtNGQwYy1iMmJkLWMyNmE5ZTBmNDYwMCIsImMiOjh9';

// Keep the report collapsed until requested, while providing a direct link to open it.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dashboard-section').forEach(section => {
    const frameWrap = section.querySelector('.dashboard-frame-wrap');
    const frame = section.querySelector('iframe.powerbi-dashboard');
    if (!frameWrap || !frame) return;

    frame.src = AFRICA_DASHBOARD_URL;
    frameWrap.hidden = true;

    const controls = document.createElement('div');
    controls.className = 'dashboard-controls';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'dashboard-toggle';
    toggle.textContent = 'Show dashboard';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      toggle.textContent = expanded ? 'Show dashboard' : 'Hide dashboard';
      frameWrap.hidden = expanded;
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
});
