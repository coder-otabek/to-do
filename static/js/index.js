/* =========================================
   INDEX.JS — Homepage scripts
   ========================================= */

'use strict';

// ─── Text Scramble Effect ───
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKabcdefghijkl01234';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    return new Promise(resolve => {
      let queue = [];
      for (let i = 0; i < len; i++) {
        const from = old[i] || '';
        const to   = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end   = start + Math.floor(Math.random() * 20);
        queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.queue = queue;
      this.resolve = resolve;
      this.update();
    });
  }
  update() {
    let output = '', complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:var(--accent);opacity:0.6">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// Run scramble on hero title
const scrambleEl = document.querySelector('.scramble');
if (scrambleEl) {
  const fx = new TextScramble(scrambleEl);
  const originalText = scrambleEl.textContent;
  setTimeout(() => fx.setText(originalText), 300);
}

// ─── Projects Filter ───
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visibleCount = 0;

    projectCards.forEach((card, i) => {
      const cardCategory = card.dataset.category || '';
      const show = filter === 'all' || cardCategory.includes(filter);

      if (show) {
        card.style.display = 'flex';
        card.style.animationDelay = `${visibleCount * 0.05}s`;
        card.style.animation = 'none';
        card.offsetHeight; // reflow
        card.style.animation = 'fadeIn 0.4s ease both';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show empty state if no cards
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  });
});

// ─── Project card click (open detail) ───
projectCards.forEach(card => {
  const link = card.dataset.url;
  if (link) {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('a')) {
        window.location.href = link;
      }
    });
    card.style.cursor = 'pointer';
  }
});

// ─── Typed greeting ───
const greetingEl = document.querySelector('.typed-greeting');
if (greetingEl) {
  const texts = ['Django Developer', 'Python Enthusiast', 'Backend Engineer', 'Problem Solver'];
  let currentIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = texts[currentIndex];
    if (isDeleting) {
      greetingEl.textContent = current.substring(0, charIndex--);
    } else {
      greetingEl.textContent = current.substring(0, charIndex++);
    }

    if (!isDeleting && charIndex === current.length + 1) {
      isDeleting = true;
      setTimeout(type, 1800);
      return;
    }
    if (isDeleting && charIndex === 0) {
      isDeleting = false;
      currentIndex = (currentIndex + 1) % texts.length;
    }
    setTimeout(type, isDeleting ? 50 : 90);
  }
  type();
}
