// ── Stable viewport height (fixes URL-bar jitter on Brave / WKWebView) ──
function setVH() {
  document.documentElement.style.setProperty(
    '--vh',
    `${window.innerHeight * 0.01}px`,
  );
}
setVH();
window.addEventListener('orientationchange', setVH);

// ── Menu toggle ──────────────────────────────────────────────────────────
const mainMenuToggle = document.getElementById('main-menu-toggle');
const audioMenuToggle = document.getElementById('audio-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const rightAudioMenu = document.querySelector('.right-audio-menu');
const languageToggle = document.getElementById('language-toggle');

function closeMenu() {
  mainNav.classList.remove('open');
  mainMenuToggle.classList.remove('open');
  document.body.classList.remove('nav-open');
}

mainMenuToggle.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  const isOpen = mainNav.classList.contains('open');
  document.body.classList.toggle('nav-open', isOpen);
  mainMenuToggle.classList.toggle('open', isOpen);
});

if (audioMenuToggle) {
  audioMenuToggle.addEventListener('click', () => {
    rightAudioMenu.classList.toggle('open');
    audioMenuToggle.classList.toggle('open');
  });
}

// Close menu when a nav link is clicked
document.addEventListener('click', (e) => {
  if (
    e.target.matches('[data-nav-link]') ||
    e.target.matches('#language-toggle')
  ) {
    closeMenu();
  }
});

// Close menu when clicking outside it
document.addEventListener('click', (e) => {
  if (document.body.classList.contains('nav-open')) {
    if (!mainNav.contains(e.target) && !mainMenuToggle.contains(e.target)) {
      closeMenu();
    } else if (
      mainNav.contains(e.target) &&
      !e.target.matches('[data-nav-link]')
    ) {
      closeMenu();
    }
  }
});

// ── Language toggle ──────────────────────────────────────────────────────
// Handles two patterns:
//  1. id="content-fr" / id="content-en"  — single block per page (most pages)
//  2. data-lang="fr" / data-lang="en"    — repeated elements (events cards, etc.)
function setLanguage(lang) {
  // Pattern 1 — single blocks
  const contentFr = document.getElementById('content-fr');
  const contentEn = document.getElementById('content-en');
  if (contentFr) contentFr.style.display = lang === 'fr' ? 'block' : 'none';
  if (contentEn) contentEn.style.display = lang === 'en' ? 'block' : 'none';
  // Pattern 2 — repeated blocks (querySelectorAll handles any number)
  document.querySelectorAll('[data-lang]').forEach((el) => {
    el.style.display = el.dataset.lang === lang ? 'block' : 'none';
  });
  if (languageToggle)
    languageToggle.textContent = lang === 'en' ? 'FRANÇAIS' : 'ENGLISH';
  localStorage.setItem('language', lang);
}

setLanguage(localStorage.getItem('language') || 'fr');
initArchiveGate();

if (languageToggle) {
  languageToggle.addEventListener('click', () => {
    setLanguage(
      (localStorage.getItem('language') || 'fr') === 'fr' ? 'en' : 'fr',
    );
  });
}

// ── Archive password gate ────────────────────────────────────────────────
// Inline scripts inside swapped innerHTML don't execute, so the gate logic
// lives here in the shell and is re-initialised after every navigation.
function initArchiveGate() {
  const input = document.getElementById('password-input');
  if (!input) return;
  const gate = document.getElementById('archive-gate');
  const content = document.getElementById('archive-content');
  const error = document.getElementById('password-error');
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (input.value === gate.dataset.password) {
      gate.style.display = 'none';
      content.style.display = 'block';
    } else {
      if (error) error.style.display = 'block';
      input.value = '';
    }
  });
}

// ── Click event-handler ────────────────────────────────────────
const scrollPosition = {};

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-nav-link]');
  if (!link) return;

  // If it's a back link, use browser history so popstate fires and scroll is restored
  if (link.hasAttribute('data-back')) {
    e.preventDefault();
    history.back();
    return;
  }

  // save current page's scroll position before leaving
  scrollPosition[window.location.pathname] = window.scrollY;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('http') || href.startsWith('//')) return;
  e.preventDefault();
  if (href === window.location.pathname) return;
  history.pushState(null, '', href);
  navigateTo(href);
});

window.addEventListener('popstate', () => {
  navigateTo(window.location.pathname || '/', true);
  setActiveNavLink();
});

function setActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === '/' ? path === '/' : path.startsWith(href);
    link.classList.toggle('active', isActive);
  });
}

setActiveNavLink();

// ── Fetch navigation (keeps audio alive across pages) ────────────────────
// Intercepts nav-link clicks, fetches the target, swaps only <main> content,
// and updates the URL — the audio element in the shell is never destroyed.
async function navigateTo(url, restoreScroll = false) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      window.location.href = url;
      return;
    }
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const newMain = doc.querySelector('main.main-content');
    const currentMain = document.querySelector('main.main-content');
    if (newMain && currentMain) currentMain.innerHTML = newMain.innerHTML;
    document.title = doc.title;
    setLanguage(localStorage.getItem('language') || 'fr');
    initArchiveGate();
    setActiveNavLink();

    // bring the user to the top of the main-content
    requestAnimationFrame(() => {
      if (restoreScroll && scrollPosition[url] != null) {
        window.scrollTo({ top: scrollPosition[url], behavior: 'instant' });
      } else {
        const main = document.querySelector('.main-header');
        if (main)
          window.scrollTo({ top: main.offsetHeight, behavior: 'smooth' });
      }
    });
  } catch (_) {
    window.location.href = url;
  }
}
