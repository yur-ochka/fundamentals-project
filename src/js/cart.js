function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "{}");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  let count = 0;

  for (const key in cart) {
    count += cart[key].quantity;
  }

  const cartCountElem = document.querySelector(".header__cart-count");
  if (cartCountElem) cartCountElem.textContent = count;
}

function fixImagePath(path) {
  if (!path) return "../assets/images/no-image.png";

  if (path.startsWith("/")) return "" + path;

  return path;
}

function updateCheckout() {
  const cart = getCart();

  let subtotal = 0;

  for (const key in cart) {
    subtotal += cart[key].price * cart[key].quantity;
  }

  const discount = subtotal > 3000 ? subtotal * 0.1 : 0;
  const shipping = 30;
  const total = subtotal + shipping - discount;

  const subtotalElem = document.getElementById("checkout-subtotal");
  const discountElem = document.getElementById("checkout-discount");
  const totalElem = document.getElementById("checkout-total");

  if (subtotalElem) subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
  if (discountElem) discountElem.textContent = `$${discount.toFixed(2)}`;
  if (totalElem) totalElem.textContent = `$${total.toFixed(2)}`;
}

function renderCart(tbody) {
  if (!tbody) return;

  const cart = getCart();
  tbody.innerHTML = "";

  for (const key in cart) {
    const product = cart[key];
    const row = document.createElement("tr");

    const imageSrc = fixImagePath(product.imageUrl);

    row.innerHTML = `
      <td>
        <img 
          src="${imageSrc}"
          alt="${product.name}"
          style="width:70px; height:70px; object-fit:cover; border-radius:6px;"
          onerror="this.src='/src/assets/images/no-image.png'"
        >
      </td>

      <td>${product.name}</td>

      <td>$${product.price.toFixed(2)}</td>

      <td>
        <div class="quantity-selector-cart quantity-selector">
          <div class="quantity-input">
            <button type="button" class="quantity-btn decrement">-</button>
            <input
              type="number"
              value="${product.quantity}"
              min="1"
              max="99"
              data-key="${key}"
            />
            <button type="button" class="quantity-btn increment">+</button>
          </div>
        </div>
      </td>

      <td>$${(product.price * product.quantity).toFixed(2)}</td>

      <td>
        <button class="deleteBtn btn" data-key="${key}">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  }

  initQuantityEvents(tbody);
  initDeleteEvents(tbody);
  initCheckoutButton(tbody);
  initClearButton(tbody);
  initContinueButton();

  updateCheckout();
}

function initQuantityEvents(tbody) {
  tbody.querySelectorAll(".quantity-selector").forEach((selector) => {
    const input = selector.querySelector("input");
    const btnDecrement = selector.querySelector(".decrement");
    const btnIncrement = selector.querySelector(".increment");
    const key = input.dataset.key;

    btnDecrement.addEventListener("click", () => {
      let value = parseInt(input.value);
      if (isNaN(value) || value <= 1) value = 1;
      else value--;
      input.value = value;

      const cart = getCart();
      cart[key].quantity = value;
      saveCart(cart);

      updateCartCount();
      renderCart(tbody);
    });

    btnIncrement.addEventListener("click", () => {
      let value = parseInt(input.value);
      if (isNaN(value)) value = 1;
      else value++;
      input.value = value;

      const cart = getCart();
      cart[key].quantity = value;
      saveCart(cart);

      updateCartCount();
      renderCart(tbody);
    });

    input.addEventListener("change", (e) => {
      let value = parseInt(e.target.value);
      if (isNaN(value) || value < 1) value = 1;
      input.value = value;

      const cart = getCart();
      cart[key].quantity = value;
      saveCart(cart);

      updateCartCount();
      renderCart(tbody);
    });
  });
}

function initDeleteEvents(tbody) {
  tbody.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      const cart = getCart();
      delete cart[key];
      saveCart(cart);

      updateCartCount();
      renderCart(tbody);
    });
  });
  const counter = document.querySelector(".header__cart-count");
  counter.style.display = "none";
}

function initCheckoutButton(tbody) {
  const checkoutbtn = document.getElementById("checkout-btn");
  checkoutbtn.addEventListener("click", () => {
    const cart = {};
    saveCart(cart);

    updateCartCount();
    renderCart(tbody);
    checkoutbtn.innerHTML = "THANK YOU";
    const counter = document.querySelector(".header__cart-count");
    counter.style.display = "none";
    setTimeout(() => {
      checkoutbtn.innerHTML = "CHECKOUT";
    }, 2000);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const waitForCheckoutBtn = setInterval(() => {
    const btn = document.getElementById("checkout-btn");
    if (btn) {
      initCheckoutButton();
      clearInterval(waitForCheckoutBtn);
    }
  }, 200);
});

function initClearButton(tbody) {
  const btn = document.getElementById("clear-btn");
  btn.addEventListener("click", () => {
    const cart = {};
    saveCart(cart);

    updateCartCount();
    renderCart(tbody);
  });
}

function initContinueButton() {
  const btn = document.getElementById("continue-btn");
  btn.addEventListener("click", () => {
    window.location.href = `/src/html/catalog.html`;
  });
}

window.cartModule = {
  getCart,
  saveCart,
  updateCartCount,
  renderCart,
  updateCheckout,
};
