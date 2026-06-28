import { PAYPAL_CLIENT_ID } from '../../lib/paypal.js'
import { CURRENCY } from '../../lib/products.js'

// Public config the browser needs to load the PayPal SDK.
// Only the (public) Client ID and currency are returned — never anything
// derived from a secret env var.
export default function handler(req, res) {
  res.status(200).json({
    clientId: PAYPAL_CLIENT_ID,
    currency: CURRENCY,
  })
}
