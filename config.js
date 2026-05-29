/* ============================================
   config.js — Shared Configuration
   แก้ค่าตรงนี้เพียงที่เดียว ใช้ได้ทุกหน้า
   ============================================ */

const CONFIG = {
  // 🔧 Google Apps Script Web App URL
  // ไปที่ Apps Script → Deploy → Manage Deployments → Copy Web App URL
  GAS_URL: "https://script.googleusercontent.com/macros/s/AKfycbxt9npSPQaR8vtnySTkjwHe8dJRwHwXRTFblpZm4zG-Uq7a00j3vGFijGKKLSgJHdJ4Ig/exec",

  // 🔧 LINE LIFF ID
  // ไปที่ LINE Developers → LIFF → Copy LIFF ID
  LIFF_ID: "2010184903-n2TCZvo7",

  // 🔧 ชื่อร้าน
  SHOP_NAME: "🍜 ร้านอาหาร",
  SHOP_SUBTITLE: "สั่งอาหารง่าย ๆ ส่งถึงมือคุณ",

  // Admin LINE User IDs (สำหรับ check permission)
  // ใส่ userId ของ admin จาก LINE Profile
  ADMIN_IDS: ["Ubd3c2f911022842290bb8fbfed28bcac"],
};