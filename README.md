# Linkspace v6 — Forced sidebar flow fix

This version uses explicit, high-priority CSS on the sidebar, folder list, folder rows, and backup note so the note cannot overlap folder names.

## Apply this update
1. Extract the ZIP.
2. In the same GitHub repository, replace the root `index.html` with `Linkspace/index.html`.
3. Commit the change.
4. Wait for GitHub Pages deployment to finish.
5. Open the site and hard-refresh with Ctrl+Shift+R.

If this exact version still appears unchanged, the browser is not receiving the updated file (wrong repository/file path, deployment did not complete, or cached page). Send me your public GitHub Pages URL and I can help verify which version is being served.

The existing `linkspace.abid.v3` localStorage key is retained.
