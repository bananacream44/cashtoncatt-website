/* ============================================
   CASHTONCATT — Cart
   ============================================ */

// ============================================
// Cart State
// ============================================

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cc_cart') || '[]');
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cc_cart', JSON.stringify(cart));
  updateCartBadge();
}

function cartAdd(productId, options) {
  const product = getProductById(productId);
  if (!product || !product.available) return;

  const cart = getCart();
  const key = options && options.size ? `${productId}__${options.size}` : productId;
  const existing = cart.find(item => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      key,
      id: productId,
      qty: 1,
      options: options || {}
    });
  }

  saveCart(cart);
  openCart();
}

function cartRemove(key) {
  saveCart(getCart().filter(item => item.key !== key));
  renderCartItems();
}

function cartTotal() {
  return getCart().reduce((sum, item) => {
    const p = getProductById(item.id);
    return p ? sum + p.price * item.qty : sum;
  }, 0);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const count = cartCount();
  document.querySelectorAll('.nav__cart-badge').forEach(el => {
    el.textContent = count;
    el.classList.toggle('visible', count > 0);
  });
}

// ============================================
// Cart HTML Injection
// ============================================

function injectCartHTML() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <!-- Cart Drawer -->
    <div class="cart-drawer" id="cartDrawer" aria-hidden="true">
      <div class="cart-drawer__backdrop" id="cartBackdrop"></div>
      <div class="cart-drawer__panel" role="dialog" aria-label="Shopping cart">
        <div class="cart-drawer__header">
          <span class="label">Cart (<span id="cartItemCount">0</span>)</span>
          <button class="cart-drawer__close" id="cartClose">Close</button>
        </div>
        <div class="cart-drawer__items" id="cartItems"></div>
        <div class="cart-drawer__footer" id="cartFooter"></div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div class="checkout-modal" id="checkoutModal" aria-hidden="true">
      <div class="checkout-modal__backdrop" id="checkoutBackdrop"></div>
      <div class="checkout-modal__panel" role="dialog" aria-label="Place your order">
        <div class="checkout-modal__inner">
          <button class="checkout-modal__back" id="checkoutBack">← Back to Cart</button>
          <span class="label" style="display:block;margin-bottom:16px;">Order</span>
          <h2 class="checkout-modal__title">Place Order</h2>
          <p class="checkout-modal__sub">We'll confirm within 48 hours and send your payment link.</p>

          <form class="checkout-form" id="checkoutForm" novalidate>
            <div class="form-field">
              <label class="form-label" for="cf-name">Full Name</label>
              <input class="form-input" id="cf-name" type="text" name="name" required autocomplete="name" placeholder="Jane Smith">
            </div>
            <div class="form-field">
              <label class="form-label" for="cf-email">Email</label>
              <input class="form-input" id="cf-email" type="email" name="email" required autocomplete="email" placeholder="jane@example.com">
            </div>
            <div class="form-field">
              <label class="form-label" for="cf-phone">Phone <span style="color:var(--text-muted)">(optional)</span></label>
              <input class="form-input" id="cf-phone" type="tel" name="phone" autocomplete="tel">
            </div>
            <div class="form-field">
              <label class="form-label" for="cf-notes">Notes</label>
              <textarea class="form-input form-textarea" id="cf-notes" name="notes" rows="3" placeholder="Ring size, gift message, special requests..."></textarea>
            </div>
            <div id="checkoutSummary" class="checkout-summary"></div>
            <button type="submit" class="btn btn-primary">Send Order →</button>
            <p class="checkout-footer-note">You won't be charged yet. We'll confirm availability and send an invoice.</p>
          </form>
        </div>
      </div>
    </div>

    <!-- Order Confirmation -->
    <div class="order-confirm" id="orderConfirm" aria-hidden="true">
      <div class="order-confirm__inner">
        <div class="order-confirm__check">✓</div>
        <h2 class="order-confirm__title">Order Sent</h2>
        <p class="order-confirm__text">We'll be in touch within 48 hours to confirm your pieces and send a payment link.</p>
        <button class="btn btn-primary" id="orderConfirmClose" style="max-width:240px;margin:0 auto">Done</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);
}

// ============================================
// Cart Render
// ============================================

function renderCartItems() {
  const cart = getCart();
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  const countEl = document.getElementById('cartItemCount');
  if (!itemsEl || !footerEl) return;

  if (countEl) countEl.textContent = cartCount();

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty.</p>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = cart.map(item => {
    const p = getProductById(item.id);
    if (!p) return '';

    const imgHtml = p.imageUrl
      ? `<img src="${escHtml(p.imageUrl)}" alt="${escHtml(p.name)}">`
      : `<svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="${escHtml(p.svgBg || '#EEE')}"/></svg>`;

    const optionTag = item.options && item.options.size
      ? `<span class="cart-item__option">Size ${escHtml(item.options.size)}</span>` : '';

    return `
      <div class="cart-item">
        <div class="cart-item__image">${imgHtml}</div>
        <div class="cart-item__details">
          <p class="cart-item__name">${escHtml(p.name)}</p>
          <p class="cart-item__meta">${escHtml(p.material)}${optionTag ? ' · ' + item.options.size : ''}</p>
        </div>
        <div class="cart-item__right">
          <p class="cart-item__price">$${p.price}</p>
          <button class="cart-item__remove" data-key="${escHtml(item.key)}">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  itemsEl.querySelectorAll('[data-key]').forEach(btn => {
    btn.addEventListener('click', () => cartRemove(btn.dataset.key));
  });

  const total = cartTotal();
  footerEl.innerHTML = `
    <div class="cart-total-row">
      <span class="label">Subtotal</span>
      <span class="cart-total-amount">$${total}</span>
    </div>
    <p class="cart-lead-note">Handmade to order · 3–4 week lead time</p>
    <button class="btn btn-primary" id="cartProceed">Proceed to Order →</button>
  `;
  document.getElementById('cartProceed')?.addEventListener('click', openCheckout);
}

function renderCheckoutSummary() {
  const el = document.getElementById('checkoutSummary');
  if (!el) return;

  const cart = getCart();
  const rows = cart.map(item => {
    const p = getProductById(item.id);
    if (!p) return '';
    const sizeStr = item.options && item.options.size ? ` (Size ${item.options.size})` : '';
    return `<div class="checkout-summary__row">
      <span>${escHtml(p.name)}${escHtml(sizeStr)} × ${item.qty}</span>
      <span>$${p.price * item.qty}</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="checkout-summary__block">
      <p class="label" style="margin-bottom:12px">Order Summary</p>
      ${rows}
      <div class="checkout-summary__row checkout-summary__total">
        <span>Total</span>
        <span>$${cartTotal()}</span>
      </div>
    </div>
  `;
}

// ============================================
// Open / Close
// ============================================

function openCart() {
  renderCartItems();
  const el = document.getElementById('cartDrawer');
  el?.classList.add('open');
  el?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const el = document.getElementById('cartDrawer');
  el?.classList.remove('open');
  el?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openCheckout() {
  renderCheckoutSummary();
  closeCart();
  const el = document.getElementById('checkoutModal');
  el?.classList.add('open');
  el?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  const el = document.getElementById('checkoutModal');
  el?.classList.remove('open');
  el?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ============================================
// Order Submission
// ============================================

function submitOrder(form) {
  const data = new FormData(form);
  const name  = data.get('name')  || '';
  const email = data.get('email') || '';
  const phone = data.get('phone') || '';
  const notes = data.get('notes') || '';

  const cart = getCart();
  const itemLines = cart.map(item => {
    const p = getProductById(item.id);
    if (!p) return '';
    const sizeStr = item.options && item.options.size ? ` (Size ${item.options.size})` : '';
    return `${p.name}${sizeStr} × ${item.qty}  —  $${p.price * item.qty}`;
  }).filter(Boolean).join('\n');

  const total = cartTotal();

  const subject = `New Order — cashtoncatt`;
  const body = [
    `New order received at chastoncatt.com`,
    ``,
    `Name:  ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    ``,
    `Order:`,
    itemLines,
    ``,
    `Total: $${total}`,
    ``,
    `Notes: ${notes || 'None'}`,
    ``,
    `—`,
    `Please confirm availability and send payment link to ${email}`
  ].join('\n');

  window.location.href = `mailto:hello@chastoncatt.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  setTimeout(() => {
    saveCart([]);
    closeCheckout();
    const confirm = document.getElementById('orderConfirm');
    confirm?.classList.add('open');
    confirm?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }, 400);
}

// ============================================
// Init
// ============================================

function initCart() {
  injectCartHTML();
  updateCartBadge();

  document.getElementById('cartBackdrop')?.addEventListener('click', closeCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);

  document.addEventListener('click', e => {
    if (e.target.closest('#cartToggle')) openCart();
  });

  document.getElementById('checkoutBackdrop')?.addEventListener('click', closeCheckout);
  document.getElementById('checkoutBack')?.addEventListener('click', () => {
    closeCheckout();
    openCart();
  });

  document.getElementById('checkoutForm')?.addEventListener('submit', e => {
    e.preventDefault();
    submitOrder(e.target);
  });

  document.getElementById('orderConfirmClose')?.addEventListener('click', () => {
    document.getElementById('orderConfirm')?.classList.remove('open');
    document.getElementById('orderConfirm')?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('cartDrawer')?.classList.contains('open')) closeCart();
    if (document.getElementById('checkoutModal')?.classList.contains('open')) closeCheckout();
  });
}

document.addEventListener('DOMContentLoaded', initCart);
