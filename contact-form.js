document.getElementById('briefing-form').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.currentTarget;
  if (form.getAttribute('aria-busy') === 'true' || !form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  const note = document.getElementById('form-note');
  const originalLabel = button.innerHTML;
  const details = Object.fromEntries(new FormData(form));
  form.setAttribute('aria-busy', 'true');
  button.disabled = true;
  button.textContent = 'Sending…';
  note.textContent = 'Sending your briefing request…';
  note.removeAttribute('data-status');
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
      signal: AbortSignal.timeout(20000)
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error('Submission failed');
    form.reset();
    note.dataset.status = 'success';
    note.textContent = 'Thank you. Your briefing request has been sent. We’ll contact you by email.';
  } catch {
    note.dataset.status = 'error';
    note.textContent = 'We couldn’t send your request. Please try again or email contact@vajraksh.com.';
  } finally {
    form.setAttribute('aria-busy', 'false');
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
});
