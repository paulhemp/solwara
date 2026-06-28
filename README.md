# Solwara — Sacred Cacao Born Beside the Sea

A world-class marketing & storefront site for Solwara ceremonial cacao.
Built with **Vite + React + Tailwind CSS**. Fast, mobile-first, and ready to
deploy to Vercel.

> Note: the cart and checkout are a polished front-end demo (no real payment
> processing yet). See **Going live with payments** below to connect Stripe.

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

## Going live with payments (next step)

The checkout currently simulates an order. To accept real payments, the
recommended path on Vercel is a **Stripe Checkout** serverless function:

1. Add a Vercel Serverless Function (e.g. `api/checkout.js`) that creates a
   Stripe Checkout Session with the cart line items plus the flat
   `$20 AUD` shipping line.
2. Store `STRIPE_SECRET_KEY` (and a webhook secret) in
   **Vercel → Settings → Environment Variables** — never commit keys.
3. Point the "Proceed to Checkout" button at that function and redirect the
   customer to the returned Stripe URL.
4. Add a Stripe webhook to confirm payment and record the order.

The same pattern covers the contact / wholesale form storage and newsletter
capture (e.g. with Resend for email). See the original build brief for the full
launch checklist.

---

© Solwara Cacao. Pure · Ethical · Pacific.
