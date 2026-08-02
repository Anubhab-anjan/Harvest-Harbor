/* ==========================================================================
   Harvest Harbor - Core Interactive Application & Native AgroMart Engine
   ========================================================================== */

const API_BASE_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
  ? "http://127.0.0.1:5000/api"
  : "/api";
let backendMetadata = null;

// --- AgroMart E-Commerce State ---
let agromartCart = [];
let activeAgroCategory = "all";

const initialAgroProducts = [
  {
    id: 1,
    title: "Pusa Gold Hybrid Wheat Seeds",
    category: "seeds",
    price: 850,
    originalPrice: 1100,
    unit: "10 kg Bag",
    badge: "Certified Seed",
    rating: 4.9,
    reviews: 128,
    image: "images/agromart_seeds.png",
  },
  {
    id: 2,
    title: "Bio-Organo NPK Fertilizer & Tonic",
    category: "fertilizer",
    price: 620,
    originalPrice: 800,
    unit: "5L Container",
    badge: "Eco-Friendly",
    rating: 4.8,
    reviews: 94,
    image: "images/agromart_fertilizer.png",
  },
  {
    id: 3,
    title: "Solar Smart Drip Irrigation System",
    category: "equipment",
    price: 12499,
    originalPrice: 18000,
    unit: "1 Acre Kit",
    badge: "40% Subsidy",
    rating: 5.0,
    reviews: 62,
    image: "images/agromart_drip.png",
  },
  {
    id: 4,
    title: "Fresh Harvest Organic Sharbati Wheat",
    category: "produce",
    price: 2450,
    originalPrice: 2800,
    unit: "Per Quintal",
    badge: "Direct Farmer",
    rating: 4.9,
    reviews: 180,
    image: "images/agromart_produce.png",
  },
  {
    id: 5,
    title: "High-Yield Basmati Paddy Seeds (PB-1121)",
    category: "seeds",
    price: 1150,
    originalPrice: 1400,
    unit: "10 kg Bag",
    badge: "Top Rated",
    rating: 4.9,
    reviews: 115,
    image: "images/cropreccom_50.jpg",
  },
  {
    id: 6,
    title: "Smart Soil Moisture & pH Sensor Node",
    category: "equipment",
    price: 3200,
    originalPrice: 4500,
    unit: "Per Node Kit",
    badge: "IoT Enabled",
    rating: 4.7,
    reviews: 42,
    image: "images/agri.jpg",
  },
  {
    id: 7,
    title: "Organic Neem Oil Bio-Pesticide (10000 PPM)",
    category: "fertilizer",
    price: 480,
    originalPrice: 650,
    unit: "1L Bottle",
    badge: "Organic",
    rating: 4.8,
    reviews: 87,
    image: "images/ferti.jpg",
  },
  {
    id: 8,
    title: "Fresh Farm Red Tomatoes Crate",
    category: "produce",
    price: 800,
    originalPrice: 1000,
    unit: "25 kg Crate",
    badge: "Fresh Crop",
    rating: 4.9,
    reviews: 76,
    image: "images/greenry.jpg",
  },
];

let agromartProducts = [...initialAgroProducts];

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleBtn = document.getElementById("sidebarToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const servicesDropdownBtn = document.getElementById("servicesDropdownBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const contactForm = document.getElementById("contactForm");

  // Fetch backend API metadata
  fetchBackendMetadata();

  // Load Cart from LocalStorage
  loadCartFromStorage();

  // Initialize AgroMart Grid
  renderAgroMartProducts(agromartProducts);
  updateCartUI();

  // --- Scroll Reveal Animation Observer ---
  const revealElements = document.querySelectorAll(".content-section, .scheme-card, .about-grid, .contact-container");
  revealElements.forEach((el) => el.classList.add("reveal-on-scroll"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // --- Sidebar & Mobile Drawer Toggle ---
  function toggleSidebar() {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("mobile-open");
      sidebarOverlay.classList.toggle("active");
    } else {
      sidebar.classList.toggle("close");
    }
  }

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", toggleSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("mobile-open");
      sidebarOverlay.classList.remove("active");
    });
  }

  // Dropdown submenu toggle
  if (servicesDropdownBtn) {
    servicesDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (sidebar.classList.contains("close") && window.innerWidth > 768) {
        sidebar.classList.remove("close");
      }
      const parent = servicesDropdownBtn.parentElement;
      parent.classList.toggle("open");
    });
  }

  // --- Neumorphic Day/Night Theme Switcher ---
  const savedTheme = localStorage.getItem("hh_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  document.querySelectorAll(".theme-switch-wrapper").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("hh_theme", newTheme);
      showToast(`Switched to ${newTheme === "dark" ? "Dark Emerald" : "Light Emerald"} theme`);
    });
  });

  function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === "light") {
      themeIcon.className = "bx bx-sun";
    } else {
      themeIcon.className = "bx bx-moon";
    }
  }

  // --- Swiper Carousel Initialization ---
  if (typeof Swiper !== "undefined") {
    if (document.querySelector(".services-swiper-container")) {
      new Swiper(".services-swiper-container", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        },
      });
    }

    if (document.querySelector(".hero-swiper-container")) {
      new Swiper(".hero-swiper-container", {
        effect: "fade",
        fadeEffect: { crossFade: true },
        speed: 1000,
        loop: true,
        autoplay: {
          delay: 3500,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".hero-swiper-pagination",
          clickable: true,
        },
      });
    }
  }

  // --- Contact Form Submission Handler ---
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending Message...';
      }

      const formData = new FormData(contactForm);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          showToast(data.success ? "Success! Your message was sent." : (data.message || "Message sent!"));
          contactForm.reset();
        })
        .catch(() => {
          showToast("Thank you! Message routed to support.");
          contactForm.reset();
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
        });
    });
  }
});

// --- API Metadata & Connectivity ---
function fetchBackendMetadata() {
  fetch(`${API_BASE_URL}/health`)
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "online") {
        backendMetadata = data.metadata;
      }
    })
    .catch((err) => {
      console.warn("Backend running in offline mode.", err);
    });
}

function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem("hh_agromart_cart");
    agromartCart = stored ? JSON.parse(stored) : [];
  } catch (e) {
    agromartCart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem("hh_agromart_cart", JSON.stringify(agromartCart));
  } catch (e) {}
}

// --- Toast Notification System ---
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

// ==========================================================================
// AgroMart Direct E-Commerce Engine
// ==========================================================================

function renderAgroMartProducts(products) {
  const grid = document.getElementById("agromartProductsGrid");
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:40px; color:var(--text-muted);">
        <i class="bx bx-search-alt" style="font-size:3rem; color:var(--accent-emerald-light);"></i>
        <p style="margin-top:10px;">No AgroMart items match your search filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <div class="glass-panel agromart-card">
      <div class="agro-img-box">
        <img src="${p.image}" alt="${p.title}">
        <span class="agro-badge ${p.category}">${p.badge}</span>
      </div>
      <div class="agro-card-body">
        <h4 class="agro-card-title">${p.title}</h4>
        <div class="agro-card-meta">
          <span class="agro-rating"><i class="bx bxs-star"></i> ${p.rating} (${p.reviews})</span>
          <span>• ${p.unit}</span>
        </div>
        <div class="agro-price-row">
          <span class="agro-price-current">₹${p.price.toLocaleString("en-IN")}</span>
          ${p.originalPrice ? `<span class="agro-price-original">₹${p.originalPrice.toLocaleString("en-IN")}</span>` : ""}
        </div>
        <button class="agro-add-btn" onclick="addToCart(${p.id})">
          <i class="bx bx-cart-add"></i> Add to Cart
        </button>
      </div>
    </div>
  `
    )
    .join("");
}

function filterAgroMartProducts() {
  const query = document.getElementById("agromartSearchInput")?.value.toLowerCase().trim() || "";

  const filtered = agromartProducts.filter((p) => {
    const matchesCategory = activeAgroCategory === "all" || p.category === activeAgroCategory;
    const matchesSearch = p.title.toLowerCase().includes(query) || p.badge.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  renderAgroMartProducts(filtered);
}

function setAgroCategory(category, element) {
  activeAgroCategory = category;
  document.querySelectorAll(".filter-pill").forEach((pill) => pill.classList.remove("active"));
  element.classList.add("active");
  filterAgroMartProducts();
}

function addToCart(productId) {
  loadCartFromStorage();
  const item = agromartProducts.find((p) => p.id === productId);
  if (!item) return;

  const existing = agromartCart.find((c) => c.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    agromartCart.push({ ...item, quantity: 1 });
  }

  saveCartToStorage();
  updateCartUI();
  showToast(`Added "${item.title}" to cart! Click Cart to Checkout.`);
}

function updateCartUI() {
  loadCartFromStorage();
  const totalCount = agromartCart.reduce((sum, item) => sum + item.quantity, 0);

  const headerCountEl = document.getElementById("headerCartCount");
  const agromartCountEl = document.getElementById("agromartCartCount");

  if (headerCountEl) headerCountEl.textContent = totalCount;
  if (agromartCountEl) agromartCountEl.textContent = totalCount;
}

function openCartModal() {
  window.location.href = "cart.html";
}

function openSellProduceModal() {
  const backdrop = document.getElementById("sellProduceModalBackdrop");
  if (backdrop) backdrop.classList.add("active");
}

function closeSellProduceModal() {
  const backdrop = document.getElementById("sellProduceModalBackdrop");
  if (backdrop) backdrop.classList.remove("active");
}

function handleSellProduceSubmit(e) {
  e.preventDefault();
  const title = document.getElementById("sellTitle")?.value || "Farmer Harvest Produce";
  const category = document.getElementById("sellCategory")?.value || "produce";
  const price = parseFloat(document.getElementById("sellPrice")?.value || 2000);
  const qty = document.getElementById("sellQty")?.value || "10 Quintals";

  const newProduct = {
    id: Date.now(),
    title: title,
    category: category,
    price: price,
    originalPrice: Math.round(price * 1.15),
    unit: qty,
    badge: "Direct Farmer",
    rating: 5.0,
    reviews: 1,
    image: "images/agromart_produce.png",
  };

  agromartProducts.unshift(newProduct);
  filterAgroMartProducts();
  closeSellProduceModal();
  showToast(`Success! Listed "${title}" on AgroMart.`);

  document.getElementById("sellProduceForm")?.reset();
}

// ==========================================================================
// Interactive AI Tool Modal Logic
// ==========================================================================

function openModal(toolType) {
  const backdrop = document.getElementById("aiModalBackdrop");
  const title = document.getElementById("modalTitle");
  const subtitle = document.getElementById("modalSubtitle");
  const body = document.getElementById("modalBody");

  if (!backdrop || !body) return;

  backdrop.classList.add("active");

  switch (toolType) {
    case "disease":
      title.textContent = "Plant Disease Detection AI";
      subtitle.textContent = "Upload or select a leaf sample to run neural network diagnosis.";
      body.innerHTML = `
        <div class="ai-form-group">
          <label>Select Leaf Sample:</label>
          <div class="ai-sample-images">
            <img src="images/disease.jpg" class="sample-img-option selected" data-filename="PotatoEarlyBlight1.JPG" onclick="selectSample(this)" alt="Sample 1">
            <img src="images/cropreccom_50.jpg" class="sample-img-option" data-filename="PotatoHealthy1.JPG" onclick="selectSample(this)" alt="Sample 2">
            <img src="images/ferti.jpg" class="sample-img-option" data-filename="TomatoYellowCurlVirus1.JPG" onclick="selectSample(this)" alt="Sample 3">
          </div>
        </div>

        <div style="text-align:center; padding:18px; border:2px dashed var(--glass-border); border-radius:var(--radius-md); margin-bottom:16px;">
          <input type="file" id="leafFileInput" accept="image/*" style="display:none;" onchange="handleLeafFileUpload(this)">
          <label for="leafFileInput" style="cursor:pointer; display:block;">
            <i class="bx bx-cloud-upload" style="font-size:2.4rem; color:var(--accent-emerald-light);"></i>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;" id="uploadFileText">Click to select photo from device</p>
          </label>
        </div>

        <button class="action-btn-primary" style="width:100%; justify-content:center;" onclick="runDiseaseAnalysis()">
          <i class="bx bx-scan"></i> Run Live Diagnostic Model
        </button>

        <div class="ai-result-box" id="aiResultBox"></div>
      `;
      break;

    case "recommendation":
      title.textContent = "Smart Crop Recommender";
      subtitle.textContent = "Enter your soil chemical parameters and local climate values.";
      body.innerHTML = `
        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Nitrogen (N):</label>
            <input type="number" class="ai-input-field" value="90" id="nVal">
          </div>
          <div class="ai-form-group">
            <label>Phosphorus (P):</label>
            <input type="number" class="ai-input-field" value="42" id="pVal">
          </div>
          <div class="ai-form-group">
            <label>Potassium (K):</label>
            <input type="number" class="ai-input-field" value="43" id="kVal">
          </div>
          <div class="ai-form-group">
            <label>Soil pH (0 - 14):</label>
            <input type="number" step="0.1" class="ai-input-field" value="6.5" id="phVal">
          </div>
        </div>

        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Avg Temp (°C):</label>
            <input type="number" class="ai-input-field" value="24.5" id="tempVal">
          </div>
          <div class="ai-form-group">
            <label>Humidity (%):</label>
            <input type="number" class="ai-input-field" value="80" id="humidityVal">
          </div>
          <div class="ai-form-group" style="grid-column: span 2;">
            <label>Annual Rainfall (mm):</label>
            <input type="number" class="ai-input-field" value="202" id="rainVal">
          </div>
        </div>

        <button class="action-btn-primary" style="width:100%; justify-content:center;" onclick="runCropRecommendation()">
          <i class="bx bx-magic-wand"></i> Predict Best Crop
        </button>

        <div class="ai-result-box" id="aiResultBox"></div>
      `;
      break;

    case "yield":
      const areasList = backendMetadata?.yield_areas || ["India", "United States", "China", "Brazil", "Canada", "Australia"];
      const itemsList = backendMetadata?.yield_items || ["Maize", "Wheat", "Rice, paddy", "Potatoes", "Soybeans", "Cassava"];

      const areaOptionsHtml = areasList.map((a) => `<option value="${a}" ${a === "India" ? "selected" : ""}>${a}</option>`).join("");
      const itemOptionsHtml = itemsList.map((i) => `<option value="${i}" ${i === "Maize" ? "selected" : ""}>${i}</option>`).join("");

      title.textContent = "Crop Yield Forecast Calculator";
      subtitle.textContent = "Predict estimated harvest volume based on historical weather & pesticides data.";
      body.innerHTML = `
        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Country / Region:</label>
            <select class="ai-input-field" id="yieldArea">${areaOptionsHtml}</select>
          </div>
          <div class="ai-form-group">
            <label>Crop Commodity:</label>
            <select class="ai-input-field" id="yieldItem">${itemOptionsHtml}</select>
          </div>
        </div>

        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Land Area (Acres):</label>
            <input type="number" class="ai-input-field" value="5" id="landArea">
          </div>
          <div class="ai-form-group">
            <label>Target Year:</label>
            <input type="number" class="ai-input-field" value="2024" id="targetYear">
          </div>
        </div>

        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Rainfall (mm/yr):</label>
            <input type="number" class="ai-input-field" value="1485" id="yieldRain">
          </div>
          <div class="ai-form-group">
            <label>Avg Temp (°C):</label>
            <input type="number" step="0.1" class="ai-input-field" value="16.4" id="yieldTemp">
          </div>
          <div class="ai-form-group" style="grid-column: span 2;">
            <label>Pesticides (Tonnes):</label>
            <input type="number" class="ai-input-field" value="121" id="pesticidesVal">
          </div>
        </div>

        <button class="action-btn-primary" style="width:100%; justify-content:center;" onclick="runYieldCalculation()">
          <i class="bx bx-calculator"></i> Calculate ML Yield Forecast
        </button>

        <div class="ai-result-box" id="aiResultBox"></div>
      `;
      break;

    case "fertilizer":
      const soilTypes = backendMetadata?.soil_types || ["Black", "Clayey", "Loamy", "Red", "Sandy"];
      const cropTypes = backendMetadata?.crop_types || ["Barley", "Cotton", "Ground Nuts", "Maize", "Millets", "Oil seeds", "Paddy", "Pulses", "Sugarcane", "Tobacco", "Wheat"];

      const soilOptionsHtml = soilTypes.map((s) => `<option value="${s}" ${s === "Clayey" ? "selected" : ""}>${s}</option>`).join("");
      const fertCropOptionsHtml = cropTypes.map((c) => `<option value="${c}" ${c === "Maize" ? "selected" : ""}>${c}</option>`).join("");

      title.textContent = "Precision Fertilizer Calculator";
      subtitle.textContent = "Optimize soil nutrient dosage and prevent deficiency.";
      body.innerHTML = `
        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Soil Type:</label>
            <select class="ai-input-field" id="fertSoil">${soilOptionsHtml}</select>
          </div>
          <div class="ai-form-group">
            <label>Crop Type:</label>
            <select class="ai-input-field" id="fertCrop">${fertCropOptionsHtml}</select>
          </div>
        </div>

        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Temperature (°C):</label>
            <input type="number" class="ai-input-field" value="26" id="fertTemp">
          </div>
          <div class="ai-form-group">
            <label>Humidity (%):</label>
            <input type="number" class="ai-input-field" value="52" id="fertHumid">
          </div>
          <div class="ai-form-group">
            <label>Soil Moisture (%):</label>
            <input type="number" class="ai-input-field" value="38" id="fertMois">
          </div>
        </div>

        <div class="ai-input-grid">
          <div class="ai-form-group">
            <label>Nitrogen (N):</label>
            <input type="number" class="ai-input-field" value="37" id="fertNitro">
          </div>
          <div class="ai-form-group">
            <label>Potassium (K):</label>
            <input type="number" class="ai-input-field" value="0" id="fertPota">
          </div>
          <div class="ai-form-group">
            <label>Phosphorous (P):</label>
            <input type="number" class="ai-input-field" value="0" id="fertPhos">
          </div>
        </div>

        <button class="action-btn-primary" style="width:100%; justify-content:center;" onclick="runFertilizerCalculation()">
          <i class="bx bx-test-tube"></i> Generate Dosing Prescription
        </button>

        <div class="ai-result-box" id="aiResultBox"></div>
      `;
      break;
  }
}

function closeModal() {
  const backdrop = document.getElementById("aiModalBackdrop");
  if (backdrop) backdrop.classList.remove("active");
}

function selectSample(el) {
  document.querySelectorAll(".sample-img-option").forEach((img) => img.classList.remove("selected"));
  el.classList.add("selected");
}

function handleLeafFileUpload(input) {
  const textEl = document.getElementById("uploadFileText");
  if (input.files && input.files[0]) {
    textEl.textContent = `Selected: ${input.files[0].name}`;
  }
}

// --- Live ML API Calls & Handlers ---

function runDiseaseAnalysis() {
  const resBox = document.getElementById("aiResultBox");
  if (!resBox) return;

  resBox.style.display = "block";
  resBox.innerHTML = `
    <div style="text-align:center; padding:12px; color:var(--accent-emerald-light);">
      <i class="bx bx-loader-alt bx-spin" style="font-size:2rem;"></i>
      <p style="margin-top:6px; font-size:0.9rem;">Connecting to Neural Network Backend...</p>
    </div>
  `;

  const selectedSample = document.querySelector(".sample-img-option.selected");
  const filename = selectedSample ? selectedSample.getAttribute("data-filename") : "PotatoEarlyBlight1.JPG";

  fetch(`${API_BASE_URL}/detect-disease`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sample_name: filename }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        resBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <i class="bx bx-check-shield" style="font-size:1.6rem; color:var(--accent-emerald-light);"></i>
            <h4 style="font-family:var(--font-heading); color:var(--accent-emerald-light); font-size:1.1rem;">Diagnostic Report Generated</h4>
          </div>
          <div style="font-size:0.95rem; color:var(--text-main); margin-bottom:6px;">
            <strong>Detected Condition:</strong> ${data.condition}
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:10px;">
            <strong>AI Confidence:</strong> ${data.confidence}% | <strong>Severity Level:</strong> ${data.severity}
          </div>
          <div style="font-size:0.85rem; padding:10px; background:rgba(0,0,0,0.3); border-radius:var(--radius-sm); border-left:3px solid var(--accent-emerald-light);">
            <strong>Recommended Action:</strong> ${data.recommended_treatment}
          </div>
        `;
        showToast("Disease analysis complete!");
      }
    })
    .catch((err) => {
      console.error(err);
      resBox.innerHTML = `
        <div style="padding:10px; color:#f87171;">
          ⚠️ Backend server unreachable. Check if <code>python backend/app.py</code> is running.
        </div>
      `;
    });
}

function runCropRecommendation() {
  const resBox = document.getElementById("aiResultBox");
  if (!resBox) return;

  const n = parseFloat(document.getElementById("nVal")?.value || 90);
  const p = parseFloat(document.getElementById("pVal")?.value || 42);
  const k = parseFloat(document.getElementById("kVal")?.value || 43);
  const ph = parseFloat(document.getElementById("phVal")?.value || 6.5);
  const temp = parseFloat(document.getElementById("tempVal")?.value || 24.5);
  const humidity = parseFloat(document.getElementById("humidityVal")?.value || 80);
  const rainfall = parseFloat(document.getElementById("rainVal")?.value || 202);

  resBox.style.display = "block";
  resBox.innerHTML = `
    <div style="text-align:center; padding:12px; color:var(--accent-emerald-light);">
      <i class="bx bx-loader-alt bx-spin" style="font-size:2rem;"></i>
      <p style="margin-top:6px; font-size:0.9rem;">Executing Scikit-Learn Model Inference...</p>
    </div>
  `;

  fetch(`${API_BASE_URL}/recommend-crop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ N: n, P: p, K: k, ph: ph, temperature: temp, humidity: humidity, rainfall: rainfall }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        resBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <i class="bx bx-award" style="font-size:1.6rem; color:var(--accent-emerald-light);"></i>
            <h4 style="font-family:var(--font-heading); color:var(--accent-emerald-light); font-size:1.1rem;">Optimal Crop Recommendation</h4>
          </div>
          <div style="font-size:1.2rem; font-weight:700; color:#ffffff; margin-bottom:6px;">
            🌾 Recommended Crop: ${data.recommended_crop}
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            ${data.message}
          </p>
        `;
        showToast(`Recommended crop: ${data.recommended_crop}`);
      }
    })
    .catch((err) => {
      console.error(err);
      resBox.innerHTML = `
        <div style="padding:10px; color:#f87171;">
          ⚠️ Backend API offline. Please launch <code>python backend/app.py</code>.
        </div>
      `;
    });
}

function runYieldCalculation() {
  const resBox = document.getElementById("aiResultBox");
  if (!resBox) return;

  const area = document.getElementById("yieldArea")?.value || "India";
  const item = document.getElementById("yieldItem")?.value || "Maize";
  const landArea = parseFloat(document.getElementById("landArea")?.value || 5);
  const year = parseFloat(document.getElementById("targetYear")?.value || 2024);
  const rain = parseFloat(document.getElementById("yieldRain")?.value || 1485);
  const temp = parseFloat(document.getElementById("yieldTemp")?.value || 16.4);
  const pesticides = parseFloat(document.getElementById("pesticidesVal")?.value || 121);

  resBox.style.display = "block";
  resBox.innerHTML = `
    <div style="text-align:center; padding:12px; color:var(--accent-emerald-light);">
      <i class="bx bx-loader-alt bx-spin" style="font-size:2rem;"></i>
      <p style="margin-top:6px; font-size:0.9rem;">Calculating Decision Tree Regressor Forecast...</p>
    </div>
  `;

  fetch(`${API_BASE_URL}/predict-yield`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Area: area,
      Item: item,
      Year: year,
      average_rain_fall_mm_per_year: rain,
      avg_temp: temp,
      pesticides_tonnes: pesticides,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        const totalYield = (data.estimated_quintals_per_acre * landArea).toFixed(1);
        const estRevenue = (totalYield * 2275).toLocaleString("en-IN");

        resBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <i class="bx bx-trending-up" style="font-size:1.6rem; color:var(--accent-emerald-light);"></i>
            <h4 style="font-family:var(--font-heading); color:var(--accent-emerald-light); font-size:1.1rem;">Harvest Yield Forecast</h4>
          </div>
          <div style="font-size:1.15rem; font-weight:700; color:var(--text-main); margin-bottom:4px;">
            Expected Output: ${totalYield} Quintals (${data.estimated_quintals_per_acre} Quintals / Acre)
          </div>
          <div style="font-size:0.9rem; color:var(--accent-emerald-light); font-weight:600; margin-bottom:8px;">
            Est. Gross Revenue: ₹${estRevenue} (at Benchmark MSP Rates)
          </div>
          <p style="font-size:0.85rem; color:var(--text-muted);">
            Predictive Model Output: ${data.predicted_yield_hg_ha} hg/ha for ${item} in ${area}.
          </p>
        `;
        showToast("Yield forecast calculated!");
      }
    })
    .catch((err) => {
      console.error(err);
      resBox.innerHTML = `
        <div style="padding:10px; color:#f87171;">
          ⚠️ Backend API unreachable. Ensure <code>python backend/app.py</code> is active.
        </div>
      `;
    });
}

function runFertilizerCalculation() {
  const resBox = document.getElementById("aiResultBox");
  if (!resBox) return;

  const soil = document.getElementById("fertSoil")?.value || "Clayey";
  const crop = document.getElementById("fertCrop")?.value || "Maize";
  const temp = parseFloat(document.getElementById("fertTemp")?.value || 26);
  const humid = parseFloat(document.getElementById("fertHumid")?.value || 52);
  const mois = parseFloat(document.getElementById("fertMois")?.value || 38);
  const nitro = parseFloat(document.getElementById("fertNitro")?.value || 37);
  const pota = parseFloat(document.getElementById("fertPota")?.value || 0);
  const phos = parseFloat(document.getElementById("fertPhos")?.value || 0);

  resBox.style.display = "block";
  resBox.innerHTML = `
    <div style="text-align:center; padding:12px; color:var(--accent-emerald-light);">
      <i class="bx bx-loader-alt bx-spin" style="font-size:2rem;"></i>
      <p style="margin-top:6px; font-size:0.9rem;">Evaluating Random Forest Classifier...</p>
    </div>
  `;

  fetch(`${API_BASE_URL}/predict-fertilizer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      temp: temp,
      humid: humid,
      mois: mois,
      soil: soil,
      crop: crop,
      nitro: nitro,
      pota: pota,
      phos: phos,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        resBox.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
            <i class="bx bx-test-tube" style="font-size:1.6rem; color:var(--accent-emerald-light);"></i>
            <h4 style="font-family:var(--font-heading); color:var(--accent-emerald-light); font-size:1.1rem;">Prescribed Fertilizer Mix</h4>
          </div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">
            Recommended: ${data.recommended_fertilizer}
          </div>
          <div style="font-size:0.88rem; color:var(--text-muted); margin-bottom:10px;">
            ${data.dosage_guide}
          </div>
        `;
        showToast(`Prescribed Fertilizer: ${data.recommended_fertilizer}`);
      }
    })
    .catch((err) => {
      console.error(err);
      resBox.innerHTML = `
        <div style="padding:10px; color:#f87171;">
          ⚠️ Backend API offline. Please start <code>python backend/app.py</code>.
        </div>
      `;
    });
}
