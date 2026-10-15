/* Sciton OMNI Demo Day thank-you page */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Personalise with the first name saved by the form.
  let lead = {};
  try { lead = JSON.parse(sessionStorage.getItem('omni_lead') || '{}'); } catch (e) { lead = {}; }
  const name = (lead.first_name || '').trim();
  if (name) {
    document.querySelector('[data-thanks-title]').textContent = `Thank you, ${name.charAt(0).toUpperCase()}${name.slice(1)}.`;
  }

  // Show the preferred time they chose ("10am to 11am" reads as "10am – 11am").
  const preferredTime = (lead.preferred_time || '').trim().replace(' to ', ' \u2013 ');
  const timeLine = document.querySelector('[data-time-line]');
  if (preferredTime && timeLine) {
    const strong = document.createElement('strong');
    strong.className = 'whitespace-nowrap font-semibold';
    strong.textContent = preferredTime;
    const note = document.createElement('span');
    note.className = 'block text-[13px] text-muted';
    note.textContent = 'To be confirmed by the Sciton team';
    timeLine.replaceChildren('Preferred time: ', strong, note);
  }

  // Product film
  document.querySelectorAll('.video-tile').forEach((tile) => {
    const video = tile.querySelector('video');
    tile.querySelector('.video-play').addEventListener('click', () => {
      video.controls = true;
      tile.dataset.state = 'playing';
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(() => { tile.dataset.state = 'idle'; video.controls = false; });
    });
    video.addEventListener('ended', () => {
      tile.dataset.state = 'idle';
      video.controls = false;
      video.currentTime = 0;
    });
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }
})();
