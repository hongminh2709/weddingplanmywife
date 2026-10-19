const assert = require('node:assert/strict');
const invitation = require('../local/personalized-invitation.js');

const generic = invitation.buildLink('https://example.com', '');
assert.equal(generic, 'https://example.com/chungdoi.com/i/hongminh-khanhlinh.html');

const personal = invitation.buildLink('https://example.com', '  em Ánh & gia đình  ');
assert.equal(invitation.guestFromUrl(personal), 'em Ánh & gia đình');
assert.equal(invitation.guestFromUrl(generic), '');
assert.equal(invitation.guestFromUrl('https://example.com/?guest=%20%20'), '');
assert.equal(invitation.guestFromUrl('https://example.com/?guest=%3Cscript%3E'), '<script>');
console.log('Personalized invitation link checks passed');
