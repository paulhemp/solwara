import { readJsonBody } from '../lib/email.js'
import { getAllData, isConfigured } from '../lib/db.js'

// Constant-time-ish string compare to avoid leaking length/timing.
function safeEqual(a = '', b = '') {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return res
      .status(503)
      .json({ error: 'Admin is not configured. Set ADMIN_PASSWORD in Vercel.' })
  }

  const { password } = await readJsonBody(req)
  if (!safeEqual(password || '', expected)) {
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  if (!isConfigured()) {
    return res.status(200).json({
      dbConfigured: false,
      data: { subscribers: [], contacts: [], wholesale: [], orders: [] },
    })
  }

  try {
    const data = await getAllData()
    return res.status(200).json({ dbConfigured: true, data })
  } catch (err) {
    console.error('admin data error:', err)
    return res.status(500).json({ error: 'Could not load data.' })
  }
}
