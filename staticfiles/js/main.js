/* =========================================
   MAIN.JS — Global JavaScript
   ========================================= */

'use strict';

// ─── Navbar Menu Toggle ───
const btnMenu = document.querySelector('.btn-menu');
const navLinks = document.querySelector('.navbar-links');
if (btnMenu && navLinks) {
  btnMenu.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
      navLinks.classList.remove('open');
    }
  });
}

// ─── Auto-dismiss Django messages ───
document.querySelectorAll('.alert[data-auto-dismiss]').forEach(alert => {
  const delay = parseInt(alert.dataset.autoDismiss) || 4000;
  setTimeout(() => {
    alert.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-8px)';
    setTimeout(() => alert.remove(), 400);
  }, delay);
});

// ─── Scroll-to-top button ───
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── CSRF Token helper ───
function getCookie(name) {
  let val = null;
  if (document.cookie && document.cookie !== '') {
    document.cookie.split(';').forEach(cookie => {
      const c = cookie.trim();
      if (c.startsWith(name + '=')) {
        val = decodeURIComponent(c.slice(name.length + 1));
      }
    });
  }
  return val;
}
window.csrfToken = getCookie('csrftoken');

// ─── Fetch with CSRF helper ───
window.apiFetch = function(url, options = {}) {
  return fetch(url, {
    headers: {
      'X-CSRFToken': window.csrfToken,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
};

// ─── Animate elements on scroll ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in-1, .fade-in-2, .fade-in-3, .fade-in-4').forEach(el => {
  el.style.animationPlayState = 'paused';
  observer.observe(el);
});

// ─── Number counter animation ───
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = start + (el.dataset.suffix || '');
  }, 16);
}

const counterEls = document.querySelectorAll('[data-counter]');
if (counterEls.length) {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target, parseInt(entry.target.dataset.counter));
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObs.observe(el));
}

// ─── Toast notification system ───
window.showToast = function(msg, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 1.5rem; right: 1.5rem;
      display: flex; flex-direction: column; gap: 8px;
      z-index: 9999; pointer-events: none;
    `;
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  const colors = {
    success: 'var(--accent)',
    error: 'var(--danger)',
    warning: 'var(--warning)',
    info: '#a78bfa'
  };

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: var(--bg-secondary);
    border: 1px solid ${colors[type]};
    border-left: 3px solid ${colors[type]};
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: ${colors[type]};
    display: flex;
    align-items: center;
    gap: 10px;
    pointer-events: all;
    animation: fadeIn 0.3s ease;
    min-width: 220px;
    max-width: 340px;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  `;
  toast.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ─── Active nav link highlighting ───
const currentPath = window.location.pathname;
document.querySelectorAll('.navbar-links a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});

// ─── Theme persistence (for future dark/light toggle) ───
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
