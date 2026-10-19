const assert = require('node:assert/strict');
const invitation = require('../local/personalized-invitation.js');

const generic = invitation.buildLink('https://example.com', '');
assert.equal(generic, 'https://example.com/');
const name = 'em Ánh & gia đình';
const personal = invitation.buildLink('https://example.com', `  ${name}  `);
assert.match(personal, /^https:\/\/example\.com\/m\/[A-Za-z0-9_-]+$/);
assert.equal(invitation.guestFromUrl(personal), name);
assert.equal(invitation.guestFromUrl(personal + '?open=1'), name);
assert.equal(invitation.guestFromUrl(generic), '');
assert.equal(invitation.guestFromUrl('https://example.com/?guest=%20%20'), '');
assert.equal(invitation.guestFromUrl('https://example.com/?guest=%3Cscript%3E'), '<script>');
assert.equal(invitation.guestFromUrl('https://example.com/m/%ZZ'), '');
console.log('Personalized invitation link checks passed');
