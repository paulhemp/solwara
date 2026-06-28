import { PAYPAL_CLIENT_ID, PAYPAL_ENV } from '../../lib/paypal.js'
import { CURRENCY } from '../../lib/products.js'

// Public config the browser needs to load the PayPal SDK.
export default function handler(req, res) {
  res.status(200).json({
    clientId: PAYPAL_CLIENT_ID,
    currency: CURRENCY,
    env: PAYPAL_ENV,
  })
}
