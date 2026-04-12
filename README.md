# BCBS Pre-Fix

BCBS Pre-Fix is a static lookup app that lets a user enter a BCBS prefix and view:

- plan
- group name
- home plan
- home plan state
- phone numbers

## Files

- `index.html` - app markup
- `styles.css` - app styling
- `app.js` - lookup logic
- `data.json` - BCBS prefix dataset

## Run locally

Serve the folder with any simple static server, or publish it with GitHub Pages.

If you open `index.html` directly from the filesystem, some browsers may block `fetch()` from loading `data.json`.

## GitHub Pages

This project is ready for GitHub Pages because it is a plain static site with no build step.

1. Push the repository to GitHub.
2. In the repository settings, open `Pages`.
3. Set the source to the main branch and the root folder.
4. Save, then open the published site URL.

## Notes

- The original single-file version is still in the repo as `bcbs_prefix_lookup_advanced.html`.
- The main app entrypoint for GitHub should now be `index.html`.
- The app now loads its records from `data.json`, which keeps the code easier to maintain.
