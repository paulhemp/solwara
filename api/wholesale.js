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
    const { name, business, email, phone, message, company } = body

    if (company) return res.status(200).json({ ok: true }) // honeypot

    if (!name || !business || !email || !message) {
      return res.status(400).json({ error: 'Please complete the required fields.' })
    }

    await sendEmail({
      to: NOTIFY_TO,
      replyTo: email,
      subject: `Wholesale enquiry — ${business}`,
      html: layout(
        'New wholesale enquiry',
        `<table>${fieldRows([
          ['Name', name],
          ['Business', business],
          ['Email', email],
          ['Phone', phone],
          ['Their space', message],
        ])}</table>`
      ),
    })

    try {
      await sendEmail({
        to: email,
        subject: 'Your wholesale enquiry — Solwara',
        html: layout(
          `Thank you, ${esc(name)}`,
          `<p style="color:#4A3527;font-size:14px;line-height:1.7">Thank you for your interest in stocking Solwara. We've received your enquiry and will be in touch shortly with our offering details.</p>`
        ),
      })
    } catch (e) {
      console.warn('Wholesale confirmation not sent:', e.message)
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('wholesale error:', err)
    return res
      .status(500)
      .json({ error: 'Something went wrong submitting your enquiry.' })
  }
}
