/* =========================================
   AUTH.JS — Authentication page scripts
   ========================================= */

'use strict';

// ─── Password toggle visibility ───
document.querySelectorAll('.input-toggle[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword ? '🙈' : '👁';
  });
});

// ─── Password strength meter ───
const passwordInput = document.getElementById('id_password1') || document.getElementById('id_password');
const strengthBar = document.querySelector('.strength-fill');
const strengthText = document.querySelector('.strength-text');
const strengthWrapper = document.querySelector('.password-strength');

function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { cls: 'strength-weak',   label: 'Juda zaif',  color: 'var(--danger)'  },
    { cls: 'strength-weak',   label: 'Zaif',       color: 'var(--danger)'  },
    { cls: 'strength-fair',   label: "O'rtacha",   color: 'var(--warning)' },
    { cls: 'strength-good',   label: 'Yaxshi',     color: '#60a5fa'        },
    { cls: 'strength-strong', label: 'Kuchli! 💪', color: 'var(--accent)'  },
  ];
  return levels[Math.min(score, 4)];
}

if (passwordInput && strengthBar && strengthWrapper) {
  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    if (!val) {
      strengthWrapper.style.display = 'none';
      return;
    }
    strengthWrapper.style.display = 'block';
    const result = checkPasswordStrength(val);
    const widths = ['25%', '35%', '55%', '75%', '100%'];
    const score = [
      val.length >= 8,
      val.length >= 12,
      /[A-Z]/.test(val),
      /[0-9]/.test(val),
      /[^A-Za-z0-9]/.test(val)
    ].filter(Boolean).length;

    strengthBar.style.width = widths[Math.min(score, 4)];
    strengthBar.style.background = result.color;
    if (strengthText) {
      strengthText.textContent = result.label;
      strengthText.style.color = result.color;
    }
  });
  strengthWrapper.style.display = 'none';
}

// ─── Confirm password match ───
const pass1 = document.getElementById('id_password1');
const pass2 = document.getElementById('id_password2');
if (pass1 && pass2) {
  function checkMatch() {
    if (!pass2.value) return;
    const match = pass1.value === pass2.value;
    pass2.classList.toggle('is-invalid', !match);
    let feedback = pass2.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
      feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';
      pass2.parentNode.insertBefore(feedback, pass2.nextSibling);
    }
    feedback.textContent = match ? '' : 'Parollar mos emas!';
    feedback.style.display = match ? 'none' : 'block';
  }
  pass1.addEventListener('input', checkMatch);
  pass2.addEventListener('input', checkMatch);
}

// ─── OTP input auto-advance ───
const otpInputs = document.querySelectorAll('.otp-input');
otpInputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    if (input.value.length === 1 && i < otpInputs.length - 1) {
      otpInputs[i + 1].focus();
    }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && i > 0) {
      otpInputs[i - 1].focus();
    }
  });
  input.addEventListener('paste', (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    [...pasted].forEach((char, j) => {
      if (otpInputs[i + j]) otpInputs[i + j].value = char;
    });
    const next = otpInputs[Math.min(i + pasted.length, otpInputs.length - 1)];
    if (next) next.focus();
    e.preventDefault();
  });
});

// ─── Form submit loading state ───
document.querySelectorAll('form.auth-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.classList.add('btn-loading');
      submitBtn.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.7s linear infinite;margin-right:6px;"></span> Yuklanmoqda...`;
    }
  });
});

// ─── Email validation ───
const emailInput = document.querySelector('input[type="email"]');
if (emailInput) {
  emailInput.addEventListener('blur', () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    if (emailInput.value && !valid) {
      emailInput.classList.add('is-invalid');
    } else {
      emailInput.classList.remove('is-invalid');
    }
  });
}

// ─── Username availability check (debounced) ───
const usernameInput = document.getElementById('id_username');
if (usernameInput) {
  let debounceTimer;
  usernameInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const val = usernameInput.value;
    if (val.length < 3) return;
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/accounts/check-username/?username=${encodeURIComponent(val)}`);
        const data = await res.json();
        usernameInput.classList.toggle('is-invalid', !data.available);
        usernameInput.style.borderColor = data.available ? 'var(--accent)' : 'var(--danger)';
      } catch (_) { /* server-side validation will handle it */ }
    }, 400);
  });
}
