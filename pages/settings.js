/* Journey — Settings Page */

safeRender(function() {
  // Export
  window.exportData = function() {
    var trips = loadTrips();
    var photos;
    try { photos = JSON.parse(localStorage.getItem('journey_photos')) || {}; } catch(e) { photos = {}; }
    var data = { version: '1.0', exportedAt: new Date().toISOString(), trips: trips, photos: photos };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'journey-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('数据已导出', 'success');
  };

  // Import
  window.importData = function(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.trips || !Array.isArray(data.trips)) throw new Error('Invalid format');
        showConfirm('将导入 ' + data.trips.length + ' 条旅行数据，会合并到现有数据中。确定吗？', function() {
          var existing = loadTrips();
          var existingIds = new Set(existing.map(function(t) { return t.id; }));
          var newTrips = data.trips.filter(function(t) { return !existingIds.has(t.id); });
          saveTrips(existing.concat(newTrips));
          if (data.photos) {
            var existingPhotos;
            try { existingPhotos = JSON.parse(localStorage.getItem('journey_photos')) || {}; } catch(err) { existingPhotos = {}; }
            Object.keys(data.photos).forEach(function(key) {
              if (!existingPhotos[key]) existingPhotos[key] = data.photos[key];
              else existingPhotos[key] = existingPhotos[key].concat(data.photos[key].filter(function(p) {
                return !existingPhotos[key].some(function(ep) { return ep.id === p.id; });
              }));
            });
            localStorage.setItem('journey_photos', JSON.stringify(existingPhotos));
          }
          showToast('成功导入 ' + newTrips.length + ' 条数据', 'success');
          setTimeout(function() { location.reload(); }, 500);
        });
      } catch(err) {
        showToast('文件格式不正确', 'error');
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    input.value = '';
  };

  // Load sample data
  window.loadSampleData = function() {
    showConfirm('将添加东京、成都、上海、大理四条示例旅行数据。确定吗？', function() {
      var samples = getSampleTrips();
      var existing = loadTrips();
      var existingIds = new Set(existing.map(function(t) { return t.id; }));
      var newSamples = samples.filter(function(s) { return !existingIds.has(s.id); });
      saveTrips(existing.concat(newSamples));
      showToast('已添加 ' + newSamples.length + ' 条示例', 'success');
      setTimeout(function() { location.href = 'index.html'; }, 500);
    });
  };

  // Clear all data
  window.clearAllData = function() {
    showConfirm('将删除所有旅行数据和照片，此操作不可恢复！', function() {
      localStorage.removeItem('journey_proto_trips');
      localStorage.removeItem('journey_photos');
      showToast('所有数据已清除', 'success');
      setTimeout(function() { location.href = 'index.html'; }, 500);
    });
  };
});
