(function (root) {
  'use strict';

  function guestFromUrl(value) {
    return (new URL(value).searchParams.get('guest') || '').trim();
  }

  function buildLink(origin, guest) {
    var url = new URL('/chungdoi.com/i/hongminh-khanhlinh.html', origin);
    var name = guest.trim();
    if (name) url.searchParams.set('guest', name);
    return url.href;
  }

  var api = { guestFromUrl: guestFromUrl, buildLink: buildLink };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
    return;
  }
  root.personalizedInvitation = api;

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
