/* ============================================
   admin.js — Admin Panel
   จัดการเมนู / หมวดหมู่ / คำสั่งซื้อ
   ============================================ */

// ── State ──────────────────────────────────
let adminMenuItems = [];
let adminCategories = [];
let adminOrders    = [];
let editingItemId  = null;
let currentAdminTab = "menu";

// ── Init ───────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await checkAdminAuth();
  await Promise.all([loadAdminMenu(), loadAdminCategories()]);
  initAdminNav();
});

// ── Auth Check ─────────────────────────────
async function checkAdminAuth() {
  try {
    await liff.init({ liffId: CONFIG.LIFF_ID });

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: location.href });
      return;
    }

    const profile = await liff.getProfile();

    // แสดงชื่อใน navbar
    const nameEl   = document.getElementById("admin-user-name");
    const avatarEl = document.getElementById("admin-user-avatar");
    if (nameEl)   nameEl.textContent = profile.displayName;
    if (avatarEl) avatarEl.innerHTML = `<img src="${profile.pictureUrl}" alt="avatar">`;

    // Check admin permission
    if (CONFIG.ADMIN_IDS.length && !CONFIG.ADMIN_IDS.includes(profile.userId)) {
      document.body.innerHTML = `
        <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;font-family:'Prompt',sans-serif">
          <div style="font-size:3rem">🚫</div>
          <h2 style="color:#1A1A2E">ไม่มีสิทธิ์เข้าถึง</h2>
          <p style="color:#6B7280">คุณไม่ใช่ผู้ดูแลระบบ</p>
          <a href="index.html" style="color:#FF6B35;font-weight:600">← กลับหน้าหลัก</a>
        </div>`;
    }
  } catch (err) {
    console.warn("Admin auth error:", err);
  }
}

// ── Admin Nav / Tabs ───────────────────────
function initAdminNav() {
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentAdminTab = tab;

  document.querySelectorAll(".admin-tab-content").forEach(el => {
    el.classList.toggle("hidden", el.dataset.tab !== tab);
  });

  document.querySelectorAll(".sidebar-link[data-tab]").forEach(link => {
    link.classList.toggle("active", link.dataset.tab === tab);
  });

  if (tab === "orders")    loadAdminOrders();
  if (tab === "categories") renderAdminCategories();
}

// Mobile sidebar toggle
function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("mobile-open");
}

// ── Load Menu (Admin) ──────────────────────
async function loadAdminMenu() {
  const grid = document.getElementById("admin-menu-grid");
  if (!grid) return;

  grid.innerHTML = `<div class="loading-wrap" style="grid-column:1/-1"><div class="spinner"></div><span>กำลังโหลด…</span></div>`;

  try {
    const res  = await fetch(`${CONFIG.GAS_URL}?action=getMenu`);
    const data = await res.json();
    adminMenuItems = data.menu || [];
    renderAdminMenu();
  } catch (err) {
    console.error("loadAdminMenu error:", err);
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">❌</div><p>โหลดเมนูไม่ได้</p></div>`;
    showAdminToast("โหลดเมนูไม่สำเร็จ", "error");
  }
}

function renderAdminMenu(filter = "") {
  const grid = document.getElementById("admin-menu-grid");
  if (!grid) return;

  const items = filter
    ? adminMenuItems.filter(i =>
        i.name.toLowerCase().includes(filter.toLowerCase()) ||
        (i.category || "").toLowerCase().includes(filter.toLowerCase()))
    : adminMenuItems;

  if (!items.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🍽️</div>
      <h3>ยังไม่มีเมนู</h3>
      <button class="btn btn-primary mt-2" onclick="openAddMenuModal()">+ เพิ่มเมนูแรก</button>
    </div>`;
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="menu-admin-card">
      <div class="menu-admin-img">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : "🍴"}
      </div>
      <div class="menu-admin-body">
        <div class="menu-admin-name">${item.name}</div>
        <div class="menu-admin-cat">${item.category || "ไม่มีหมวด"}</div>
        <div class="menu-admin-price">฿${Number(item.price).toLocaleString()}</div>
        <div class="menu-admin-actions">
          <label class="toggle" title="${item.status === 'available' ? 'พร้อมขาย' : 'หมดชั่วคราว'}">
            <input type="checkbox" ${item.status === 'available' ? 'checked' : ''}
                   onchange="toggleMenuStatus('${item.id}', this.checked)">
            <span class="toggle-track"></span>
          </label>
          <button class="btn btn-ghost btn-sm" onclick="openEditMenuModal('${item.id}')">✏️</button>
          <button class="btn btn-danger btn-sm"  onclick="deleteMenuItem('${item.id}')">🗑️</button>
        </div>
      </div>
    </div>
  `).join("");
}

// ── Search Menu ────────────────────────────
function searchAdminMenu(val) {
  renderAdminMenu(val);
}

// ── Add / Edit Menu Modal ──────────────────
function openAddMenuModal() {
  editingItemId = null;
  document.getElementById("menu-modal-title").textContent = "เพิ่มเมนูใหม่";
  document.getElementById("menu-form").reset();
  populateCategorySelect("menu-category");
  openAdminModal("menu-modal");
}

function openEditMenuModal(id) {
  const item = adminMenuItems.find(m => m.id === id);
  if (!item) return;
  editingItemId = id;

  document.getElementById("menu-modal-title").textContent = "แก้ไขเมนู";
  document.getElementById("menu-name").value     = item.name || "";
  document.getElementById("menu-price").value    = item.price || "";
  document.getElementById("menu-image").value    = item.image || "";
  document.getElementById("menu-desc").value     = item.description || "";
  document.getElementById("menu-status").value   = item.status || "available";
  populateCategorySelect("menu-category", item.category);
  openAdminModal("menu-modal");
}

function populateCategorySelect(selectId, selected = "") {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = `<option value="">-- เลือกหมวดหมู่ --</option>` +
    adminCategories.map(c =>
      `<option value="${c.name}" ${c.name === selected ? 'selected' : ''}>${c.name}</option>`
    ).join("");
}

async function saveMenuItem() {
  const name     = document.getElementById("menu-name").value.trim();
  const price    = document.getElementById("menu-price").value;
  const category = document.getElementById("menu-category").value;
  const image    = document.getElementById("menu-image").value.trim();
  const desc     = document.getElementById("menu-desc").value.trim();
  const status   = document.getElementById("menu-status").value;

  if (!name || !price) {
    showAdminToast("กรุณากรอกชื่อและราคา", "warning");
    return;
  }

  const saveBtn = document.getElementById("save-menu-btn");
  saveBtn.disabled = true;

  const payload = {
    action:      editingItemId ? "editMenu" : "addMenu",
    id:          editingItemId || "",
    name, price: Number(price), category, image, description: desc, status,
  };

  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.status === "ok") {
      showAdminToast(editingItemId ? "แก้ไขเมนูแล้ว ✅" : "เพิ่มเมนูแล้ว ✅", "success");
      closeAdminModal("menu-modal");
      await loadAdminMenu();
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error("saveMenuItem error:", err);
    showAdminToast("บันทึกไม่สำเร็จ", "error");
  } finally {
    saveBtn.disabled = false;
  }
}

async function deleteMenuItem(id) {
  const item = adminMenuItems.find(m => m.id === id);
  if (!confirm(`ลบ "${item?.name}" จริงหรือ?`)) return;

  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteMenu", id }),
    });
    const data = await res.json();

    if (data.status === "ok") {
      showAdminToast("ลบเมนูแล้ว", "success");
      await loadAdminMenu();
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    showAdminToast("ลบไม่สำเร็จ", "error");
  }
}

async function toggleMenuStatus(id, isAvailable) {
  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggleStatus",
        id,
        status: isAvailable ? "available" : "unavailable",
      }),
    });
    const data = await res.json();
    if (data.status !== "ok") throw new Error();
    showAdminToast(isAvailable ? "เปิดขายแล้ว" : "ปิดชั่วคราว", "info");
    // Update local state
    const item = adminMenuItems.find(m => m.id === id);
    if (item) item.status = isAvailable ? "available" : "unavailable";
  } catch {
    showAdminToast("อัปเดตสถานะไม่สำเร็จ", "error");
  }
}

// ── Categories ─────────────────────────────
async function loadAdminCategories() {
  try {
    const res  = await fetch(`${CONFIG.GAS_URL}?action=getCategories`);
    const data = await res.json();
    adminCategories = data.categories || [];
  } catch (err) {
    console.error("loadAdminCategories error:", err);
  }
}

function renderAdminCategories() {
  const list = document.getElementById("admin-cat-list");
  if (!list) return;

  if (!adminCategories.length) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📂</div>
      <h3>ยังไม่มีหมวดหมู่</h3>
    </div>`;
    return;
  }

  list.innerHTML = adminCategories.map(cat => `
    <div class="card flex items-center justify-between" style="padding:14px 20px;margin-bottom:10px">
      <span style="font-weight:600">${cat.icon || "📂"} ${cat.name}</span>
      <div class="flex gap-2">
        <button class="btn btn-danger btn-sm" onclick="deleteCategory('${cat.name}')">🗑️ ลบ</button>
      </div>
    </div>
  `).join("");
}

function openAddCategoryModal() {
  document.getElementById("cat-name").value = "";
  document.getElementById("cat-icon").value = "";
  openAdminModal("category-modal");
}

async function saveCategory() {
  const name = document.getElementById("cat-name").value.trim();
  const icon = document.getElementById("cat-icon").value.trim();

  if (!name) { showAdminToast("กรุณากรอกชื่อหมวดหมู่", "warning"); return; }

  const saveBtn = document.getElementById("save-cat-btn");
  saveBtn.disabled = true;

  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addCategory", name, icon }),
    });
    const data = await res.json();

    if (data.status === "ok") {
      showAdminToast("เพิ่มหมวดหมู่แล้ว ✅", "success");
      closeAdminModal("category-modal");
      await loadAdminCategories();
      renderAdminCategories();
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    showAdminToast("เพิ่มหมวดหมู่ไม่สำเร็จ", "error");
  } finally {
    saveBtn.disabled = false;
  }
}

async function deleteCategory(name) {
  if (!confirm(`ลบหมวด "${name}" จริงหรือ?`)) return;

  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteCategory", name }),
    });
    const data = await res.json();

    if (data.status === "ok") {
      showAdminToast("ลบหมวดหมู่แล้ว", "success");
      await loadAdminCategories();
      renderAdminCategories();
    } else {
      throw new Error();
    }
  } catch {
    showAdminToast("ลบไม่สำเร็จ", "error");
  }
}

// ── Orders (Admin) ─────────────────────────
async function loadAdminOrders() {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px"><div class="spinner" style="margin:auto"></div></td></tr>`;

  try {
    const res  = await fetch(`${CONFIG.GAS_URL}?action=getOrders`);
    const data = await res.json();
    adminOrders = data.orders || [];
    renderAdminOrders(adminOrders);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--danger);padding:40px">โหลดคำสั่งซื้อไม่ได้</td></tr>`;
  }
}

function renderAdminOrders(orders) {
  const tbody = document.getElementById("admin-orders-tbody");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">ยังไม่มีคำสั่งซื้อ</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><span class="font-bold">#${o.orderId}</span></td>
      <td>${o.userName || "-"}</td>
      <td>${formatDate(o.timestamp)}</td>
      <td class="font-bold" style="color:var(--primary)">฿${Number(o.total).toLocaleString()}</td>
      <td>${getStatusBadge(o.status)}</td>
      <td>
        <select class="form-control" style="padding:4px 8px;font-size:0.75rem;width:130px"
                onchange="updateOrderStatus('${o.orderId}', this.value)">
          ${["pending","confirmed","cooking","ready","delivered","cancelled"].map(s =>
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${statusLabel(s)}</option>`
          ).join("")}
        </select>
      </td>
    </tr>
  `).join("");
}

async function updateOrderStatus(orderId, status) {
  try {
    const res  = await fetch(CONFIG.GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateOrderStatus", orderId, status }),
    });
    const data = await res.json();
    if (data.status === "ok") {
      showAdminToast(`อัปเดตสถานะ #${orderId} แล้ว`, "success");
    }
  } catch {
    showAdminToast("อัปเดตสถานะไม่สำเร็จ", "error");
  }
}

function filterAdminOrders(status) {
  document.querySelectorAll(".filter-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.status === status);
  });
  const filtered = status === "all" ? adminOrders : adminOrders.filter(o => o.status === status);
  renderAdminOrders(filtered);
}

// ── Helpers ────────────────────────────────
function getStatusBadge(status) {
  const map = {
    pending:   ["badge-warning",  "⏳ รอยืนยัน"],
    confirmed: ["badge-info",     "✅ ยืนยันแล้ว"],
    cooking:   ["badge-warning",  "🍳 กำลังทำ"],
    ready:     ["badge-success",  "🎉 พร้อมส่ง"],
    delivered: ["badge-gray",     "📦 ส่งแล้ว"],
    cancelled: ["badge-danger",   "❌ ยกเลิก"],
  };
  const [cls, label] = map[status] || ["badge-gray", status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function statusLabel(s) {
  return {
    pending: "⏳ รอยืนยัน", confirmed: "✅ ยืนยัน",
    cooking: "🍳 กำลังทำ", ready: "🎉 พร้อมส่ง",
    delivered: "📦 ส่งแล้ว", cancelled: "❌ ยกเลิก",
  }[s] || s;
}

function formatDate(ts) {
  if (!ts) return "-";
  try {
    const d = new Date(ts);
    return d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" }) + " " +
           d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  } catch { return ts; }
}

// ── Admin Modal Helpers ────────────────────
function openAdminModal(id)  { document.getElementById(id)?.classList.add("open"); }
function closeAdminModal(id) { document.getElementById(id)?.classList.remove("open"); }

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("open");
  }
});

// ── Admin Toast ────────────────────────────
function showAdminToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}