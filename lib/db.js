// Postgres storage (Neon / Vercel Postgres) for subscribers, contact &
// wholesale enquiries, and orders.
//
// Connection string comes from whichever of these Vercel injects when you
// create a Postgres database in the Storage tab:
import { neon } from '@neondatabase/serverless'

const CONN =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  ''

let _sql
function db() {
  if (!CONN) return null
  if (!_sql) _sql = neon(CONN)
  return _sql
}

export function isConfigured() {
  return Boolean(CONN)
}

let schemaReady = false
async function ensureSchema(sql) {
  if (schemaReady) return
  await sql`CREATE TABLE IF NOT EXISTS subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name TEXT, email TEXT, message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS wholesale (
    id SERIAL PRIMARY KEY,
    name TEXT, business TEXT, email TEXT, phone TEXT, message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  await sql`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    paypal_order_id TEXT UNIQUE,
    status TEXT, amount NUMERIC, currency TEXT,
    customer_name TEXT, customer_email TEXT, shipping_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`
  schemaReady = true
}

export async function addSubscriber(email) {
  const sql = db()
  if (!sql) return
  await ensureSchema(sql)
  await sql`INSERT INTO subscribers (email) VALUES (${email})`
}

export async function addContact({ name, email, message }) {
  const sql = db()
  if (!sql) return
  await ensureSchema(sql)
  await sql`INSERT INTO contacts (name, email, message)
            VALUES (${name}, ${email}, ${message})`
}

export async function addWholesale({ name, business, email, phone, message }) {
  const sql = db()
  if (!sql) return
  await ensureSchema(sql)
  await sql`INSERT INTO wholesale (name, business, email, phone, message)
            VALUES (${name}, ${business}, ${email}, ${phone}, ${message})`
}

// Idempotent: returns { inserted: true } only the first time an order id is
// recorded. Lets either the capture call or the webhook win the race without
// duplicating emails.
export async function recordOrder(o) {
  const sql = db()
  if (!sql) return { inserted: false, configured: false }
  await ensureSchema(sql)
  const rows = await sql`
    INSERT INTO orders
      (paypal_order_id, status, amount, currency, customer_name, customer_email, shipping_address)
    VALUES
      (${o.orderId}, ${o.status}, ${o.amount || null}, ${o.currency}, ${o.name}, ${o.email}, ${o.address})
    ON CONFLICT (paypal_order_id) DO NOTHING
    RETURNING id`
  return { inserted: rows.length > 0, configured: true }
}

export async function getAllData() {
  const sql = db()
  if (!sql) return null
  await ensureSchema(sql)
  const [subscribers, contacts, wholesale, orders] = await Promise.all([
    sql`SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC LIMIT 5000`,
    sql`SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC LIMIT 5000`,
    sql`SELECT id, name, business, email, phone, message, created_at FROM wholesale ORDER BY created_at DESC LIMIT 5000`,
    sql`SELECT id, paypal_order_id, status, amount, currency, customer_name, customer_email, shipping_address, created_at FROM orders ORDER BY created_at DESC LIMIT 5000`,
  ])
  return { subscribers, contacts, wholesale, orders }
}
