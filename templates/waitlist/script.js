const form = document.querySelector('.waitlist-form');
const email = document.querySelector('#email');
const status = document.querySelector('.form-status');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!email.value.trim() || !email.validity.valid) {
    status.textContent = 'Enter a valid example email address to preview this form.';
    email.focus();
    return;
  }

  status.textContent = 'Preview only: no waitlist entry was created. Your email was not sent or stored.';
  form.reset();
});
