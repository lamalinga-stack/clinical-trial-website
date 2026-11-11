// Remove the dashboard section and all dashboard links from the page.
// This also strips legacy markup so an old embed cannot reappear after a reload.
document.querySelectorAll('.dashboard-section, .dashboard-link, .powerbi-dashboard, .dashboard-frame-wrap').forEach(element => element.remove());
document.querySelectorAll('a[href*="app.powerbi.com/view"]').forEach(link => link.remove());
