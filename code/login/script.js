/* ============================================================
   Royal Cars — Auth page interactions
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const tabs        = document.querySelector('.tabs');
  const tabButtons   = document.querySelectorAll('.tabs__btn');
  const forms        = document.querySelectorAll('.authform');
  const toast        = document.getElementById('toast');

  /* ---------------- Tab / form switching ---------------- */
  function activate(target){
    tabButtons.forEach(btn => {
      const isMatch = btn.dataset.target === target;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      btn.tabIndex = isMatch ? 0 : -1;
    });

    forms.forEach(form => {
      const isMatch = form.id === `panel-${target}`;
      form.classList.toggle('is-active', isMatch);
      form.hidden = !isMatch;
    });

    tabs.classList.toggle('is-signup', target === 'signup');

    if (target === 'signup') {
      document.getElementById('signup-name')?.focus({ preventScroll: true });
    } else {
      document.getElementById('login-email')?.focus({ preventScroll: true });
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => activate(btn.dataset.target));
  });

  document.querySelectorAll('[data-switch]').forEach(el => {
    el.addEventListener('click', () => activate(el.dataset.switch));
  });

  // left/right arrow key navigation between tabs
  tabs?.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const targets = Array.from(tabButtons).map(b => b.dataset.target);
    const current = targets.findIndex(t => document.querySelector(`.tabs__btn[data-target="${t}"]`).classList.contains('is-active'));
    const next = e.key === 'ArrowRight'
      ? (current + 1) % targets.length
      : (current - 1 + targets.length) % targets.length;
    activate(targets[next]);
  });

  /* ---------------- Password visibility toggles ---------------- */
  document.querySelectorAll('[data-toggle-pw]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePw);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.classList.toggle('is-visible', !showing);
      btn.setAttribute('aria-label', showing ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
    });
  });

  /* ---------------- Password strength meter ---------------- */
  const strengthBar = document.querySelector('[data-strength-for="signup-password"]');
  const signupPassword = document.getElementById('signup-password');

  function scorePassword(value){
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
    return score; // 0-3
  }

  signupPassword?.addEventListener('input', () => {
    if (!strengthBar) return;
    const score = scorePassword(signupPassword.value);
    strengthBar.classList.remove('s-weak', 's-fair', 's-strong');
    if (!signupPassword.value) return;
    if (score <= 1) strengthBar.classList.add('s-weak');
    else if (score === 2) strengthBar.classList.add('s-fair');
    else strengthBar.classList.add('s-strong');
  });

  /* ---------------- Validation helpers ---------------- */
  function setError(fieldId, message){
    const input = document.getElementById(fieldId);
    const field = input?.closest('.field');
    const errorEl = document.querySelector(`[data-error-for="${fieldId}"]`);
    if (field) field.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function clearErrors(form){
    form.querySelectorAll('.field').forEach(f => f.classList.remove('has-error'));
    form.querySelectorAll('.field__error').forEach(e => { e.textContent = ''; e.classList.remove('is-visible'); });
  }

  function showToast(message){
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  /* ---------------- Login form ---------------- */
  const loginForm = document.getElementById('panel-login');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(loginForm);

    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    let valid = true;

    if (!email.value.trim() || !email.checkValidity()) {
      setError('login-email', 'Entrez une adresse e-mail valide.');
      valid = false;
    }
    if (password.value.length < 8) {
      setError('login-password', 'Le mot de passe doit contenir au moins 8 caractères.');
      valid = false;
    }

    if (!valid) return;

    const btn = loginForm.querySelector('.btn--primary');
    submitWithFeedback(btn, () => {
      showToast(`Bienvenue, connexion réussie.`);
      loginForm.reset();
    });
  });

  /* ---------------- Signup form ---------------- */
  const signupForm = document.getElementById('panel-signup');
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(signupForm);
    setError('signup-terms', '');
    document.querySelector('[data-error-for="signup-terms"]')?.classList.remove('is-visible');

    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const phone = document.getElementById('signup-phone');
    const password = document.getElementById('signup-password');
    const confirm = document.getElementById('signup-confirm');
    const terms = signupForm.querySelector('[name="terms"]');
    let valid = true;

    if (!name.value.trim()) {
      setError('signup-name', 'Entrez votre nom complet.');
      valid = false;
    }
    if (!email.value.trim() || !email.checkValidity()) {
      setError('signup-email', 'Entrez une adresse e-mail valide.');
      valid = false;
    }
    if (!phone.value.trim() || phone.value.replace(/\D/g, '').length < 9) {
      setError('signup-phone', 'Entrez un numéro de téléphone valide.');
      valid = false;
    }
    if (password.value.length < 8) {
      setError('signup-password', 'Le mot de passe doit contenir au moins 8 caractères.');
      valid = false;
    }
    if (confirm.value !== password.value || !confirm.value) {
      setError('signup-confirm', 'Les mots de passe ne correspondent pas.');
      valid = false;
    }
    if (!terms.checked) {
      const termsError = document.querySelector('[data-error-for="signup-terms"]');
      if (termsError) {
        termsError.textContent = 'Veuillez accepter les conditions d\'utilisation.';
        termsError.classList.add('is-visible');
      }
      valid = false;
    }

    if (!valid) return;

    const btn = signupForm.querySelector('.btn--primary');
    submitWithFeedback(btn, () => {
      showToast(`Compte créé, bienvenue chez Royal Cars.`);
      signupForm.reset();
      document.querySelector('.strength')?.classList.remove('s-weak', 's-fair', 's-strong');
    });
  });

  /* ---------------- Simulated async submit ---------------- */
  function submitWithFeedback(button, onDone){
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = 'Veuillez patienter…';

    setTimeout(() => {
      button.disabled = false;
      button.innerHTML = originalContent;
      onDone();
    }, 900);
  }

  /* live-clear a field's error state once the user starts fixing it */
  document.querySelectorAll('.field input').forEach(input => {
    input.addEventListener('input', () => {
      const field = input.closest('.field');
      if (field?.classList.contains('has-error')) {
        field.classList.remove('has-error');
        const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);
        if (errorEl) errorEl.textContent = '';
      }
    });
  });

});
