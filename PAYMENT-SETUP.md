# Paystack setup

The storefront uses Paystack as its first payment provider. Paystack states that integration has no upfront or monthly fee; transaction fees apply when customers successfully pay. Current South African local pricing is listed by Paystack as 2.9% + R1 excluding VAT, with certain pay-by-bank channels priced differently.

## 1. Create the merchant account
Create a Paystack South Africa account and complete the business verification required by Paystack.

## 2. Set the Firebase Function secret
From the project root:

```bash
firebase functions:secrets:set PAYSTACK_SECRET_KEY
```

Paste the Paystack secret key when prompted. Never put this value in `.env`, `VITE_*`, GitHub Pages, or browser JavaScript.

## 3. Deploy the payment functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 4. Configure Paystack webhook
After deployment, configure the Paystack webhook URL as:

```text
https://us-central1-knot-cross-collective.cloudfunctions.net/paystackWebhook
```

Paystack will sign webhook requests. The Firebase Function verifies the signature before changing an order's payment status.

## 5. Test
Use Paystack test keys/account first. Do not use live keys until the merchant account and checkout flow have been tested end-to-end.
