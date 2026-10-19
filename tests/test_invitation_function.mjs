import assert from 'node:assert/strict';
import invitation, { config } from '../netlify/functions/invitation.mjs';
assert.deepEqual(config.path, ['/', '/m/:code', '/thiep', '/api/invitations']);
const name = 'Em gái & gia đình';
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_PUBLISHABLE_KEY;
const createRequest = () => new Request('https://example.com/api/invitations', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guest: name }),
});
assert.equal((await invitation(createRequest())).status, 503);
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
const originalFetch = globalThis.fetch;
const calls = [];
globalThis.fetch = async (url, options) => {
  calls.push({ url: url.href, body: JSON.parse(options.body), headers: options.headers });
  if (url.pathname.endsWith('/create_invitation_link')) return Response.json('s_0123456789abcdef');
  if (url.pathname.endsWith('/get_invitation_guest')) return Response.json(calls.at(-1).body.link_code === 's_0123456789abcdef' ? name : null);
  throw new Error('Unexpected request');
};
try {
  const created = await invitation(createRequest());
  assert.equal(created.status, 200);
  assert.deepEqual(await created.json(), { code: 's_0123456789abcdef' });
  assert.deepEqual(calls[0].body, { guest: name });
  assert.equal(calls[0].headers.apikey, 'sb_publishable_test');
  const short = await invitation(new Request('https://example.com/m/s_0123456789abcdef'));
  const preview = await short.text();
  assert.equal(short.status, 200);
  assert.ok(preview.includes('Thân mời Em gái &amp; gia đình'));
  assert.ok(preview.includes('guest=Em+g%C3%A1i+%26+gia+%C4%91%C3%ACnh'));
  assert.equal((await invitation(new Request('https://example.com/m/s_0000000000000000'))).status, 404);
  globalThis.fetch = async () => new Response('', { status: 500 });
  assert.equal((await invitation(createRequest())).status, 502);
  assert.equal((await invitation(new Request('https://example.com/m/s_0123456789abcdef'))).status, 502);
} finally {
  globalThis.fetch = originalFetch;
}
console.log('Invitation share preview checks passed');
