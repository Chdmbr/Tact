# Tact

Tact is a static site with an admin form for publishing events.

## Admin publishing flow

- `admin.html` submits event data to a Google Apps Script web app
- Apps Script verifies the admin PIN
- Apps Script writes event files directly to the GitHub repo under `content/events`
- The site reads the generated event content and `content/events/events-feed.js`

## Admin page behavior

- Unlocking can be done with the `Unlock Form` button or by pressing `Enter` in the PIN field
- Event time is entered with separate `From Time` and `To Time` fields
- After a successful submit, the page refreshes so the form is cleared
- `Manage Existing Events` loads the current GitHub event list with poster preview and delete controls
- Delete uses the already unlocked PIN session and asks for confirmation before removing the event folder

## Current backend setup

The active backend is GitHub-based.
Google Drive and Google Sheets are not used in the current publishing flow.

Setup guide:

- [ADMIN-SETUP.md](/home/chi/Tact/ADMIN-SETUP.md)

Apps Script source:

- [backend/google-apps-script/Code.gs](/home/chi/Tact/backend/google-apps-script/Code.gs)
