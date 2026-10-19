(function () {
  'use strict';
  var form = document.getElementById('invite-form');
  var field = document.getElementById('guest-field');
  var guest = document.getElementById('guest');
  var result = document.getElementById('result');
  var link = document.getElementById('link');
  var preview = document.getElementById('preview');
  var message = document.getElementById('copy-message');
  var error = document.getElementById('form-error');
  var submit = form.querySelector('button[type="submit"]');

  function isPersonal() {
    return form.elements.mode.value === 'personal';
  }

  form.addEventListener('change', function () {
    field.hidden = !isPersonal();
    guest.required = isPersonal();
    result.hidden = true;
    error.textContent = '';
  });
  guest.addEventListener('input', function () { result.hidden = true; });

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    var name = isPersonal() ? guest.value.trim() : '';
    if (isPersonal() && !name) {
      guest.setCustomValidity('Vui lòng nhập tên khách mời.');
      guest.reportValidity();
      guest.setCustomValidity('');
      return;
    }
    error.textContent = '';
    result.hidden = true;
    submit.disabled = true;
    try {
      if (name) {
        var response = await fetch('/api/invitations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guest: name }),
        });
        var data = await response.json();
        if (!response.ok || !/^s_[a-f0-9]{16}$/.test(data.code)) {
          throw new Error(data.error || 'Không thể tạo liên kết. Vui lòng thử lại.');
        }
        link.value = new URL('/m/' + data.code, window.location.origin).href;
      } else {
        link.value = window.personalizedInvitation.buildLink(window.location.origin, '');
      }
    } catch (err) {
      error.textContent = err.message || 'Không thể tạo liên kết. Vui lòng thử lại.';
      return;
    } finally {
      submit.disabled = false;
    }
    if ((isPersonal() ? guest.value.trim() : '') !== name) return;
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
