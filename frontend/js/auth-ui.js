import { getCurrentUser, logoutUser } from './auth.js';

function setVisible(el, show) {
  if (!el) return;
  el.style.display = show ? '' : 'none';
}

function syncAuthButtons(isLoggedIn) {
  setVisible(document.getElementById('loginBtn'), !isLoggedIn);
  setVisible(document.getElementById('logoutBtn'), isLoggedIn);

  document.querySelectorAll('[data-auth="login"]').forEach(el => setVisible(el, !isLoggedIn));
  document.querySelectorAll('[data-auth="logout"]').forEach(el => setVisible(el, isLoggedIn));

  setVisible(document.getElementById('loginBtnMobile'), !isLoggedIn);
  setVisible(document.getElementById('logoutBtnMobile'), isLoggedIn);
}

// Expose logout for inline onclick handlers already present in HTML.
window.userLogout = async function () {
  await logoutUser();
};

// Run synchronously on load — no async wait needed for UI toggling
const user = getCurrentUser();
syncAuthButtons(Boolean(user));
