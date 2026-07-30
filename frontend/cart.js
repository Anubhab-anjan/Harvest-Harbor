/* ==========================================================================
   AgroMart Dedicated Cart & Checkout Controller with Geolocation
   ========================================================================== */

let cartItems = [];
let appliedCouponDiscount = 0;
let selectedPaymentMethod = "upi";

document.addEventListener("DOMContentLoaded", function () {
  loadCartFromStorage();
  // Scroll Reveal Observer
  const cartCards = document.querySelectorAll(".cart-section-card");
  cartCards.forEach((c) => c.classList.add("reveal-on-scroll"));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("active");
    });
  }, { threshold: 0.1 });
  cartCards.forEach((c) => observer.observe(c));

  // Neumorphic Day/Night Theme setup
  const savedTheme = localStorage.getItem("hh_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  document.querySelectorAll(".theme-switch-wrapper").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("hh_theme", newTheme);
    });
  });
});

function updateThemeIcon(theme) {
  const icon = document.getElementById("themeIcon");
  if (!icon) return;
  icon.className = theme === "light" ? "bx bx-sun" : "bx bx-moon";
}

function loadCartFromStorage() {
  try {
    const data = localStorage.getItem("hh_agromart_cart");
    cartItems = data ? JSON.parse(data) : [];
  } catch (e) {
    cartItems = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem("hh_agromart_cart", JSON.stringify(cartItems));
  } catch (e) {}
}

function renderCartPage() {
  const container = document.getElementById("cartItemsList");
  const countTitle = document.getElementById("cartCountTitle");

  if (!container) return;

  const totalQty = cartItems.reduce((s, i) => s + i.quantity, 0);
  if (countTitle) countTitle.textContent = totalQty;

  if (cartItems.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
        <i class="bx bx-shopping-bag" style="font-size:3.5rem; color:var(--accent-emerald-light);"></i>
        <h4 style="font-size:1.1rem; color:var(--text-main); margin-top:10px;">Your AgroMart Cart is Empty</h4>
        <p style="font-size:0.85rem; margin-top:4px;">Add high-yield seeds, fertilizers, or farm equipment from AgroMart shop.</p>
        <a href="index.html#agromart" class="action-btn-primary" style="display:inline-flex; margin-top:16px;">
          <i class="bx bx-store-alt"></i> Browse AgroMart Shop
        </a>
      </div>
    `;
    updateOrderSummary();
    return;
  }

  container.innerHTML = cartItems
    .map(
      (item) => `
    <div class="cart-item-row" style="padding:14px 16px;">
      <div class="cart-item-info">
        <img src="${item.image}" class="cart-item-thumb" style="width:60px; height:60px;" alt="${item.title}">
        <div>
          <div class="cart-item-title" style="font-size:1rem;">${item.title}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${item.unit || "Unit"}</div>
          <div class="cart-item-price" style="font-size:0.95rem; margin-top:2px;">
            ₹${item.price.toLocaleString("en-IN")} × ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:16px;">
        <div class="cart-qty-controls">
          <button class="cart-qty-btn" onclick="modifyQty(${item.id}, -1)">-</button>
          <span class="cart-qty-num">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="modifyQty(${item.id}, 1)">+</button>
        </div>

        <button onclick="removeCartItem(${item.id})" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:1.3rem; padding:4px;" title="Remove Item">
          <i class="bx bx-trash"></i>
        </button>
      </div>
    </div>
  `
    )
    .join("");

  updateOrderSummary();
}

function modifyQty(productId, delta) {
  const item = cartItems.find((i) => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cartItems = cartItems.filter((i) => i.id !== productId);
  }

  saveCartToStorage();
  renderCartPage();
}

function removeCartItem(productId) {
  cartItems = cartItems.filter((i) => i.id !== productId);
  saveCartToStorage();
  renderCartPage();
  showToast("Item removed from cart");
}

function updateOrderSummary() {
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const farmerDiscount = Math.round(subtotal * 0.05); // 5% Farmer Direct Discount
  const couponDiscAmount = Math.round(subtotal * appliedCouponDiscount);
  const totalDiscount = farmerDiscount + couponDiscAmount;

  const gst = Math.round(subtotal * 0.18);
  const total = Math.max(0, subtotal - totalDiscount);

  document.getElementById("subtotalVal").textContent = `₹${subtotal.toLocaleString("en-IN")}`;
  document.getElementById("discountVal").textContent = `-₹${totalDiscount.toLocaleString("en-IN")}`;
  document.getElementById("gstVal").textContent = `₹${gst.toLocaleString("en-IN")}`;
  document.getElementById("totalVal").textContent = `₹${total.toLocaleString("en-IN")}`;
}

function applyCoupon() {
  const code = document.getElementById("couponCode")?.value.trim().toUpperCase();
  if (code === "HARVEST10" || code === "AGRI10") {
    appliedCouponDiscount = 0.1;
    showToast("Coupon HARVEST10 Applied! 10% Extra Discount");
    updateOrderSummary();
  } else if (code) {
    showToast("Invalid Coupon Code. Try HARVEST10");
  }
}

// --- Geolocation Auto-Detection System ---
function detectUserLocation() {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser");
    return;
  }

  showToast("Detecting current GPS location...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (data && data.address) {
          const addr = data.address;
          const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || "";
          const state = addr.state || "";
          const postcode = addr.postcode || "";
          const road = [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ");

          if (city) document.getElementById("city").value = city;
          if (state) document.getElementById("state").value = state;
          if (postcode) document.getElementById("pincode").value = postcode;
          if (road) document.getElementById("streetAddress").value = road;

          showToast(`Location detected: ${city}, ${state}`);
        } else {
          showToast(`GPS Position: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
      } catch (err) {
        showToast("GPS coordinates acquired.");
      }
    },
    (err) => {
      showToast("Location access denied or unavailable.");
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

function selectPaymentMethod(element, method) {
  selectedPaymentMethod = method;
  document.querySelectorAll(".payment-option-card").forEach((card) => card.classList.remove("selected"));
  element.classList.add("selected");
  const radio = element.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;
}

function submitCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (cartItems.length === 0) {
    showToast("Your cart is empty! Add items before checkout.");
    return;
  }

  handlePlaceOrder();
}

function handlePlaceOrder(e) {
  if (e) e.preventDefault();

  const fullName = document.getElementById("fullName")?.value || "Valued Farmer";
  const street = document.getElementById("streetAddress")?.value || "";
  const city = document.getElementById("city")?.value || "";
  const state = document.getElementById("state")?.value || "";
  const pincode = document.getElementById("pincode")?.value || "";

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const farmerDiscount = Math.round(subtotal * 0.05);
  const couponDiscAmount = Math.round(subtotal * appliedCouponDiscount);
  const total = Math.max(0, subtotal - (farmerDiscount + couponDiscAmount));

  const orderId = "#HH-" + Math.floor(10000 + Math.random() * 90000);
  const addressStr = `${street}, ${city}, ${state} - ${pincode}`;

  const paymentNames = {
    upi: "Instant UPI / QR Code",
    cod: "Cash on Delivery (COD)",
    kisan_card: "Kisan Credit Card (KCC)",
  };

  document.getElementById("confirmOrderId").textContent = orderId;
  document.getElementById("confirmCustomer").textContent = fullName;
  document.getElementById("confirmAddress").textContent = addressStr;
  document.getElementById("confirmPayment").textContent = paymentNames[selectedPaymentMethod] || "UPI";
  document.getElementById("confirmTotal").textContent = `₹${total.toLocaleString("en-IN")}`;

  // Clear cart
  cartItems = [];
  saveCartToStorage();
  renderCartPage();

  // Show Confirmation Modal
  const backdrop = document.getElementById("orderConfirmBackdrop");
  if (backdrop) backdrop.classList.add("active");
}

function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastText");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}
