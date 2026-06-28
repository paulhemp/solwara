// Minimal PayPal REST helper (no SDK dependency).
//
// Env vars (set in Vercel → Settings → Environment Variables):
//   PAYPAL_CLIENT_SECRET  (required, SECRET — never commit / never expose)
//   PAYPAL_CLIENT_ID      (optional — falls back to the public id below)
//   PAYPAL_ENV            (optional — "live" (default) or "sandbox")
//
// The Client ID is public (it ships in the browser SDK), so it's safe to keep
// here as a default. The secret must only ever live in an env var.

const DEFAULT_CLIENT_ID =
  'ATJkidRkj5x6PTt-qIg8g-UIkDibpAjyo20KCA9ZHSwucBTS1PT_VomoRv4GoSuTxGMNoygenkrJ3tDp'

export const PAYPAL_ENV = process.env.PAYPAL_ENV || 'live'
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || DEFAULT_CLIENT_ID
export const PAYPAL_BASE =
  PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com'

export async function getAccessToken() {
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!secret) throw new Error('PAYPAL_CLIENT_SECRET is not set')

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${secret}`).toString('base64')
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    throw new Error(`PayPal auth failed (${res.status}): ${await res.text()}`)
  }
  const data = await res.json()
  return data.access_token
}

// Map a PayPal v2 order object (from create/capture/get) into the fields we
// store and email.
export function extractOrder(data = {}) {
  const payer = data.payer || {}
  const name = [payer.name?.given_name, payer.name?.surname]
    .filter(Boolean)
    .join(' ')
  const email = payer.email_address || null
  const pu = data.purchase_units?.[0] || {}
  const capture = pu.payments?.captures?.[0] || {}
  const amount = capture.amount?.value || pu.amount?.value || null
  const currency = capture.amount?.currency_code || pu.amount?.currency_code || 'AUD'
  const breakdown = pu.amount?.breakdown || {}
  const itemTotal = breakdown.item_total?.value || null
  const shippingTotal = breakdown.shipping?.value || null
  const items = (pu.items || [])
    .map((it) => `${it.quantity}× ${it.name}`)
    .join(', ')
  const shipping = pu.shipping
  const a = shipping?.address
  const address = a
    ? [
        shipping?.name?.full_name,
        a.address_line_1,
        a.address_line_2,
        [a.admin_area_2, a.admin_area_1, a.postal_code].filter(Boolean).join(' '),
        a.country_code,
      ]
        .filter(Boolean)
        .join('\n')
    : ''
  return {
    orderId: data.id,
    status: data.status,
    amount,
    currency,
    itemTotal,
    shippingTotal,
    items,
    name,
    email,
    address,
  }
}

export async function paypalFetch(path, { method = 'GET', body } = {}) {
  const token = await getAccessToken()
  const res = await fetch(`${PAYPAL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}
