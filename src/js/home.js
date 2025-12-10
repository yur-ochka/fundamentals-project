const catalogSelected = document.getElementById("catalogSelected");
const catalogArrivals = document.getElementById("catalogArrivals");

const arrivalsPrev = document.getElementById("arrivalsprevBtn");
const arrivalsNext = document.getElementById("arrivalsnextBtn");
const selectedPrev = document.getElementById("selectedPrevBtn");
const selectedNext = document.getElementById("selectedNextBtn");

let arrivalsIndex = 0;
let arrivalsCardsPerView = 4;
let arrivalsItems = [];

let selectedIndex = 0;
let selectedCardsPerView = 4;
let selectedItems = [];

function getCart() {
  const cartJSON = localStorage.getItem("cart");
  return cartJSON ? JSON.parse(cartJSON) : {};
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  if (cart[product.id]) {
    cart[product.id].quantity += 1;
  } else {
    cart[product.id] = { ...product, quantity: 1 };
  }
  saveCart(cart);
  updateCartCount();
  const counter = document.querySelector(".header__cart-count");
  counter.style.display = "block";
}

function updateCartCount() {
  const cart = getCart();
  const totalCount = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const counter = document.querySelector(".header__cart-count");
  if (counter) {
    counter.textContent = totalCount;
  }
}

async function loadSelectedProducts() {
  try {
    const response = await fetch("assets/data.json");
    const json = await response.json();
    const products = json.data;
    window.loadedProducts = products;

    const filtered = products.filter((p) =>
      p.blocks.includes("Selected Products")
    );

    filtered.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("homepage__selected-card");

      card.innerHTML = `
        <div class="homepage__selected-card__image">
          <a href="/src/html/product.html?id=${product.id}">
            <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
          </a>
          ${
            product.salesStatus
              ? `<button disabled class="btn">SALE</button>`
              : ""
          }
        </div>
        <div class="homepage__selected-card__info">
          <p class="homepage__selected-card__title">${product.name}</p>
          <p class="homepage__selected-card__price">$${product.price}</p>
          <button class="btn homepage__selected-card__btn">Add to Cart</button>
        </div>
      `;
      catalogSelected.appendChild(card);
    });

    selectedItems = Array.from(
      document.querySelectorAll(".homepage__selected-card")
    );

    initSelectedCarousel();
    bindAddToCartSelected();
    updateCartCount();
  } catch (err) {
    console.error("Error:", err);
  }
}

async function loadArrivalsProducts() {
  try {
    const response = await fetch("assets/data.json");
    const json = await response.json();
    const products = json.data;
    window.loadedProducts = products;

    const filtered = products.filter((p) =>
      p.blocks.includes("New Products Arrival")
    );

    filtered.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("homepage__arrivals-card");

      card.innerHTML = `
        <div class="homepage__arrivals-card__image">
          <a href="/src/html/product.html?id=${product.id}">
            <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
          </a>
          ${
            product.salesStatus
              ? `<button disabled class="btn">SALE</button>`
              : ""
          }
        </div>
        <div class="homepage__arrivals-card__info">
          <p class="homepage__arrivals-card__title">${product.name}</p>
          <p class="homepage__arrivals-card__price">$${product.price}</p>
          <button class="btn homepage__arrivals-card__btn">Add to Cart</button>
        </div>
      `;
      catalogArrivals.appendChild(card);
    });

    arrivalsItems = Array.from(
      document.querySelectorAll(".homepage__arrivals-card")
    );

    initArrivalsCarousel();
    bindAddToCartArrivals();
    updateCartCount();
  } catch (err) {
    console.error("Error:", err);
  }
}

function bindAddToCartSelected() {
  const buttons = document.querySelectorAll(".homepage__selected-card__btn");
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const product = window.loadedProducts.find((p) =>
        selectedItems[index].querySelector("a").href.includes(p.id)
      );
      if (product) addToCart(product);
    });
  });
}

function bindAddToCartArrivals() {
  const buttons = document.querySelectorAll(".homepage__arrivals-card__btn");
  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const product = window.loadedProducts.find((p) =>
        arrivalsItems[index].querySelector("a").href.includes(p.id)
      );
      if (product) addToCart(product);
    });
  });
}

function initArrivalsCarousel() {
  updateArrivalsCarousel();
  arrivalsNext.addEventListener("click", () => {
    if (arrivalsIndex < arrivalsItems.length - arrivalsCardsPerView) {
      arrivalsIndex++;
      updateArrivalsCarousel();
    }
  });
  arrivalsPrev.addEventListener("click", () => {
    if (arrivalsIndex > 0) {
      arrivalsIndex--;
      updateArrivalsCarousel();
    }
  });
}

function updateArrivalsCarousel() {
  if (!arrivalsItems.length) return;
  const gap = parseFloat(getComputedStyle(catalogArrivals).gap);
  const cardWidth = arrivalsItems[0].offsetWidth + gap;
  catalogArrivals.style.transform = `translateX(-${
    arrivalsIndex * cardWidth
  }px)`;
  catalogArrivals.style.transition = "transform 0.3s ease";
}

function initSelectedCarousel() {
  updateSelectedCarousel();
  selectedNext.addEventListener("click", () => {
    if (selectedIndex < selectedItems.length - selectedCardsPerView) {
      selectedIndex++;
      updateSelectedCarousel();
    }
  });
  selectedPrev.addEventListener("click", () => {
    if (selectedIndex > 0) {
      selectedIndex--;
      updateSelectedCarousel();
    }
  });
}

function updateSelectedCarousel() {
  if (!selectedItems.length) return;
  const gap = parseFloat(getComputedStyle(catalogSelected).gap);
  const cardWidth = selectedItems[0].offsetWidth + gap;
  catalogSelected.style.transform = `translateX(-${
    selectedIndex * cardWidth
  }px)`;
  catalogSelected.style.transition = "transform 0.3s ease";
}

loadSelectedProducts();
loadArrivalsProducts();
updateCartCount();
