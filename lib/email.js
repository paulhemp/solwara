// Tiny Resend client (no SDK dependency — uses the REST API via fetch).
// Configure via Vercel Environment Variables:
//   RESEND_API_KEY  (required)  – your Resend API key
//   RESEND_FROM     (optional)  – e.g. "Solwara <hello@solwara.com.au>"
//                                  defaults to Resend's test sender so it works
//                                  before your domain is verified.
//   CONTACT_TO      (optional)  – where enquiry notifications are sent
//                                  (defaults to paulbenhaim@gmail.com)

export const NOTIFY_TO = process.env.CONTACT_TO || 'paulbenhaim@gmail.com'
export const FROM = process.env.RESEND_FROM || 'Solwara <onboarding@resend.dev>'

export async function sendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Resend responded ${res.status}: ${detail}`)
  }
  return res.json()
}

// Read and JSON-parse the request body robustly (works whether or not the
// platform has already parsed it).
export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}')
    } catch {
      return {}
    }
  }
  let raw = ''
  for await (const chunk of req) raw += chunk
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return {}
  }
}

// Minimal HTML escaping for user-supplied values.
export function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Shared brand wrapper for outgoing emails.
export function layout(title, bodyHtml) {
  return `
  <div style="font-family:Helvetica,Arial,sans-serif;background:#F5F0E8;padding:32px;color:#1B2F3A">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E6DCCF">
      <div style="background:#1B2F3A;padding:24px 32px">
        <div style="color:#F5F0E8;letter-spacing:4px;font-size:18px;text-transform:uppercase">Solwara</div>
        <div style="color:#B99A53;letter-spacing:2px;font-size:10px;text-transform:uppercase;margin-top:4px">Sacred Cacao Born Beside the Sea</div>
      </div>
      <div style="padding:32px">
        <h1 style="font-size:18px;margin:0 0 16px;color:#1B2F3A">${esc(title)}</h1>
        ${bodyHtml}
      </div>
      <div style="background:#F5F0E8;padding:16px 32px;font-size:11px;color:#4A3527;border-top:1px solid #E6DCCF">
        Solwara Cacao · Pure · Ethical · Pacific
      </div>
    </div>
  </div>`
}

export function fieldRows(pairs) {
  return pairs
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#B99A53;font-size:12px;text-transform:uppercase;letter-spacing:1px;vertical-align:top;white-space:nowrap">${esc(
          k
        )}</td><td style="padding:6px 0;color:#1B2F3A;font-size:14px">${esc(
          v
        ).replace(/\n/g, '<br/>')}</td></tr>`
    )
    .join('')
}
