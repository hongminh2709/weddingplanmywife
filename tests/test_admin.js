const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const personalized = require('../local/personalized-invitation.js');
const listeners = {};
const elements = {
  'invite-form': { elements: { mode: { value: 'personal' } }, addEventListener: (type, fn) => { listeners[type] = fn; } },
  'guest-field': {}, guest: { value: ' Em Ánh ', addEventListener() {} }, result: {}, link: {}, preview: {},
  'copy-message': {}, open: {}, copy: { addEventListener() {} },
};
vm.runInNewContext(fs.readFileSync('local/admin.js', 'utf8'), {
  document: { getElementById: id => elements[id] },
  window: { location: { origin: 'https://example.com' }, personalizedInvitation: personalized },
});
listeners.submit({ preventDefault() {} });
assert.equal(personalized.guestFromUrl(elements.link.value), 'Em Ánh');
assert.equal(elements.preview.textContent, 'Thân Mời Em Ánh');
elements['invite-form'].elements.mode.value = 'generic';
listeners.submit({ preventDefault() {} });
assert.equal(elements.link.value, 'https://example.com/');
console.log('Invitation admin checks passed');
