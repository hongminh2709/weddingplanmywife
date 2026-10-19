(function (root) {
  'use strict';

  function guestFromUrl(value) {
    var url = new URL(value);
    var encoded = url.pathname.match(/^\/m\/([A-Za-z0-9_-]+)\/?$/);
    if (encoded) {
      try {
        var binary = atob(encoded[1].replace(/-/g, '+').replace(/_/g, '/'));
        return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, function (c) { return c.charCodeAt(0); })).trim();
      } catch (_) { return ''; }
    }
    return (url.searchParams.get('guest') || '').trim();
  }

  function buildLink(origin, guest) {
    var name = guest.trim();
    if (!name) return new URL('/thiep', origin).href;
    var bytes = new TextEncoder().encode(name);
    var binary = Array.from(bytes, function (byte) { return String.fromCharCode(byte); }).join('');
    var code = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return new URL('/m/' + code, origin).href;
  }

  function openedLink(value) {
    var url = new URL(value);
    url.pathname = '/chungdoi.com/i/hongminh-khanhlinhbaf7.html';
    url.searchParams.delete('open');
    url.searchParams.delete('_r');
    url.hash = '';
    return url.href;
  }

  var api = { guestFromUrl: guestFromUrl, buildLink: buildLink, openedLink: openedLink };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.personalizedInvitation = api;

  document.addEventListener('click', function (event) {
    var anchor = event.target.closest('[data-landing-screenshot-id="invite-envelope"] a');
    if (!anchor) return;
    anchor.href = openedLink(root.location.href);
    // Let the browser follow the link, without the original animation handler.
    event.stopPropagation();
  }, true);

  var guest = guestFromUrl(root.location.href);
  if (!guest) return;

  function updateEnvelope() {
    var envelope = document.querySelector('[data-landing-screenshot-id="invite-envelope"]');
    if (!envelope) return;
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
