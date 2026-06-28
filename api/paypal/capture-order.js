import { paypalFetch, extractOrder } from '../../lib/paypal.js'
import { readJsonBody } from '../../lib/email.js'
import { recordOrderAndNotify } from '../../lib/orders.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { orderID } = await readJsonBody(req)
    if (!orderID) return res.status(400).json({ error: 'Missing order id.' })

    const { ok, data } = await paypalFetch(
      `/v2/checkout/orders/${orderID}/capture`,
      { method: 'POST' }
    )

    if (!ok || data.status !== 'COMPLETED') {
      console.error('PayPal capture failed:', JSON.stringify(data))
      return res.status(502).json({ error: 'Payment could not be completed.' })
    }

    // Record + notify (idempotent — the webhook may also call this).
    const order = extractOrder(data)
    await recordOrderAndNotify(order)

    return res.status(200).json({
      status: order.status,
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    console.error('capture-order error:', err)
    return res.status(500).json({ error: 'Payment could not be completed.' })
  }
}
