// Presentation-only interactions. No network requests or persistent visitor data.
// Only the display preference is persisted; form and assessment details stay in memory.
const themeButton = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let explicitTheme;
try { explicitTheme = localStorage.getItem('vajraksh-theme'); } catch {}
if (!['light', 'dark'].includes(explicitTheme)) explicitTheme = null;
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  themeButton.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`;
}
applyTheme(document.documentElement.dataset.theme);
themeButton.addEventListener('click', () => {
  explicitTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(explicitTheme);
  try { localStorage.setItem('vajraksh-theme', explicitTheme); } catch {}
});
systemTheme.addEventListener('change', event => {
  if (!explicitTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('primary-nav');
function closeMenu() {
  navigation.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, moveFocus = false) {
  tabs.forEach(candidate => {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
  });
  if (moveFocus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activateTab(tabs[next], true);
    }
  });
});

const decisionButtons = [...document.querySelectorAll('[data-decision]')];
decisionButtons.forEach(button => {
  button.setAttribute('aria-pressed', 'false');
  button.addEventListener('click', () => {
    const rationale = document.getElementById('review-rationale');
    if (!rationale.value.trim()) {
      document.getElementById('decision-status').textContent = 'Add a short rationale before recording this sample decision.';
      rationale.focus();
      return;
    }
    decisionButtons.forEach(candidate => {
      candidate.classList.remove('selected-decision');
      candidate.setAttribute('aria-pressed', String(candidate === button));
    });
    document.getElementById('decision-status').textContent = `${button.dataset.decision} — sample decision noted for this preview. Rationale: ${rationale.value.trim()}. This is not a deployment approval; nothing is submitted or saved.`;
  });
});

const form = document.getElementById('preview-form');
const briefingDialog = document.getElementById('briefing-dialog');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const details = new FormData(form);
  document.getElementById('dialog-summary').textContent = `${details.get('name')}, your preview is for ${details.get('organisation')}, covering ${details.get('interest').toLowerCase()}.`;
  document.getElementById('form-status').textContent = 'Preview prepared. Nothing has been sent or stored. You can email contact@vajraksh.com to contact the team.';
  briefingDialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => briefingDialog.close());
document.querySelector('.dialog-return').addEventListener('click', () => briefingDialog.close());
briefingDialog.addEventListener('click', event => {
  if (event.target === briefingDialog) {
    const bounds = briefingDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) briefingDialog.close();
  }
});

if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  links.forEach(link => observer.observe(document.querySelector(link.hash)));
}
