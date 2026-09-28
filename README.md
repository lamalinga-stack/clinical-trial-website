# TrialScope

A responsive clinical-trial discovery website powered by the public [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api) and the [PACTR GIS Viewer](https://pactr.samrc.ac.za/GIS_Viewer.aspx) for Africa-specific trials.

## Features

- Search studies by condition, treatment, location, or NCT identifier
- Browse featured studies on first load
- Explore Africa-focused clinical research through the official PACTR GIS Viewer
- View study status, study type, location, and NCT ID
- Sort by recently updated, recently posted, or study status
- Load additional results with API pagination
- Responsive layout for mobile, tablet, and desktop

## Run locally

This is a static site. From the project directory, run any local web server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Data and disclaimer

Study data is retrieved directly from ClinicalTrials.gov when the page loads. For Africa-specific registry access, the site links to the official Pan African Clinical Trial Registry GIS Viewer. The site is for research information only and is not medical advice. Always consult a qualified healthcare professional about medical decisions.

## Africa registry link

- PACTR GIS Viewer: https://pactr.samrc.ac.za/GIS_Viewer.aspx

## Deployment note

This project is designed to run as a static web application on GitHub Pages, Netlify, Vercel, or any standard web host.
