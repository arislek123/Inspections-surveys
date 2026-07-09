# Firebase setup for online sync

This version saves data online in Firebase Firestore and requires Google sign-in.

## 1) Enable Authentication

Firebase Console → Security → Authentication → Get started → Sign-in method → Google → Enable → Save.

## 2) Create Firestore Database

Firebase Console → Databases & Storage → Firestore Database → Create database.

Start in production mode if possible.

## 3) Firestore Rules

Use these rules to allow only your Google account to read/write the app data.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /workspaces/default {
      allow read, write: if request.auth != null
        && request.auth.token.email in [
          'aristeidislekkas@gmail.com'
        ];
    }
  }
}
```

If you want to add colleagues later, add their emails inside the list.

## 4) Upload to GitHub

Copy all files and folders from this extracted ZIP into the repository folder through GitHub Desktop, commit, then push/publish.

## 5) GitHub Pages

Repository → Settings → Pages → Source: GitHub Actions.

Then go to Actions and wait for the deploy to become green.
