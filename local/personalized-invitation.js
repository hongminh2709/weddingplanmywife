(function (root) {
  'use strict';

  function guestFromUrl(value) {
    var url = new URL(value);
    var legacy = url.searchParams.get('guest');
    if (legacy !== null) return legacy.trim();
    var match = url.pathname.match(/^\/m\/([A-Za-z0-9_-]+)\/?$/);
    if (!match) return '';
    try {
      var encoded = match[1].replace(/-/g, '+').replace(/_/g, '/');
      var binary = atob(encoded);
      var bytes = Uint8Array.from(binary, function (character) { return character.charCodeAt(0); });
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes).trim();
    } catch (_) { return ''; }
  }

  function buildLink(origin, guest) {
    var name = guest.trim();
    if (!name) return new URL('/', origin).href;
    var bytes = new TextEncoder().encode(name);
    var binary = Array.from(bytes, function (byte) { return String.fromCharCode(byte); }).join('');
    var code = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URL('/m/' + code, origin).href;
  }

  function openFallbackUrl(value) {
    var url = new URL(value);
    url.searchParams.set('open', '1');
    return url.href;
  }

  var api = { guestFromUrl: guestFromUrl, buildLink: buildLink, openFallbackUrl: openFallbackUrl };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.personalizedInvitation = api;

  var guest = guestFromUrl(root.location.href);

  function updateEnvelope() {
    var envelope = document.querySelector('[data-landing-screenshot-id="invite-envelope"]');
    if (!envelope) return;
    var openLink = envelope.querySelector('a[href]');
    var fallback = openFallbackUrl(root.location.href);
    if (openLink && openLink.href !== fallback) openLink.href = fallback;
    if (!guest) return;
    envelope.querySelectorAll('p').forEach(function (paragraph) {
      var label = paragraph.querySelector('span');
      if (label && label.textContent.trim().toLocaleLowerCase('vi') === 'thân mời' &&
          paragraph.getAttribute('data-invite-guest') !== guest) {
        paragraph.setAttribute('data-invite-guest', guest);
      }
    });
  }

  new MutationObserver(updateEnvelope).observe(document.documentElement, { childList: true, subtree: true });
  updateEnvelope();
})(typeof window === 'undefined' ? globalThis : window);
