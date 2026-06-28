import {
  sendEmail,
  readJsonBody,
  layout,
  fieldRows,
  NOTIFY_TO,
  esc,
} from '../lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = await readJsonBody(req)
    const { name, email, message, company } = body

    // Honeypot: bots fill hidden fields. Pretend success, send nothing.
    if (company) return res.status(200).json({ ok: true })

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Please complete all fields.' })
    }

    // Notify Solwara
    await sendEmail({
      to: NOTIFY_TO,
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: layout(
        'New contact message',
        `<table>${fieldRows([
          ['Name', name],
          ['Email', email],
          ['Message', message],
        ])}</table>`
      ),
    })

    // Confirmation to the sender (best-effort; needs a verified domain to
    // deliver to arbitrary addresses — don't fail the request if it bounces).
    try {
      await sendEmail({
        to: email,
        subject: 'We received your message — Solwara',
        html: layout(
          `Thank you, ${esc(name)}`,
          `<p style="color:#4A3527;font-size:14px;line-height:1.7">We've received your message and will reply as soon as we can. With warmth,<br/>The Solwara team.</p>`
        ),
      })
    } catch (e) {
      console.warn('Customer confirmation not sent:', e.message)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('contact error:', err)
    return res
      .status(500)
      .json({ error: 'Something went wrong sending your message.' })
  }
}
