const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

// Exercise the actual form handler without needing a browser or email credentials.
const handlerScript = readFileSync(require.resolve('../contact-form.js'), 'utf8');

function setup(fetch) {
  let handler;
  let resets = 0;
  const attributes = {};
  const button = { innerHTML: 'Request a technical briefing', disabled: false };
  const note = { dataset: {}, removeAttribute() { delete this.dataset.status; } };
  const form = {
    addEventListener(event, callback) { handler = callback; },
    getAttribute(name) { return attributes[name]; },
    setAttribute(name, value) { attributes[name] = value; },
    reportValidity() { return true; },
    querySelector() { return button; },
    reset() { resets++; }
  };
  vm.runInNewContext(handlerScript, {
    document: { getElementById: id => id === 'briefing-form' ? form : note },
    FormData: class { *[Symbol.iterator]() { yield ['name', 'Test']; yield ['email', 'test@example.com']; } },
    fetch, AbortSignal
  });
  return { submit: () => handler({ preventDefault() {}, currentTarget: form }), form, button, note, resets: () => resets };
}

test('successful submission resets the form only after acceptance and prevents duplicate clicks', async () => {
  let finish;
  let calls = 0;
  const ui = setup((url, options) => {
    calls++;
    assert.equal(url, '/api/contact');
    assert.equal(options.method, 'POST');
    return new Promise(resolve => { finish = resolve; });
  });
  const pending = ui.submit();
  assert.equal(ui.button.disabled, true);
  assert.equal(ui.resets(), 0);
  await ui.submit();
  assert.equal(calls, 1);
  finish({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.equal(ui.resets(), 1);
  assert.equal(ui.note.dataset.status, 'success');
  assert.equal(ui.button.disabled, false);
  assert.equal(ui.form.getAttribute('aria-busy'), 'false');
});

test('network, server and malformed responses preserve details and allow a retry', async () => {
  for (const fetch of [
    async () => { throw new Error('offline'); },
    async () => ({ ok: false, json: async () => ({ error: 'Unavailable' }) }),
    async () => ({ ok: true, json: async () => { throw new Error('not JSON'); } }),
    async () => ({ ok: true, json: async () => ({}) })
  ]) {
    const ui = setup(fetch);
    await ui.submit();
    assert.equal(ui.resets(), 0);
    assert.equal(ui.note.dataset.status, 'error');
    assert.match(ui.note.textContent, /contact@vajraksh.com/);
    assert.equal(ui.button.disabled, false);
  }
});
