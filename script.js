(function () {
  // ---------- Header on scroll ----------
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Hero: naslov reč po reč ----------
  var heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !reduceMotion) {
    var words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.setAttribute('aria-label', heroTitle.textContent.trim());
    heroTitle.innerHTML = words.map(function (w, i) {
      return '<span class="word" aria-hidden="true"><span style="animation-delay:' + (0.25 + i * 0.07).toFixed(2) + 's">' + w + '</span></span>';
    }).join(' ');
    heroTitle.classList.add('is-split');
  }

  // ---------- Reveal on scroll ----------
  // Elementi se sakrivaju tek kada je sigurno da su ispod ekrana i da će ih observer kasnije prikazati,
  // tako da sadržaj nikada ne ostane nevidljiv (npr. u pregledima bez skrolovanja).
  var autoReveal = [
    ['.section .eyebrow, .process .eyebrow, .faq .eyebrow', ''],
    ['.section-head .h2, .process__head .h2, .faq__title, .contact__title', ''],
    ['.section-head__text, .process__text, .process__head > .btn, .faq__text, .contact__head p, .contact__head .btn', ''],
    ['.stat, .stats__trust', ''],
    ['.step, .acc, .info-card, .form, .slider-nav, .team__toggle, #cases', ''],
    ['.footer__grid > *', ''],
    ['.about__img', 'reveal--img']
  ];
  autoReveal.forEach(function (pair) {
    document.querySelectorAll(pair[0]).forEach(function (el) {
      el.classList.add('reveal');
      if (pair[1]) el.classList.add(pair[1]);
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.unobserve(el);
          // Posle animacije ukloni kašnjenje da ne usporava hover efekte
          if (el.classList.contains('reveal--pending')) {
            var delay = parseFloat(el.style.getPropertyValue('--rd')) || 0;
            setTimeout(function () { el.classList.remove('reveal--pending'); }, 1700 + delay);
          }
        } else if (!el.dataset.revealInit && entry.boundingClientRect.top > window.innerHeight) {
          el.classList.add('reveal--pending');
        }
        el.dataset.revealInit = '1';
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) {
      // Postepeno pojavljivanje elemenata koji su jedan pored drugog
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); });
      var idx = siblings.indexOf(el);
      el.style.setProperty('--rd', (idx % 6) * 90 + 'ms');
      io.observe(el);
    });
  }

  // ---------- Parallax pozadina ----------
  var parallaxEls = document.querySelectorAll('.process__bg, .faq__bg');
  if (parallaxEls.length && !reduceMotion) {
    var ticking = false;
    function updateParallax() {
      ticking = false;
      parallaxEls.forEach(function (bg) {
        var rect = bg.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        bg.style.transform = 'translate3d(0,' + (progress * -60).toFixed(1) + 'px,0)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    }, { passive: true });
    updateParallax();
  }

  // ---------- Animated counters ----------
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = +el.dataset.count;
        var suffix = el.textContent.replace(/[0-9]/g, '');
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1400, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  // ---------- Team toggle ----------
  var teamToggle = document.getElementById('team-toggle');
  var teamMore = document.getElementById('team-more');
  teamToggle.addEventListener('click', function () {
    var open = teamMore.hasAttribute('hidden');
    teamMore.toggleAttribute('hidden', !open);
    teamToggle.setAttribute('aria-expanded', String(open));
    teamToggle.textContent = open ? 'Prikaži manje' : 'Prikaži ceo tim';
    if (!open) document.getElementById('tim').scrollIntoView({ behavior: 'smooth' });
  });

  // ---------- Cases slider: strelice + prevlačenje mišem ----------
  var cases = document.getElementById('cases');
  var prevBtn = document.querySelector('.arrow-btn[data-dir="-1"]');
  var nextBtn = document.querySelector('.arrow-btn[data-dir="1"]');

  function cardStep() {
    var card = cases.querySelector('.case-card');
    var gap = parseFloat(getComputedStyle(cases).columnGap) || 18;
    return card.offsetWidth + gap;
  }
  function maxScroll() { return cases.scrollWidth - cases.clientWidth; }
  function updateArrows() {
    prevBtn.disabled = cases.scrollLeft <= 2;
    nextBtn.disabled = cases.scrollLeft >= maxScroll() - 2;
  }
  document.querySelectorAll('.arrow-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      cases.scrollBy({ left: cardStep() * +btn.dataset.dir, behavior: 'smooth' });
    });
  });
  cases.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  updateArrows();

  // Prevlačenje mišem (na dodir telefona radi prirodno skrolovanje)
  var drag = { active: false, moved: false, startX: 0, startScroll: 0, lastX: 0, lastT: 0, velocity: 0, suppressClick: false };
  var settleTimer;

  cases.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    clearTimeout(settleTimer);
    drag.active = true;
    drag.moved = false;
    drag.startX = drag.lastX = e.clientX;
    drag.startScroll = cases.scrollLeft;
    drag.lastT = performance.now();
    drag.velocity = 0;
    cases.classList.add('is-grabbing');
  });

  window.addEventListener('pointermove', function (e) {
    if (!drag.active) return;
    var dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > 5) {
      drag.moved = true;
      cases.classList.add('is-dragging');
    }
    if (!drag.moved) return;
    e.preventDefault();
    cases.scrollLeft = drag.startScroll - dx;
    var now = performance.now();
    var dt = Math.max(now - drag.lastT, 1);
    drag.velocity = 0.8 * ((e.clientX - drag.lastX) / dt) + 0.2 * drag.velocity;
    drag.lastX = e.clientX;
    drag.lastT = now;
  });

  function endDrag() {
    if (!drag.active) return;
    drag.active = false;
    cases.classList.remove('is-grabbing');
    if (!drag.moved) return;
    drag.suppressClick = true;
    setTimeout(function () { drag.suppressClick = false; }, 0);

    // Inercija: projektuj kretanje pa se "zalepi" za najbližu karticu
    var step = cardStep();
    var projected = cases.scrollLeft - drag.velocity * 220;
    var target = Math.round(projected / step) * step;
    target = Math.max(0, Math.min(target, maxScroll()));
    cases.scrollTo({ left: target, behavior: 'smooth' });
    settleTimer = setTimeout(function () { cases.classList.remove('is-dragging'); }, 600);
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('blur', endDrag);

  // Posle prevlačenja ne otvaraj link na kartici
  cases.addEventListener('click', function (e) {
    if (drag.suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  cases.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // ---------- FAQ: animirano otvaranje/zatvaranje, samo jedno otvoreno ----------
  var accs = document.querySelectorAll('.acc');
  var canAnimate = typeof Element.prototype.animate === 'function' && !reduceMotion;
  var accEase = 'cubic-bezier(.4, 0, .2, 1)';
  var ACC_MS = 380;
  var accordion = document.querySelector('.accordion');

  // Lista pitanja dobija stalnu visinu (visina kada je otvoren najduži odgovor),
  // pa se sekcija ne skuplja i ne širi dok se pitanja otvaraju i zatvaraju.
  function lockAccordionHeight() {
    var states = Array.prototype.map.call(accs, function (a) { return a.open; });
    accordion.style.minHeight = '';
    var max = 0;
    accs.forEach(function (target) {
      accs.forEach(function (a) { a.open = a === target; });
      max = Math.max(max, accordion.offsetHeight);
    });
    accs.forEach(function (a, i) { a.open = states[i]; });
    accordion.style.minHeight = max + 'px';
  }
  lockAccordionHeight();
  var lockTimer;
  window.addEventListener('resize', function () {
    clearTimeout(lockTimer);
    lockTimer = setTimeout(lockAccordionHeight, 150);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockAccordionHeight);

  function openAcc(acc) {
    var body = acc.querySelector('.acc__body');
    accs.forEach(function (o) { if (o !== acc && o.open) closeAcc(o); });
    if (acc._anim) acc._anim.cancel();
    acc.classList.remove('is-closing');
    acc.open = true;
    if (!canAnimate) return;
    var h = body.scrollHeight;
    acc._anim = body.animate(
      [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }],
      { duration: ACC_MS, easing: accEase }
    );
    acc._anim.onfinish = function () { acc._anim = null; };
  }

  function closeAcc(acc) {
    var body = acc.querySelector('.acc__body');
    if (!canAnimate) { acc.open = false; return; }
    if (acc._anim) acc._anim.cancel();
    acc.classList.add('is-closing');
    var h = body.offsetHeight;
    acc._anim = body.animate(
      [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: ACC_MS, easing: accEase }
    );
    acc._anim.onfinish = function () {
      acc._anim = null;
      acc.open = false;
      acc.classList.remove('is-closing');
    };
  }

  accs.forEach(function (acc) {
    acc.querySelector('summary').addEventListener('click', function (e) {
      e.preventDefault();
      if (acc.open && !acc.classList.contains('is-closing')) closeAcc(acc);
      else openAcc(acc);
    });
  });

  // ---------- Contact form ----------
  // NAPOMENA: forma za sada samo prikazuje poruku o uspehu i ne šalje podatke.
  // Za stvarno slanje povežite je sa servisom (npr. Formspree) ili sopstvenim backend-om
  // u funkciji sendForm ispod.
  var form = document.getElementById('contact-form');
  var success = form.querySelector('.form__success');
  var consent = form.querySelector('input[name="saglasnost"]');

  function validateField(input) {
    var field = input.closest('.field');
    var valid = input.checkValidity();
    if (field) field.classList.toggle('is-invalid', !valid);
    return valid;
  }
  function validateConsent() {
    var label = consent.closest('.check');
    label.classList.toggle('is-invalid', !consent.checked);
    return consent.checked;
  }

  form.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea').forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value) validateField(input); });
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('is-invalid')) validateField(input);
    });
  });
  consent.addEventListener('change', validateConsent);

  function sendForm(data) {
    // Ovde dodati stvarno slanje, npr.:
    // return fetch('https://formspree.io/f/VAS_ID', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    return new Promise(function (resolve) { setTimeout(resolve, 700); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea');
    var firstInvalid = null;
    fields.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    var consentOk = validateConsent();
    if (firstInvalid) { firstInvalid.focus(); return; }
    if (!consentOk) { consent.focus(); return; }

    var btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.firstChild.textContent = 'Slanje… ';
    sendForm(new FormData(form)).then(function () {
      success.hidden = false;
      form.reset();
      btn.disabled = false;
      btn.firstChild.textContent = 'Pošaljite poruku ';
    });
  });

  // ---------- Year ----------
  document.getElementById('year').textContent = new Date().getFullYear();
})();
