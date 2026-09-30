# Deployment

## Local
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## Firebase
```bash
firebase use knot-cross-collective
firebase deploy --only firestore:rules,storage
```

For payments, configure the Paystack secret and deploy functions using `PAYMENT-SETUP.md`.

## Hosting
The React/Vite output is in `dist/`. Configure Firebase Hosting to serve `dist` if moving the storefront from GitHub Pages to Firebase Hosting. The existing CNAME is retained for reference.
