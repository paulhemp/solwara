import { sendEmail, readJsonBody, layout, NOTIFY_TO, esc } from '../lib/email.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = await readJsonBody(req)
    const { email, company } = body

    if (company) return res.status(200).json({ ok: true }) // honeypot

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email.' })
    }

    await sendEmail({
      to: NOTIFY_TO,
      subject: `New newsletter subscriber`,
      html: layout(
        'New subscriber',
        `<p style="color:#1B2F3A;font-size:14px">${esc(email)}</p>`
      ),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('subscribe error:', err)
    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
