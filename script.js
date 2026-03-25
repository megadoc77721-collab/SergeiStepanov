const GOOGLE_DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/13yMQpG6YNpLsDqNw5dxl4r9NlPa3SMBE?usp=sharing";

const portfolioSeed = [
  {
    title: "Карточки товара для premium-линейки",
    description: "Продающая структура первого экрана, чистая инфографика и акцент на фактуре продукта.",
    category: "marketplaces",
    label: "Маркетплейсы"
  },
  {
    title: "Печатный каталог и рекламные вставки",
    description: "Минималистичная полиграфия с премиальной версткой и тактильным ощущением бренда.",
    category: "print",
    label: "Полиграфия"
  },
  {
    title: "Серия упаковки для retail-полки",
    description: "Упаковка, которая выглядит цельно в линейке и уверенно выделяется в окружении.",
    category: "packaging",
    label: "Упаковка"
  },
  {
    title: "Меню с акцентом на food photography",
    description: "Меню и визуальные материалы для заведений с ясной иерархией и дорогой подачей.",
    category: "menu",
    label: "Меню"
  },
  {
    title: "Контент-система для Instagram",
    description: "Сетка и креативы, которые поддерживают бренд и делают подачу цельной от поста к посту.",
    category: "social",
    label: "Соцсети"
  },
  {
    title: "Карточки для e-commerce витрины",
    description: "Адаптация под маркетплейсы и собственные витрины без потери визуального уровня.",
    category: "marketplaces",
    label: "Маркетплейсы"
  },
  {
    title: "Имиджевая полиграфия бренда",
    description: "Лукбук, листовки и брендовые носители с чистым воздухом и выразительной типографикой.",
    category: "print",
    label: "Полиграфия"
  },
  {
    title: "Этикетки и лицевая упаковка",
    description: "Фронтальные поверхности, иконографика и композиция для сильного shelf impact.",
    category: "packaging",
    label: "Упаковка"
  },
  {
    title: "Меню и seasonal promo-материалы",
    description: "Сезонные предложения, тейбл-тенты и меню, выстроенные в единой эстетике.",
    category: "menu",
    label: "Меню"
  },
  {
    title: "Рекламные креативы для соцсетей",
    description: "Stories, посты и промо-визуалы, где бренд ощущается современным и дорогим.",
    category: "social",
    label: "Соцсети"
  }
];

const placeholderPalette = [
  ["#fdfdfd", "#d8e5f5", "#f8cad7"],
  ["#fefefe", "#e0effd", "#e9dffd"],
  ["#fefefe", "#f9dfd3", "#dbe8db"],
  ["#fbfbfd", "#d7e4ff", "#ffe1d2"],
  ["#ffffff", "#dde9f8", "#f7d6df"]
];

const portfolioGrid = document.querySelector("#portfolioGrid");
const miniPreviews = document.querySelector("#miniPreviews");
const portfolioCardTemplate = document.querySelector("#portfolioCardTemplate");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const header = document.querySelector(".site-header");
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = [...document.querySelectorAll(".nav__links a")];
const contactForm = document.querySelector("#contactForm");
const formNote = document.querySelector("#formNote");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector(".lightbox__image");
const lightboxCaption = document.querySelector(".lightbox__caption");
const lightboxClose = document.querySelector(".lightbox__close");
const revealElements = [...document.querySelectorAll(".reveal")];
const parallaxLayers = [...document.querySelectorAll("[data-parallax]")];

let portfolioItems = [];

function getFolderId(url) {
  const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : "";
}

function createPlaceholder(index) {
  const palette = placeholderPalette[index % placeholderPalette.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Portfolio placeholder">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="50%" stop-color="${palette[1]}"/>
          <stop offset="100%" stop-color="${palette[2]}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#g)"/>
      <circle cx="620" cy="220" r="140" fill="rgba(255,255,255,0.45)"/>
      <circle cx="230" cy="780" r="170" fill="rgba(255,255,255,0.25)"/>
      <rect x="84" y="112" width="360" height="26" rx="13" fill="rgba(16,19,27,0.10)"/>
      <rect x="84" y="160" width="270" height="14" rx="7" fill="rgba(16,19,27,0.08)"/>
      <rect x="84" y="666" width="632" height="170" rx="34" fill="rgba(255,255,255,0.34)"/>
      <rect x="118" y="710" width="210" height="18" rx="9" fill="rgba(16,19,27,0.14)"/>
      <rect x="118" y="748" width="320" height="28" rx="14" fill="rgba(16,19,27,0.20)"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function driveImageUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
}

async function fetchGoogleDriveImages() {
  const folderId = getFolderId(GOOGLE_DRIVE_FOLDER_URL);
  if (!folderId) {
    throw new Error("Google Drive folder ID not found.");
  }

  const response = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}#grid`);
  if (!response.ok) {
    throw new Error(`Google Drive request failed with status ${response.status}`);
  }

  const html = await response.text();
  const ids = [...html.matchAll(/[-\w]{25,}/g)]
    .map((match) => match[0])
    .filter((id, index, arr) => arr.indexOf(id) === index && id !== folderId);

  return ids.map((id) => ({
    id,
    src: driveImageUrl(id)
  }));
}

function buildPortfolioItems(images) {
  return portfolioSeed.map((item, index) => {
    const image = images[index];
    return {
      ...item,
      image: image?.src || createPlaceholder(index),
      original: image?.src || createPlaceholder(index),
      isPlaceholder: !image
    };
  });
}

function createCard(item, index) {
  const fragment = portfolioCardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".portfolio-card");
  const button = fragment.querySelector(".portfolio-card__button");
  const image = fragment.querySelector("img");
  const category = fragment.querySelector(".portfolio-card__category");
  const title = fragment.querySelector(".portfolio-card__title");
  const description = fragment.querySelector(".portfolio-card__description");

  card.dataset.category = item.category;
  image.src = item.image;
  image.alt = item.title;
  image.onerror = () => {
    image.src = createPlaceholder(index);
  };

  category.textContent = item.label;
  title.textContent = item.title;
  description.textContent = item.description;

  button.addEventListener("click", () => openLightbox(item.original, item.title));
  return fragment;
}

function renderPortfolio(items) {
  portfolioGrid.innerHTML = "";
  items.forEach((item, index) => portfolioGrid.append(createCard(item, index)));
  observeReveals([...portfolioGrid.querySelectorAll(".reveal")]);
}

function renderMiniPreviews(items) {
  miniPreviews.innerHTML = "";
  items.slice(0, 3).forEach((item, index) => {
    const preview = document.createElement("div");
    preview.className = "mini-preview";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title;
    image.loading = "lazy";
    image.onerror = () => {
      image.src = createPlaceholder(index + 20);
    };

    preview.append(image);
    miniPreviews.append(preview);
  });
}

function applyFilter(filter) {
  const cards = [...portfolioGrid.querySelectorAll(".portfolio-card")];
  cards.forEach((card) => {
    const isVisible = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !isVisible);
  });
}

function openLightbox(src, alt) {
  lightboxImage.src = src;
  lightboxImage.alt = alt;
  lightboxCaption.textContent = alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.style.overflow = "";
}

function observeReveals(elements) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  elements.forEach((element) => observer.observe(element));
}

function setupParallax() {
  const updateParallax = () => {
    const y = window.scrollY;
    parallaxLayers.forEach((layer) => {
      const speed = Number(layer.dataset.parallax || 0.1);
      layer.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  };

  updateParallax();
  window.addEventListener("scroll", updateParallax, { passive: true });
}

function setupNavigation() {
  const toggleMenu = () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  };

  navToggle.addEventListener("click", toggleMenu);
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

function setupContactForm() {
  if (!contactForm || !formNote) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const recipient = contactForm.dataset.recipient || "";
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!recipient || recipient === "hello@yourdomain.com") {
      formNote.textContent =
        "Укажите ваш рабочий email в атрибуте data-recipient формы, и отправка будет открываться через почтовый клиент.";
      return;
    }

    const subject = encodeURIComponent(`Новый запрос с сайта от ${name}`);
    const body = encodeURIComponent(
      `Имя: ${name}\nEmail: ${email}\n\nСообщение:\n${message}`
    );

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    formNote.textContent = "Письмо подготовлено в почтовом клиенте.";
    contactForm.reset();
  });
}

async function initPortfolio() {
  try {
    const driveImages = await fetchGoogleDriveImages();
    portfolioItems = buildPortfolioItems(driveImages);
  } catch (error) {
    console.warn("Google Drive images unavailable, using placeholders.", error);
    portfolioItems = buildPortfolioItems([]);
  }

  renderPortfolio(portfolioItems);
  renderMiniPreviews(portfolioItems);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    applyFilter(button.dataset.filter);
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});

observeReveals(revealElements);
setupParallax();
setupNavigation();
setupContactForm();
initPortfolio();
