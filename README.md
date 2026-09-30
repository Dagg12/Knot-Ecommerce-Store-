# Knot & Cross Collective — Store 2.1

Premium React/Vite fashion storefront and business platform for Knot & Cross Collective / OV Fashion Lab.

## What is included

- Premium editorial storefront for Ocean View, Cape Town
- Firebase Email/Password authentication
- Google sign-in
- Secure password reset
- Customer dashboard with profile/settings and order history
- Admin control room with products, categories, designers, orders, customers, enquiries and store settings
- Firestore-backed catalogue with **no shipped demo product data**
- Admin-controlled product pricing
- Direct product image uploads to Firebase Storage (no image URLs required)
- Multi-image product uploads
- Role-protected administration
- Firestore and Storage security rules
- Paystack server-side checkout function
- Responsive premium design
- Empty states instead of fake products, orders, customers or metrics

## Run locally

Do not use the bundled `node_modules` from an operating system with a different CPU/platform.

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Firebase

Copy `.env.example` to `.env.local` if needed.

Enable these Firebase Authentication providers:

- Email/Password
- Google

The Google provider must also have the local/deployed domains configured in Firebase Authentication.

## Admin access

A customer account is not automatically an admin.

To create an administrator:

1. Register/sign in with Firebase Authentication.
2. In Firestore open `users/{uid}`.
3. Set:
   `role: "admin"`
4. Sign in again.
5. Open `/admin`.

Only users whose Firestore profile has `role: "admin"` can access the control room or upload product images.

## Product management

Admins can:

- Create/edit/delete products
- Set prices and stock
- Publish/unpublish products
- Upload product photos directly from their computer
- Upload multiple product photos
- Manage categories
- Manage collections through product metadata
- Manage designers

The public store does not show product prices by default. The admin can change the `showPublicPrices` setting in Admin → Settings.

## Password reset

Customers can use:

`/forgot-password`

Firebase sends the reset email. No passwords are stored by the application.

## Payments

Paystack checkout is prepared through Firebase Functions.

The browser never receives the Paystack secret key.

Configure the secret with Firebase Functions:

```bash
firebase functions:secrets:set PAYSTACK_SECRET_KEY
```

Then deploy:

```bash
firebase deploy --only functions,firestore:rules,storage
```

## Production notes

Before launch:

- Configure the production Firebase Authentication authorised domains.
- Confirm Google OAuth configuration.
- Configure the Paystack secret in Firebase Functions.
- Deploy Firestore and Storage rules.
- Add the two founders as admin users.
- Add real products/photos/prices through the Admin Dashboard.
- Configure shipping and fulfilment policy.
- Test a Paystack test transaction before switching to live payments.
- Do not commit service-account credentials or payment secrets.
