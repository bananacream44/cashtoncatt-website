/* ============================================
   CASHTONCATT — Product Data
   ============================================
   To add or edit products:
   Option 1: Edit this file directly and re-upload to your server
   Option 2: Use the admin panel at /admin.html (stores changes locally)
   ============================================ */

const PRODUCTS_DEFAULT = [
  {
    id: 'arc',
    name: 'Arc Pendant',
    category: 'pendant',
    material: 'Sterling Silver',
    edition: 15,
    editionRemaining: 6,
    price: 380,
    spec1Label: 'Dimensions',
    spec1Value: '45mm arc · 45cm chain',
    spec2Label: 'Finish',
    spec2Value: 'High polish',
    description: 'A single continuous arc, formed from hand-drawn silver wire. The pendant rotates freely on its chain, catching light at each movement. No two pieces are identical — each arc is shaped by hand before being soldered and polished to a high finish. Supplied with a 45cm fine silver chain.',
    imageUrl: '',
    stripeLink: '',
    available: true,
    featured: true,
    svgBg: '#F0EDEA',
    svgMarkup: '<path d="M 100 215 A 50 50 0 0 1 200 215" stroke="#999" stroke-width="0.75"/><line x1="150" y1="160" x2="150" y2="215" stroke="#999" stroke-width="0.5" stroke-dasharray="3 3"/><circle cx="150" cy="157" r="3" stroke="#999" stroke-width="0.75" fill="none"/>'
  },
  {
    id: 'spine',
    name: 'Spine Ring',
    category: 'ring',
    material: '18ct Gold Vermeil',
    edition: 20,
    editionRemaining: 11,
    price: 240,
    spec1Label: 'Sizes',
    spec1Value: 'US 5 – 10',
    spec2Label: 'Plating',
    spec2Value: '3 micron 18ct gold',
    description: 'Inspired by the vertebral form, the Spine Ring features a raised ridge running along the outside of the band. The 18ct gold vermeil surface develops a quiet patina over time. Worn alone or stacked, it sits low and flat on the finger. Please note your ring size at checkout.',
    imageUrl: '',
    stripeLink: '',
    available: true,
    featured: false,
    svgBg: '#EBE6DC',
    svgMarkup: '<circle cx="150" cy="200" r="44" stroke="#999" stroke-width="0.75"/><line x1="150" y1="156" x2="150" y2="244" stroke="#999" stroke-width="0.5"/>'
  },
  {
    id: 'void',
    name: 'Void Earrings',
    category: 'earring',
    material: 'Sterling Silver',
    edition: 12,
    editionRemaining: 4,
    price: 295,
    spec1Label: 'Drop',
    spec1Value: '28mm · post back',
    spec2Label: 'Finish',
    spec2Value: 'Polish + brushed',
    description: 'An asymmetric pair — one circle complete, one interrupted. The Void Earrings are worn with the interrupted form to the front. The polished outer surface contrasts with a brushed inner face. Sold as a pair. The asymmetry is intentional.',
    imageUrl: '',
    stripeLink: '',
    available: true,
    featured: false,
    svgBg: '#0A0A0A',
    svgMarkup: '<circle cx="116" cy="200" r="26" stroke="rgba(255,255,255,0.3)" stroke-width="0.75" stroke-dasharray="42 22"/><circle cx="184" cy="200" r="26" stroke="rgba(255,255,255,0.3)" stroke-width="0.75"/>'
  },
  {
    id: 'column',
    name: 'Column Cuff',
    category: 'cuff',
    material: 'Sterling Silver',
    edition: 10,
    editionRemaining: 3,
    price: 450,
    spec1Label: 'Width',
    spec1Value: '8mm · adjustable',
    spec2Label: 'Gauge',
    spec2Value: '1.2mm sheet silver',
    description: 'A flat section of sterling silver — wide and architectural. The Column Cuff is formed from a single piece of sheet silver, shaped cold and polished to a bright finish. It sits flat against the wrist, low and considered. Adjustable to fit most wrist sizes.',
    imageUrl: '',
    stripeLink: '',
    available: true,
    featured: true,
    svgBg: '#E8E8E8',
    svgMarkup: '<rect x="130" y="133" width="40" height="134" rx="2" stroke="#999" stroke-width="0.75"/><line x1="130" y1="200" x2="170" y2="200" stroke="#999" stroke-width="0.4"/>'
  },
  {
    id: 'knot',
    name: 'Knot Ring',
    category: 'ring',
    material: '18ct Gold Vermeil',
    edition: 25,
    editionRemaining: 18,
    price: 195,
    spec1Label: 'Sizes',
    spec1Value: 'US 5 – 10',
    spec2Label: 'Plating',
    spec2Value: '3 micron 18ct gold',
    description: "A small loop, twisted once before it closes. The knot sits at twelve o'clock on the finger — subtle and wearable as an everyday piece. The 18ct gold vermeil finish is thick-plated and designed for daily wear. Please note your ring size at checkout.",
    imageUrl: '',
    stripeLink: '',
    available: true,
    featured: false,
    svgBg: '#EDE8DC',
    svgMarkup: '<circle cx="134" cy="200" r="30" stroke="#999" stroke-width="0.75"/><circle cx="166" cy="200" r="30" stroke="#999" stroke-width="0.75"/>'
  }
];

// ============================================
// Product Store
// Reads from localStorage if admin has made
// changes, otherwise uses defaults above.
// ============================================

function getProducts() {
  try {
    const stored = localStorage.getItem('cc_products');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* fall through */ }
  return PRODUCTS_DEFAULT;
}

function saveProducts(products) {
  try {
    localStorage.setItem('cc_products', JSON.stringify(products));
  } catch (e) {
    console.error('Could not save products to localStorage:', e);
  }
}

function getProductById(id) {
  return getProducts().find(p => p.id === id) || null;
}

function getFeaturedProducts() {
  return getProducts().filter(p => p.featured && p.available);
}

// ============================================
// Utilities (shared across site JS)
// ============================================

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function productImageHTML(product, classes) {
  if (product.imageUrl) {
    return `<img src="${escHtml(product.imageUrl)}" alt="${escHtml(product.name)}" loading="lazy" class="${classes || ''}">`;
  }
  return `<svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="300" height="400" fill="${escHtml(product.svgBg || '#EEE')}"/>
    ${product.svgMarkup || ''}
  </svg>`;
}
