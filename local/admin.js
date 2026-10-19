(function () {
  'use strict';
  var form = document.getElementById('invite-form');
  var field = document.getElementById('guest-field');
  var guest = document.getElementById('guest');
  var result = document.getElementById('result');
  var link = document.getElementById('link');
  var preview = document.getElementById('preview');
  var message = document.getElementById('copy-message');

  function isPersonal() {
    return form.elements.mode.value === 'personal';
  }

  form.addEventListener('change', function () {
    field.hidden = !isPersonal();
    guest.required = isPersonal();
    result.hidden = true;
  });
  guest.addEventListener('input', function () { result.hidden = true; });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var name = isPersonal() ? guest.value.trim() : '';
    if (isPersonal() && !name) {
      guest.setCustomValidity('Vui lòng nhập tên khách mời.');
      guest.reportValidity();
      guest.setCustomValidity('');
      return;
    }
    link.value = window.personalizedInvitation.buildLink(window.location.origin, name);
    preview.textContent = 'Thân Mời' + (name ? ' ' + name : '');
    document.getElementById('open').href = link.value;
    message.textContent = '';
    result.hidden = false;
  });

  document.getElementById('copy').addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(link.value);
      message.textContent = 'Đã sao chép liên kết.';
    } catch (_) {
      link.focus();
      link.select();
      message.textContent = 'Hãy sao chép đường dẫn đã chọn ở trên.';
    }
  });
})();
