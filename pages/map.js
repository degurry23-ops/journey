/* Journey — Map Page */

safeRender(function() {
  var trip = getTripById(getParam('trip'));
  if (!trip) { showPageError('fa-map', '旅行不存在', '找不到这个行程', 'index.html', '返回首页'); return; }

  var DAY_COLORS = ['#0052FF', '#4D7CFF', '#F59E0B', '#8B5CF6', '#10B981', '#EC4899', '#06B6D4'];
  var allPlaces = [];

  if (trip.days instanceof Array) {
    trip.days.forEach(function(d, di) {
      if (d.places) {
        d.places.forEach(function(p) {
          if (p.lat && p.lng) {
            allPlaces.push(Object.assign({ d: di + 1, color: DAY_COLORS[di % DAY_COLORS.length] }, p));
          }
        });
      }
    });
  }

  var initLat = allPlaces.length > 0 ? allPlaces[0].lat : 35.68;
  var initLng = allPlaces.length > 0 ? allPlaces[0].lng : 139.76;
  var initZoom = allPlaces.length > 0 ? 13 : 5;

  var map = L.map('map').setView([initLat, initLng], initZoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  }).addTo(map);

  var markers = [];
  var lines = [];

  function renderMap(dayNum) {
    markers.forEach(function(m) { map.removeLayer(m); });
    lines.forEach(function(l) { map.removeLayer(l); });
    markers = [];
    lines = [];

    var filtered = dayNum === 'all' ? allPlaces : allPlaces.filter(function(p) { return p.d === dayNum; });
    var groups = {};
    filtered.forEach(function(p) {
      if (!groups[p.color]) groups[p.color] = [];
      groups[p.color].push(p);
    });

    Object.values(groups).forEach(function(group) {
      group.forEach(function(p) {
        var m = L.circleMarker([p.lat, p.lng], {
          radius: 8,
          fillColor: p.color,
          color: '#fff',
          weight: 2,
          fillOpacity: 0.9
        }).bindPopup('<b>' + p.name + '</b><br/>' + (p.time || '')).addTo(map);
        markers.push(m);
      });
      if (group.length > 1) {
        var coords = group.map(function(p) { return [p.lat, p.lng]; });
        var l = L.polyline(coords, {
          color: group[0].color,
          weight: 3,
          opacity: 0.6,
          dashArray: '8 4'
        }).addTo(map);
        lines.push(l);
      }
    });

    if (filtered.length > 0) {
      var bounds = filtered.map(function(p) { return [p.lat, p.lng]; });
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  renderMap('all');

  window.filterDay = function(dayNum, el) {
    document.querySelectorAll('header + div button').forEach(function(b) {
      b.style.background = 'var(--muted)';
      b.style.color = 'var(--muted-fg)';
      b.classList.remove('btn-primary');
    });
    el.style.background = 'linear-gradient(135deg,var(--accent),var(--accent2))';
    el.style.color = '#fff';
    el.classList.add('btn-primary');
    renderMap(dayNum);
  };

  // Back link
  var backLink = document.getElementById('backLink');
  if (backLink) {
    backLink.href = 'trip-detail.html?id=' + trip.id;
    backLink.onclick = function(e) { e.preventDefault(); window.location.href = 'trip-detail.html?id=' + trip.id; };
  }
});
