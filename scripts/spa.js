const routes = {
  '#/': 'pages/home.html',
  '#/presentation': 'pages/presentation.html',
  '#/references': 'pages/references.html',
  '#/archive': 'pages/archive.html',
  '#/contact': 'pages/contact.html',
};

async function loadPage(hash) {
  const file = routes[hash] || routes['#/'];
  console.log(file);
  const html = await fetch(file).then((res) => res.text());
  console.log(html);
  document.getElementById('app').innerHTML = html;
  setupLanguageToggle();
}

function navigate(event) {
  if (event.target.matches('[data-link]')) {
    event.preventDefault();
    const url = event.target.getAttribute('href');
    location.hash = url;
  }
}

window.addEventListener('hashchange', () => loadPage(location.hash));
document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);
  document.body.classList.add('ready');
  document.body.addEventListener('click', navigate);
  loadPage(location.hash || '#/');
});

// --- Language toggle logic ---
function setupLanguageToggle() {
  const languageToggle = document.getElementById('language-toggle');
  const contentFr = document.getElementById('content-fr');
  const contentEn = document.getElementById('content-en');

  if (languageToggle && contentFr && contentEn) {
    languageToggle.onclick = function () {
      if (contentFr.style.display === 'none') {
        contentFr.style.display = 'block';
        contentEn.style.display = 'none';
        languageToggle.textContent = 'ENGLISH';
        localStorage.setItem('language', 'fr');
      } else {
        contentFr.style.display = 'none';
        contentEn.style.display = 'block';
        languageToggle.textContent = 'FRANÇAIS';
        localStorage.setItem('language', 'en');
      }
    };

    // Set initial state based on localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'en') {
      contentFr.style.display = 'none';
      contentEn.style.display = 'block';
      languageToggle.textContent = 'FRANÇAIS';
    } else {
      contentFr.style.display = 'block';
      contentEn.style.display = 'none';
      languageToggle.textContent = 'ENGLISH';
    }
  }
}

// Menu toggle functionality
const mainMenuToggle = document.getElementById('main-menu-toggle');
const audioMenuToggle = document.getElementById('audio-menu-toggle');
const mainHeader = document.querySelector('.main-header');
const rightAudioMenu = document.querySelector('.right-audio-menu');

// Main navigation menu toggle (expands header downward)
mainMenuToggle.addEventListener('click', () => {
  mainHeader.classList.toggle('expanded');
  document.body.classList.toggle(
    'nav-open',
    mainHeader.classList.contains('expanded'),
  );
  mainMenuToggle.classList.toggle(
    'open',
    mainHeader.classList.contains('expanded'),
  );
});

// Close main menu when clicking nav links
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]') || e.target.matches('#language-toggle')) {
    mainHeader.classList.remove('expanded');
    mainMenuToggle.classList.remove('open');
    document.body.classList.remove('nav-open');

    // Scroll to top of content + offset
    setTimeout(() => {
      const app = document.getElementById('playground-title');
      const offset = 40;
      const top = app.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 0);
  }
});

// Close main menu when clicking outside
document.addEventListener('click', (e) => {
  if (!mainHeader.contains(e.target)) {
    mainHeader.classList.remove('expanded');
    mainMenuToggle.classList.remove('open');
    document.body.classList.remove('nav-open');
  }
});

// Close main menu when clicking outside nav links (dead space or outside menu)
document.addEventListener('click', (e) => {
  const navMenu = document.querySelector('.main-nav');
  const navToggle = document.getElementById('main-menu-toggle');
  // If menu is open
  if (document.body.classList.contains('nav-open')) {
    console.log(e.target);
    // If click is outside navMenu and toggle, close menu
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      mainHeader.classList.remove('expanded');
      mainMenuToggle.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
    // If click is inside navMenu but NOT on a nav link, close menu
    else if (navMenu.contains(e.target) && !e.target.matches('[data-link]')) {
      mainHeader.classList.remove('expanded');
      mainMenuToggle.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
  }
});

// Audio menu toggle (mobile only)
if (audioMenuToggle) {
  audioMenuToggle.addEventListener('click', () => {
    const isOpen = rightAudioMenu.classList.contains('open');
    rightAudioMenu.classList.toggle('open');
    audioMenuToggle.classList.toggle('open');

    // Prevent body scrolling when audio menu is open
    if (rightAudioMenu.classList.contains('open')) {
      document.body.classList.add('audio-menu-open');
    } else {
      document.body.classList.remove('audio-menu-open');
    }
  });

  // Close audio menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !rightAudioMenu.contains(e.target) &&
      !audioMenuToggle.contains(e.target)
    ) {
      rightAudioMenu.classList.remove('open');
      audioMenuToggle.classList.remove('open');
      document.body.classList.remove('audio-menu-open');
    }
  });
}

// --- Swipe gesture to open/close mobile menu ---
(function () {
  const edgeZone = document.getElementById('swipe-edge-zone');
  let touchStartX = 0;
  let touchStartY = 0;
  let currentX = 0;
  let currentY = 0;
  let swipeFromEdge = false;
  const minSwipeDistance = 40; // px horizontal required
  const maxVerticalDelta = 80; // px vertical allowed

  function openMenu() {
    mainHeader.classList.add('expanded');
    mainMenuToggle.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    mainHeader.classList.remove('expanded');
    mainMenuToggle.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  function onTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    currentX = touchStartX;
    currentY = touchStartY;
  }

  function onTouchMove(e) {
    currentX = e.touches[0].clientX;
    currentY = e.touches[0].clientY;
  }

  // Edge zone: capture swipe-to-open from right edge (touch-action: none on the element)
  if (edgeZone) {
    edgeZone.addEventListener(
      'touchstart',
      (e) => {
        swipeFromEdge = true;
        onTouchStart(e);
      },
      { passive: true },
    );

    edgeZone.addEventListener('touchmove', onTouchMove, { passive: true });

    edgeZone.addEventListener(
      'touchend',
      () => {
        if (!swipeFromEdge) return;
        swipeFromEdge = false;
        const deltaX = touchStartX - currentX;
        const deltaY = Math.abs(touchStartY - currentY);
        if (deltaY < maxVerticalDelta && deltaX > minSwipeDistance) {
          openMenu();
        }
      },
      { passive: true },
    );
  }

  // Document: capture swipe-to-close from anywhere when menu is open
  document.addEventListener(
    'touchstart',
    (e) => {
      swipeFromEdge = false;
      onTouchStart(e);
    },
    { passive: true },
  );

  document.addEventListener('touchmove', onTouchMove, { passive: true });

  document.addEventListener(
    'touchend',
    () => {
      if (swipeFromEdge) return; // already handled by edge zone
      if (!window.matchMedia('(max-width: 768px)').matches) return;

      const deltaX = touchStartX - currentX;
      const deltaY = Math.abs(touchStartY - currentY);

      if (deltaY >= maxVerticalDelta) return;

      const isNavOpen = document.body.classList.contains('nav-open');

      if (deltaX < -minSwipeDistance && isNavOpen) {
        closeMenu(); // left-to-right: close
      }
    },
    { passive: true },
  );
})();
