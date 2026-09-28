# AfricaTrialUs

A clinical-trial discovery platform focused on trials registered in African nations. Powered by [ClinicalTrials.gov API v2](https://clinicaltrials.gov/data-api/api) and the [PACTR GIS Viewer](https://pactr.samrc.ac.za/GIS_Viewer.aspx).

## Features

- Africa-focused search — Find clinical trials across African countries
- Country filters — Search by specific African nations
- Condition search — Search by disease, condition, or treatment
- PACTR integration — Link to the official Pan African Clinical Trial Registry map viewer
- Participant contact form — Submit country, disease area, email, address, code, and telephone
- Firebase storage — Save submissions to Firestore
- Admin panel — Review contact submissions in a dedicated admin page
- Email notification — Trigger email sending to info@africatrialus.com through Firebase Cloud Functions

## Project structure

- `index.html` — public website
- `admin.html` — Firebase admin panel for submissions
- `app.js` — website search and participant form logic
- `firebase-config.js` — Firebase frontend configuration
- `functions/index.js` — Cloud Function that sends email notification to the admin email
- `firestore.rules` — Firestore security rules

## Firebase setup

1. Create a new Firebase project.
2. Enable Firestore Database.
3. Enable Authentication (Email/Password).
4. Add your web app to Firebase.
5. Update `firebase-config.js` with your Firebase project configuration values.
6. Update `.firebaserc` to include your Firebase project ID.
7. Set the admin user email in `admin.js` and `firestore.rules` to your authorized admin address.
8. Configure the following environment variables for Cloud Functions:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `EMAIL_FROM`
   - `ADMIN_EMAIL`

## Deploy

```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
firebase deploy
```

## Admin login

Open the admin panel at:

`/admin.html`

Log in with the authorized admin email and password configured in Firebase Authentication.

## Data and disclaimer

Study data is retrieved directly from ClinicalTrials.gov and PACTR. This site is for research information only and is not medical advice. Always consult a qualified healthcare professional about medical decisions.
