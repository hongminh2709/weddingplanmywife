import assert from 'node:assert/strict';
import preview from '../netlify/functions/invitation.mjs';
import invitation from '../local/personalized-invitation.js';

const personal = invitation.buildLink('https://example.com', 'em Ánh & gia đình');
const code = new URL(personal).pathname.split('/').pop();
const response = await preview(new Request(`https://example.com/m/${code}`));
assert.equal(response.status, 200);
const html = await response.text();
assert.match(html, /property="og:description" content="Thân mời em Ánh &amp; gia đình/);
assert.match(html, /property="og:url" content="https:\/\/example\.com\/m\//);
assert.match(html, /property="og:image" content="https:\/\/example\.com\/cdn\.chungdoi\.com\/uploads\//);
assert.match(html, /data-landing-screenshot-id="invite-envelope"/);
const malicious = invitation.buildLink('https://example.com', '<script>"');
const badCode = new URL(malicious).pathname.split('/').pop();
const safeHtml = await (await preview(new Request(`https://example.com/m/${badCode}`))).text();
assert.match(safeHtml, /&lt;script&gt;&quot;/);
assert.equal((await preview(new Request('https://example.com/m/!!!'))).status, 404);
console.log('Invitation preview checks passed');
