/* ============================================
   script.js — Customer Frontend
   หน้าเมนู + ตะกร้าสินค้า + Checkout
   ============================================ */

// ── State ──────────────────────────────────
let allMenuItems = [];
let categories   = [];
let cart         = JSON.parse(localStorage.getItem("fd_cart") || "[]");
let userProfile  = null;
let currentCat   = "all";
let cartOpen     = false;

// ── Init ───────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await initLiff();
  await loadCategories();
  await loadMenu();
  renderCart();
  updateCartBadge();
});

// ── LIFF Init ──────────────────────────────
async function initLiff() {
  try {
    await liff.init({ liffId: CONFIG.LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: location.href });
      return;
    }

    userProfile = await liff.getProfile();

    // แสดงชื่อผู้ใช้ใน navbar
    const nameEl   = document.getElementById("user-name");
    const avatarEl = document.getElementById("user-avatar");
    if (nameEl)   nameEl.textContent = userProfile.displayName;
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="${userProfile.pictureUrl}" alt="avatar">`;
    }

  } catch (err) {
    console.warn("LIFF init failed:", err);
    showToast("ไม่สามารถเชื่อม LINE ได้", "warning");
  }
}

// ── Load Categories ────────────────────────
async function loadCategories() {
  try {
    const res  = await fetch(`${CONFIG.GAS_URL}?action=getCategories`);
    const data = await res.json();
    categories = data.categories || [];
    renderCategoryFilter();
  } catch (err) {
    console.error("loadCategories error:", err);
  }
}

function renderCategoryFilter() {
  const wrap = document.getElementById("category-filter");
  if (!wrap) return;

  const allBtn = document.createElement("button");
  allBtn.className = "cat-btn active";
  allBtn.dataset.cat = "all";
  allBtn.textContent = "🍽️ ทั้งหมด";
  allBtn.onclick = () => filterByCategory("all");
  wrap.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "cat-btn";
    btn.dataset.cat = cat.name;
    btn.textContent = (cat.icon || "🍴") + " " + cat.name;
    btn.onclick = () => filterByCategory(cat.name);
    wrap.appendChild(btn);
  });
}

function filterByCategory(cat) {
  currentCat = cat;

  document.querySelectorAll(".cat-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.cat === cat);
  });

  const filtered = cat === "all"
    ? allMenuItems
    : allMenuItems.filter(item => item.category === cat);

  renderFoods(filtered);
}

// ── Load Menu ──────────────────────────────
async function loadMenu() {
  const grid = document.getElementById("food-grid");
  if (!grid) return;

  grid.innerHTML = `<div class="loading-wrap" style="grid-column:1/-1">
    <div class="spinner"></div><span>กำลังโหลดเมนู…</span>
  </div>`;

  try {
    const res  = await fetch(`${CONFIG.GAS_URL}?action=getMenu`);
    const data = await res.json();
    allMenuItems = (data.menu || []).filter(item => item.status !== "hidden");
    renderFoods(allMenuItems);
  } catch (err) {
    console.error("loadMenu error:", err);
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">😕</div>
      <h3>โหลดเมนูไม่ได้</h3>
      <p>กรุณาลองใหม่อีกครั้ง</p>
      <button class="btn btn-primary mt-2" onclick="loadMenu()">ลองใหม่</button>
    </div>`;
    showToast("โหลดเมนูไม่สำเร็จ", "error");
  }
}

function renderFoods(items) {
  const grid = document.getElementById("food-grid");
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🍽️</div>
      <h3>ไม่พบเมนูในหมวดนี้</h3>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="food-card ${item.status === 'unavailable' ? 'unavailable' : ''}" 
         onclick="openFoodDetail('${item.id}')">
      <div class="food-card-img">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
          : `🍴`}
      </div>
      <div class="food-card-body">
        <div class="food-card-name">${item.name}</div>
        <div class="food-card-price">฿${Number(item.price).toLocaleString()} <span>บาท</span></div>
        ${item.status === 'unavailable'
          ? `<div class="badge badge-gray w-full text-center">หมด</div>`
          : `<button class="food-card-add" onclick="event.stopPropagation(); addToCart('${item.id}')">
               + เพิ่มลงตะกร้า
             </button>`
        }
      </div>
    </div>
  `).join("");
}

// ── Food Detail Modal ──────────────────────
function openFoodDetail(id) {
  const item = allMenuItems.find(m => m.id === id);
  if (!item) return;

  document.getElementById("detail-name").textContent  = item.name;
  document.getElementById("detail-price").textContent = `฿${Number(item.price).toLocaleString()}`;
  document.getElementById("detail-desc").textContent  = item.description || "ไม่มีคำอธิบาย";
  document.getElementById("detail-img").innerHTML = item.image
    ? `<img src="${item.image}" alt="${item.name}">`
    : `<div style="font-size:4rem;text-align:center;padding:20px">🍴</div>`;

  const addBtn = document.getElementById("detail-add-btn");
  addBtn.onclick = () => { addToCart(id); closeModal("food-detail-modal"); };
  addBtn.disabled = item.status === "unavailable";
  addBtn.textContent = item.status === "unavailable" ? "หมดชั่วคราว" : "+ เพิ่มลงตะกร้า";

  openModal("food-detail-modal");
}

// ── Cart ───────────────────────────────────
function addToCart(id) {
  const item = allMenuItems.find(m => m.id === id);
  if (!item) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: item.id, name: item.name, price: Number(item.price), image: item.image || "", qty: 1 });
  }

  saveCart();
  renderCart();
  updateCartBadge();
  showToast(`เพิ่ม "${item.name}" แล้ว ✅`, "success");
}

function changeQty(id, delta) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  renderCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem("fd_cart", JSON.stringify(cart));
}

function renderCart() {
  const itemsWrap = document.getElementById("cart-items");
  const totalEl   = document.getElementById("cart-total");
  const emptyEl   = document.getElementById("cart-empty");
  const footerEl  = document.getElementById("cart-footer");

  if (!itemsWrap) return;

  if (!cart.length) {
    itemsWrap.innerHTML = "";
    if (emptyEl)  emptyEl.classList.remove("hidden");
    if (footerEl) footerEl.classList.add("hidden");
    return;
  }

  if (emptyEl)  emptyEl.classList.add("hidden");
  if (footerEl) footerEl.classList.remove("hidden");

  const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  itemsWrap.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${c.image ? `<img src="${c.image}" alt="${c.name}">` : "🍴"}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${c.name}</div>
        <div class="cart-item-price">฿${(c.price * c.qty).toLocaleString()}</div>
      </div>
      <div class="cart-qty">
        <button class="qty-btn" onclick="changeQty('${c.id}', -1)">−</button>
        <span class="qty-num">${c.qty}</span>
        <button class="qty-btn" onclick="changeQty('${c.id}', 1)">+</button>
      </div>
    </div>
  `).join("");

  if (totalEl) totalEl.textContent = `฿${total.toLocaleString()}`;
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  const total = cart.reduce((sum, c) => sum + c.qty, 0);
  if (!badge) return;
  badge.textContent = total;
  badge.classList.toggle("hidden", total === 0);
}

function toggleCart() {
  cartOpen = !cartOpen;
  const drawer = document.getElementById("cart-drawer");
  if (drawer) drawer.classList.toggle("open", cartOpen);
}

// ── Checkout ───────────────────────────────
function openCheckout() {
  if (!cart.length) { showToast("ตะกร้าว่างเปล่า", "warning"); return; }
  if (!userProfile)  { showToast("กรุณา login ก่อน", "warning"); return; }

  const summaryEl = document.getElementById("checkout-summary");
  const total     = cart.reduce((sum, c) => sum + c.price * c.qty, 0);

  summaryEl.innerHTML = cart.map(c => `
    <div class="order-item-line">
      <span class="item-name">${c.name} × ${c.qty}</span>
      <span class="item-sub-total">฿${(c.price * c.qty).toLocaleString()}</span>
    </div>
  `).join("") + `
    <div class="order-item-line mt-2" style="border-top:1px solid var(--border);padding-top:10px">
      <span class="font-bold">รวมทั้งหมด</span>
      <span class="font-bold text-primary-color">฿${total.toLocaleString()}</span>
    </div>`;

  openModal("checkout-modal");
}

async function submitOrder() {
  const note    = document.getElementById("order-note")?.value.trim() || "";
  const address = document.getElementById("order-address")?.value.trim() || "";

  if (!address) { showToast("กรุณากรอกที่อยู่จัดส่ง", "warning"); return; }

  const submitBtn = document.getElementById("submit-order-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "กำลังส่งคำสั่ง…";

  const orderData = {
    action:    "createOrder",
    userId:    userProfile?.userId   || "guest",
    userName:  userProfile?.displayName || "Guest",
    items:     JSON.stringify(cart),
    total:     cart.reduce((s, c) => s + c.price * c.qty, 0),
    note,
    address,
    timestamp: new Date().toISOString(),
  };

  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();

    if (data.status === "ok") {
      cart = [];
      saveCart();
      renderCart();
      updateCartBadge();
      closeModal("checkout-modal");
      showToast(`สั่งอาหารสำเร็จ! 🎉 หมายเลข: ${data.orderId}`, "success");
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (err) {
    console.error("submitOrder error:", err);
    showToast("ส่งคำสั่งไม่สำเร็จ กรุณาลองใหม่", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "✅ ยืนยันสั่งอาหาร";
  }
}

// ── Modal helpers ──────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

// Close modal on overlay click
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

// ── Toast ──────────────────────────────────
function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span><span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}