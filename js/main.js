/* ============================================
   CASHTONCATT — Main JavaScript
   ============================================ */

// ============================================
// RENDER PRODUCTS
// ============================================

function renderProductCard(product, index) {
  const delayClass = ['', 'reveal-d1', 'reveal-d2', 'reveal-d3'][index % 4];
  const isVoid = product.id === 'void';

  const imgContent = product.imageUrl
    ? `<img src="${escHtml(product.imageUrl)}" alt="${escHtml(product.name)}" loading="lazy">`
    : `<svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="300" height="400" fill="${escHtml(product.svgBg || '#EEE')}"/>
        ${product.svgMarkup || ''}
       </svg>`;

  const soldBadge = !product.available
    ? `<span class="product-card__sold-out">Sold Out</span>` : '';

  return `
    <div class="product-card${isVoid ? ' product-void' : ''} reveal ${delayClass}"
         data-product="${escHtml(product.id)}"
         role="button"
         tabindex="0"
         aria-label="View ${escHtml(product.name)} details">
      <div class="product-card__image">
        ${imgContent}
        ${soldBadge}
        <div class="product-card__overlay">
          <span class="product-card__overlay-text">View Details</span>
        </div>
      </div>
      <div class="product-card__info">
        <span class="product-card__name">${escHtml(product.name)}</span>
        <span class="product-card__price">$${product.price}</span>
        <span class="product-card__meta">${escHtml(product.material)} · Edition of ${product.edition}</span>
      </div>
    </div>
  `;
}

function renderProductGrid(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = products.map((p, i) => renderProductCard(p, i)).join('');
  bindProductCards();
  initReveal();
}

// ============================================
// NAVIGATION
// ============================================
const nav = document.getElementById('nav');
const mobileToggle = document.getElementById('mobileToggle');
const navMobile = document.getElementById('navMobile');
const navMobileClose = document.getElementById('navMobileClose');

window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

if (window.scrollY > 40) nav?.classList.add('scrolled');

mobileToggle?.addEventListener('click', () => {
  navMobile.classList.add('open');
  document.body.style.overflow = 'hidden';
});

navMobileClose?.addEventListener('click', closeMobileMenu);

function closeMobileMenu() {
  navMobile?.classList.remove('open');
  document.body.style.overflow = '';
}

// Active nav link
const page = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link').forEach(link => {
  const href = link.getAttribute('href');
  if (href === page || (page === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// ============================================
// PAGE TRANSITIONS
// ============================================
document.querySelectorAll('a[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
  link.addEventListener('click', e => {
    e.preventDefault();
    document.body.style.transition = 'opacity 0.2s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 220);
  });
});

// ============================================
// PRODUCT MODAL
// ============================================
const modal      = document.getElementById('productModal');
const backdrop   = document.getElementById('modalBackdrop');
const closeBtn   = document.getElementById('modalClose');

function openModal(id) {
  const p = getProductById(id);
  if (!p || !modal) return;

  // Image
  const imgEl = document.getElementById('modalImage');
  if (imgEl) {
    imgEl.innerHTML = p.imageUrl
      ? `<img src="${escHtml(p.imageUrl)}" alt="${escHtml(p.name)}">`
      : `<svg viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
           <rect width="300" height="400" fill="${escHtml(p.svgBg || '#EEE')}"/>
           ${p.svgMarkup || ''}
         </svg>`;
  }

  // Text fields
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.textContent = val; };
  set('modalEdition',      `Edition of ${p.edition}`);
  set('modalName',         p.name);
  set('modalPrice',        `$${p.price}`);
  set('modalDesc',         p.description);
  set('modalSpec1L',       p.spec1Label);
  set('modalSpec1V',       p.spec1Value);
  set('modalSpec2L',       p.spec2Label);
  set('modalSpec2V',       p.spec2Value);
  set('modalMaterial',     p.material);
  set('modalEditionCount', `${p.edition} pieces`);
  set('modalAvail',        `${p.editionRemaining || p.edition} remaining`);

  // Size selector (for rings)
  const optionsContainer = document.getElementById('modalOptions');
  if (optionsContainer) {
    if (p.category === 'ring') {
      const sizes = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];
      optionsContainer.innerHTML = `
        <div class="product-options">
          <p class="spec-label" style="margin-bottom:8px">Ring Size (US)</p>
          <select class="size-select" id="modalSizeSelect">
            <option value="">Select size</option>
            ${sizes.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
      `;
    } else {
      optionsContainer.innerHTML = '';
    }
  }

  // Buttons
  const addCartBtn = document.getElementById('modalAddCart');
  if (addCartBtn) {
    if (p.available) {
      addCartBtn.textContent = 'Add to Cart';
      addCartBtn.disabled = false;
      addCartBtn.onclick = () => {
        const sizeSelect = document.getElementById('modalSizeSelect');
        if (p.category === 'ring' && sizeSelect && !sizeSelect.value) {
          sizeSelect.style.borderColor = '#000';
          sizeSelect.focus();
          return;
        }
        const options = sizeSelect && sizeSelect.value ? { size: sizeSelect.value } : {};
        cartAdd(p.id, options);
        closeModal();
      };
    } else {
      addCartBtn.textContent = 'Sold Out';
      addCartBtn.disabled = true;
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.focus();
}

function closeModal() {
  modal?.classList.remove('open');
  document.body.style.overflow = '';
}

backdrop?.addEventListener('click', closeModal);
closeBtn?.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ============================================
// BIND PRODUCT CARDS
// ============================================
function bindProductCards() {
  document.querySelectorAll('[data-product]').forEach(card => {
    const id = card.dataset.product;
    card.addEventListener('click', () => openModal(id));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(id);
      }
    });
  });
}

// ============================================
// SCROLL REVEAL
// ============================================
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

// ============================================
// CONTACT FORM
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name    = data.get('name')    || '';
    const email   = data.get('email')   || '';
    const subject = data.get('subject') || 'Enquiry from chastoncatt.com';
    const message = data.get('message') || '';

    const mailto = document.createElement('a');
    mailto.href = `mailto:hello@chastoncatt.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    mailto.click();

    const success = document.getElementById('formSuccess');
    if (success) {
      success.classList.add('visible');
      contactForm.reset();
    }
  });
}

// ============================================
// HERO SLIDER
// ============================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero__slide');
  const dots   = document.querySelectorAll('.hero__slider-dot');
  if (slides.length < 2) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = index % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  function next() { goTo(current + 1); }

  function start() { timer = setInterval(next, 5500); }
  function reset()  { clearInterval(timer); start(); }

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.slide, 10));
      reset();
    });
  });

  start();
}

// ============================================
// PAGE INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Render product grids if containers exist
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) renderProductGrid('productsGrid', getProducts());

  const featuredGrid = document.getElementById('featuredGrid');
  if (featuredGrid) renderProductGrid('featuredGrid', getFeaturedProducts());

  // Bind any static product cards (in case of fallback HTML)
  bindProductCards();

  // Hero slider
  initHeroSlider();

  // Scroll reveal
  initReveal();
});
