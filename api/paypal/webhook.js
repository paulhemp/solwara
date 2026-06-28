import { paypalFetch, extractOrder } from '../../lib/paypal.js'
import { readJsonBody } from '../../lib/email.js'
import { recordOrderAndNotify } from '../../lib/orders.js'

// PayPal webhook receiver.
//
// Configure in the PayPal dashboard (Live app → Webhooks):
//   URL:    https://solwara.com.au/api/paypal/webhook
//   Events: "Checkout order approved" (CHECKOUT.ORDER.APPROVED)
//           "Payment capture completed" (PAYMENT.CAPTURE.COMPLETED)
//
// We verify authenticity by re-fetching the event from PayPal by its id using
// our own credentials — only genuine events for our account can be retrieved,
// so no extra secret or raw-body handling is required.

async function loadAndRecord(orderId) {
  if (!orderId) return
  const { ok, data } = await paypalFetch(`/v2/checkout/orders/${orderId}`)
  if (!ok || !data?.id) {
    console.warn('webhook: could not load order', orderId)
    return
  }
  await recordOrderAndNotify(extractOrder(data))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const event = await readJsonBody(req)
    if (!event?.id) return res.status(400).json({ error: 'Missing event id' })

    // Verify: re-fetch the event from PayPal. If it isn't really ours, stop.
    const verify = await paypalFetch(`/v1/notifications/webhooks-events/${event.id}`)
    if (!verify.ok) {
      console.warn('webhook verification failed:', verify.status)
      return res.status(400).json({ error: 'Unverified event' })
    }

    const evt = verify.data || event
    const type = evt.event_type

    if (type === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = evt.resource?.id
      // The buyer approved but the tab may have closed before our capture ran.
      // Capture now; if it was already captured, PayPal returns an error we
      // can safely ignore, and we still record from the order details.
      if (orderId) {
        const cap = await paypalFetch(`/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
        })
        if (!cap.ok) {
          console.warn(
            'webhook capture skipped (likely already captured):',
            cap.status
          )
        }
        await loadAndRecord(orderId)
      }
    } else if (
      type === 'PAYMENT.CAPTURE.COMPLETED' ||
      type === 'CHECKOUT.ORDER.COMPLETED'
    ) {
      const orderId =
        evt.resource?.supplementary_data?.related_ids?.order_id ||
        evt.resource?.id
      await loadAndRecord(orderId)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('webhook error:', err)
    // 500 lets PayPal retry later if it was a transient failure.
    return res.status(500).json({ error: 'Webhook handling failed' })
  }
}
