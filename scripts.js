document.addEventListener("DOMContentLoaded", function () {
  loadHeader();
  setupLanguageToggle();
});

function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (headerPlaceholder) {
    fetch("header.html")
      .then((response) => response.text())
      .then((data) => {
        headerPlaceholder.innerHTML = data;
      })
      .catch((error) => console.error("Error loading header:", error));
  } else {
    console.error("header-placeholder element not found");
  }
}

function setupLanguageToggle() {
  const languageToggle = document.getElementById("language-toggle");
  const contentFr = document.getElementById("content-fr");
  const contentEn = document.getElementById("content-en");

  if (languageToggle && contentFr && contentEn) {
    languageToggle.addEventListener("click", function () {
      if (contentFr.style.display === "none") {
        contentFr.style.display = "block";
        contentEn.style.display = "none";
        languageToggle.textContent = "FR";
        localStorage.setItem("language", "fr");
      } else {
        contentFr.style.display = "none";
        contentEn.style.display = "block";
        languageToggle.textContent = "EN";
        localStorage.setItem("language", "en");
      }
    });

    // Set initial state based on localStorage
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage === "en") {
      contentFr.style.display = "none";
      contentEn.style.display = "block";
      languageToggle.textContent = "EN";
    } else {
      contentFr.style.display = "block";
      contentEn.style.display = "none";
      languageToggle.textContent = "FR";
    }
  } else {
    console.error("Language toggle button or content elements not found");
  }
}
