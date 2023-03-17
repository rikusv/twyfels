# twyfels

This intends to be a place on the interwebs for the Hayats from Twyfelspoort, South Africa.

## Developing and running locally

This website uses [SvelteKit](https://kit.svelte.dev) and [Firebase](https://firebase.google.com).

Run locally:

```bash
npm install
npm run dev -- --open
```

Test production build:

```bash
npm run build
npm run preview
```

Test Firebase Hosting locally:

```npm
npm run build
firebase emulators:start --only hosting
```

## Deploying

[GitHub Actions](./.github) take care of deployment to Firebase.

For working with Firebase from local:

```bash
npm install -g firebase-tools
firebase login
firebase deploy
```