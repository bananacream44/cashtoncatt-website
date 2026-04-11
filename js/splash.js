/* ============================================
   CASHTONCATT — Splash / Site Status
   ============================================ */

const SITE_STATUS_KEY  = 'cc_site_open';
const BYPASS_USERS_KEY = 'cc_bypass_users';
const BYPASS_SESSION   = 'cc_bypass_granted';

function isSiteOpen() {
  // Default to open if key not set
  const val = localStorage.getItem(SITE_STATUS_KEY);
  return val === null ? true : val === 'true';
}

function getBypassUsers() {
  try {
    return JSON.parse(localStorage.getItem(BYPASS_USERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function checkBypass(email, password) {
  const users = getBypassUsers();
  return users.some(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash');
  if (!splash) return;

  // If site is open or bypass was already granted this session, hide splash
  if (isSiteOpen() || sessionStorage.getItem(BYPASS_SESSION) === '1') {
    splash.style.display = 'none';
    return;
  }

  // Show splash, hide rest of page
  splash.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  document.getElementById('splashSubmit').addEventListener('click', attemptBypass);
  document.getElementById('splashPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') attemptBypass();
  });

  function attemptBypass() {
    const email    = document.getElementById('splashEmail').value.trim();
    const password = document.getElementById('splashPassword').value;
    const errorEl  = document.getElementById('splashError');

    if (!email || !password) {
      errorEl.textContent = 'Please enter your email and password.';
      return;
    }

    if (checkBypass(email, password)) {
      sessionStorage.setItem(BYPASS_SESSION, '1');
      splash.style.display = 'none';
      document.body.style.overflow = '';
    } else {
      errorEl.textContent = 'Incorrect credentials.';
    }
  }
});
