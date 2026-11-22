const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

module.exports = async function contact(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  // Do not allow another website to submit this form through a visitor's browser.
  if (req.headers['sec-fetch-site'] === 'cross-site') {
    return res.status(403).json({ error: 'Cross-site submissions are not allowed.' });
  }
  if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return res.status(415).json({ error: 'Expected JSON.' });
  }

  let body;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw, 'utf8') > 4096) {
      return res.status(413).json({ error: 'Request is too large or empty.' });
    }
    body = JSON.parse(raw);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON.' });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }
  // A hidden field catches simple bots without adding a challenge for visitors.
  if (typeof body.website !== 'undefined' && (typeof body.website !== 'string' || body.website !== '')) {
    return res.status(400).json({ error: 'Invalid submission.' });
  }
  const limits = { name: 120, organisation: 200, email: 254 };
  const details = {};
  for (const [field, limit] of Object.entries(limits)) {
    const value = body[field];
    if (typeof value !== 'string' || !value.trim() || value.length > limit || CONTROL_CHARACTERS.test(value)) {
      return res.status(400).json({ error: 'Please provide a valid name, organisation and email.' });
    }
    details[field] = value.trim();
  }
  if (!EMAIL_PATTERN.test(details.email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  const interests = ['Technical briefing', 'Offline binary assessment', 'Sandbox testing & triage', 'Evaluation / pilot'];
  if (body.interest !== undefined && !interests.includes(body.interest)) {
    return res.status(400).json({ error: 'Please choose a valid area of interest.' });
  }
  details.interest = body.interest || 'Technical briefing';

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error('Contact email configuration is missing.');
    return res.status(503).json({ error: 'Contact service is temporarily unavailable.' });
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: ['contact@vajraksh.com'],
        reply_to: details.email,
        subject: 'New VAJRAKSH technical briefing request',
        text: [
          'A visitor requested a technical briefing.',
          '',
          `Name: ${details.name}`,
          `Organisation / unit: ${details.organisation}`,
          `Work email: ${details.email}`,
          `Area of interest: ${details.interest}`,
          '',
          'Reply to this email to contact the visitor.'
        ].join('\n')
      }),
      signal: AbortSignal.timeout(10000)
    });
    const result = await response.json();
    if (!response.ok || typeof result.id !== 'string' || !result.id) {
      console.error('Contact email provider rejected the request.', response.status);
      return res.status(502).json({ error: 'Unable to send your request. Please try again.' });
    }
    return res.status(200).json({ success: true });
  } catch {
    // Keep contact details, provider responses and credentials out of logs.
    console.error('Contact email provider request failed.');
    return res.status(502).json({ error: 'Unable to send your request. Please try again.' });
  }
};
