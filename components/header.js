/* ═══════════════════════════════════════════════════
   Journey — Shared Header Component
   Usage: renderHeader(currentPage) where currentPage
   is one of 'home','journeys','create','settings'
   ═══════════════════════════════════════════════════ */

function renderHeader(currentPage) {
  const pages = [
    { key: 'home', label: '首页', href: 'index.html', icon: 'fa-home' },
    { key: 'journeys', label: '我的旅行', href: 'journeys.html', icon: 'fa-suitcase' },
    { key: 'create', label: '✨ AI 规划', href: 'create.html', icon: 'fa-magic' },
  ];

  // User profile
  var profile = {};
  try { profile = JSON.parse(localStorage.getItem('journey_user')) || {}; } catch(e) {}
  var userHTML = profile.nickname
    ? '<a href="settings.html" style="display:flex;align-items:center;gap:6px;text-decoration:none;color:var(--fg);font-size:13px;font-weight:500;"><span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">' + profile.nickname[0] + '</span>' + profile.nickname + '</a>'
    : '<a href="settings.html" style="text-decoration:none;color:var(--muted-fg);font-size:13px;font-weight:500;">👤 登录</a>';

  const navLinks = pages.map(p =>
    `<a href="${p.href}"${p.key === currentPage ? ' class="active"' : ''}>${p.label}</a>`
  ).join('') + userHTML;

  const mobileLinks = pages.map(p =>
    `<a href="${p.href}"${p.key === currentPage ? ' class="active"' : ''}><i class="fas ${p.icon}"></i>${p.label}</a>`
  ).join('');

  const html = `
  <header>
    <div class="container header-inner">
      <a href="index.html" class="logo">
        <div class="logo-icon"><i class="fas fa-map-marker-alt"></i></div>
        Journey
      </a>
      <nav>${navLinks}</nav>
    </div>
  </header>
  <nav class="mobile-nav mobile-only">${mobileLinks}</nav>`;

  // Insert at top of body
  const placeholder = document.getElementById('header-placeholder');
  if (placeholder) {
    placeholder.outerHTML = html;
  } else {
    document.body.insertAdjacentHTML('afterbegin', html);
  }
}
