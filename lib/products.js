// Server-side source of truth for pricing. The browser sends only product
// ids + quantities; the server recomputes the amount from THIS file so totals
// can't be tampered with. Keep prices in sync with the `products` array in
// src/App.jsx.

export const PRODUCTS = {
  1: { name: 'The Quiet Cup', price: 30 },
  2: { name: 'The Daily Ritual', price: 55 },
  3: { name: 'The Gathering Box', price: 120 },
  4: { name: 'The Artisan Block', price: 60 },
  5: { name: 'The Ceremony Block', price: 250 },
  6: { name: 'Eiru — Sacred Irish Blend', price: 160 },
}

export const FLAT_SHIPPING = 20
export const CURRENCY = 'AUD'

// Turn a client cart ([{ id, quantity }]) into trusted PayPal amounts.
export function priceCart(items) {
  const lineItems = []
  let itemTotal = 0

  for (const it of Array.isArray(items) ? items : []) {
    const p = PRODUCTS[it?.id]
    if (!p) continue
    const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1))
    itemTotal += p.price * qty
    lineItems.push({
      name: p.name,
      quantity: String(qty),
      unit_amount: { currency_code: CURRENCY, value: p.price.toFixed(2) },
    })
  }

  const shipping = lineItems.length ? FLAT_SHIPPING : 0
  const total = itemTotal + shipping
  return {
    lineItems,
    itemTotal: itemTotal.toFixed(2),
    shipping: shipping.toFixed(2),
    total: total.toFixed(2),
  }
}
