const itemsContainer = document.querySelector(".catalog__items");
const showingText = document.querySelector(".catalog__toprow-showing");
const paginationContainer = document.createElement("div");

paginationContainer.classList.add("catalog__pagination");
document.querySelector(".catalog__pagination").appendChild(paginationContainer);

let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 12;

function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    size: params.get("size") || "",
    color: params.get("color") || "",
    category: params.get("category") || "",
    sales: params.get("sales") === "1",
  };
}

function applyFilters(products) {
  const { size, color, category, sales } = getFiltersFromURL();
  const filters = products.filter(
    (p) =>
      (!size || p.size === size) &&
      (!color || p.color === color) &&
      (!category || p.category === category) &&
      (!sales || p.salesStatus)
  );
  return filters;
}

function setHeaderFiltersFromURL() {
  const { size, color, category, sales } = getFiltersFromURL();

  const sizeSelect = document.getElementById("filterSize");
  const colorSelect = document.getElementById("filterColor");
  const categorySelect = document.getElementById("filterCategory");
  const salesCheckbox = document.getElementById("salesStatus");

  if (sizeSelect) sizeSelect.value = size || "default";
  if (colorSelect) colorSelect.value = color || "default";
  if (categorySelect) categorySelect.value = category || "default";
  if (salesCheckbox) salesCheckbox.checked = sales;
}

function getCart() {
  const cartJSON = localStorage.getItem("cart");
  return cartJSON ? JSON.parse(cartJSON) : {};
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
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

function addToCart(product) {
  const cart = getCart();
  if (cart[product.id]) cart[product.id].quantity += 1;
  else cart[product.id] = { ...product, quantity: 1 };
  saveCart(cart);
  updateCartCount();
  const counter = document.querySelector(".header__cart-count");
  counter.style.display = "block";
}

function renderStatsTable(products) {
  const totalProducts = products.length;
  const totalSets = products.filter((p) => p.id.startsWith("SET")).length;
  const totalRegular = totalProducts - totalSets;
  const onSaleCount = products.filter((p) => p.salesStatus).length;
  const avgPrice = (
    products.reduce((sum, p) => sum + p.price, 0) / totalProducts
  ).toFixed(2);
  const maxPrice = Math.max(...products.map((p) => p.price));
  const minPrice = Math.min(...products.map((p) => p.price));

  const statsContainer = document.createElement("div");
  statsContainer.classList.add("catalog-stats");

  statsContainer.innerHTML = `
    <h3 class="stats-title">📊 Catalog Statistics</h3>
    <table class="stats-table">
      <tbody>
        <tr>
          <td>Total Products</td>
          <td>${totalProducts}</td>
        </tr>
        <tr>
          <td>Product Sets</td>
          <td>${totalSets}</td>
        </tr>
        <tr>
          <td>Individual Products</td>
          <td>${totalRegular}</td>
        </tr>
        <tr>
          <td>On Sale</td>
          <td>${onSaleCount}</td>
        </tr>
        <tr>
          <td>Average Price</td>
          <td>$${avgPrice}</td>
        </tr>
        <tr>
          <td>Price Range</td>
          <td>$${minPrice} - $${maxPrice}</td>
        </tr>
        <tr>
          <td>Categories</td>
          <td>${[...new Set(products.map((p) => p.category))].length}</td>
        </tr>
        <tr>
          <td>Average Rating</td>
          <td>${(
            products.reduce((sum, p) => sum + p.rating, 0) / totalProducts
          ).toFixed(1)}/5</td>
        </tr>
      </tbody>
    </table>
  `;

  const bestSetsSection = document.querySelector(".catalog__bestsets");
  if (bestSetsSection) {
    document.querySelector(".catalog__stats1").appendChild(statsContainer);
  } else {
    const catalogSection = document.querySelector(".catalog");
    if (catalogSection) {
      catalogSection.appendChild(statsContainer);
    }
  }
}

async function loadCatalogProducts() {
  try {
    const response = await fetch("../assets/data.json");
    const json = await response.json();
    products = json.data;

    filteredProducts = applyFilters(products);
    renderCatalog();

    renderBestSets(products);
    renderStatsTable(products);
    setHeaderFiltersFromURL();
    updateCartCount();
  } catch (err) {
    console.error("Error:", err);
  }
}

const statsStyles = `
.catalog-stats {
  margin: 40px 0;
  padding: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.stats-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.stats-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
}

.stats-table tr:last-child td {
  border-bottom: none;
}

.stats-table tr:nth-child(even) {
  background-color: #fafafa;
}

.stats-table tr:hover {
  background-color: #f0f7ff;
}

.stats-table td:first-child {
  font-weight: 500;
  color: #2c3e50;
  width: 60%;
  border-right: 1px solid #f0f0f0;
}

.stats-table td:last-child {
  font-weight: 600;
  color: #27ae60;
  text-align: right;
  width: 40%;
}

/* Адаптивность */
@media (max-width: 768px) {
  .catalog-stats {
    padding: 20px;
    margin: 30px 0;
  }
  
  .stats-title {
    font-size: 20px;
  }
  
  .stats-table td {
    padding: 12px 15px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .catalog-stats {
    display: none !important;
  }
  
  .stats-table td {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .stats-table td:first-child {
    width: 55%;
  }
  
  .stats-table td:last-child {
    width: 45%;
  }
}
`;

if (!document.querySelector("#catalog-stats-styles")) {
  const styleElement = document.createElement("style");
  styleElement.id = "catalog-stats-styles";
  styleElement.textContent = statsStyles;
  document.head.appendChild(styleElement);
}

function renderCatalog() {
  itemsContainer.innerHTML = "";

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  showingText.textContent = `Showing ${
    totalItems === 0 ? 0 : startIndex + 1
  }–${endIndex} of ${totalItems} Results`;

  visibleProducts.forEach((product) => {
    const card = document.createElement("div");
    card.classList.add("catalog__item");

    card.innerHTML = `
      <div class="catalog__item-image">
        <a href="/src/html/product.html?id=${product.id}">
          <img src="${product.imageUrl}" alt="${product.name}" loading="lazy" />
        </a>
        ${
          product.salesStatus
            ? `<button disabled class="btn">SALE</button>`
            : ""
        }
      </div>
      <div class="catalog__item-info">
        <p class="catalog__item-title">${product.name}</p>
        <p class="catalog__item-price">$${product.price}</p>
        <button class="btn catalog__item-btn" data-id="${
          product.id
        }">Add to Cart</button>
      </div>
    `;

    itemsContainer.appendChild(card);
  });

  renderPagination(totalPages);
  bindAddToCartButtons();
}

function renderBestSets(products) {
  const bestSetsContainer = document.querySelector(".catalog__bestsets-items");
  if (!bestSetsContainer) return;

  const bestSets = products.filter((p) => p.id.startsWith("SET"));
  bestSetsContainer.innerHTML = "";

  bestSets.forEach((set) => {
    const item = document.createElement("div");
    item.classList.add("catalog__bestsets-item");

    item.innerHTML = `
      <img
        src="${set.imageUrl}"
        alt="${set.name}"
        class="catalog__bestsets-item-image"
        width="87"
        height="97"
        loading="lazy"
      />
      <div class="catalog__bestsets-item-info">
        <p class="catalog__bestsets-item-name">${set.name}</p>
        <img
          src="/src/assets/images/stars.svg"
          alt="Rating"
          class="catalog__bestsets-item-rating"
          width="${Math.round(set.rating * 16)}"
          height="11"
          loading="lazy"
        />
        <p class="catalog__bestsets-item-price">$${set.price}</p>
      </div>
    `;

    bestSetsContainer.appendChild(item);
  });
}

function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";
  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderCatalog();
    }
  });
  paginationContainer.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.classList.add("active");
    pageBtn.addEventListener("click", () => {
      currentPage = i;
      renderCatalog();
    });
    paginationContainer.appendChild(pageBtn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderCatalog();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

const searchInput = document.getElementById("catalogSearch");
if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase().trim();
    filteredProducts = applyFilters(products).filter((p) =>
      p.name.toLowerCase().includes(query)
    );
    currentPage = 1;
    renderCatalog();
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const query = searchInput.value.toLowerCase().trim();
      if (!query) return;

      const matches = applyFilters(products).filter((p) =>
        p.name.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        const product = matches[0];
        window.location.href = `/src/html/product.html?id=${product.id}`;
      } else alert("No matches");
    }
  });
}

const sortSelect = document.getElementById("catalogSort");
if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    const value = e.target.value;

    switch (value) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "popularity-asc":
        filteredProducts.sort((a, b) => a.popularity - b.popularity);
        break;
      case "popularity-desc":
        filteredProducts.sort((a, b) => b.popularity - a.popularity);
        break;

      case "rating-asc":
        filteredProducts.sort((a, b) => a.rating - b.rating);
        break;
      case "rating-desc":
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;

      default:
        filteredProducts = applyFilters(products);
        break;
    }

    currentPage = 1;
    renderCatalog();
  });
}

function bindAddToCartButtons() {
  document.querySelectorAll(".catalog__item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const product = filteredProducts.find((p) => p.id === id);
      if (product) addToCart(product);
    });
  });
}

loadCatalogProducts();
