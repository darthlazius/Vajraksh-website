const { test } = require('node:test');
const assert = require('node:assert/strict');
const contact = require('../api/contact');

const valid = { name: 'Test Visitor', organisation: 'Example Unit', email: 'visitor@example.com', website: '' };

async function submit(body = valid, options = {}) {
  const req = { method: 'POST', headers: { 'content-type': 'application/json' }, body, ...options };
  const res = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
  await contact(req, res);
  return res;
}

test('contact endpoint validates submissions and sends only to the configured team inbox', async t => {
  const originalFetch = global.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.CONTACT_FROM_EMAIL;
  t.after(() => {
    global.fetch = originalFetch;
    for (const [key, value] of [['RESEND_API_KEY', originalKey], ['CONTACT_FROM_EMAIL', originalFrom]]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  process.env.RESEND_API_KEY = 'test-key';
  process.env.CONTACT_FROM_EMAIL = 'Website <website@example.com>';
  let calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ id: 'test-email-id' }) };
  };

  await t.test('valid details reach the provider with a fixed recipient and visitor Reply-To', async () => {
    const res = await submit({ ...valid, name: '  Test Visitor  ', to: 'attacker@example.com' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true });
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.resend.com/emails');
    const message = JSON.parse(calls[0].options.body);
    assert.deepEqual(message.to, ['contact@vajraksh.com']);
    assert.equal(message.reply_to, valid.email);
    assert.match(message.text, /Name: Test Visitor\n/);
    assert.match(message.text, /Organisation \/ unit: Example Unit/);
    assert.match(message.text, /Area of interest: Technical briefing/);
    assert.equal(message.from, process.env.CONTACT_FROM_EMAIL);
    assert.equal(message.html, undefined);
    calls = [];
  });

  await t.test('selected area of interest is included in the notification', async () => {
    const res = await submit({ ...valid, interest: 'Sandbox testing & triage' });
    assert.equal(res.statusCode, 200);
    const message = JSON.parse(calls[0].options.body);
    assert.match(message.text, /Area of interest: Sandbox testing & triage/);
    calls = [];
  });

  await t.test('invalid data, bots, oversized requests and cross-site browsers never trigger email', async () => {
    for (const body of [null, [], '{', {}, { ...valid, name: ' ' }, { ...valid, email: 'invalid' },
      { ...valid, email: 'person@example.com\r\nBcc: other@example.com' },
      { ...valid, organisation: 'a'.repeat(201) }, { ...valid, name: 123 },
      { ...valid, interest: 'Unexpected option' }, { ...valid, interest: ['Technical briefing'] },
      { ...valid, website: 'https://spam.example.com' }]) {
      assert.equal((await submit(body)).statusCode, 400);
    }
    assert.equal((await submit('x'.repeat(4097))).statusCode, 413);
    assert.equal((await submit(valid, { headers: { 'content-type': 'text/plain' } })).statusCode, 415);
    assert.equal((await submit(valid, { headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' } })).statusCode, 403);
    const get = await submit(valid, { method: 'GET' });
    assert.equal(get.statusCode, 405);
    assert.equal(get.headers.Allow, 'POST');
    assert.equal(calls.length, 0);
  });

  await t.test('missing credentials and provider failures never report success', async () => {
    delete process.env.RESEND_API_KEY;
    assert.equal((await submit()).statusCode, 503);
    assert.equal(calls.length, 0);
    process.env.RESEND_API_KEY = 'test-key';
    global.fetch = async () => ({ ok: false, status: 429, json: async () => ({ message: 'private provider error' }) });
    const rejected = await submit();
    assert.equal(rejected.statusCode, 502);
    assert.equal(JSON.stringify(rejected.body).includes('private provider error'), false);
    global.fetch = async () => { throw new Error('network timeout'); };
    assert.equal((await submit()).statusCode, 502);
    global.fetch = async () => ({ ok: true, status: 200, json: async () => ({}) });
    assert.equal((await submit()).statusCode, 502);
  });
});
