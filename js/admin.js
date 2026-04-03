/* ============================================
   CASHTONCATT — Admin Panel
   ============================================
   Default password: chastoncatt2026
   Change by updating ADMIN_PASSWORD below.
   ============================================ */

const ADMIN_PASSWORD = 'chastoncatt2026';

// ============================================
// Auth
// ============================================

function isAuthed() {
  return sessionStorage.getItem('cc_admin') === '1';
}

function login(password) {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem('cc_admin', '1');
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem('cc_admin');
  location.reload();
}

// ============================================
// Product Management
// ============================================

function adminGetProducts() {
  try {
    const stored = localStorage.getItem('cc_products');
    if (stored) return JSON.parse(stored);
  } catch (e) { /* fall through */ }
  return JSON.parse(JSON.stringify(PRODUCTS_DEFAULT));
}

function adminSaveProducts(products) {
  localStorage.setItem('cc_products', JSON.stringify(products));
}

function adminDeleteProduct(id) {
  if (!confirm(`Delete this product? This cannot be undone.`)) return;
  const products = adminGetProducts().filter(p => p.id !== id);
  adminSaveProducts(products);
  renderProductList();
}

function adminToggleField(id, field) {
  const products = adminGetProducts();
  const p = products.find(p => p.id === id);
  if (p) p[field] = !p[field];
  adminSaveProducts(products);
  renderProductList();
}

function adminResetToDefaults() {
  if (!confirm('Reset all products to defaults? All your changes will be lost.')) return;
  localStorage.removeItem('cc_products');
  renderProductList();
}

// ============================================
// UI — Product List
// ============================================

function renderProductList() {
  const container = document.getElementById('adminProducts');
  if (!container) return;

  const products = adminGetProducts();

  if (products.length === 0) {
    container.innerHTML = `<p class="admin-empty">No products yet. Add your first product below.</p>`;
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Price</th>
          <th>Edition</th>
          <th>Available</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>
              <div class="admin-product-name">${escAdminHtml(p.name)}</div>
              <div class="admin-product-meta">${escAdminHtml(p.material)}</div>
            </td>
            <td>$${p.price}</td>
            <td>${p.editionRemaining} / ${p.edition}</td>
            <td>
              <button class="admin-toggle ${p.available ? 'on' : 'off'}"
                onclick="adminToggleField('${p.id}', 'available')">
                ${p.available ? 'Yes' : 'No'}
              </button>
            </td>
            <td>
              <button class="admin-toggle ${p.featured ? 'on' : 'off'}"
                onclick="adminToggleField('${p.id}', 'featured')">
                ${p.featured ? 'Yes' : 'No'}
              </button>
            </td>
            <td class="admin-actions">
              <button onclick="openEditForm('${p.id}')" class="admin-btn">Edit</button>
              <button onclick="adminDeleteProduct('${p.id}')" class="admin-btn admin-btn-danger">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
      <button onclick="openAddForm()" class="admin-btn-primary">+ Add New Product</button>
      <button onclick="exportProductsJSON()" class="admin-btn">Export JSON</button>
      <button onclick="adminResetToDefaults()" class="admin-btn admin-btn-danger">Reset to Defaults</button>
    </div>
  `;
}

// ============================================
// UI — Product Form
// ============================================

const RING_SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'];

function productFormHTML(product) {
  const p = product || {};
  const isEdit = !!p.id;

  return `
    <form id="productForm" class="admin-form">
      <h3 class="admin-form-title">${isEdit ? 'Edit Product' : 'New Product'}</h3>

      <div class="admin-form-grid">
        <div class="admin-field admin-field-wide">
          <label>Product Name *</label>
          <input type="text" name="name" value="${escAdminHtml(p.name || '')}" required>
        </div>

        <div class="admin-field">
          <label>Price (USD) *</label>
          <input type="number" name="price" value="${p.price || ''}" min="1" required>
        </div>

        <div class="admin-field">
          <label>Material *</label>
          <input type="text" name="material" value="${escAdminHtml(p.material || '')}" required placeholder="e.g. Sterling Silver">
        </div>

        <div class="admin-field">
          <label>Edition Size *</label>
          <input type="number" name="edition" value="${p.edition || ''}" min="1" required>
        </div>

        <div class="admin-field">
          <label>Remaining in Edition</label>
          <input type="number" name="editionRemaining" value="${p.editionRemaining !== undefined ? p.editionRemaining : ''}">
        </div>

        <div class="admin-field">
          <label>Category</label>
          <select name="category">
            ${['pendant','ring','earring','cuff','bracelet','necklace','other'].map(c =>
              `<option value="${c}" ${p.category === c ? 'selected' : ''}>${c}</option>`
            ).join('')}
          </select>
        </div>

        <div class="admin-field">
          <label>Spec 1 Label</label>
          <input type="text" name="spec1Label" value="${escAdminHtml(p.spec1Label || '')}" placeholder="e.g. Dimensions">
        </div>

        <div class="admin-field">
          <label>Spec 1 Value</label>
          <input type="text" name="spec1Value" value="${escAdminHtml(p.spec1Value || '')}" placeholder="e.g. 45mm arc">
        </div>

        <div class="admin-field">
          <label>Spec 2 Label</label>
          <input type="text" name="spec2Label" value="${escAdminHtml(p.spec2Label || '')}" placeholder="e.g. Finish">
        </div>

        <div class="admin-field">
          <label>Spec 2 Value</label>
          <input type="text" name="spec2Value" value="${escAdminHtml(p.spec2Value || '')}" placeholder="e.g. High polish">
        </div>

        <div class="admin-field admin-field-wide">
          <label>Description *</label>
          <textarea name="description" rows="4" required>${escAdminHtml(p.description || '')}</textarea>
        </div>

        <div class="admin-field admin-field-wide">
          <label>Image URL</label>
          <input type="url" name="imageUrl" value="${escAdminHtml(p.imageUrl || '')}" placeholder="https://... (leave blank to use placeholder)">
          <span class="admin-hint">Recommended: Upload to Cloudinary (free) and paste the URL here.</span>
          ${p.imageUrl ? `<img src="${escAdminHtml(p.imageUrl)}" style="max-width:120px;margin-top:8px;border:1px solid #333">` : ''}
          <div style="margin-top:8px">
            <label style="font-weight:normal;color:#888;font-size:12px">Or upload a file (stored in browser):</label><br>
            <input type="file" id="imageUpload" accept="image/*" style="margin-top:4px">
          </div>
        </div>

        <div class="admin-field admin-field-wide">
          <label>Stripe Payment Link</label>
          <input type="url" name="stripeLink" value="${escAdminHtml(p.stripeLink || '')}" placeholder="https://buy.stripe.com/...">
          <span class="admin-hint">Optional. Create at dashboard.stripe.com → Payment Links.</span>
        </div>

        <div class="admin-field">
          <label>SVG Placeholder Background</label>
          <input type="color" name="svgBg" value="${p.svgBg || '#F0F0F0'}">
        </div>

        <div class="admin-field">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" name="available" ${p.available !== false ? 'checked' : ''}>
            Available for purchase
          </label>
        </div>

        <div class="admin-field">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
            <input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}>
            Featured on homepage
          </label>
        </div>
      </div>

      <div class="admin-form-actions">
        <button type="submit" class="admin-btn-primary">${isEdit ? 'Save Changes' : 'Add Product'}</button>
        <button type="button" onclick="closeForm()" class="admin-btn">Cancel</button>
        ${isEdit ? `<input type="hidden" name="_id" value="${escAdminHtml(p.id)}">` : ''}
      </div>
    </form>
  `;
}

function openAddForm() {
  const panel = document.getElementById('adminFormPanel');
  if (!panel) return;
  panel.innerHTML = productFormHTML(null);
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
  bindFormEvents();
}

function openEditForm(id) {
  const p = adminGetProducts().find(prod => prod.id === id);
  if (!p) return;
  const panel = document.getElementById('adminFormPanel');
  if (!panel) return;
  panel.innerHTML = productFormHTML(p);
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
  bindFormEvents();
}

function closeForm() {
  const panel = document.getElementById('adminFormPanel');
  if (panel) panel.style.display = 'none';
}

function bindFormEvents() {
  const form = document.getElementById('productForm');
  if (!form) return;

  // Image file upload → base64
  const imageUpload = document.getElementById('imageUpload');
  imageUpload?.addEventListener('change', () => {
    const file = imageUpload.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Image is over 500KB. For better performance, compress the image first or use a hosted URL.');
    }
    const reader = new FileReader();
    reader.onload = e => {
      form.elements['imageUrl'].value = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    saveProductForm(form);
  });
}

function saveProductForm(form) {
  const data = new FormData(form);
  const existingId = data.get('_id');
  const products = adminGetProducts();

  const name = (data.get('name') || '').trim();
  const id = existingId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const updated = {
    id,
    name,
    category:         data.get('category') || 'other',
    material:         (data.get('material') || '').trim(),
    edition:          parseInt(data.get('edition')) || 1,
    editionRemaining: parseInt(data.get('editionRemaining')) || parseInt(data.get('edition')) || 1,
    price:            parseFloat(data.get('price')) || 0,
    spec1Label:       (data.get('spec1Label') || '').trim(),
    spec1Value:       (data.get('spec1Value') || '').trim(),
    spec2Label:       (data.get('spec2Label') || '').trim(),
    spec2Value:       (data.get('spec2Value') || '').trim(),
    description:      (data.get('description') || '').trim(),
    imageUrl:         (data.get('imageUrl') || '').trim(),
    stripeLink:       (data.get('stripeLink') || '').trim(),
    svgBg:            data.get('svgBg') || '#F0F0F0',
    svgMarkup:        existingId ? (products.find(p => p.id === existingId)?.svgMarkup || '') : '',
    available:        data.get('available') === 'on',
    featured:         data.get('featured') === 'on',
  };

  if (existingId) {
    const idx = products.findIndex(p => p.id === existingId);
    if (idx !== -1) products[idx] = updated;
    else products.push(updated);
  } else {
    if (products.find(p => p.id === id)) {
      alert(`A product with ID "${id}" already exists. Please use a unique name.`);
      return;
    }
    products.push(updated);
  }

  adminSaveProducts(products);
  closeForm();
  renderProductList();

  const notice = document.getElementById('adminNotice');
  if (notice) {
    notice.textContent = `"${name}" ${existingId ? 'updated' : 'added'} successfully.`;
    notice.classList.add('visible');
    setTimeout(() => notice.classList.remove('visible'), 3000);
  }
}

// ============================================
// Export
// ============================================

function exportProductsJSON() {
  const products = adminGetProducts();
  const json = JSON.stringify(products, null, 2);
  const blob = new Blob([`/* cashtoncatt — Products */\nconst PRODUCTS_DEFAULT = ${json};\n`], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'products.js';
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// Utility
// ============================================

function escAdminHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================
// Init
// ============================================

function initAdmin() {
  const loginForm = document.getElementById('adminLoginForm');
  const dashboard = document.getElementById('adminDashboard');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('adminLogout');

  if (isAuthed()) {
    loginForm?.closest('.admin-login-wall')?.remove();
    if (dashboard) dashboard.style.display = '';
    renderProductList();
  } else {
    if (dashboard) dashboard.style.display = 'none';
  }

  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const pwd = loginForm.querySelector('input[type="password"]')?.value;
    if (login(pwd)) {
      loginForm.closest('.admin-login-wall')?.remove();
      if (dashboard) dashboard.style.display = '';
      renderProductList();
    } else {
      if (loginError) loginError.textContent = 'Incorrect password.';
    }
  });

  logoutBtn?.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', initAdmin);
