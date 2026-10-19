const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

async function run() {
  const listeners = {};
  const submit = {};
  const elements = {
    'invite-form': {
      elements: { mode: { value: 'personal' } },
      addEventListener: (type, fn) => { listeners[type] = fn; },
      querySelector: () => submit,
    },
    'guest-field': {}, guest: { value: ' Em Ánh ', addEventListener() {} },
    result: {}, link: {}, preview: {}, 'copy-message': {}, 'form-error': {}, open: {},
    copy: { addEventListener() {} },
  };
  let status = 200;
  const calls = [];
  const context = {
    URL, document: { getElementById: id => elements[id] },
    window: { location: { origin: 'https://example.com' }, personalizedInvitation: { buildLink: origin => origin + '/thiep' } },
    fetch: async (url, options) => {
      calls.push({ url, body: JSON.parse(options.body) });
      return { ok: status === 200, json: async () => status === 200 ? { code: 's_0123456789abcdef' } : { error: 'Không thể tạo liên kết.' } };
    },
  };
  vm.runInNewContext(fs.readFileSync('local/admin.js', 'utf8'), context);
  await listeners.submit({ preventDefault() {} });
  assert.equal(calls[0].body.guest, 'Em Ánh');
  assert.equal(elements.link.value, 'https://example.com/m/s_0123456789abcdef');
  assert.equal(elements.preview.textContent, 'Thân Mời Em Ánh');
  assert.equal(elements.result.hidden, false);
  status = 503;
  await listeners.submit({ preventDefault() {} });
  assert.equal(elements.result.hidden, true);
  assert.equal(elements['form-error'].textContent, 'Không thể tạo liên kết.');
  assert.equal(submit.disabled, false);
  console.log('Invitation admin checks passed');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
