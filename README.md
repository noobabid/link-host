# Linkspace — Google sign-in + shared cloud sync

This build keeps the Linkspace design and adds Firebase Authentication + Cloud Firestore.

## Important: shared workspace behavior

**Every Google account that signs in sees and can edit the same shared folders and links.** This is a shared workspace, not separate private data per account. Anyone who can reach this site and sign in with any Google account can edit or delete the shared content. Do not store passwords, private tokens, or sensitive notes here. If you want only specific Google accounts to be allowed, the Firestore rules must be restricted to an allowlist instead.

## Firebase setup

1. In Firebase Console → Authentication → Sign-in method, enable **Google** and choose a support email.
2. In Authentication → Settings → Authorized domains, ensure the exact GitHub Pages domain hosting this site is listed (for example, `yourname.github.io`).
3. In Firestore Database, create the database if you have not already.
4. Open Firestore Database → **Rules**, replace the rules with the following, then click **Publish**:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/linkspace-shared {
      allow read, write: if request.auth != null;
    }
  }
}
```

These rules let any signed-in Firebase user read/write only the one shared workspace document. They do not grant access to other Firestore documents. Since the intent is sharing between any Google accounts, the rules intentionally do not restrict by UID.

## Deploy on GitHub Pages

Upload/replace `index.html` from this ZIP in the same GitHub Pages repository/folder where the current Linkspace site is hosted. Firebase SDK modules are loaded from Google's CDN, so no build step is needed.

## Existing local data migration

When a Google account signs in for the first time:
- If `workspaces/linkspace-shared` already exists, the cloud copy is loaded and used.
- If it does not exist, this browser's current local Linkspace data is uploaded to seed the shared workspace.

Export a backup first using the site's **Backup** button. If you have important folders stored in a different browser/device, export that data before the first sign-in initializes the cloud document; the first cloud initialization uses the browser that signs in first.

## Testing

1. Open the deployed site and sign in with Google.
2. Create a test folder and a test link; wait for the cloud-save confirmation / ensure no error toast appears.
3. Open the same site in another browser or device and sign in with a different Google account. The same workspace should load.
4. Create a test item in the second account and confirm it appears in the first.

If the app reports a cloud setup error, check Google provider enablement, authorized domains, Firestore database existence, and published rules.
