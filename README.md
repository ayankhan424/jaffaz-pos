# Jaffa'z Restaurant POS

A React/Vite restaurant point-of-sale app using Firebase Authentication for staff sign-in and Cloud Firestore for shared, live orders. Manager, waiter, receptionist, and cook screens read the same order collection. Firestore rules restrict access by the staff member's role.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the local URL Vite prints in the terminal.

## Firebase setup

1. In Firebase Console, enable **Authentication → Email/Password**. In **Authentication → Settings → Authorized domains**, add `127.0.0.1` for this project's local URL and your exact Vercel domain. Then create an account for each staff member.
2. For each account, copy its Authentication UID. In **Firestore Database → Data**, create a `staff` document with that exact UID as the document ID.
3. Add `name`, `role`, and `active` fields. Use role values `Manager`, `Waiter`, `Receptionist`, or `Cook`; set `active` to `true`. Lowercase role values are also accepted.
4. Publish the rules in `firestore.rules` using **Firestore Database → Rules**. These rules prevent users from editing staff roles and allow only role-appropriate order status changes.

The Firebase web configuration is in `src/firebase.js`. It is client configuration, not a private Admin key. Never add a Firebase Admin service-account private key to the browser app.

## Deploy the rules with Firebase CLI (optional)

The project includes `firebase.json` and `.firebaserc` for the Jaffaz POS Firebase project:

```sh
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

You can instead copy `firestore.rules` into the Firebase Console Rules editor and click **Publish**.

## Build and deploy the web app

```sh
npm run build
```

The production files are created in `dist`. The Vercel project should use `npm run build` as its build command and `dist` as its output directory. The POS talks to Firebase directly, so the old local JSON API is not part of the deployed app.

## Existing local orders

Orders previously saved in `server/data/orders.json` are not copied into Firestore automatically. New orders are saved in Firestore and appear on other signed-in staff screens in real time.

## Order flow

- A manager creates an order. It goes to the waiter first when waiter confirmation is selected; otherwise it goes to reception for payment.
- A waiter confirms an order to send it to reception.
- Reception records payment, which moves the order to the kitchen queue.
- A cook moves an order through preparing, ready, and completed.
- A manager can cancel an order that is not already completed or cancelled.

The payment screen records a payment method; it does not process card or wallet transactions.
