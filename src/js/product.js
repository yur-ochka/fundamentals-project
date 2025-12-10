document.addEventListener("DOMContentLoaded", function () {
  const BASE = window.location.origin;

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      id: params.get("id"),
    };
  }

  function getCart() {
    const cartJSON = localStorage.getItem("cart");
    return cartJSON ? JSON.parse(cartJSON) : {};
  }

  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
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
    if (counter) counter.textContent = totalCount;
  }

  async function loadProductData() {
    try {
      const response = await fetch(`${BASE}/src/assets/data.json`);
      const data = await response.json();
      window.loadedProducts = data.data;
      return data.data;
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  }

  function findProductById(products, productId) {
    return products.find((p) => p.id === productId);
  }

  function createStarRating(rating, maxStars = 5) {
    const starsContainer = document.createElement("div");
    starsContainer.className = "star-rating";

    for (let i = 1; i <= maxStars; i++) {
      const star = document.createElement("span");
      star.className = "star";
      if (i <= rating) {
        star.classList.add("full");
        star.innerHTML = "★";
      } else {
        star.classList.add("empty");
        star.innerHTML = "☆";
      }
      starsContainer.appendChild(star);
    }

    return starsContainer;
  }

  function populateProductData(product) {
    if (!product) return;

    document.getElementById("title").textContent = product.name;
    document.getElementById("price").textContent = `$${product.price}`;

    const ratingContainer = document.getElementById(
      "product__info-rating-display"
    );

    const ratingContainerUserRewiew = document.getElementById(
      "product__texts-review-display"
    );
    if (ratingContainer) {
      ratingContainer.innerHTML = "";
      ratingContainer.appendChild(createStarRating(product.rating));
      const ratingText = document.createElement("span");
      ratingText.textContent = ` ${product.rating}/5 (1 Clients Review)`;
      ratingContainer.appendChild(ratingText);
    }
    if (ratingContainerUserRewiew) {
      ratingContainerUserRewiew.innerHTML = "";
      ratingContainerUserRewiew.appendChild(createStarRating(product.rating));
      const ratingText = document.createElement("span");
      ratingContainerUserRewiew.appendChild(ratingText);
    }

    const mainPhoto = document.getElementById("mainPhoto");
    if (mainPhoto) {
      mainPhoto.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}" class="product__photos-main" />`;
    }

    ["thumbnail1", "thumbnail2", "thumbnail3", "thumbnail4"].forEach(
      (thumbId) => {
        const thumb = document.getElementById(thumbId);
        if (thumb)
          thumb.innerHTML = `<img src="${product.imageUrl}" alt="${product.name}" class="product__photos-thumbnail" />`;
      }
    );

    updateSelectOptions(product);
  }

  function updateSelectOptions(product) {
    const sizeSelect = document.getElementById("productSize");
    if (sizeSelect) {
      sizeSelect.innerHTML = '<option value="default">Choose Size</option>';
      const sizeOption = document.createElement("option");
      sizeOption.value = product.size.toLowerCase();
      sizeOption.textContent = product.size;
      sizeSelect.appendChild(sizeOption);
    }

    const colorSelect = document.getElementById("productColor");
    if (colorSelect) {
      colorSelect.innerHTML = '<option value="default">Choose Color</option>';
      const colorOption = document.createElement("option");
      colorOption.value = product.color.toLowerCase();
      colorOption.textContent =
        product.color.charAt(0).toUpperCase() + product.color.slice(1);
      colorSelect.appendChild(colorOption);
    }

    const categorySelect = document.getElementById("productCategory");
    if (categorySelect) {
      categorySelect.innerHTML =
        '<option value="default">Choose Category</option>';
      const catOption = document.createElement("option");
      catOption.value = product.category.toLowerCase().replace(/'/g, "");
      catOption.textContent = product.category;
      categorySelect.appendChild(catOption);
    }
  }

  function initQuantitySelector() {
    const quantityInput = document.getElementById("quantity");
    const decrementBtn = document.querySelector(".decrement");
    const incrementBtn = document.querySelector(".increment");

    if (quantityInput && decrementBtn && incrementBtn) {
      decrementBtn.addEventListener("click", () => {
        let value = parseInt(quantityInput.value);
        if (value > 1) quantityInput.value = value - 1;
      });

      incrementBtn.addEventListener("click", () => {
        let value = parseInt(quantityInput.value);
        if (value < 99) quantityInput.value = value + 1;
      });
    }
  }

  function initAddToCart() {
    const addBtn = document.getElementById("addToCartButton");
    if (!addBtn) return;

    addBtn.addEventListener("click", () => {
      const quantity = parseInt(document.getElementById("quantity").value);
      const size = document.getElementById("productSize").value;
      const color = document.getElementById("productColor").value;
      const category = document.getElementById("productCategory").value;

      if (
        !size ||
        size === "default" ||
        !color ||
        color === "default" ||
        !category ||
        category === "default"
      ) {
        alert("Please select size, color, and category.");
        return;
      }

      const productId = getUrlParams().id;
      const product = window.loadedProducts.find((p) => p.id === productId);
      if (!product) return alert("Product not found!");

      const productToCart = {
        ...product,
        quantity,
        selectedSize: size,
        selectedColor: color,
        selectedCategory: category,
      };

      const cart = getCart();
      const cartKey = `${productId}_${size}_${color}_${category}`;
      if (cart[cartKey]) {
        cart[cartKey].quantity += quantity;
      } else {
        cart[cartKey] = productToCart;
      }

      saveCart(cart);
    });
  }

  function showTab(blocks, activeBlock) {
    blocks.forEach((b) => b.classList.remove("active"));
    activeBlock.classList.add("active");
  }

  function onDetailsTabClick(blocks, detailsBlock, detailsTab, reviewsTab) {
    return () => {
      showTab(blocks, detailsBlock);
      detailsTab.classList.add("active");
      reviewsTab?.classList.remove("active");
    };
  }

  function onReviewsTabClick(blocks, reviewsBlock, detailsTab, reviewsTab) {
    return () => {
      showTab(blocks, reviewsBlock);
      detailsTab?.classList.remove("active");
      reviewsTab.classList.add("active");
    };
  }

  function initTabs() {
    const detailsTab = document.getElementById("details");
    const reviewsTab = document.getElementById("reviews");
    const detailsBlock = document.querySelector(".product__texts-details");
    const reviewsBlock = document.querySelector(".product__texts-reviews");

    const blocks = [detailsBlock, reviewsBlock];

    showTab(blocks, detailsBlock);

    detailsTab?.addEventListener(
      "click",
      onDetailsTabClick(blocks, detailsBlock, detailsTab, reviewsTab)
    );

    reviewsTab?.addEventListener(
      "click",
      onReviewsTabClick(blocks, reviewsBlock, detailsTab, reviewsTab)
    );
  }

  function onStarHover(container, index) {
    return () => updateStars(container, index);
  }

  function onStarOut(container, getSelectedRating) {
    return () => updateStars(container, getSelectedRating());
  }

  function onStarClick(container, index, setSelectedRating) {
    return () => {
      setSelectedRating(index);
      container.dataset.rating = index;
      updateStars(container, index);
    };
  }

  function createInteractiveStars(maxStars = 5) {
    const container = document.createElement("div");
    container.className = "review-stars";

    let selectedRating = 0;
    const getSelectedRating = () => selectedRating;
    const setSelectedRating = (v) => (selectedRating = v);

    for (let i = 1; i <= maxStars; i++) {
      const star = document.createElement("span");
      star.className = "review-star";
      star.dataset.value = i;
      star.innerHTML = "☆";

      star.addEventListener("mouseover", onStarHover(container, i));
      star.addEventListener(
        "mouseout",
        onStarOut(container, getSelectedRating)
      );
      star.addEventListener(
        "click",
        onStarClick(container, i, setSelectedRating)
      );

      container.appendChild(star);
    }

    return container;
  }

  function updateStars(container, activeCount) {
    const stars = container.querySelectorAll(".review-star");
    stars.forEach((star, index) => {
      if (index < activeCount) {
        star.innerHTML = "★";
        star.classList.add("full");
        star.classList.remove("empty");
      } else {
        star.innerHTML = "☆";
        star.classList.remove("full");
        star.classList.add("empty");
      }
    });
  }

  async function loadMayAlsoLikeProducts() {
    try {
      const products = window.loadedProducts;
      const filtered = products.filter((p) =>
        p.blocks.includes("New Products Arrival")
      );

      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }

      const randomFour = filtered.slice(0, 4);
      const container = document.getElementById("mayAlsoLike");
      container.innerHTML = "";

      randomFour.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("product__mayAlsoLike-card");

        card.innerHTML = `
          <div class="product__mayAlsoLike-card__image">
            <a href="/src/html/product.html?id=${product.id}">
              <img src="${product.imageUrl}" alt="${
          product.name
        }" width="100%" height="auto" loading="lazy">
            </a>
            ${
              product.salesStatus
                ? `<button disabled class="btn">SALE</button>`
                : ""
            }
          </div>
          <div class="product__mayAlsoLike-card__info">
            <p class="product__mayAlsoLike-card__title">${product.name}</p>
            <p class="product__mayAlsoLike-card__price">$${product.price}</p>
            <button class="btn product__mayAlsoLike-card__btn">Add to Cart</button>
          </div>
        `;

        container.appendChild(card);
      });

      bindMayAlsoLikeButtons();
    } catch (err) {
      console.error("Error:", err);
    }
  }

  function getProductIdFromCard(card) {
    const title = card.querySelector(
      ".product__mayAlsoLike-card__title"
    )?.textContent;
    return window.loadedProducts.find((p) => p.name === title)?.id || null;
  }

  function addProductToCart(productId) {
    const product = window.loadedProducts.find((p) => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const key = `${productId}_default_default_default`;

    if (cart[key]) {
      cart[key].quantity += 1;
    } else {
      cart[key] = { ...product, quantity: 1 };
    }

    saveCart(cart);
  }

  function bindMayAlsoLikeButtons() {
    const cards = document.querySelectorAll(".product__mayAlsoLike-card");
    const buttons = document.querySelectorAll(
      ".product__mayAlsoLike-card__btn"
    );

    buttons.forEach((btn, index) => {
      btn.addEventListener("click", () => {
        const card = cards[index];
        const productId = getProductIdFromCard(card);
        if (!productId) return;

        addProductToCart(productId);
      });
    });
  }

  async function init() {
    updateCartCount();

    const urlParams = getUrlParams();
    if (!urlParams.id) return console.error("ID invalid");

    const products = await loadProductData();
    const product = findProductById(products, urlParams.id);

    if (!product) {
      const info = document.querySelector(".product__info");
      if (info) info.innerHTML = "<p>No product</p>";
      return;
    }

    populateProductData(product);
    initQuantitySelector();
    initAddToCart();
    initTabs();

    const ratingBlock = document.querySelector(".product__texts-review-rating");
    if (ratingBlock) {
      const stars = createInteractiveStars(5);
      stars.style.cursor = "pointer";

      const oldImg = ratingBlock.querySelector("img");
      if (oldImg) oldImg.remove();

      ratingBlock.appendChild(stars);
    }

    document.getElementById("submit-btn").addEventListener("click", () => {
      const rating = Number(
        document.querySelector(".review-stars")?.dataset.rating || 0
      );
      const reviewText = document.getElementById("review").value.trim();
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!rating) {
        alert("Please, enter rating!");
        return;
      }
      if (!reviewText) {
        alert("Please, enter correct text!");
        return;
      }
      if (!name) {
        alert("Please, enter correct name!");
        return;
      }
      if (!email || !emailRegex.test(email)) {
        alert("Please, enter correct email!");
        return;
      }

      alert("Thank you for your review!");
    });

    await loadMayAlsoLikeProducts();
  }

  init();
});
