/* Sciton OMNI Demo Day landing page */
(() => {
  'use strict';

  /*
   * Where leads go. Leave `endpoint` empty until the CRM / Zapier / Make webhook is ready:
   * the form still validates and moves on to the thank-you page, but nothing is sent.
   * When set, each lead is POSTed as JSON (see buildPayload for the fields).
   */
  const CONFIG = {
    endpoint: '',
    thankYouUrl: '/omni-demo-day/thank-you',
    event: 'OMNI Demo Day, SkinCeuticals, 187 Wood Lane, London W12 7SA, Monday 2 November 2026, 10am-6pm',
    // Monday 2 November 2026, 10am to 6pm London time (GMT).
    eventStart: Date.parse('2026-11-02T10:00:00Z'),
    eventEnd: Date.parse('2026-11-02T18:00:00Z'),
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- Attribution: keep UTM / fbclid for the whole visit ---------- */
  const TRACK_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
  const attribution = (() => {
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem('omni_attribution') || '{}'); } catch (e) { stored = {}; }
    const params = new URLSearchParams(window.location.search);
    TRACK_KEYS.forEach((key) => { if (params.get(key)) stored[key] = params.get(key); });
    try { sessionStorage.setItem('omni_attribution', JSON.stringify(stored)); } catch (e) { /* private mode */ }
    return stored;
  })();

  /* ---------- Lead forms ---------- */
  const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    phone: /^(?:\+44|0044|0)\d{9,10}$/,
  };
  const FIELDS = ['first_name', 'last_name', 'clinic_name', 'email', 'phone', 'preferred_time'];

  const forms = $$('[data-lead-form]');

  function showError(form, name, show) {
    const error = $(`[data-error-for="${name}"]`, form);
    const input = $(`[name="${name}"]`, form);
    if (error) error.classList.toggle('hidden', !show);
    input.setAttribute('aria-invalid', show ? 'true' : 'false');
    if (error) {
      if (!error.id) error.id = `${form.id}-${name}-error`;
      if (show) input.setAttribute('aria-describedby', error.id);
      else input.removeAttribute('aria-describedby');
    }
    return !show;
  }

  function validateField(form, name) {
    const value = ($(`[name="${name}"]`, form).value || '').trim();
    let valid = value.length > 0;
    if (valid && name === 'email') valid = PATTERNS.email.test(value);
    if (valid && name === 'phone') valid = PATTERNS.phone.test(value.replace(/[\s\-()]/g, ''));
    return showError(form, name, !valid);
  }

  function validateForm(form) {
    const results = FIELDS.map((name) => validateField(form, name));
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return results.every(Boolean);
  }

  function buildPayload(form) {
    const data = new FormData(form);
    const value = (name) => (data.get(name) || '').toString().trim();
    const payload = {
      event: CONFIG.event,
      first_name: value('first_name'),
      last_name: value('last_name'),
      clinic_name: value('clinic_name'),
      email: value('email'),
      phone: value('phone'),
      preferred_time: value('preferred_time'),
      form_location: value('form_location'),
      page_url: window.location.href,
      submitted_at: new Date().toISOString(),
    };
    TRACK_KEYS.forEach((key) => { payload[key] = attribution[key] || ''; });
    return payload;
  }

  forms.forEach((form) => {
    // Hidden attribution fields, for anyone who later posts the form natively.
    TRACK_KEYS.forEach((key) => {
      const input = $(`input[type="hidden"][name="${key}"]`, form);
      if (input) input.value = attribution[key] || '';
    });
    const pageInput = $('input[name="page_url"]', form);
    if (pageInput) pageInput.value = window.location.href;

    // Clear errors as soon as the visitor fixes them.
    $$('.field-input', form).forEach((input) => {
      input.addEventListener('blur', () => { if (input.value.trim()) validateField(form, input.name); });
      input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(form, input.name); });
      input.addEventListener('change', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(form, input.name); });
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateForm(form)) return;

      const button = $('[data-submit]', form);
      const label = $('[data-submit-label]', form);
      const submitError = $('[data-submit-error]', form);
      submitError.classList.add('hidden');

      // Bots fill the hidden field; send them to the thank-you page without sending anything.
      if ($('[name="website_url"]', form).value) { window.location.href = CONFIG.thankYouUrl; return; }

      const payload = buildPayload(form);
      button.disabled = true;
      button.classList.add('opacity-70');
      label.textContent = 'Booking your slot…';

      try {
        if (CONFIG.endpoint) {
          const response = await fetch(CONFIG.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!response.ok) throw new Error(`Lead endpoint returned ${response.status}`);
        } else {
          console.info('[OMNI Demo Day] No lead endpoint configured. This lead was not sent:', payload);
        }
        document.dispatchEvent(new CustomEvent('omni:lead', { detail: payload }));
        try {
          sessionStorage.setItem('omni_lead', JSON.stringify({ first_name: payload.first_name, preferred_time: payload.preferred_time }));
        } catch (e) { /* private mode */ }
        window.location.href = CONFIG.thankYouUrl;
      } catch (error) {
        console.error(error);
        submitError.classList.remove('hidden');
        button.disabled = false;
        button.classList.remove('opacity-70');
        label.textContent = 'Book Your Demo Slot';
      }
    });
  });

  /* ---------- Booking links: go to the nearest form ---------- */
  const formTargets = ['#book', '#book-final'].map((id) => $(id)).filter(Boolean);

  function nearestFormTarget() {
    const viewportMiddle = window.innerHeight / 2;
    return formTargets
      .map((el) => ({ el, distance: Math.abs(el.getBoundingClientRect().top + el.offsetHeight / 2 - viewportMiddle) }))
      .sort((a, b) => a.distance - b.distance)[0].el;
  }

  $$('[data-book]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!formTargets.length) return;
      event.preventDefault();
      const target = nearestFormTarget();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const form = $('[data-lead-form]', target);
      setTimeout(() => {
        $('[name="first_name"]', form).focus({ preventScroll: true });
      }, reduceMotion ? 0 : 700);
    });
  });

  /* ---------- Hero silk loop ---------- */
  const heroVideo = $('[data-hero-video]');
  if (heroVideo && !reduceMotion && !saveData) {
    heroVideo.preload = 'auto';
    heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-playing'), { once: true });
    const attempt = heroVideo.play();
    if (attempt && attempt.catch) attempt.catch(() => { /* autoplay blocked: the poster stays */ });
  }

  /* ---------- Feature card loops: play only while on screen ---------- */
  const loops = $$('video[data-loop]');
  if (loops.length && !reduceMotion && !saveData && 'IntersectionObserver' in window) {
    const loopObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.preload !== 'auto') video.preload = 'auto';
          const attempt = video.play();
          if (attempt && attempt.catch) attempt.catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.35 });
    loops.forEach((video) => loopObserver.observe(video));
  }

  /* ---------- Click-to-play video tiles ---------- */
  const tiles = $$('.video-tile');
  tiles.forEach((tile) => {
    const video = $('video', tile);
    const play = $('.video-play', tile);
    play.addEventListener('click', () => {
      tiles.forEach((other) => {
        const v = $('video', other);
        if (other !== tile && !v.paused) v.pause();
      });
      video.controls = true;
      tile.dataset.state = 'playing';
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(() => { tile.dataset.state = 'idle'; video.controls = false; });
      video.focus({ preventScroll: true });
    });
    video.addEventListener('ended', () => {
      tile.dataset.state = 'idle';
      video.controls = false;
      video.currentTime = 0;
    });
  });

  /* ---------- Before / after sliders ---------- */
  $$('[data-ba]').forEach((slider) => {
    const range = $('.ba-range', slider);
    const update = () => slider.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  /* ---------- Countdown to the Demo Day ---------- */
  const daysLeftEls = $$('[data-days-left]');
  const countdown = $('[data-countdown]');
  // Whole calendar days between today and the event, both in London time.
  const londonDay = (time) => {
    const [y, m, d] = new Date(time).toLocaleDateString('en-CA', { timeZone: 'Europe/London' }).split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  function tick() {
    const now = Date.now();
    const diff = CONFIG.eventStart - now;
    const live = now >= CONFIG.eventStart && now < CONFIG.eventEnd;
    const over = now >= CONFIG.eventEnd;

    // Every "Limited slots" pill (hero and both forms) carries the same day count.
    if (daysLeftEls.length) {
      const days = Math.round((londonDay(CONFIG.eventStart) - londonDay(now)) / 86400000);
      let label = `${days} days to go`;
      if (live) label = 'Happening today, until 6pm';
      else if (days <= 0) label = 'Today, from 10am';
      else if (days === 1) label = 'Tomorrow';
      daysLeftEls.forEach((el) => {
        if (over) el.closest('[data-days-left-wrap]').style.display = 'none';
        else el.textContent = label;
      });
    }

    if (countdown) {
      if (live || over) {
        $('[data-countdown-label]', countdown).textContent = live ? 'Happening now, until 6pm' : 'Thank you to everyone who joined us';
        countdown.querySelector('[role="timer"]').hidden = true;
        return;
      }
      const mins = Math.max(0, Math.floor(diff / 60000));
      $('[data-cd-days]', countdown).textContent = String(Math.floor(mins / 1440));
      $('[data-cd-hours]', countdown).textContent = String(Math.floor((mins % 1440) / 60)).padStart(2, '0');
      $('[data-cd-mins]', countdown).textContent = String(mins % 60).padStart(2, '0');
    }
  }
  tick();
  setInterval(tick, 30000);

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Mobile sticky booking bar ---------- */
  const sticky = $('[data-sticky-cta]');
  if (sticky && formTargets.length && 'IntersectionObserver' in window) {
    const visible = new Map();
    const heroForm = $('#book');
    const update = () => {
      const formInView = Array.from(visible.values()).some(Boolean);
      const pastHero = heroForm.getBoundingClientRect().bottom < 0;
      const show = !formInView && pastHero;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', String(!show));
      $('a', sticky).tabIndex = show ? 0 : -1;
    };
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting));
      update();
    });
    formTargets.forEach((el) => stickyObserver.observe(el));
    window.addEventListener('scroll', update, { passive: true });
  }
})();
