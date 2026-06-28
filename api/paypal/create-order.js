import { paypalFetch } from '../../lib/paypal.js'
import { priceCart, CURRENCY } from '../../lib/products.js'
import { readJsonBody } from '../../lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { items } = await readJsonBody(req)
    const { lineItems, itemTotal, shipping, total } = priceCart(items)

    if (!lineItems.length) {
      return res.status(400).json({ error: 'Your cart is empty.' })
    }

    const { ok, data } = await paypalFetch('/v2/checkout/orders', {
      method: 'POST',
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: 'Solwara ceremonial cacao',
            amount: {
              currency_code: CURRENCY,
              value: total,
              breakdown: {
                item_total: { currency_code: CURRENCY, value: itemTotal },
                shipping: { currency_code: CURRENCY, value: shipping },
              },
            },
            items: lineItems,
          },
        ],
        application_context: {
          brand_name: 'Solwara',
          shipping_preference: 'GET_FROM_FILE',
          user_action: 'PAY_NOW',
        },
      },
    })

    if (!ok || !data.id) {
      console.error('PayPal create-order failed:', JSON.stringify(data))
      return res.status(502).json({ error: 'Could not start PayPal checkout.' })
    }

    return res.status(200).json({ id: data.id })
  } catch (err) {
    console.error('create-order error:', err)
    return res.status(500).json({ error: 'Could not start checkout.' })
  }
}
