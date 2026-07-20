/* ═══════════════════════════════════════════════════
   Journey — Shared Header Component
   Usage: renderHeader(currentPage) where currentPage
   is one of 'home','journeys','create','settings'
   ═══════════════════════════════════════════════════ */

function renderHeader(currentPage) {
  const pages = [
    { key: 'home', label: '首页', href: 'index.html', icon: 'fa-home' },
    { key: 'journeys', label: '旅行', href: 'journeys.html', icon: 'fa-map' },
    { key: 'create', label: '创建', href: 'create.html', icon: 'fa-plus-circle' },
  ];

  const navLinks = pages.map(p =>
    `<a href="${p.href}"${p.key === currentPage ? ' class="active"' : ''}>${p.label}</a>`
  ).join('');

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
