// Comptes admin (à personnaliser)
  const ADMINS = [
    { email: 'admin@royalcars.cm', password: 'royalcars2024' },
    { email: 'marvel@royalcars.cm', password: 'marvel123' },
  ];

  function login() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const match = ADMINS.find(a => a.email === email && a.password === password);
    if (match) {
      sessionStorage.setItem('rc_admin', JSON.stringify({ email, loggedAt: Date.now() }));
      window.location.href = 'dashboard.html';
    } else {
      document.getElementById('error-msg').classList.add('show');
      document.getElementById('password').value = '';
    }
  }

  // Déjà connecté ?
  if (sessionStorage.getItem('rc_admin')) {
    window.location.href = 'dashboard.html';
  }