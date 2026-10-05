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

  // ---------- Reveal on scroll ----------
  // Elementi se sakrivaju tek kada je sigurno da su ispod ekrana i da će ih observer kasnije prikazati,
  // tako da sadržaj nikada ne ostane nevidljiv (npr. u pregledima bez skrolovanja).
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.unobserve(el);
        } else if (!el.dataset.revealInit && entry.boundingClientRect.top > window.innerHeight) {
          el.classList.add('reveal--pending');
        }
        el.dataset.revealInit = '1';
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      io.observe(el);
    });
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

  // ---------- Cases slider ----------
  var cases = document.getElementById('cases');
  document.querySelectorAll('.arrow-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = cases.querySelector('.case-card');
      var gap = parseFloat(getComputedStyle(cases).columnGap) || 18;
      cases.scrollBy({ left: (card.offsetWidth + gap) * +btn.dataset.dir, behavior: 'smooth' });
    });
  });

  // ---------- FAQ: only one open at a time ----------
  var accs = document.querySelectorAll('.acc');
  accs.forEach(function (acc) {
    acc.addEventListener('toggle', function () {
      if (acc.open) accs.forEach(function (o) { if (o !== acc) o.open = false; });
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
