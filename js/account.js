/* ============================================
   CASHTONCATT — Account
   ============================================ */

// ============================================
// Account State (localStorage)
// ============================================

const ACCOUNT_KEY = 'cc_account';

function getAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function saveAccount(data) {
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(data));
}

function clearAccount() {
  localStorage.removeItem(ACCOUNT_KEY);
}

// Simple hash for password storage (not cryptographic — for demo/local use only)
function hashPassword(pw) {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

// ============================================
// Account Panel UI
// ============================================

function renderAccountPanel() {
  const body = document.getElementById('accountPanelBody');
  const title = document.getElementById('accountPanelTitle');
  const account = getAccount();

  if (account) {
    title.textContent = 'Account';
    body.innerHTML = `
      <p class="account-logged-in__name">${escapeHtml(account.name)}</p>
      <p class="account-logged-in__email">${escapeHtml(account.email)}</p>
      <button class="account-logged-in__signout" id="accountSignOut">Sign out</button>
    `;
    document.getElementById('accountSignOut').addEventListener('click', () => {
      clearAccount();
      updateAccountButton();
      renderAccountPanel();
    });
  } else {
    renderLoginForm();
  }
}

function renderLoginForm() {
  const body = document.getElementById('accountPanelBody');
  const title = document.getElementById('accountPanelTitle');
  title.textContent = 'Sign In';
  body.innerHTML = `
    <h3>Welcome back</h3>
    <p>Sign in to your cashtoncatt account.</p>
    <div id="accountFormError" style="display:none;color:#c00;font-size:12px;margin-bottom:12px;"></div>
    <div class="account-form__field">
      <label for="loginEmail">Email</label>
      <input type="email" id="loginEmail" autocomplete="email" placeholder="you@example.com">
    </div>
    <div class="account-form__field">
      <label for="loginPassword">Password</label>
      <input type="password" id="loginPassword" autocomplete="current-password" placeholder="••••••••">
    </div>
    <button class="account-form__submit" id="loginSubmit">Sign In</button>
    <p class="account-form__toggle">Don't have an account? <a id="showRegister">Create one</a></p>
  `;

  document.getElementById('loginSubmit').addEventListener('click', handleLogin);
  document.getElementById('loginPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('showRegister').addEventListener('click', renderRegisterForm);
}

function renderRegisterForm() {
  const body = document.getElementById('accountPanelBody');
  const title = document.getElementById('accountPanelTitle');
  title.textContent = 'Create Account';
  body.innerHTML = `
    <h3>Create account</h3>
    <p>Join cashtoncatt to track orders and save your details.</p>
    <div id="accountFormError" style="display:none;color:#c00;font-size:12px;margin-bottom:12px;"></div>
    <div class="account-form__field">
      <label for="regName">Full Name</label>
      <input type="text" id="regName" autocomplete="name" placeholder="Your name">
    </div>
    <div class="account-form__field">
      <label for="regEmail">Email</label>
      <input type="email" id="regEmail" autocomplete="email" placeholder="you@example.com">
    </div>
    <div class="account-form__field">
      <label for="regPassword">Password</label>
      <input type="password" id="regPassword" autocomplete="new-password" placeholder="Min. 6 characters">
    </div>
    <button class="account-form__submit" id="registerSubmit">Create Account</button>
    <p class="account-form__toggle">Already have an account? <a id="showLogin">Sign in</a></p>
  `;

  document.getElementById('registerSubmit').addEventListener('click', handleRegister);
  document.getElementById('showLogin').addEventListener('click', renderLoginForm);
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('accountFormError');

  if (!email || !password) {
    showFormError('Please enter your email and password.');
    return;
  }

  // Load stored accounts
  const accounts = getStoredAccounts();
  const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hashPassword(password)) {
    showFormError('Incorrect email or password.');
    return;
  }

  saveAccount({ name: user.name, email: user.email });
  updateAccountButton();
  renderAccountPanel();
}

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!name || !email || !password) {
    showFormError('Please fill in all fields.');
    return;
  }
  if (password.length < 6) {
    showFormError('Password must be at least 6 characters.');
    return;
  }

  const accounts = getStoredAccounts();
  if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
    showFormError('An account with this email already exists.');
    return;
  }

  accounts.push({ name, email, passwordHash: hashPassword(password) });
  localStorage.setItem('cc_accounts', JSON.stringify(accounts));

  saveAccount({ name, email });
  updateAccountButton();
  renderAccountPanel();
}

function showFormError(msg) {
  const el = document.getElementById('accountFormError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function getStoredAccounts() {
  try {
    return JSON.parse(localStorage.getItem('cc_accounts') || '[]');
  } catch (e) {
    return [];
  }
}

function updateAccountButton() {
  const btn = document.getElementById('accountToggle');
  if (!btn) return;
  const account = getAccount();
  btn.textContent = account ? account.name.split(' ')[0] : 'Account';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ============================================
// Init
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('accountToggle');
  const panel = document.getElementById('accountPanel');
  const backdrop = document.getElementById('accountBackdrop');
  const closeBtn = document.getElementById('accountClose');

  if (!toggle || !panel) return;

  updateAccountButton();

  function openPanel() {
    renderAccountPanel();
    panel.classList.add('open');
    panel.focus();
  }

  function closePanel() {
    panel.classList.remove('open');
  }

  toggle.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
});
