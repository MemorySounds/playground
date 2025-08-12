const routes = {
  "#/": "pages/home.html",
  "#/presentation": "pages/presentation.html",
  "#/references": "pages/references.html",
  "#/archive": "pages/archive.html",
  "#/contact": "pages/contact.html"
};

async function loadPage(hash) {
  const file = routes[hash] || routes["#/"];
  console.log(file);
  const html = await fetch(file).then(res => res.text());
  console.log(html);
  document.getElementById("app").innerHTML = html;
  setupLanguageToggle();
}

function navigate(event) {
  if (event.target.matches("[data-link]")) {
    event.preventDefault();
    const url = event.target.getAttribute("href");
    location.hash = url;
  }
}

window.addEventListener("hashchange", () => loadPage(location.hash));
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("ready"); // Add as early as possible
  document.body.addEventListener("click", navigate);
  loadPage(location.hash || "#/");
});

// --- Language toggle logic ---
function setupLanguageToggle() {
  const languageToggle = document.getElementById("language-toggle");
  const contentFr = document.getElementById("content-fr");
  const contentEn = document.getElementById("content-en");

  if (languageToggle && contentFr && contentEn) {
    languageToggle.onclick = function () {
      if (contentFr.style.display === "none") {
        contentFr.style.display = "block";
        contentEn.style.display = "none";
        languageToggle.textContent = "ENGLISH";
        localStorage.setItem("language", "fr");
      } else {
        contentFr.style.display = "none";
        contentEn.style.display = "block";
        languageToggle.textContent = "FRANÇAIS";
        localStorage.setItem("language", "en");
      }
    };

    // Set initial state based on localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "en") {
      contentFr.style.display = "none";
      contentEn.style.display = "block";
      languageToggle.textContent = "FRANÇAIS";
    } else {
      contentFr.style.display = "block";
      contentEn.style.display = "none";
      languageToggle.textContent = "ENGLISH";
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
  const isExpanded = mainHeader.classList.contains('expanded');
  mainHeader.classList.toggle('expanded');
  mainMenuToggle.classList.toggle('open');
});

// Close main menu when clicking nav links
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-link]')) {
    mainHeader.classList.remove('expanded');
    mainMenuToggle.classList.remove('open');
  }
});

// Close main menu when clicking outside
document.addEventListener('click', (e) => {
  if (!mainHeader.contains(e.target)) {
    mainHeader.classList.remove('expanded');
    mainMenuToggle.classList.remove('open');
  }
});

// Audio menu toggle (mobile only)
if (audioMenuToggle) {
  audioMenuToggle.addEventListener('click', () => {
    const isOpen = rightAudioMenu.classList.contains('open');
    rightAudioMenu.classList.toggle('open');
    audioMenuToggle.classList.toggle('open');
  });

  // Close audio menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!rightAudioMenu.contains(e.target) && !audioMenuToggle.contains(e.target)) {
      rightAudioMenu.classList.remove('open');
      audioMenuToggle.classList.remove('open');
    }
  });
}