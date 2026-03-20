# Tact

Tact is a static site with an admin form for publishing events.

## Admin publishing flow

- `admin.html` submits event data to a Google Apps Script web app
- Apps Script verifies the admin PIN
- Apps Script writes event files directly to the GitHub repo under `content/events`
- The site reads the generated event content and `content/events/events-feed.js`

## Current backend setup

The active backend is GitHub-based.
Google Drive and Google Sheets are not used in the current publishing flow.

Setup guide:

- [ADMIN-SETUP.md](/home/chi/Tact/ADMIN-SETUP.md)

Apps Script source:

- [backend/google-apps-script/Code.gs](/home/chi/Tact/backend/google-apps-script/Code.gs)
