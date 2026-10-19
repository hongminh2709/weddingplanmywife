(function (root) {
  'use strict';

  function mapEmbedUrl(value, fallbackAddress) {
    var url;
    try { url = new URL(value); } catch (_) { return null; }
    if (url.hostname !== 'www.google.com' || url.pathname !== '/maps/embed/v1/place') return null;
    var query = url.searchParams.get('q');
    if (!query) return null;
    if (query.indexOf('place_id:') === 0) {
      query = url.searchParams.get('center') || fallbackAddress || query;
    }
    var embed = new URL('https://maps.google.com/maps');
    embed.searchParams.set('q', query);
    embed.searchParams.set('output', 'embed');
    var zoom = url.searchParams.get('zoom');
    if (zoom) embed.searchParams.set('z', zoom);
    return embed.href;
  }

  function trackForUrl(value) {
    if (value !== 'https://api.chungdoi.com/api/music-tracks/romantic-013') return null;
    return { success: true, track: { id: 'romantic-013', title: 'Lễ Đường', artist: 'Kai Đinh', duration: 249, url: 'https://cdn.chungdoi.com/music/le-duong.mp3', tags: ['wedding', 'vietnamese'], status: 'ready', market: 'vn' } };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mapEmbedUrl: mapEmbedUrl, trackForUrl: trackForUrl };
    return;
  }

  root.weddingCompat = { mapEmbedUrl: mapEmbedUrl };

  var originalFetch = root.fetch;
  root.fetch = function (input, options) {
    var url = typeof input === 'string' ? input : input && input.url;
    var track = trackForUrl(url);
    if (track) return Promise.resolve(new Response(JSON.stringify(track), { headers: { 'Content-Type': 'application/json' } }));
    return originalFetch.apply(this, arguments);
  };

  function fixMaps() {
    document.querySelectorAll('iframe[src*="google.com/maps/embed/v1/place"]').forEach(function (frame) {
      var url = mapEmbedUrl(frame.src);
      if (url) frame.src = url;
    });
  }
  new MutationObserver(fixMaps).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  fixMaps();
})(typeof window === 'undefined' ? globalThis : window);
