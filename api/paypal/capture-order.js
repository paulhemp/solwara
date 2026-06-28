import { paypalFetch } from '../../lib/paypal.js'
import {
  readJsonBody,
  sendEmail,
  layout,
  fieldRows,
  NOTIFY_TO,
  esc,
} from '../../lib/email.js'

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

    // Pull a few useful details out of the capture response.
    const payer = data.payer || {}
    const name = [payer.name?.given_name, payer.name?.surname]
      .filter(Boolean)
      .join(' ')
    const email = payer.email_address
    const pu = data.purchase_units?.[0] || {}
    const capture = pu.payments?.captures?.[0] || {}
    const amount = capture.amount?.value
    const currency = capture.amount?.currency_code || 'AUD'
    const shipping = pu.shipping
    const address = shipping?.address
    const addressText = address
      ? [
          shipping?.name?.full_name,
          address.address_line_1,
          address.address_line_2,
          [address.admin_area_2, address.admin_area_1, address.postal_code]
            .filter(Boolean)
            .join(' '),
          address.country_code,
        ]
          .filter(Boolean)
          .join('\n')
      : ''

    // Notify Solwara (best-effort — never block the customer's confirmation).
    try {
      await sendEmail({
        to: NOTIFY_TO,
        subject: `New order — $${amount} ${currency} (${name || email || 'customer'})`,
        html: layout(
          'New paid order',
          `<table>${fieldRows([
            ['Order ID', data.id],
            ['PayPal capture', capture.id],
            ['Amount', amount ? `$${amount} ${currency}` : ''],
            ['Customer', name],
            ['Email', email],
            ['Ship to', addressText],
          ])}</table>`
        ),
      })
    } catch (e) {
      console.warn('Order notification not sent:', e.message)
    }

    // Customer receipt (needs a verified Resend domain to reach external inboxes).
    if (email) {
      try {
        await sendEmail({
          to: email,
          subject: 'Your Solwara order is confirmed',
          html: layout(
            `Thank you${name ? `, ${esc(name)}` : ''}`,
            `<p style="color:#4A3527;font-size:14px;line-height:1.7">We've received your order and payment of <strong>$${esc(
              amount
            )} ${esc(
              currency
            )}</strong>. Your ceremonial cacao will be lovingly packed and shipped soon.</p>
             <p style="color:#4A3527;font-size:13px;line-height:1.7">Order reference: ${esc(
               data.id
             )}</p>
             <p style="color:#B99A53;font-style:italic;font-size:14px">Slow down · Gather · Share</p>`
          ),
        })
      } catch (e) {
        console.warn('Customer receipt not sent:', e.message)
      }
    }

    return res.status(200).json({
      status: data.status,
      orderId: data.id,
      amount,
      currency,
    })
  } catch (err) {
    console.error('capture-order error:', err)
    return res.status(500).json({ error: 'Payment could not be completed.' })
  }
}
