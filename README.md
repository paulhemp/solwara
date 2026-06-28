# Solwara — Sacred Cacao Born Beside the Sea

A world-class marketing & storefront site for Solwara ceremonial cacao.
Built with **Vite + React + Tailwind CSS**. Fast, mobile-first, and ready to
deploy to Vercel.

> Cart & checkout use real **PayPal** payments and the forms send real email
> via **Resend** — both run as serverless functions on Vercel. You just add the
> API keys as environment variables (see **Payments** and **Email** below).

---

## Quick start (run locally)

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
```

Other commands:

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Project structure

```
solwara-cacao/
├─ public/
│  ├─ favicon.png
│  └─ images/            ← all product & brand imagery (optimised)
├─ src/
│  ├─ App.jsx            ← the whole site (pages, cart, forms)
│  ├─ main.jsx           ← React entry point
│  └─ index.css          ← Tailwind + small custom styles
├─ index.html            ← title, meta, fonts, favicon
├─ tailwind.config.js    ← brand colours, fonts, animations
├─ vite.config.js
└─ vercel.json
```

### Editing content
- **Products / prices / copy** → edit the `products` array near the top of
  [`src/App.jsx`](src/App.jsx).
- **Images** → drop files into `public/images/` and reference them as
  `/images/your-file.jpg`. To swap a product photo, change its `image` and
  `gallery` paths in the `products` array.
- **Brand colours & fonts** → `tailwind.config.js`.

---

## Deploy to GitHub + Vercel

### 1. Push to a new GitHub repo

From inside this `solwara-cacao` folder:

```bash
git init
git add .
git commit -m "Initial commit: Solwara website"
git branch -M main
```

Create an empty repo on GitHub (no README/licence), then:

```bash
git remote add origin https://github.com/<your-username>/solwara-cacao.git
git push -u origin main
```

> Don't have the GitHub CLI? You can also create the repo at
> <https://github.com/new>, then run the two commands above.
> With the `gh` CLI installed you can do it in one step:
> `gh repo create solwara-cacao --public --source=. --push`.

### 2. Deploy on Vercel

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. **Import** the `solwara-cacao` repository.
3. Vercel auto-detects **Vite** — no configuration needed. Defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. Your site is live in ~1 minute on a `*.vercel.app` URL.

Every `git push` to `main` redeploys automatically.

### 3. Connect your domain (solwara.com.au)

In the Vercel project → **Settings → Domains** → add `solwara.com.au`, then
update the DNS records at your registrar as Vercel instructs.

---

## Email (contact, wholesale & newsletter) — powered by Resend

The Contact, Wholesale and newsletter forms send real email through
[Resend](https://resend.com) via three serverless functions in `api/`
(`contact.js`, `wholesale.js`, `subscribe.js`). They notify
`paulbenhaim@gmail.com` and send the customer a branded confirmation.

These run automatically on Vercel — **you only need to add your Resend key.**

### 1. Add your Resend API key to Vercel
1. In Resend, create a key at <https://resend.com/api-keys>.
2. In Vercel → your project → **Settings → Environment Variables**, add:

   | Name | Value | Notes |
   |------|-------|-------|
   | `RESEND_API_KEY` | `re_…` your key | **required** |
   | `CONTACT_TO` | `paulbenhaim@gmail.com` | where enquiries are sent (optional) |
   | `RESEND_FROM` | `Solwara <hello@solwara.com.au>` | optional — see step 2 |

3. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the functions pick up
   the variables.

### 2. Verify your domain (to send from hello@solwara.com.au)
Until you verify a domain, Resend only sends from its test address
`onboarding@resend.dev` **and only delivers to your own Resend account email.**
That's enough to confirm the contact/wholesale *notifications* to you work.

To send from `hello@solwara.com.au` and email customers their confirmations:
1. Go to <https://resend.com/domains> → **Add Domain** → `solwara.com.au`.
2. Add the DNS records Resend shows you at your domain registrar.
3. Once verified, set `RESEND_FROM=Solwara <hello@solwara.com.au>` in Vercel and
   redeploy.

> The forms only work on Vercel (or via `vercel dev` locally) — the plain
> `npm run dev` server doesn't run the `api/` functions. To test locally:
> `npm i -g vercel`, copy `.env.example` → `.env.local`, fill in your key, then
> run `vercel dev`.

---

## Payments — PayPal

Checkout uses **PayPal** (PayPal balance + card, no PayPal account required for
the buyer). Three serverless functions in `api/paypal/` handle it securely:
`config.js` (gives the browser the public Client ID), `create-order.js`
(creates the order with the **server-recomputed** total so amounts can't be
tampered with), and `capture-order.js` (captures payment, then emails you a
notification and the customer a receipt via Resend).

### Set it up
1. In the [PayPal Developer dashboard](https://developer.paypal.com/dashboard/applications)
   open your app and copy its **Secret**.
2. In Vercel → your project → **Settings → Environment Variables**, add:

   | Name | Value | Notes |
   |------|-------|-------|
   | `PAYPAL_CLIENT_SECRET` | your secret | **required, keep secret** |
   | `PAYPAL_ENV` | `live` or `sandbox` | must match the credentials |
   | `PAYPAL_CLIENT_ID` | `AT…` | optional — a default is baked in; set only if you rotate it |

3. **Redeploy** so the functions pick up the variables.

> The Client ID is public and safe in the repo; only the **secret** is
> sensitive. Make sure `PAYPAL_ENV` matches the type of credentials (a sandbox
> Client ID + secret with `PAYPAL_ENV=sandbox`, live with `live`).

### Test it
- **Sandbox first:** set `PAYPAL_ENV=sandbox` with sandbox credentials and pay
  using a [sandbox test account](https://developer.paypal.com/dashboard/accounts).
- Confirm the order email lands in your inbox, then switch to `live`.
- Prices live in **two** places that must agree: `src/App.jsx` (`products`, for
  display) and `lib/products.js` (server, for charging). Update both if a price
  changes.

> Like the email forms, PayPal only works on Vercel (or `vercel dev`) — not the
> plain `npm run dev` server, which doesn't run the `api/` functions.

---

## Other next steps

- **Order storage / admin:** orders currently arrive by email only. A database
  (e.g. Vercel Postgres) + a simple `/admin` view would let you list orders,
  enquiries and subscribers, with CSV export.
- **PayPal webhook:** for extra reliability you can add a PayPal webhook to
  independently confirm captured payments server-side.
- **Legal review:** the Privacy, Shipping & Terms pages are practical templates
  populated with your entity (Raw With Life Pty Ltd, ABN 58 027 150 669) — have
  them reviewed against your actual business setup before relying on them.

---

© Raw With Life Pty Ltd, trading as Solwara · ABN 58 027 150 669. Pure · Ethical · Pacific.
