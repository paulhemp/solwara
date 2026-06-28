import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  createContext,
} from 'react'
import {
  ShoppingBag,
  Menu,
  X,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Instagram,
  Facebook,
  Check,
  ChevronDown,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Product catalogue — edit copy, prices and images here             */
/* ------------------------------------------------------------------ */
const products = [
  {
    id: 1,
    name: 'The Quiet Cup',
    size: '200g · ≈13 pieces',
    price: 30,
    desc: 'A gentle beginning. Hand-portioned 15g pieces for quiet moments of presence.',
    fullDesc:
      'Carefully sourced from the heart of the Pacific. The Quiet Cup is an invitation to slow down and savour the morning. Each piece is hand-portioned to 15g, making your daily ritual effortless and sacred. Notes of earth, sea mist and deep dark chocolate.',
    image: '/images/product-quiet-cup.jpg',
    gallery: [
      '/images/product-quiet-cup.jpg',
      '/images/product-quiet-cup-alt.jpg',
      '/images/pieces.jpg',
    ],
  },
  {
    id: 2,
    name: 'The Daily Ritual',
    size: '400g · ≈26 pieces',
    price: 55,
    desc: 'Your everyday ritual. Perfectly portioned ceremonial servings.',
    fullDesc:
      'Designed for the dedicated practitioner. The Daily Ritual provides a month of ceremonial servings, pre-portioned for ease and consistency. Deepen your practice with our signature Pacific-grown cacao.',
    image: '/images/product-daily-ritual.jpg',
    gallery: [
      '/images/product-daily-ritual.jpg',
      '/images/product-daily-ritual-alt.jpg',
      '/images/ritual-whisk.jpg',
    ],
  },
  {
    id: 3,
    name: 'The Gathering Box',
    size: '1kg · ≈66 pieces',
    price: 120,
    desc: 'Made for gathering. Months of meaningful ritual for facilitators and families.',
    fullDesc:
      'For those who share the medicine. The Gathering Box contains enough hand-portioned pieces to hold space for intimate circles, retreats, or your whole family. Sustainably sourced and crafted with intention.',
    image: '/images/product-gathering-box.jpg',
    gallery: ['/images/product-gathering-box.jpg', '/images/ritual-pour.jpg'],
  },
  {
    id: 4,
    name: 'The Artisan Block',
    size: '400g block',
    price: 60,
    desc: 'Pure ceremonial cacao, ready to create. Break off exactly what you need.',
    fullDesc:
      'For the purists and the makers. The Artisan Block is poured as a solid slab of premium ceremonial cacao, allowing you to shave or break off your perfect dose. Minimal processing preserves the sacred spirit of the bean.',
    image: '/images/product-artisan-block.jpg',
    gallery: ['/images/product-artisan-block.jpg', '/images/cacao-close.jpg'],
  },
  {
    id: 5,
    name: 'The Ceremony Block',
    size: '2kg block',
    price: 250,
    desc: 'Crafted for makers and facilitators. Our full 2kg ceremonial block.',
    fullDesc:
      'The ultimate offering for facilitators, cafés and devoted practitioners. A magnificent 2kg block of pure Pacific ceremonial cacao, holding the profound energy of the volcanic soil and ocean breeze.',
    image: '/images/product-ceremony-block.jpg',
    gallery: [
      '/images/product-ceremony-block.jpg',
      '/images/product-ceremony-block-alt.jpg',
      '/images/ceremony-2kg-photo.jpg',
      '/images/ceremony-2kg-label.jpg',
    ],
  },
  {
    id: 6,
    name: 'Eiru — Sacred Irish Blend',
    size: '900g block',
    price: 160,
    desc: 'Where Pacific cacao meets Celtic tradition. A signature herbal blend.',
    fullDesc:
      "A unique confluence of worlds. We've married our Pacific-grown ceremonial cacao with wild-foraged Celtic herbs. Eiru is a grounding, mystical blend designed to connect you deeply to ancient earth wisdom.",
    image: '/images/product-eiru.jpg',
    gallery: ['/images/product-eiru.jpg', '/images/cacao-close.jpg'],
  },
]

const FLAT_SHIPPING = 20

/* ------------------------------------------------------------------ */
/*  Shared store via context                                          */
/* ------------------------------------------------------------------ */
const StoreContext = createContext(null)
const useStore = () => useContext(StoreContext)

/* ------------------------------------------------------------------ */
/*  Reusable primitives                                               */
/* ------------------------------------------------------------------ */

// Graceful image fallback with a brand-coloured placeholder
function ImageWithFallback({ src, alt, className, ...rest }) {
  const [error, setError] = useState(false)
  useEffect(() => setError(false), [src])
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-sand text-ocean/50 ${className}`}
      >
        <span className="font-serif tracking-widest text-sm text-center px-4">
          {alt || 'Solwara'}
        </span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  )
}

// Reveal-on-scroll wrapper
function Reveal({ children, className = '', as: Tag = 'div', delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

function Eyebrow({ children, className = '' }) {
  return (
    <span
      className={`block font-sans text-[11px] tracking-brand uppercase text-gold ${className}`}
    >
      {children}
    </span>
  )
}

function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 font-sans text-[12px] tracking-widest uppercase bg-ocean text-ivory px-9 py-4 transition-all duration-300 hover:bg-gold ${className}`}
    >
      {children}
    </button>
  )
}

function Field({ label, name, type = 'text', textarea, required }) {
  return (
    <div>
      <label className="block font-sans text-[10px] uppercase tracking-widest text-ocean mb-2">
        {label}
        {required && <span className="text-gold"> *</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows="3"
          className="w-full bg-transparent border-b border-ocean/40 py-2 font-sans text-sm focus:outline-none focus:border-gold transition-colors resize-none"
        />
      ) : (
        <input
          name={name}
          required={required}
          type={type}
          className="w-full bg-transparent border-b border-ocean/40 py-2 font-sans text-sm focus:outline-none focus:border-gold transition-colors"
        />
      )}
    </div>
  )
}

// Hidden honeypot field — real users never fill it; bots do.
function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  )
}

// POST helper for the forms.
async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  let payload = {}
  try {
    payload = await res.json()
  } catch {
    /* ignore */
  }
  if (!res.ok) throw new Error(payload.error || 'Request failed')
  return payload
}

function ProductCard({ product }) {
  const { navigate, addToCart } = useStore()
  return (
    <div className="group flex flex-col h-full bg-ivory">
      <button
        onClick={() => navigate('product', product)}
        className="relative aspect-square overflow-hidden bg-sand"
      >
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-105"
        />
        <span className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-ocean/90 text-ivory text-[11px] tracking-widest uppercase py-3 text-center">
          View details
        </span>
      </button>
      <div className="flex flex-col flex-grow text-center pt-7 px-2">
        <h3 className="font-serif text-2xl text-ocean uppercase tracking-wide mb-1">
          {product.name}
        </h3>
        <p className="font-sans text-[11px] text-gold tracking-widest uppercase mb-4">
          {product.size}
        </p>
        <p className="font-sans text-sm font-light text-earth leading-relaxed mb-6 flex-grow">
          {product.desc}
        </p>
        <p className="font-sans text-base text-ocean mb-5">${product.price} AUD</p>
        <button
          onClick={() => addToCart(product)}
          className="font-sans text-[11px] tracking-widest uppercase border border-ocean text-ocean px-6 py-3.5 w-full hover:bg-ocean hover:text-ivory transition-colors duration-300"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Header                                                            */
/* ------------------------------------------------------------------ */
function Header() {
  const { navigate, cartItemCount, overHero } = useStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    ['shop', 'Shop'],
    ['about', 'Our Story'],
    ['ritual', 'The Ritual'],
    ['wholesale', 'Wholesale'],
    ['contact', 'Contact'],
  ]
  const tone = overHero ? 'text-ivory' : 'text-ocean'

  const go = (view) => {
    setIsMenuOpen(false)
    navigate(view)
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        overHero
          ? 'bg-transparent py-5'
          : 'bg-ivory/90 backdrop-blur-md border-b border-sand py-3 shadow-[0_1px_30px_rgba(27,47,58,0.04)]'
      }`}
    >
      <div className="max-w-8xl mx-auto px-6 lg:px-10 flex items-center justify-between">
        <button
          className={`md:hidden ${tone} transition-colors`}
          aria-label="Menu"
          onClick={() => setIsMenuOpen((o) => !o)}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <button
          onClick={() => go('home')}
          className="flex items-center gap-3"
          aria-label="Solwara home"
        >
          <img
            src="/images/mark.png"
            alt=""
            className={`h-9 w-9 object-contain transition-all duration-500 ${
              overHero ? 'brightness-0 invert opacity-90' : 'opacity-90'
            }`}
          />
          <span
            className={`font-serif text-2xl md:text-[26px] tracking-brand font-semibold uppercase ${tone} transition-colors`}
          >
            Solwara
          </span>
        </button>

        <nav
          className={`hidden md:flex items-center gap-9 font-sans text-[12px] tracking-widest uppercase ${tone}`}
        >
          {navLinks.map(([view, label]) => (
            <button
              key={view}
              onClick={() => go(view)}
              className="link-underline transition-colors hover:text-gold"
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => go('cart')}
          className={`relative ${tone} hover:text-gold transition-colors`}
          aria-label="Cart"
        >
          <ShoppingBag size={22} strokeWidth={1.5} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gold text-ivory text-[10px] font-semibold w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-ivory border-t border-sand mt-3 px-6 py-2 flex flex-col font-sans text-sm tracking-widest text-ocean uppercase animate-fade-in">
          {navLinks.map(([view, label]) => (
            <button
              key={view}
              onClick={() => go(view)}
              className="text-left py-4 border-b border-sand/70 last:border-0"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div className="fixed bottom-6 right-6 z-[60] bg-ocean text-ivory pl-5 pr-6 py-4 rounded-sm shadow-2xl font-sans text-sm flex items-center gap-3 animate-toast">
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold">
        <Check size={14} />
      </span>
      {toast}
    </div>
  )
}

function NewsletterBand() {
  const { showToast } = useStore()
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setBusy(true)
    try {
      await postJson('/api/subscribe', data)
      form.reset()
      showToast('Welcome to the circle. You are subscribed.')
    } catch {
      showToast('Sorry, something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="relative">
      <ImageWithFallback
        src="/images/newsletter-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-ocean/55" />
      <Reveal className="relative max-w-2xl mx-auto text-center px-6 py-24 md:py-32">
        <Eyebrow className="mb-5 text-gold">From the Pacific</Eyebrow>
        <h2 className="font-serif text-4xl md:text-5xl text-ivory mb-5">
          Join the circle
        </h2>
        <p className="font-sans font-light text-ivory/80 leading-relaxed mb-10 max-w-md mx-auto">
          Receive a Pacific story now and then — slow words, seasonal offerings
          and quiet invitations to gather.
        </p>
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <Honeypot />
          <input
            type="email"
            name="email"
            required
            placeholder="Your email address"
            className="flex-grow bg-ivory/95 text-ocean placeholder-ocean/40 px-5 py-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <button
            type="submit"
            disabled={busy}
            className="font-sans text-[12px] tracking-widest uppercase bg-gold text-ivory px-8 py-4 hover:bg-ivory hover:text-ocean transition-colors disabled:opacity-70"
          >
            {busy ? 'Joining…' : 'Join'}
          </button>
        </form>
      </Reveal>
    </section>
  )
}

/* =================================================================== */
/*  HOME                                                              */
/* =================================================================== */
function HomeView() {
  const { navigate } = useStore()
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[100svh] min-h-[640px] w-full flex items-center justify-center overflow-hidden bg-ocean">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/images/ritual-pour.jpg"
            alt="Hands whisking ceremonial cacao"
            className="w-full h-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ocean/70 via-ocean/30 to-ocean/80" />
          <div className="absolute inset-0 bg-ocean/20" />
        </div>

        <div className="relative z-10 text-center px-6 flex flex-col items-center">
          <img
            src="/images/mark.png"
            alt=""
            className="h-16 w-16 md:h-20 md:w-20 object-contain brightness-0 invert opacity-90 mb-8 animate-fade-in"
          />
          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl leading-none text-ivory tracking-[0.18em] lg:tracking-brand uppercase mb-6 animate-fade-in-up">
            Solwara
          </h1>
          <p
            className="font-sans text-[11px] md:text-sm text-sand tracking-brand uppercase mb-3 animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            Sacred Cacao Born Beside the Sea
          </p>
          <p
            className="font-serif italic text-ivory/80 text-lg md:text-xl mb-11 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            Pure · Ethical · Pacific
          </p>
          <div
            className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            <button
              onClick={() => navigate('shop')}
              className="font-sans text-[12px] tracking-widest uppercase bg-ivory text-ocean px-10 py-4 hover:bg-gold hover:text-ivory transition-all duration-300"
            >
              Shop the Cacao
            </button>
            <button
              onClick={() => navigate('about')}
              className="font-sans text-[12px] tracking-widest uppercase text-ivory border border-ivory/50 px-10 py-4 hover:bg-ivory hover:text-ocean transition-all duration-300"
            >
              Our Story
            </button>
          </div>
        </div>

        <button
          onClick={() =>
            window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' })
          }
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ivory/70 hover:text-ivory transition-colors animate-fade-in"
          style={{ animationDelay: '600ms' }}
          aria-label="Scroll down"
        >
          <ChevronDown size={26} className="animate-bounce" strokeWidth={1.25} />
        </button>
      </section>

      {/* Brand essence */}
      <section className="bg-ivory">
        <div className="max-w-8xl mx-auto grid md:grid-cols-2 items-stretch">
          <Reveal className="flex items-center px-6 py-20 md:py-28 lg:px-16">
            <div className="max-w-xl mx-auto md:mx-0">
              <Eyebrow className="mb-6">Wild · Grounded · Ocean-born</Eyebrow>
              <h2 className="font-serif text-4xl md:text-5xl text-ocean leading-[1.1] mb-8">
                Cacao returning to its roots.
              </h2>
              <p className="font-sans font-light text-earth leading-loose mb-6">
                Solwara begins where the volcanic earth meets the Pacific sea.
                Cultivated with reverence in Papua New Guinea and the South
                Pacific, then crafted slowly and intentionally in New Zealand.
              </p>
              <p className="font-sans font-light text-earth leading-loose mb-10">
                This is ceremonial cacao as it was always meant to be — an
                invitation to presence, to quiet moments, and to deep
                connection.
              </p>
              <button
                onClick={() => navigate('about')}
                className="link-underline font-sans text-[12px] tracking-widest uppercase text-ocean hover:text-gold transition-colors inline-flex items-center gap-2"
              >
                Discover our story <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
          <Reveal className="relative min-h-[420px] md:min-h-0 overflow-hidden">
            <ImageWithFallback
              src="/images/cacao-close.jpg"
              alt="Raw ceremonial cacao and beans"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-sand py-24 md:py-32 px-6 lg:px-10">
        <div className="max-w-8xl mx-auto">
          <Reveal className="text-center mb-16">
            <Eyebrow className="mb-4">The Offerings</Eyebrow>
            <h2 className="font-serif text-4xl md:text-5xl text-ocean">
              Crafted for your ritual
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {products.slice(0, 3).map((product, i) => (
              <Reveal key={product.id} delay={i * 120}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
          <Reveal className="text-center mt-16">
            <button
              onClick={() => navigate('shop')}
              className="link-underline font-sans text-[12px] tracking-widest uppercase text-ocean hover:text-gold transition-colors inline-flex items-center gap-2"
            >
              View all offerings <ArrowRight size={15} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* Full-bleed coastline banner */}
      <section className="relative">
        <ImageWithFallback
          src="/images/born-beside-sea.jpg"
          alt="Solwara — Sacred cacao born beside the sea"
          className="w-full h-[55vh] md:h-[70vh] object-cover"
        />
      </section>

      {/* Story teaser */}
      <section className="bg-ivory">
        <div className="max-w-8xl mx-auto grid md:grid-cols-2 items-stretch">
          <Reveal className="relative min-h-[420px] md:min-h-0 overflow-hidden order-1 md:order-none">
            <ImageWithFallback
              src="/images/hands-cup.jpg"
              alt="Hands holding a steaming cup of cacao"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </Reveal>
          <Reveal className="flex items-center px-6 py-20 md:py-28 lg:px-16">
            <div className="max-w-xl mx-auto md:mx-0">
              <Eyebrow className="mb-6">A small, sacred ritual</Eyebrow>
              <h2 className="font-serif text-4xl md:text-5xl text-ocean leading-[1.1] mb-8">
                Slow down. Gather. Share.
              </h2>
              <p className="font-sans font-light text-earth leading-loose mb-10">
                Whether you hold space for many or simply seek a quiet moment in
                your morning cup, Solwara offers a grounded, earthy and profound
                experience. Warm. Whisk. Breathe. Sip slowly.
              </p>
              <button
                onClick={() => navigate('ritual')}
                className="link-underline font-sans text-[12px] tracking-widest uppercase text-ocean hover:text-gold transition-colors inline-flex items-center gap-2"
              >
                Learn the ritual <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-ivory pb-24 md:pb-32 px-6">
        <Reveal className="max-w-4xl mx-auto text-center">
          <ImageWithFallback
            src="/images/trust-icons.png"
            alt="Ethically sourced · Crafted in New Zealand · Minimal processing · Pacific-grown"
            className="w-full max-w-2xl mx-auto h-auto"
          />
        </Reveal>
      </section>

      <NewsletterBand />
    </div>
  )
}

/* =================================================================== */
/*  SHOP                                                              */
/* =================================================================== */
function ShopView() {
  return (
    <div className="pt-32 md:pt-40 pb-24 px-6 lg:px-10 animate-fade-in">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-6">
          <Eyebrow className="mb-4">The Collection</Eyebrow>
          <h1 className="font-serif text-5xl md:text-6xl text-ocean mb-5">
            Shop the Cacao
          </h1>
          <p className="font-sans text-sm font-light tracking-wide text-earth">
            Flat ${FLAT_SHIPPING} shipping, anywhere in Australia.
          </p>
        </div>
        <div className="w-12 h-px bg-gold mx-auto mb-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 3) * 100}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

/* =================================================================== */
/*  PRODUCT DETAIL                                                    */
/* =================================================================== */
function ProductView() {
  const { activeProduct: p, navigate, addToCart } = useStore()
  const [qty, setQty] = useState(1)
  const [activeImg, setActiveImg] = useState(p?.image)

  useEffect(() => {
    setActiveImg(p?.image)
    setQty(1)
  }, [p])

  if (!p) return null
  const gallery = p.gallery?.length ? p.gallery : [p.image]

  return (
    <div className="pt-28 md:pt-36 pb-24 px-6 lg:px-10 animate-fade-in">
      <div className="max-w-8xl mx-auto">
        <button
          onClick={() => navigate('shop')}
          className="font-sans text-[11px] tracking-widest uppercase text-earth hover:text-gold flex items-center gap-2 mb-10"
        >
          <ArrowLeft size={15} /> Back to Shop
        </button>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-20">
          {/* Gallery */}
          <div>
            <div className="aspect-[4/5] bg-sand overflow-hidden mb-4">
              <ImageWithFallback
                src={activeImg}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img) => (
                  <button
                    key={img}
                    onClick={() => setActiveImg(img)}
                    className={`aspect-square bg-sand overflow-hidden border transition-colors ${
                      activeImg === img ? 'border-gold' : 'border-transparent'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center md:py-6">
            <Eyebrow className="mb-4">Ceremonial Cacao</Eyebrow>
            <h1 className="font-serif text-4xl md:text-5xl text-ocean uppercase tracking-wide mb-3">
              {p.name}
            </h1>
            <p className="font-sans text-[12px] text-gold tracking-widest uppercase mb-6">
              {p.size}
            </p>
            <p className="font-sans text-2xl text-ocean mb-8">${p.price} AUD</p>
            <div className="w-12 h-px bg-gold mb-8" />
            <p className="font-sans font-light text-earth leading-loose mb-10">
              {p.fullDesc}
            </p>

            <div className="flex items-stretch gap-4 mb-10">
              <div className="flex items-center border border-ocean">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-4 text-ocean hover:bg-sand transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="font-sans text-sm w-12 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="p-4 text-ocean hover:bg-sand transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <PrimaryButton className="flex-grow" onClick={() => addToCart(p, qty)}>
                Add to Cart
              </PrimaryButton>
            </div>

            <div className="bg-ivory border border-sand p-7">
              <h4 className="font-serif text-xl text-ocean uppercase tracking-wide mb-3">
                The Preparation
              </h4>
              <p className="font-sans text-sm font-light text-earth leading-relaxed">
                Mix your dose with hot — not boiling — water or plant milk. Whisk
                or blend intentionally until a rich froth forms. Set your
                intention, and sip slowly.
              </p>
            </div>

            <p className="font-serif italic text-gold text-xl mt-10 text-center">
              “Small rituals. Deep connection.”
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =================================================================== */
/*  CART                                                              */
/* =================================================================== */
function CartView() {
  const {
    cart,
    updateQuantity,
    cartTotal,
    navigate,
    checkoutState,
    handleCheckout,
  } = useStore()

  if (checkoutState === 'success') {
    return (
      <div className="pt-40 pb-32 px-6 text-center animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-palm rounded-full flex items-center justify-center mx-auto mb-8 text-ivory">
            <Check size={38} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-ocean mb-6">
            Order Confirmed
          </h1>
          <p className="font-sans font-light text-earth leading-loose mb-12">
            Thank you for choosing Solwara. Your ceremonial cacao will be
            lovingly packed and shipped soon. A receipt is on its way to your
            inbox.
          </p>
          <PrimaryButton onClick={() => navigate('home')}>
            Return Home
          </PrimaryButton>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 md:pt-40 pb-24 px-6 lg:px-10 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-ocean mb-3">
          Your Cart
        </h1>
        <div className="w-12 h-px bg-gold mb-12" />

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-sans font-light text-earth mb-8">
              Your cart is gently empty.
            </p>
            <PrimaryButton onClick={() => navigate('shop')}>
              Explore Offerings
            </PrimaryButton>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="w-full lg:w-2/3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-5 sm:gap-6 py-6 border-b border-sand items-center"
                >
                  <div className="w-20 h-24 sm:w-24 sm:h-28 bg-sand flex-shrink-0 overflow-hidden">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-serif text-xl text-ocean uppercase tracking-wide">
                      {item.name}
                    </h3>
                    <p className="font-sans text-[11px] text-gold tracking-widest uppercase mt-1">
                      {item.size}
                    </p>
                    <p className="font-sans text-sm text-earth mt-2">
                      ${item.price} AUD
                    </p>
                  </div>
                  <div className="flex items-center border border-sand">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-sand text-ocean"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-sans text-sm w-9 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-sand text-ocean"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="w-20 text-right font-sans text-sm text-ocean hidden sm:block">
                    ${item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-ivory border border-sand p-8 lg:sticky lg:top-28">
                <h3 className="font-serif text-2xl text-ocean uppercase tracking-wide mb-7">
                  Summary
                </h3>
                <div className="space-y-4 font-sans text-sm text-earth font-light border-b border-sand pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartTotal} AUD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (Australia-wide)</span>
                    <span>${FLAT_SHIPPING} AUD</span>
                  </div>
                </div>
                <div className="flex justify-between font-sans text-lg text-ocean mb-8">
                  <span>Total</span>
                  <span>${cartTotal + FLAT_SHIPPING} AUD</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutState === 'loading'}
                  className="font-sans text-[12px] tracking-widest uppercase bg-ocean text-ivory w-full py-4 hover:bg-gold transition-colors disabled:opacity-70"
                >
                  {checkoutState === 'loading'
                    ? 'Processing…'
                    : 'Proceed to Checkout'}
                </button>
                <p className="mt-4 text-center font-sans text-[10px] uppercase tracking-widest text-earth/50">
                  Secure payment · Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* =================================================================== */
/*  ABOUT                                                             */
/* =================================================================== */
function AboutView() {
  const { navigate } = useStore()
  return (
    <div className="animate-fade-in">
      <section className="relative h-[70vh] min-h-[460px] overflow-hidden bg-ocean">
        <ImageWithFallback
          src="/images/about-hero.jpg"
          alt="Solwara — Sacred Cacao Born Beside the Sea"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean/40 to-transparent" />
      </section>

      <section className="bg-ivory pt-24 md:pt-32 pb-20 px-6">
        <Reveal className="max-w-3xl mx-auto text-center">
          <Eyebrow className="mb-6">Solwara — Tok Pisin for ‘the sea’</Eyebrow>
          <h1 className="font-serif text-5xl md:text-6xl text-ocean uppercase tracking-wide mb-10">
            Our Story
          </h1>
          <div className="w-12 h-px bg-gold mx-auto mb-10" />
          <p className="font-serif text-2xl md:text-3xl text-ocean leading-snug">
            Solwara was born from a deep reverence for the ocean, the earth, and
            the ancient traditions that bind us to them.
          </p>
        </Reveal>
      </section>

      <section className="bg-ivory">
        <div className="max-w-8xl mx-auto grid md:grid-cols-2 items-stretch">
          <Reveal className="relative min-h-[440px] overflow-hidden">
            <ImageWithFallback
              src="/images/values-coast.jpg"
              alt="Cacao pods beside the Pacific coastline"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </Reveal>
          <Reveal className="flex items-center px-6 py-20 lg:px-16">
            <div className="max-w-xl">
              <Eyebrow className="mb-6">Honouring Origin</Eyebrow>
              <h2 className="font-serif text-3xl md:text-4xl text-ocean mb-7">
                Grown beside the sea
              </h2>
              <p className="font-sans font-light text-earth leading-loose">
                Grown in the untamed, volcanic soils of Papua New Guinea and the
                surrounding Pacific Islands, our cacao is kissed by the sea
                breeze and nurtured by generations of traditional farming wisdom.
                We source only the purest, ethically grown beans — honouring both
                the land and the people who tend to it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory">
        <div className="max-w-8xl mx-auto grid md:grid-cols-2 items-stretch">
          <Reveal className="flex items-center px-6 py-20 lg:px-16 order-1 md:order-none">
            <div className="max-w-xl">
              <Eyebrow className="mb-6">Crafted in New Zealand</Eyebrow>
              <h2 className="font-serif text-3xl md:text-4xl text-ocean mb-7">
                Slow, minimal, intentional
              </h2>
              <p className="font-sans font-light text-earth leading-loose">
                Once harvested, the raw cacao makes its journey to New Zealand,
                where it is crafted with meticulous care. Our process is minimal,
                designed to preserve the complex flavour and the potent, sacred
                spirit of the plant. We believe true luxury lies in simplicity,
                transparency and deep connection.
              </p>
            </div>
          </Reveal>
          <Reveal className="relative min-h-[440px] overflow-hidden">
            <ImageWithFallback
              src="/images/crafting-block.jpg"
              alt="Hand-cutting a block of ceremonial cacao"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-ocean py-24 md:py-28 px-6">
        <Reveal className="max-w-5xl mx-auto text-center">
          <Eyebrow className="mb-12 text-gold">Our Values</Eyebrow>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
            {[
              'Honouring Origin',
              'Minimal Processing',
              'Intentional Gathering',
              'Earth & Ocean Reverence',
            ].map((v) => (
              <div key={v} className="px-2">
                <p className="font-serif text-xl md:text-2xl text-ivory leading-snug">
                  {v}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-ivory py-20 md:py-28 px-6">
        <Reveal className="max-w-4xl mx-auto">
          <ImageWithFallback
            src="/images/philosophy.jpg"
            alt="Not everything sacred has to be complicated — welcome to Solwara"
            className="w-full h-auto shadow-sm"
          />
        </Reveal>
      </section>

      {/* Our World — gallery */}
      <section className="bg-ivory pb-8 md:pb-16 px-6 lg:px-10">
        <Reveal className="max-w-8xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow className="mb-4">Our World</Eyebrow>
            <h2 className="font-serif text-3xl md:text-4xl text-ocean">
              From the sea to the cup
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              ['/images/hero-coast.jpg', 'The Pacific coastline where our cacao grows'],
              ['/images/crafted-nz.jpg', 'Hand-crafted in small batches in New Zealand'],
              ['/images/cacao-close.jpg', 'Pure, minimally processed ceremonial cacao'],
            ].map(([src, alt]) => (
              <div key={src} className="aspect-[4/3] overflow-hidden bg-sand group">
                <ImageWithFallback
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-sand py-24 px-6 text-center">
        <Reveal className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-ocean mb-8">
            Begin your ritual
          </h2>
          <PrimaryButton onClick={() => navigate('shop')}>
            Shop the Cacao
          </PrimaryButton>
        </Reveal>
      </section>
    </div>
  )
}

/* =================================================================== */
/*  RITUAL                                                            */
/* =================================================================== */
function RitualView() {
  const { navigate } = useStore()
  const steps = [
    ['Prepare', 'Warm water or plant milk. Add 1–2 squares of ceremonial cacao paste.'],
    ['Stir', 'Whisk slowly and mindfully until smooth. Set your intention.'],
    ['Sip', 'Enjoy slowly. Breathe. Feel. Let the cacao guide you.'],
    ['Be Present', 'Connect, create, reflect, share. Live from the heart.'],
  ]
  return (
    <div className="animate-fade-in">
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden bg-ocean">
        <ImageWithFallback
          src="/images/ritual-whisk.jpg"
          alt="Whisking ceremonial cacao"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ocean/40" />
        <Reveal className="relative text-center px-6">
          <Eyebrow className="mb-5 text-gold">
            Nourish body · Focus mind · Open heart
          </Eyebrow>
          <h1 className="font-serif text-5xl md:text-7xl text-ivory tracking-wide uppercase">
            The Ritual
          </h1>
        </Reveal>
      </section>

      <section className="bg-ivory py-24 md:py-32 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {steps.map(([title, body], i) => (
              <Reveal key={title} delay={i * 100} className="text-center">
                <div className="font-serif text-5xl text-gold/40 mb-5">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-serif text-2xl text-ocean uppercase tracking-wide mb-3">
                  {title}
                </h3>
                <p className="font-sans text-sm font-light text-earth leading-relaxed">
                  {body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sand py-20 md:py-28 px-6">
        <Reveal className="max-w-4xl mx-auto">
          <ImageWithFallback
            src="/images/ritual-steps.jpg"
            alt="The Daily Ritual — prepare, stir, sip, be present"
            className="w-full h-auto shadow-sm"
          />
        </Reveal>
      </section>

      <section className="bg-ivory py-20 px-6 text-center">
        <Reveal className="max-w-2xl mx-auto">
          <p className="font-serif italic text-2xl md:text-3xl text-gold mb-10">
            “Slow down · Gather · Share”
          </p>
          <PrimaryButton onClick={() => navigate('shop')}>
            Find your cacao
          </PrimaryButton>
        </Reveal>
      </section>
    </div>
  )
}

/* =================================================================== */
/*  WHOLESALE                                                         */
/* =================================================================== */
function WholesaleView() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const submitted = status === 'sent'

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setStatus('sending')
    try {
      await postJson('/api/wholesale', data)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="pt-28 md:pt-32 pb-24 animate-fade-in">
      <div className="max-w-8xl mx-auto grid md:grid-cols-2 items-stretch">
        <div className="relative min-h-[420px] md:min-h-[640px] overflow-hidden">
          <ImageWithFallback
            src="/images/wholesale.jpg"
            alt="A café setting with Solwara ceremonial cacao"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="px-6 py-16 lg:px-16 flex items-center">
          <div className="w-full max-w-xl">
            <Eyebrow className="mb-5">Partnerships</Eyebrow>
            <h1 className="font-serif text-4xl md:text-5xl text-ocean mb-6">
              Wholesale
            </h1>
            <p className="font-sans font-light text-earth leading-relaxed mb-3">
              We welcome inquiries from aligned cafés, retreat centres,
              facilitators and specialty stockists. Share a little about your
              space and we will send our offering details.
            </p>
            <p className="font-sans text-[11px] tracking-widest uppercase text-gold mb-10">
              Wholesale pricing available on application.
            </p>

            {submitted ? (
              <div className="bg-sand p-8 border border-gold/40">
                <h3 className="font-serif text-2xl text-ocean mb-2">
                  Thank You
                </h3>
                <p className="font-sans text-sm text-earth">
                  Your inquiry has been received. We will be in touch shortly.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={onSubmit}>
                <Honeypot />
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="Name" name="name" required />
                  <Field label="Business Name" name="business" required />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="Email" name="email" type="email" required />
                  <Field label="Phone" name="phone" type="tel" />
                </div>
                <Field
                  label="Tell us about your space"
                  name="message"
                  textarea
                  required
                />
                {status === 'error' && (
                  <p className="font-sans text-sm text-earth">
                    Sorry, something went wrong. Please email us directly at{' '}
                    <a
                      href="mailto:hello@solwara.com.au"
                      className="link-underline text-ocean"
                    >
                      hello@solwara.com.au
                    </a>
                    .
                  </p>
                )}
                <PrimaryButton
                  type="submit"
                  className="w-full"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Submitting…' : 'Submit Inquiry'}
                </PrimaryButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =================================================================== */
/*  CONTACT                                                           */
/* =================================================================== */
function ContactView() {
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const submitted = status === 'sent'

  const onSubmit = async (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    setStatus('sending')
    try {
      await postJson('/api/contact', data)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="pt-32 md:pt-40 pb-28 px-6 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <Eyebrow className="mb-4">Say Hello</Eyebrow>
          <h1 className="font-serif text-4xl md:text-5xl text-ocean mb-6">
            Contact Us
          </h1>
          <p className="font-sans font-light text-earth leading-relaxed">
            We'd love to hear from you. Drop us a line, or reach out at{' '}
            <a
              href="mailto:hello@solwara.com.au"
              className="link-underline text-ocean"
            >
              hello@solwara.com.au
            </a>
            .
          </p>
        </div>

        {submitted ? (
          <div className="bg-sand p-8 text-center border border-gold/40">
            <h3 className="font-serif text-2xl text-ocean mb-2">Message Sent</h3>
            <p className="font-sans text-sm text-earth">
              Thank you for reaching out. We'll reply as soon as we can.
            </p>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={onSubmit}>
            <Honeypot />
            <div className="grid sm:grid-cols-2 gap-8">
              <Field label="Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
            </div>
            <Field label="Message" name="message" textarea required />
            {status === 'error' && (
              <p className="font-sans text-sm text-earth text-center">
                Sorry, something went wrong. Please email us directly at{' '}
                <a
                  href="mailto:hello@solwara.com.au"
                  className="link-underline text-ocean"
                >
                  hello@solwara.com.au
                </a>
                .
              </p>
            )}
            <div className="text-center">
              <PrimaryButton
                type="submit"
                className="px-14"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* =================================================================== */
/*  FOOTER                                                            */
/* =================================================================== */
function FooterColumn({ title, links }) {
  const { navigate } = useStore()
  return (
    <div>
      <h4 className="font-sans text-[10px] tracking-widest uppercase mb-6 text-gold">
        {title}
      </h4>
      <ul className="space-y-3 font-sans text-xs font-light text-sand/70">
        {links.map(([view, label]) => (
          <li key={view}>
            <button
              onClick={() => navigate(view)}
              className="hover:text-ivory transition-colors"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Footer() {
  const { showToast } = useStore()
  return (
    <footer className="bg-ocean text-sand">
      <div className="max-w-8xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <img
            src="/images/logo-badge.png"
            alt="Solwara"
            className="h-20 w-20 object-contain mb-5"
          />
          <p className="font-sans text-xs font-light leading-loose text-sand/70 max-w-[220px]">
            Sacred cacao born beside the sea. Grown in the Pacific, crafted in
            New Zealand.
          </p>
        </div>

        <FooterColumn
          title="Explore"
          links={[
            ['shop', 'Shop'],
            ['about', 'Our Story'],
            ['ritual', 'The Ritual'],
            ['wholesale', 'Wholesale'],
            ['contact', 'Contact'],
          ]}
        />

        <div>
          <h4 className="font-sans text-[10px] tracking-widest uppercase mb-6 text-gold">
            Legal
          </h4>
          <ul className="space-y-3 font-sans text-xs font-light text-sand/70">
            <li>
              <button className="hover:text-ivory transition-colors">
                Privacy Policy
              </button>
            </li>
            <li>
              <button className="hover:text-ivory transition-colors">
                Shipping &amp; Returns
              </button>
            </li>
            <li>
              <button className="hover:text-ivory transition-colors">
                Terms of Service
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-sans text-[10px] tracking-widest uppercase mb-6 text-gold">
            Stay Close
          </h4>
          <p className="font-sans text-xs font-light text-sand/70 mb-5">
            A Pacific story, now and then.
          </p>
          <form
            className="flex border-b border-sand/40 pb-2 mb-7"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const data = Object.fromEntries(new FormData(form))
              try {
                await postJson('/api/subscribe', data)
                form.reset()
                showToast('Welcome to the circle. You are subscribed.')
              } catch {
                showToast('Sorry, something went wrong. Please try again.')
              }
            }}
          >
            <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <input
              type="email"
              name="email"
              required
              placeholder="Email address"
              className="bg-transparent border-none focus:outline-none text-xs w-full text-ivory placeholder-sand/50"
            />
            <button
              type="submit"
              className="font-sans text-[11px] uppercase tracking-widest hover:text-gold transition-colors"
            >
              Join
            </button>
          </form>
          <div className="flex gap-4">
            <a
              href="https://facebook.com/solwaracacao"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand/70 hover:text-ivory transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={18} strokeWidth={1.5} />
            </a>
            <a
              href="https://instagram.com/solwaracacao"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand/70 hover:text-ivory transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-sand/15">
        <img
          src="/images/wordmark.png"
          alt=""
          aria-hidden="true"
          className="mx-auto h-10 md:h-12 object-contain brightness-0 invert opacity-15 my-8"
        />
        <div className="max-w-8xl mx-auto px-6 lg:px-10 pb-7 flex flex-col sm:flex-row justify-between items-center gap-3 font-sans text-[10px] tracking-widest uppercase text-sand/50">
          <span>© {new Date().getFullYear()} Solwara Cacao</span>
          <span>Pure · Ethical · Pacific</span>
        </div>
      </div>
    </footer>
  )
}

/* =================================================================== */
/*  Root                                                              */
/* =================================================================== */
const VIEWS = {
  home: HomeView,
  shop: ShopView,
  product: ProductView,
  cart: CartView,
  about: AboutView,
  ritual: RitualView,
  wholesale: WholesaleView,
  contact: ContactView,
}

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [activeProduct, setActiveProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [toast, setToast] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [checkoutState, setCheckoutState] = useState('cart')
  const toastTimer = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [currentView, activeProduct])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3000)
  }, [])

  const navigate = useCallback((view, product = null) => {
    setActiveProduct(product)
    if (view === 'cart') setCheckoutState('cart')
    setCurrentView(view)
  }, [])

  const addToCart = useCallback(
    (product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id)
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        }
        return [...prev, { ...product, quantity }]
      })
      showToast(`${product.name} added to your cart`)
    },
    [showToast]
  )

  const updateQuantity = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        )
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const handleCheckout = useCallback(() => {
    setCheckoutState('loading')
    setTimeout(() => {
      setCheckoutState('success')
      setCart([])
    }, 1800)
  }, [])

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0)
  const overHero = currentView === 'home' && !scrolled

  const store = {
    currentView,
    activeProduct,
    cart,
    cartTotal,
    cartItemCount,
    toast,
    overHero,
    checkoutState,
    navigate,
    addToCart,
    updateQuantity,
    showToast,
    handleCheckout,
  }

  const ActiveView = VIEWS[currentView] || HomeView

  return (
    <StoreContext.Provider value={store}>
      <div className="min-h-screen flex flex-col bg-ivory">
        <Header />
        <Toast />
        <main className="flex-grow">
          <ActiveView />
        </main>
        <Footer />
      </div>
    </StoreContext.Provider>
  )
}
