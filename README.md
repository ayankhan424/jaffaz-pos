# Jaffa’z Restaurant POS

A React and Vite point of sale with a small Node.js API. Orders are stored in `server/data/orders.json`, so they remain available after restarting the app.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` and choose local passwords for each practice account. Open the local URL printed by Vite. The development command starts the API and web app together.

## Production build

```sh
npm run build
npm start
```

`npm start` serves the built app and API on `http://127.0.0.1:4174`. Set `PORT` to use another port. Back up `server/data/orders.json` to preserve order history.

## Current scope

- Server-checked demo staff sign-in and role-based order actions
- Menu browsing, item variants, custom pricing for made-to-order split pizza, cart totals and 5% tax
- Manager orders go to Reception and Kitchen immediately by default; optional waiter confirmation is available from the order cart
- Reception and Kitchen update independently, so food preparation can begin while payment is still pending
- Role-based order actions sync across open screens every three seconds
- Responsive interface for desktop and tablet, plus mobile navigation

The included accounts are for local practice. Configure proper staff accounts, password hashing, a database backup plan, HTTPS, and network access rules before exposing this demo beyond a trusted single-machine setup. Payment methods record how an order was paid; the app does not process card or wallet transactions. Local passwords in `.env` and order records in `server/data/orders.json` are excluded from Git.
