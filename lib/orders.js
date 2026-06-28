import { recordOrder } from './db.js'
import { sendEmail, layout, fieldRows, NOTIFY_TO, esc } from './email.js'

// Records the order in the database, then — only if THIS call was the first to
// record it — sends the owner notification and the customer receipt. This makes
// the whole thing safe to call from both the capture endpoint and the webhook
// without duplicate emails.
export async function recordOrderAndNotify(order) {
  let shouldEmail = true

  try {
    const { inserted, configured } = await recordOrder(order)
    // If the DB is configured, only the first insert emails. If it's NOT
    // configured (no database yet), still email so nothing is lost.
    shouldEmail = configured ? inserted : true
  } catch (e) {
    console.warn('Order DB write failed, emailing anyway:', e.message)
    shouldEmail = true
  }

  if (!shouldEmail) return { emailed: false }

  // Owner notification
  try {
    await sendEmail({
      to: NOTIFY_TO,
      subject: `New order — $${order.amount} ${order.currency} (${
        order.name || order.email || 'customer'
      })`,
      html: layout(
        'New paid order',
        `<table>${fieldRows([
          ['Customer', order.name],
          ['Email', order.email],
          ['Products', order.items],
          ['Revenue (items)', order.itemTotal ? `$${order.itemTotal} ${order.currency}` : ''],
          ['Shipping', order.shippingTotal ? `$${order.shippingTotal} ${order.currency}` : ''],
          ['Total', order.amount ? `$${order.amount} ${order.currency}` : ''],
          ['Ship to', order.address],
          ['Order ID', order.orderId],
        ])}</table>`
      ),
    })
  } catch (e) {
    console.warn('Order notification not sent:', e.message)
  }

  // Customer receipt (needs a verified Resend domain to reach external inboxes)
  if (order.email) {
    try {
      await sendEmail({
        to: order.email,
        subject: 'Your Solwara order is confirmed',
        html: layout(
          `Thank you${order.name ? `, ${esc(order.name)}` : ''}`,
          `<p style="color:#4A3527;font-size:14px;line-height:1.7">We've received your order and payment of <strong>$${esc(
            order.amount
          )} ${esc(
            order.currency
          )}</strong>. Your ceremonial cacao will be lovingly packed and shipped soon.</p>
           <p style="color:#4A3527;font-size:13px;line-height:1.7">Order reference: ${esc(
             order.orderId
           )}</p>
           <p style="color:#B99A53;font-style:italic;font-size:14px">Slow down · Gather · Share</p>`
        ),
      })
    } catch (e) {
      console.warn('Customer receipt not sent:', e.message)
    }
  }

  return { emailed: true }
}
