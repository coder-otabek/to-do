/* =========================================
   PROFILE.JS — Profile page scripts
   ========================================= */

'use strict';

// ─── Avatar upload preview ───
const avatarInput = document.getElementById('avatar-file-input');
const avatarPreview = document.querySelector('.avatar-large, .avatar');
const avatarUploadBtn = document.querySelector('.avatar-upload-btn');

if (avatarUploadBtn && avatarInput) {
  avatarUploadBtn.addEventListener('click', () => avatarInput.click());

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      window.showToast && window.showToast("Faqat rasm fayllar qabul qilinadi!", 'error');
      return;
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      window.showToast && window.showToast("Fayl hajmi 5MB dan oshmasligi kerak!", 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (avatarPreview) {
        avatarPreview.src = e.target.result;
        avatarPreview.style.animation = 'none';
        avatarPreview.offsetHeight;
        avatarPreview.style.animation = 'fadeIn 0.3s ease';
      }
    };
    reader.readAsDataURL(file);
  });
}

// ─── Skills bar animation ───
const skillBars = document.querySelectorAll('.skill-bar-fill');
if (skillBars.length) {
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target.dataset.width || '0%';
        entry.target.style.width = '0%';
        requestAnimationFrame(() => {
          setTimeout(() => {
            entry.target.style.width = target;
          }, 100);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  skillBars.forEach(bar => skillObserver.observe(bar));
}

// ─── Change profile form — dirty state detection ───
const changeForm = document.querySelector('.change-profile-form');
if (changeForm) {
  let initialData = new FormData(changeForm);
  let isDirty = false;

  changeForm.addEventListener('input', () => { isDirty = true; });

  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  changeForm.addEventListener('submit', () => {
    isDirty = false; // Allow navigation on submit
  });
}

// ─── Character counter for bio/textarea ───
document.querySelectorAll('textarea[data-maxlength]').forEach(ta => {
  const max = parseInt(ta.dataset.maxlength);
  const counter = document.createElement('div');
  counter.style.cssText = `
    text-align: right;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-top: 4px;
  `;
  ta.parentNode.insertBefore(counter, ta.nextSibling);

  function update() {
    const left = max - ta.value.length;
    counter.textContent = `${ta.value.length} / ${max}`;
    counter.style.color = left < 20 ? 'var(--danger)' : 'var(--text-muted)';
    if (ta.value.length > max) {
      ta.value = ta.value.slice(0, max);
    }
  }
  ta.addEventListener('input', update);
  update();
});

// ─── Social link prefix auto-complete ───
const socialInputs = {
  'id_github':   'https://github.com/',
  'id_twitter':  'https://twitter.com/',
  'id_linkedin': 'https://linkedin.com/in/',
  'id_website':  'https://',
};

Object.entries(socialInputs).forEach(([id, prefix]) => {
  const input = document.getElementById(id);
  if (!input) return;
  input.addEventListener('focus', () => {
    if (!input.value) input.value = prefix;
  });
  input.addEventListener('blur', () => {
    if (input.value === prefix) input.value = '';
  });
});
