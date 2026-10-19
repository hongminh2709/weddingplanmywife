const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const invitation = require('../local/personalized-invitation.js');

const generic = invitation.buildLink('https://example.com', '');
assert.equal(generic, 'https://example.com/');

const personal = invitation.buildLink('https://example.com', '  em Ánh & gia đình  ');
assert.equal(invitation.guestFromUrl(personal), 'em Ánh & gia đình');
assert.match(new URL(personal).pathname, /^\/m\/[A-Za-z0-9_-]+$/);
assert.equal(invitation.guestFromUrl(generic), '');
assert.equal(invitation.guestFromUrl('https://example.com/?guest=%20%20'), '');
assert.equal(invitation.guestFromUrl('https://example.com/?guest=%3Cscript%3E'), '<script>');
assert.equal(invitation.guestFromUrl('https://example.com/m/_w'), '');
const opened = new URL(invitation.openedLink('https://example.com/chungdoi.com/i/hongminh-khanhlinh.html?guest=An&open=1&_r=123'));
assert.equal(opened.pathname, '/chungdoi.com/i/hongminh-khanhlinhbaf7.html');
assert.equal(opened.searchParams.get('guest'), 'An');
assert.equal(opened.searchParams.has('open'), false);
assert.equal(opened.searchParams.has('_r'), false);

let handleClick;
const document = {
  addEventListener(type, handler, capture) {
    assert.equal(type, 'click');
    assert.equal(capture, true);
    handleClick = handler;
  },
};
vm.runInNewContext(fs.readFileSync('local/personalized-invitation.js', 'utf8'), {
  URL, document, window: { location: { href: generic } },
});
const anchor = {};
let stopped = false;
handleClick({ target: { closest: () => anchor }, stopPropagation: () => { stopped = true; } });
assert.equal(anchor.href, 'https://example.com/chungdoi.com/i/hongminh-khanhlinhbaf7.html');
assert.equal(stopped, true);
console.log('Personalized invitation link checks passed');
