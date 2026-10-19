const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Exercise the saved renderer's actual envelope hook, including its mount effects.
const code = fs.readFileSync('chungdoi.com/_next/static/chunks/2065-d547b56d1a80cad3.js', 'utf8');
const start = code.indexOf('function(e){let{enabled:t,initialOpened:s=!1}');
const end = code.indexOf('({enabled:!0,initialOpened:c||A})', start);
assert.ok(start >= 0 && end > start);
const source = '(' + code.slice(start, end) + ')';

function renderEnvelope(search) {
  const states = [];
  let index = 0;
  let effects = [];
  const react = {
    useState(initial) {
      const slot = index++;
      if (!(slot in states)) states[slot] = typeof initial === 'function' ? initial() : initial;
      return [states[slot], value => { states[slot] = value; }];
    },
    useRef(value) { return { current: value }; },
    useEffect(effect) { effects.push(effect); },
    useLayoutEffect() {},
    useCallback(fn) { return fn; },
  };
  const context = { r: react, URLSearchParams, window: { location: { search } }, document: {}, history: {}, setTimeout, clearTimeout };
  const hook = vm.runInNewContext(source, context);
  function render() { index = 0; effects = []; return hook({ enabled: true }); }
  let result = render();
  effects.forEach(effect => effect());
  result = render();
  return result.envelopeOpened;
}

assert.equal(renderEnvelope(''), false);
assert.equal(renderEnvelope('?guest=An&open=1'), true);
assert.equal(renderEnvelope('?guest=An&open=0'), false);

const invitation = require('../local/personalized-invitation.js');
const fallback = new URL(invitation.openFallbackUrl('https://example.com/invite?guest=An&scroll=20#section'));
assert.equal(fallback.searchParams.get('guest'), 'An');
assert.equal(fallback.searchParams.get('scroll'), '20');
assert.equal(fallback.searchParams.get('open'), '1');
assert.equal(fallback.hash, '#section');
console.log('Envelope opening checks passed');
