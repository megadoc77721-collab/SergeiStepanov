const GOOGLE_DRIVE_FOLDER_URL =
  "https://drive.google.com/drive/folders/146LXjpZJ9ngFc6jnUcuS6pJNCozWSHcM?usp=share_link";
const GOOGLE_DRIVE_MANIFEST_URL = "./drive-manifest.json";

const FALLBACK_DATA = {
  source: "fallback",
  person: "Сергей Степанов",
  categories: [
    {
      id: "prints",
      title: "Принты",
      description: "Флагманская подборка принтов и одежды.",
      mood: "Крупная продуктовая подача с фактурой и глубокими тенями.",
      scenes: [
        "Общий вид изделия",
        "Плавный заход в принт",
        "Макро на фактуру и графику",
        "Финальная сборка композиции"
      ],
      items: [
        { id: "1u9hYlgQ-iPBkt7Mb3T63n-Rd5Weq8YnH", name: "AOT.png", mime: "image/png" },
        { id: "1wQ1qVOM2bS_sZkQoikMkOWKRBmXgKuf0", name: "ChainsawMan.png", mime: "image/png" },
        { id: "1d_-gZLxV94oUmc_Bsg-dO9Xa0BJeyuc8", name: "ХаориПеред.jpg", mime: "image/jpeg" }
      ]
    }
  ]
};

const placeholderPalettes = [
  ["#14141a", "#2a2d38", "#8f7d5a"],
  ["#121216", "#27303a", "#9b8b66"],
  ["#0f1013", "#262028", "#c6a77a"],
  ["#121419", "#212733", "#857766"],
  ["#111217", "#1d1f27", "#d6bf8e"]
];

const header = document.querySelector(".site-header");
const nav = document.querySelector(".nav");
const navBrand = document.querySelector(".nav__brand");
const navToggle = document.querySelector(".nav__toggle");
const navLinks = [...document.querySelectorAll(".nav__links a")];
const heroImage = document.querySelector("#heroImage");
const portfolioTabs = document.querySelector("#portfolioTabs");
const portfolioStage = document.querySelector("#portfolioStage");
const categoryPanelTemplate = document.querySelector("#categoryPanelTemplate");
const projectModal = document.querySelector("#projectModal");
const modalMedia = document.querySelector("#modalMedia");

const state = {
  categories: [],
  activeCategoryId: "",
  sourceMode: "fallback"
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromName(name = "") {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/[_-]+/g, " ").trim();
}

function inferMediaType(item) {
  const mime = String(item.mime || "").toLowerCase();
  const name = String(item.name || "").toLowerCase();

  if (mime.startsWith("video/") || /\.(mp4|mov|webm)$/i.test(name)) {
    return "video";
  }
  if (mime.includes("pdf") || /\.pdf$/i.test(name)) {
    return "pdf";
  }
  return "image";
}

function driveImageUrl(fileId) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function driveImageProxyUrl(fileId) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
}

function drivePreviewUrl(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function driveThumbUrl(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

function createPlaceholder(index, title = "Портфолио") {
  const palette = placeholderPalettes[index % placeholderPalettes.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1500" role="img" aria-label="${title}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="55%" stop-color="${palette[1]}"/>
          <stop offset="100%" stop-color="${palette[2]}"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="1500" fill="url(#g)"/>
      <circle cx="930" cy="290" r="180" fill="rgba(255,255,255,0.12)"/>
      <circle cx="260" cy="1120" r="260" fill="rgba(255,255,255,0.06)"/>
      <rect x="110" y="120" width="420" height="30" rx="15" fill="rgba(255,255,255,0.28)"/>
      <rect x="110" y="172" width="290" height="18" rx="9" fill="rgba(255,255,255,0.16)"/>
      <rect x="110" y="975" width="980" height="300" rx="44" fill="rgba(0,0,0,0.18)"/>
      <rect x="160" y="1040" width="250" height="18" rx="9" fill="rgba(255,255,255,0.16)"/>
      <rect x="160" y="1088" width="520" height="36" rx="18" fill="rgba(255,255,255,0.24)"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

function mediaLabel(type) {
  if (type === "video") {
    return "Видео";
  }
  if (type === "pdf") {
    return "PDF";
  }
  return "Изображение";
}

function presentationTitle(category, item, index) {
  if (item.title) {
    return item.title;
  }

  const imageTitle = {
    prints: "Принт",
    banners: "Баннер",
    events: item.mediaType === "video" ? "Ивент-видео" : "Ивент-кадр",
    menu: "Меню",
    social: "Соцсети",
    photo: item.mediaType === "pdf" ? "Фото-документ" : "Фоторабота"
  };

  const base = imageTitle[category.id] || category.title;
  return `${base} ${String(index + 1).padStart(2, "0")}`;
}

function normalizeData(payload) {
  if (!payload || !Array.isArray(payload.categories)) {
    return FALLBACK_DATA;
  }

  return {
    source: payload.source || "manifest",
    person: payload.person || "Сергей Степанов",
    categories: payload.categories.map((category) => ({
      id: category.id || slugify(category.title),
      title: category.title || "Категория",
      description: category.description || "Подборка работ.",
      mood: category.mood || "Премиальная подача в темной эстетике.",
      scenes: Array.isArray(category.scenes) ? category.scenes : [],
      items: (category.items || []).map((item, index) => {
        const type = inferMediaType(item);
        const thumb = type === "image" ? driveImageProxyUrl(item.id) : drivePreviewUrl(item.id);
        return {
          id: item.id || `${category.id}-${index}`,
          name: titleFromName(item.name || `Файл ${index + 1}`),
          title: presentationTitle(
            { id: category.id || slugify(category.title), title: category.title || "Категория" },
            { ...item, mediaType: type },
            index
          ),
          mime: item.mime || "",
          mediaType: type,
          previewLocal: item.previewLocal || "",
          thumb: item.previewLocal || thumb,
          src: item.previewLocal || thumb,
          preview: drivePreviewUrl(item.id)
        };
      })
    }))
  };
}

async function loadPortfolioData() {
  try {
    const response = await fetch(GOOGLE_DRIVE_MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`);
    }
    const payload = await response.json();
    return { ...normalizeData(payload), sourceMode: "manifest" };
  } catch (error) {
    console.warn("Manifest unavailable, using fallback data.", error);
    return { ...normalizeData(FALLBACK_DATA), sourceMode: "fallback" };
  }
}

function createMediaThumb(item, index, compact = false) {
  const image = document.createElement("img");
  image.src = item.thumb || createPlaceholder(index, item.name);
  image.alt = item.title || item.name;
  image.loading = "lazy";
  image.onerror = () => {
    if (image.dataset.fallbackTried !== "true") {
      image.dataset.fallbackTried = "true";
      image.src = driveImageUrl(item.id);
      return;
    }
    image.src = createPlaceholder(index, item.title || item.name);
  };
  return image;
}

const CATEGORY_LAYOUTS = {
  prints: [
    "story-card--feature",
    "story-card--wide",
    "",
    "",
    "story-card--wide",
    "",
    "",
    "story-card--feature"
  ],
  banners: [
    "project-card--feature",
    "",
    "project-card--tall",
    "",
    "project-card--wide",
    "",
    "project-card--tall",
    "",
    "project-card--wide",
    "",
    "",
    "project-card--feature"
  ],
  events: [
    "project-card--feature",
    "",
    "project-card--wide",
    "",
    "project-card--feature",
    "",
    "",
    "project-card--wide",
    "",
    "project-card--tall"
  ],
  social: [
    "project-card--feature",
    "",
    "project-card--wide",
    "",
    "project-card--feature",
    "",
    "project-card--wide",
    ""
  ],
  photo: [
    "project-card--wide",
    "",
    "",
    "project-card--tall",
    "",
    "project-card--wide",
    "",
    "",
    "project-card--tall",
    "",
    "project-card--wide",
    ""
  ],
  menu: [
    "project-card--feature",
    "",
    "project-card--wide"
  ]
};

function cardVariant(item, index, categoryId) {
  const layout = CATEGORY_LAYOUTS[categoryId];
  if (layout && layout.length > 0) {
    return layout[index % layout.length];
  }

  if (item.mediaType === "video" && index % 5 === 0) {
    return "project-card--feature";
  }
  if (index % 6 === 0) {
    return "project-card--wide";
  }
  if (index % 4 === 0) {
    return "project-card--tall";
  }
  return "";
}

function createProjectCard(item, category, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = `project-card glass-panel reveal ${cardVariant(item, index, category.id)}`.trim();
  card.innerHTML = `
    <div class="project-card__media"></div>
    <div class="project-card__overlay"></div>
    <div class="project-card__sheen"></div>
  `;

  card.querySelector(".project-card__media").append(createMediaThumb(item, index, true));
  card.addEventListener("click", () => openProjectModal(item, category));
  return card;
}

function createStoryCard(item, category, index) {
  const article = document.createElement("article");
  article.className = `story-card glass-panel reveal ${cardVariant(item, index, category.id)}`.trim();
  article.dataset.storyCard = "";
  article.innerHTML = `
    <div class="story-media" data-story-media>
      <div class="story-media__texture" data-story-texture></div>
      <div class="story-media__glow" data-story-glow></div>
      <div class="story-media__close" data-story-close></div>
      <div class="story-media__device" data-story-image-wrap></div>
    </div>
    <div class="story-sheen"></div>
  `;

  article.querySelector("[data-story-image-wrap]").append(createMediaThumb(item, index));
  article.addEventListener("click", () => openProjectModal(item, category));
  return article;
}

function buildCategoryPanel(category, isActive) {
  const fragment = categoryPanelTemplate.content.cloneNode(true);
  const panel = fragment.querySelector(".category-panel");
  panel.id = `panel-${category.id}`;
  panel.dataset.category = category.id;
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", `tab-${category.id}`);
  panel.hidden = !isActive;

  const hero = document.createElement("div");
  hero.className = "category-hero";
  hero.innerHTML = `
    <article class="category-hero__copy glass-panel reveal">
      <h3>${category.title}</h3>
    </article>
  `;
  panel.append(hero);

  if (category.id === "prints") {
    const storyList = document.createElement("div");
    storyList.className = "story-list";
    category.items.forEach((item, index) => storyList.append(createStoryCard(item, category, index)));
    panel.append(storyList);
  } else {
    const grid = document.createElement("div");
    grid.className = "project-grid";
    category.items.forEach((item, index) => grid.append(createProjectCard(item, category, index)));
    panel.append(grid);
  }

  return fragment;
}

function renderTabs(categories) {
  portfolioTabs.innerHTML = "";
  categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tab-button${index === 0 ? " is-active" : ""}`;
    button.id = `tab-${category.id}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(index === 0));
    button.setAttribute("aria-controls", `panel-${category.id}`);
    button.textContent = category.title;
    button.addEventListener("click", () => switchCategory(category.id));
    portfolioTabs.append(button);
  });
}

function renderPanels(categories) {
  portfolioStage.innerHTML = "";
  categories.forEach((category, index) => {
    portfolioStage.append(buildCategoryPanel(category, index === 0));
  });
  observeReveals([...document.querySelectorAll(".reveal")]);
  setupStoryAnimations();
}

function switchCategory(categoryId) {
  if (categoryId === state.activeCategoryId) {
    return;
  }

  const nextPanel = document.querySelector(`#panel-${categoryId}`);
  const currentPanel = document.querySelector(`#panel-${state.activeCategoryId}`);
  const buttons = [...portfolioTabs.querySelectorAll(".tab-button")];

  buttons.forEach((button) => {
    const active = button.id === `tab-${categoryId}`;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });

  const showNext = () => {
    nextPanel.hidden = false;
    if (window.gsap) {
      gsap.fromTo(
        nextPanel,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 1.35, ease: "power3.out" }
      );
    }
    observeReveals([...nextPanel.querySelectorAll(".reveal")]);
    setupStoryAnimations();
  };

  if (currentPanel && window.gsap) {
    gsap.to(currentPanel, {
      autoAlpha: 0,
      y: -14,
      duration: 0.9,
      ease: "power2.out",
      onComplete: () => {
        currentPanel.hidden = true;
        currentPanel.removeAttribute("style");
        showNext();
      }
    });
  } else if (currentPanel) {
    currentPanel.hidden = true;
    showNext();
  } else {
    showNext();
  }

  state.activeCategoryId = categoryId;
}

function setModalMedia(item) {
  modalMedia.innerHTML = "";

  if (item.mediaType === "image") {
    const image = document.createElement("img");
    image.src = item.previewLocal || driveImageProxyUrl(item.id) || item.thumb || item.src;
    image.alt = item.title || item.name;
    image.loading = "eager";
    image.decoding = "async";
    image.onerror = () => {
      if (image.dataset.fallbackTried !== "true") {
        image.dataset.fallbackTried = "true";
        image.src = driveImageUrl(item.id);
        return;
      }
      image.src = createPlaceholder(0, item.title || item.name);
    };
    modalMedia.append(image);
    return;
  }

  if (item.mediaType === "video") {
    const iframe = document.createElement("iframe");
    iframe.src = item.preview;
    iframe.allow = "autoplay; fullscreen";
    iframe.loading = "eager";
    iframe.setAttribute("allowfullscreen", "");
    iframe.title = item.title;
    modalMedia.append(iframe);
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = item.preview;
  iframe.loading = "eager";
  iframe.setAttribute("allowfullscreen", "");
  iframe.title = item.title;
  modalMedia.append(iframe);
}

function openProjectModal(item, category) {
  setModalMedia(item);
  projectModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeProjectModal() {
  projectModal.setAttribute("aria-hidden", "true");
  modalMedia.innerHTML = "";
  document.body.classList.remove("modal-open");
}

function updateSummary(data) {
  const allItems = data.categories.flatMap((category) => category.items);
  const firstImage = allItems.find((item) => item.mediaType === "image") || allItems[0];

  if (firstImage) {
    heroImage.src = firstImage.thumb || firstImage.src;
    heroImage.alt = firstImage.title || firstImage.name;
    heroImage.onerror = () => {
      heroImage.src = createPlaceholder(0, firstImage.title || firstImage.name);
    };
  }
}

function observeReveals(elements) {
  const fresh = elements.filter((element) => !element.dataset.observed);
  if (!fresh.length) {
    return;
  }

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

  fresh.forEach((element) => {
    element.dataset.observed = "true";
    observer.observe(element);
  });
}

function setupNavigation() {
  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  const toggleMenu = () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
    document.body.classList.toggle("nav-open", !expanded);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  navToggle.addEventListener("click", toggleMenu);

  navBrand?.addEventListener("click", (event) => {
    event.preventDefault();
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

function setupParallax() {
  const layers = [...document.querySelectorAll("[data-parallax]")];
  if (!layers.length) {
    return;
  }

  const update = () => {
    const y = window.scrollY;
    layers.forEach((layer) => {
      const speed = Number(layer.dataset.parallax || 0.08);
      layer.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupGsapAnimations() {
  if (!window.gsap) {
    return;
  }

  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.from(".hero__content h1", {
    y: 40,
    autoAlpha: 0,
    duration: 1.35,
    ease: "power3.out",
    delay: 0.18
  });

  gsap.from(".hero__glass", {
    y: 28,
    autoAlpha: 0,
    duration: 1.2,
    ease: "power3.out",
    delay: 0.42
  });

  gsap.to(".hero__media-frame img", {
    scale: 1.06,
    duration: 16,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(".page-orbs span:nth-child(1)", {
    xPercent: 12,
    yPercent: 8,
    duration: 18,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(".page-orbs span:nth-child(2)", {
    xPercent: -10,
    yPercent: 12,
    duration: 22,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.utils.toArray(".project-card").forEach((card, index) => {
    gsap.fromTo(
      card,
      { y: 42, autoAlpha: 0, scale: 0.96 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 1.15,
        ease: "power3.out",
        delay: index * 0.03,
        scrollTrigger: {
          trigger: card,
          start: "top 88%"
        }
      }
    );
  });
}

function setupStoryAnimations() {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.vars.id && trigger.vars.id.startsWith("story-")) {
      trigger.kill();
    }
  });

  gsap.utils.toArray("[data-story-card]").forEach((card, index) => {
    const image = card.querySelector("[data-story-image-wrap] img");
    const glow = card.querySelector("[data-story-glow]");
    const texture = card.querySelector("[data-story-texture]");
    const close = card.querySelector("[data-story-close]");

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        id: `story-${index}`,
        trigger: card,
        start: "top 78%",
        end: "bottom 20%",
        scrub: 1.6
      }
    })
      .fromTo(image, { scale: 0.94, yPercent: 0 }, { scale: 1.08, yPercent: -6, duration: 1 })
      .fromTo(texture, { opacity: 0.16 }, { opacity: 0.4, duration: 1 }, 0)
      .fromTo(glow, { xPercent: -8, yPercent: -6 }, { xPercent: 10, yPercent: 10, duration: 1 }, 0)
      .fromTo(close, { opacity: 0 }, { opacity: 0.88, duration: 1 }, 0.5);
  });
}

function setupModal() {
  projectModal.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-close-modal")) {
      closeProjectModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
    }
  });
}

async function init() {
  setupNavigation();
  setupParallax();
  setupModal();
  observeReveals([...document.querySelectorAll(".reveal")]);

  const data = await loadPortfolioData();
  state.categories = data.categories;
  state.sourceMode = data.sourceMode;
  state.activeCategoryId = data.categories[0]?.id || "";

  renderTabs(data.categories);
  renderPanels(data.categories);
  updateSummary(data);
  setupGsapAnimations();
}

init();
