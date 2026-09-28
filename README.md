# AfricaTrialUs

A clinical-trial discovery platform focused on trials registered in African nations. Powered by [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api) and the [PACTR GIS Viewer](https://pactr.samrc.ac.za/GIS_Viewer.aspx).

## Features

- **Africa-focused search** — Find clinical trials registered across 50+ African countries
- **Country filters** — Select specific African nations to narrow your search
- **Condition search** — Search by disease, condition, or treatment
- **PACTR integration** — Link to the official Pan African Clinical Trial Registry map viewer
- **Participant contact form** — Submit country, disease area, email, address, code, and telephone
- **Social media newsfeed** — Latest updates from Facebook, X (Twitter), and Instagram
- **Firebase storage** — Save participant submissions to Firestore
- **Admin panel** — Review all contact submissions in a dedicated page
- **Study details** — View trial status, location, trial ID, and research type
- **Sort and paginate** — Organize results by date, status, and load more trials
- **Responsive design** — Works on mobile, tablet, and desktop devices

## Supported African Countries

South Africa, Nigeria, Kenya, Uganda, Ethiopia, Ghana, Tanzania, Cameroon, Senegal, Zambia, Zimbabwe, Mozambique, Rwanda, Malawi, Egypt, Tunisia, Morocco, Angola, Botswana, Namibia, and 30+ more.

## Social Media Integration

The site displays live feeds from:
- **Facebook** — Follow `AfricaTrialUs` page for clinical trial announcements
- **X (Twitter)** — Follow `@AfricaTrialUs` for real-time trial updates
- **Instagram** — Follow `@africatrialus` for research photos and updates

Create these social media accounts and the embedded feeds will automatically display the latest posts.

## Run locally

This is a static site with Firebase backend. From the project directory, run a local web server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Firebase setup

1. Create a new Firebase project.
2. Enable Firestore Database.
3. Enable Authentication (Email/Password).
4. Add your web app to Firebase.
5. Update `firebase-config.js` with your Firebase project configuration values.
6. Update `.firebaserc` to include your Firebase project ID.
7. Configure SMTP environment variables for Cloud Functions.

## Data sources

Study data is retrieved directly from:
- **ClinicalTrials.gov** — Global registry with Africa-specific trial registrations
- **PACTR** — Pan African Clinical Trial Registry with geographic viewer

## Disclaimer

This site is for research information only and is not medical advice. Always consult a qualified healthcare professional about medical decisions or trial participation.

## Deployment

Deployed on Vercel with git-connected deployment. Any push to `main` automatically updates the live site.
