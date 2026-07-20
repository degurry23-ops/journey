/* ═══════════════════════════════════════════════════
   Journey — Utility Functions
   ═══════════════════════════════════════════════════ */

/* ── DOM Helpers ── */
function $(sel, parent) { return (parent || document).querySelector(sel); }
function $$(sel, parent) { return Array.from((parent || document).querySelectorAll(sel)); }

/* ── Alerts / Dialogs ── */
function showToast(msg, type) {
  type = type || 'info';
  const colors = { info: 'var(--accent)', success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)' };
  const icons = { info: 'fa-info-circle', success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:200;
    background:${colors[type]||colors.info}; color:#fff;
    padding:12px 24px; border-radius:999px; font-size:14px; font-weight:500;
    box-shadow:0 8px 24px rgba(0,0,0,0.15); display:flex; align-items:center; gap:8px;
    animation:fadeInDown 0.3s ease-out;
    max-width:90vw;
  `;
  toast.innerHTML = `<i class="fas ${icons[type]||icons.info}"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}

function showConfirm(msg, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:var(--radius-xl);padding:32px;max-width:360px;width:90%;text-align:center;z-index:101;animation:fadeInUp 0.3s ease-out;box-shadow:0 20px 60px rgba(0,0,0,0.15);">
      <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
      <h3 style="font-family:var(--font-display);margin-bottom:8px;">确认操作</h3>
      <p style="color:var(--muted-fg);font-size:14px;margin-bottom:24px;">${msg}</p>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-outline btn-full" id="confirmCancel">取消</button>
        <button class="btn btn-danger btn-full" id="confirmOk">确认</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  $('#confirmCancel', overlay).onclick = function() { overlay.remove(); };
  $('#confirmOk', overlay).onclick = function() { overlay.remove(); onConfirm(); };
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
}

/* ── URL Helpers ── */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ── Error Boundary ── */
function safeRender(fn) {
  try {
    fn();
  } catch (e) {
    document.body.innerHTML = `
      <div class="empty-state" style="padding-top:100px;">
        <i class="fas fa-exclamation-triangle" style="color:var(--danger);"></i>
        <h3>页面加载出错</h3>
        <p style="color:var(--muted-fg);margin-bottom:20px;">${e.message}</p>
        <a href="index.html" class="btn btn-primary">返回首页</a>
        <button class="btn btn-outline" onclick="location.reload()" style="margin-top:8px;">刷新重试</button>
      </div>`;
    console.error('Render error:', e);
  }
}

/* ── Photo Store (localStorage-based) ── */
var PHOTO_STORE_KEY = 'journey_photos';

function loadPhotos(tripId) {
  try {
    var all = JSON.parse(localStorage.getItem(PHOTO_STORE_KEY)) || {};
    return all[tripId] || [];
  } catch (e) { return []; }
}

function savePhoto(tripId, dataUrl) {
  var all;
  try { all = JSON.parse(localStorage.getItem(PHOTO_STORE_KEY)) || {}; } catch (e) { all = {}; }
  if (!all[tripId]) all[tripId] = [];
  all[tripId].push({ id: genId(), dataUrl: dataUrl, date: new Date().toISOString() });
  try { localStorage.setItem(PHOTO_STORE_KEY, JSON.stringify(all)); } catch (e) {
    showToast('存储空间不足，请清理旧照片', 'warning');
    return null;
  }
  return all[tripId];
}

function deletePhoto(tripId, photoId) {
  var all;
  try { all = JSON.parse(localStorage.getItem(PHOTO_STORE_KEY)) || {}; } catch (e) { return; }
  if (all[tripId]) all[tripId] = all[tripId].filter(function(p) { return p.id !== photoId; });
  localStorage.setItem(PHOTO_STORE_KEY, JSON.stringify(all));
}
