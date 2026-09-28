# AfricaTrialUs

A clinical-trial discovery platform focused on trials registered in African nations. Powered by [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api) and the [PACTR GIS Viewer](https://pactr.samrc.ac.za/GIS_Viewer.aspx).

## Features

- **Africa-focused search** — Find clinical trials registered across 50+ African countries
- **Country filters** — Select specific African nations to narrow your search
- **Condition search** — Search by disease, condition, or treatment
- **PACTR integration** — Link to the official Pan African Clinical Trial Registry map viewer
- **Study details** — View trial status, location, trial ID, and research type
- **Sort and paginate** — Organize results by date, status, and load more trials
- **Responsive design** — Works on mobile, tablet, and desktop devices

## Supported African Countries

South Africa, Nigeria, Kenya, Uganda, Ethiopia, Ghana, Tanzania, Cameroon, Senegal, Zambia, Zimbabwe, Mozambique, Rwanda, Malawi, Egypt, Tunisia, Morocco, Angola, Botswana, Namibia, and 30+ more.

## Run locally

This is a static site. From the project directory, run a local web server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Data sources

Study data is retrieved directly from:
- **ClinicalTrials.gov** — Global registry with Africa-specific trial registrations
- **PACTR** — Pan African Clinical Trial Registry with geographic viewer

## Disclaimer

This site is for research information only and is not medical advice. Always consult a qualified healthcare professional about medical decisions or trial participation.

## Deployment

Deployed on Vercel with git-connected deployment. Any push to `main` automatically updates the live site.
