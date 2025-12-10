const BASE = window.location.origin;

function loadPartial(part, target, callback) {
  fetch(`${BASE}/src/html/partials/${part}.html`)
    .then((res) => res.text())
    .then((html) => {
      const container = document.getElementById(target);
      if (!container) return;
      container.innerHTML = html;
      callback?.();
    })
    .catch((err) => console.error(`Failed to load ${part}:`, err));
}

function highlightCurrentMenu() {
  const currentPath = window.location.pathname;
  const menuLinks = document.querySelectorAll(".header__menu-link");

  let currentPage = "home";
  if (currentPath.includes("catalog")) currentPage = "catalog";
  else if (currentPath.includes("about")) currentPage = "about";
  else if (currentPath.includes("contact")) currentPage = "contact";

  menuLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === currentPage);
    link.parentElement.classList.toggle(
      "active",
      link.dataset.page === currentPage
    );
  });
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "{}");
  const count = Object.values(cart).reduce((sum, p) => sum + p.quantity, 0);
  const elem = document.querySelector(".header__cart-count");
  if (elem) elem.textContent = count;
}

function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  return {
    size: params.get("size") || "",
    color: params.get("color") || "",
    category: params.get("category") || "",
    sales: params.get("sales") === "1",
  };
}

function setHeaderFiltersFromURL() {
  const filters = getFiltersFromURL();
  const map = {
    filterSize: filters.size || "default",
    filterColor: filters.color || "default",
    filterCategory: filters.category || "default",
    salesStatus: filters.sales,
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = value;
    else el.value = value;
  });
}

function initCatalogFilters() {
  const dropdown = document.querySelector(".header__filters-dropdown");
  if (!dropdown) return;

  dropdown.addEventListener("change", updateFiltersURL);

  const clearBtn = document.getElementById("clearFilters");
  clearBtn?.addEventListener("click", () => {
    window.location.href = "/src/html/catalog.html";
  });
}

function updateFiltersURL() {
  const size = document.getElementById("filterSize")?.value;
  const color = document.getElementById("filterColor")?.value;
  const category = document.getElementById("filterCategory")?.value;
  const sales = document.getElementById("salesStatus")?.checked;

  const params = new URLSearchParams();
  if (size && size !== "default") params.set("size", size);
  if (color && color !== "default") params.set("color", color);
  if (category && category !== "default") params.set("category", category);
  if (sales) params.set("sales", "1");

  window.location.href = `/src/html/catalog.html?${params}`;
}

function initLoginModal() {
  const loginBtn = document.getElementById("logIn");
  loginBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    openLoginModal();
  });
}

function openLoginModal() {
  document.body.classList.add("blurred");

  let modal = document.getElementById("loginModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "loginModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  fetch(`${BASE}/src/html/partials/logIn.html`)
    .then((res) => res.text())
    .then((html) => {
      createLoginModalStructure(modal, html);
      attachLoginModalListeners(modal);
      initLoginFormValidation(modal);
    });
}

function createLoginModalStructure(modal, html) {
  modal.innerHTML = `
    <div class="modal-window">
      <button class="modal-close">&times;</button>
      ${html}
    </div>
  `;
}

function attachLoginModalListeners(modal) {
  modal
    .querySelector(".modal-close")
    ?.addEventListener("click", closeLoginModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLoginModal();
  });
}

function initLoginFormValidation(modal) {
  const loginForm = modal.querySelector(".login-form");
  if (!loginForm) return;

  const emailField = loginForm.querySelector("#logIn-email");
  const passField = loginForm.querySelector("#logIn-password");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  [emailField, passField].forEach((field) =>
    setupFieldValidation(field, emailRegex)
  );

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateLoginForm([emailField, passField], emailRegex)) {
      alert("Login successful!");
      loginForm.reset();
      closeLoginModal();
    }
  });
}

function setupFieldValidation(field, emailRegex) {
  const errorElem = document.createElement("div");
  errorElem.className = "field-error";
  errorElem.style.cssText =
    "color:red;font-size:0.9rem;margin-top:4px;display:none;";
  field.after(errorElem);

  field.addEventListener("input", () => {
    const value = field.value.trim();
    let message = "";

    if (!value) message = "This field is required!";
    else if (field.id === "logIn-email" && !emailRegex.test(value))
      message = "Please enter a valid email!";

    if (message) {
      errorElem.textContent = message;
      errorElem.style.display = "block";
      field.style.borderColor = "red";
    } else {
      errorElem.style.display = "none";
      field.style.borderColor = "";
    }
  });
}

function validateLoginForm(fields, emailRegex) {
  let valid = true;

  fields.forEach((field) => {
    const value = field.value.trim();
    const errorElem = field.nextElementSibling;

    if (!value || (field.id === "logIn-email" && !emailRegex.test(value))) {
      errorElem.style.display = "block";
      field.style.borderColor = "red";
      valid = false;
    }
  });

  return valid;
}

function closeLoginModal() {
  document.body.classList.remove("blurred");
  document.getElementById("loginModal")?.remove();
}

function initCartOverlay() {
  fetch(`${BASE}/src/html/cart.html`)
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);

      const overlay = document.getElementById("cartOverlay");
      const cartBtn = document.getElementById("cart");

      cartBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        overlay.style.display = "flex";

        overlay.addEventListener("click", (e) => {
          if (e.target === overlay) overlay.style.display = "none";
        });

        const tbody = document.querySelector(".cart-table tbody");
        if (window.cartModule && tbody) {
          window.cartModule.renderCart(tbody);
        }
      });
    })
    .catch((err) => console.error("Failed to load cart:", err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadPartial("header", "header", () => {
    highlightCurrentMenu();
    initCatalogFilters();
    setHeaderFiltersFromURL();
    updateCartCount();
    initLoginModal();
    initCartOverlay();
  });

  loadPartial("footer", "footer");
});
