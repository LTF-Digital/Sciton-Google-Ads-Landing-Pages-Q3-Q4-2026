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

  // Add to calendar: build the .ics file in the browser, so no external link is needed.
  const calendarButton = document.querySelector('[data-add-calendar]');
  if (calendarButton) {
    calendarButton.addEventListener('click', () => {
      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Sciton//OMNI Demo Day//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:omni-demo-day-20261102@sciton.com',
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
        'DTSTART:20261102T100000Z',
        'DTEND:20261102T180000Z',
        'SUMMARY:OMNI™ Demo Day by Sciton',
        'LOCATION:SkinCeuticals\\, 187 Wood Lane\\, London W12 7SA\\, United Kingdom',
        `DESCRIPTION:See OMNI™ laser hair removal in action. ${preferredTime ? `Your preferred time: ${preferredTime.replace(/[\\,;]/g, (c) => `\\${c}`)}. ` : ''}The Sciton team will confirm your demo slot.`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        'DESCRIPTION:OMNI™ Demo Day is tomorrow',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ]
        // RFC 5545: fold lines longer than 75 characters onto continuation lines.
        .map((line) => line.match(/.{1,72}/g).join('\r\n '))
        .join('\r\n');
      const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'OMNI-Demo-Day-2-November.ics';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
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
