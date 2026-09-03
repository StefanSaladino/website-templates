const form = document.querySelector('.waitlist-form');
const email = document.querySelector('#email');
const status = document.querySelector('.form-status');

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!email.value.trim() || !email.validity.valid) {
    status.textContent = 'Enter a valid email address to join the beta.';
    email.focus();
    return;
  }

  status.textContent = 'You’re on the list. We’ll only email when an invite is ready.';
  form.reset();
});
