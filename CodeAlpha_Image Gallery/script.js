const images = [
  {
    title: "Quiet morning",
    category: "Nature",
    alt: "Sunlight breaking through a quiet forest of evergreen trees",
    url: "images/quiet-morning-forest.jpg",
  },
  {
    title: "Into the blue",
    category: "Nature",
    alt: "Layers of blue mountain peaks fading into the distance",
    url: "images/into-the-blue-mountains.jpg",
  },
  {
    title: "Open water",
    category: "Nature",
    alt: "Soft turquoise water meeting a rugged coastline",
    url: "images/open-water-coastline.jpg",
  },
  {
    title: "A curious friend",
    category: "Animals",
    alt: "Fox looking curiously toward the camera in its natural habitat",
    url: "images/curious-fox.jpg",
  },
  {
    title: "Wild and free",
    category: "Animals",
    alt: "Elephant walking through a sunlit grassy landscape",
    url: "images/wild-elephant.jpg",
  },
  {
    title: "Little daydreamer",
    category: "Animals",
    alt: "Cat resting in a patch of warm afternoon sunlight",
    url: "images/little-daydreamer-cat.jpg",
  },
  {
    title: "Lines of light",
    category: "Architecture",
    alt: "Modern building facade with clean lines and repeating windows",
    url: "images/lines-of-light-building.jpg",
  },
  {
    title: "City in balance",
    category: "Architecture",
    alt: "Contemporary architecture framed against an open sky",
    url: "images/city-in-balance-architecture.jpg",
  },
  {
    title: "A place to pause",
    category: "Architecture",
    alt: "Minimalist concrete architecture in warm evening light",
    url: "images/place-to-pause-concrete.jpg",
  },
  {
    title: "Quiet connections",
    category: "Technology",
    alt: "Glowing fiber optic cables creating a pattern of blue light",
    url: "images/quiet-connections-fiber-optics.jpg",
  },
  {
    title: "Future in focus",
    category: "Technology",
    alt: "People collaborating around computers in a bright workspace",
    url: "images/future-in-focus-workspace.jpg",
  },
  {
    title: "A brighter idea",
    category: "Technology",
    alt: "Colorful digital lights glowing against a dark background",
    url: "images/brighter-idea-digital-lights.jpg",
  },
];

const gallery = document.querySelector("#gallery-grid");
const galleryCount = document.querySelector("#gallery-count");
const emptyMessage = document.querySelector("#empty-message");
const filterButtons = document.querySelectorAll(".filter-button");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCategory = document.querySelector("#lightbox-category");
const lightboxCounter = document.querySelector("#lightbox-counter");
const closeButton = document.querySelector("#lightbox-close");
const previousButton = document.querySelector("#lightbox-previous");
const nextButton = document.querySelector("#lightbox-next");

let activeCategory = "All";
let visibleImages = [...images];
let activeIndex = 0;
let previouslyFocusedElement = null;

function renderGallery() {
  visibleImages = activeCategory === "All"
    ? [...images]
    : images.filter((image) => image.category === activeCategory);

  gallery.replaceChildren();
  emptyMessage.hidden = visibleImages.length !== 0;
  gallery.hidden = visibleImages.length === 0;
  galleryCount.textContent = `${visibleImages.length} ${visibleImages.length === 1 ? "IMAGE" : "IMAGES"}`;

  const allCount = document.querySelector('[data-category="All"] .filter-count');
  allCount.textContent = `(${images.length})`;

  visibleImages.forEach((image, index) => {
    const card = document.createElement("article");
    card.className = "gallery-card";
    card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;

    const button = document.createElement("button");
    button.className = "image-button";
    button.type = "button";
    button.setAttribute("aria-label", `View ${image.title}, ${image.category}`);

    const img = document.createElement("img");
    img.src = image.url;
    img.alt = image.alt;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
    img.addEventListener("error", () => {
      img.alt = `${image.alt}. Image could not be loaded.`;
      button.disabled = true;
      button.setAttribute("aria-label", `${image.title}, image could not be loaded`);
      button.classList.add("image-unavailable");
    }, { once: true });

    const overlay = document.createElement("span");
    overlay.className = "image-overlay";
    const overlayCategory = document.createElement("small");
    overlayCategory.textContent = image.category;
    const overlayTitle = document.createElement("strong");
    overlayTitle.textContent = image.title;
    overlay.append(overlayCategory, overlayTitle);

    button.append(img, overlay);
    button.addEventListener("click", () => openLightbox(index, button));

    const caption = document.createElement("div");
    caption.className = "card-caption";
    const titleGroup = document.createElement("div");
    const category = document.createElement("span");
    category.className = "card-category";
    category.textContent = image.category;
    const title = document.createElement("h2");
    title.textContent = image.title;
    titleGroup.append(category, title);

    const cardIndex = document.createElement("span");
    cardIndex.className = "card-index";
    cardIndex.setAttribute("aria-hidden", "true");
    cardIndex.textContent = String(index + 1).padStart(2, "0");
    caption.append(titleGroup, cardIndex);

    card.append(button, caption);
    gallery.append(card);
  });
}

function updateLightbox() {
  const image = visibleImages[activeIndex];
  if (!image) return;

  lightboxImage.src = image.url;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = image.title;
  lightboxCategory.textContent = image.category;
  lightboxCounter.textContent = `${activeIndex + 1} / ${visibleImages.length}`;
}

function openLightbox(index, trigger) {
  activeIndex = index;
  previouslyFocusedElement = trigger;
  updateLightbox();
  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  closeButton.focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  if (previouslyFocusedElement?.isConnected) previouslyFocusedElement.focus();
}

function navigateLightbox(direction) {
  if (visibleImages.length < 2) return;
  activeIndex = (activeIndex + direction + visibleImages.length) % visibleImages.length;
  updateLightbox();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderGallery();
  });
});

closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => navigateLightbox(-1));
nextButton.addEventListener("click", () => navigateLightbox(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (lightbox.hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    navigateLightbox(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    navigateLightbox(1);
  }
});

renderGallery();
