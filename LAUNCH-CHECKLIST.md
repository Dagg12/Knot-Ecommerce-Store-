# Knot & Cross Collective launch checklist

## Firebase
- [ ] Enable Email/Password Authentication.
- [ ] Confirm Firestore and Storage are enabled.
- [ ] Deploy `firestore.rules` and `storage.rules`.
- [ ] Create a customer account.
- [ ] Promote the first admin user by setting `users/{uid}.role` to `admin` through a trusted admin process.
- [ ] Sign in as admin and create a test product with an image.
- [ ] Verify a non-admin cannot open admin functionality.
- [ ] Verify Storage upload/delete permissions.
- [ ] Add real product and designer data.

## Commerce
- [ ] Test product search/filter/sort.
- [ ] Test add/remove/quantity/cart persistence.
- [ ] Test authenticated checkout.
- [ ] Verify order reference creation.
- [ ] Confirm payment remains `unpaid` until a real gateway is integrated.
- [ ] Define delivery/collection process.

## Enquiries
- [ ] Test CMT enquiry with image/PDF references.
- [ ] Test bridal consultation.
- [ ] Test matric consultation.
- [ ] Test space rental request.
- [ ] Review admin status workflows.

## Legal / privacy
- [ ] Add final POPIA/privacy notice.
- [ ] Confirm terms, returns, cancellations and delivery policies.
- [ ] Confirm consent wording for uploaded customer references.

## Deployment
- [ ] Serve locally over HTTP and test on desktop/tablet/mobile.
- [ ] Publish to GitHub Pages.
- [ ] Confirm `knotandcross.co.za` DNS and HTTPS.
- [ ] Submit sitemap to search tooling.
