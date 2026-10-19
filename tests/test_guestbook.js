const assert = require('node:assert/strict');
const { createGuestbookFetch } = require('../local/guestbook.js');

(async () => {
  const requests = [];
  const stub = async (url, options = {}) => {
    requests.push({ url, options });
    return Response.json({ comments: [] });
  };
  const fetch = createGuestbookFetch(stub);
  const endpoint = 'https://api.chungdoi.com/api/invite/hongminh-khanhlinh/comments';
  await fetch(endpoint);
  assert.equal(requests[0].url, '/.netlify/functions/guestbook');
  assert.equal(requests[0].options.headers, undefined);
  const body = JSON.stringify({ name: 'An', message: 'Chúc mừng!' });
  await fetch(endpoint, { method: 'POST', body });
  assert.equal(requests[1].options.body, body);
  assert.equal(requests[1].url, '/.netlify/functions/guestbook');
  const suggestions = await (await fetch('https://api.chungdoi.com/api/invite/hongminh-khanhlinh/ai-wishes', { method: 'POST' })).json();
  assert.equal(suggestions.wishes.length, 5);
  console.log('Guestbook browser adapter checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
