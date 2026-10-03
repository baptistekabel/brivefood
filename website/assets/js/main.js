/* ==========================================================================
   BRIVE FOOD : interactions
   - Header : fond flouté après le hero
   - Menu mobile
   - Révélation au scroll (IntersectionObserver, une seule fois)
   - Manifeste : mots qui s'allument au fil du scroll
   - Parallaxe légère de la vidéo (transform uniquement, désactivée en
     reduced-motion et sur écrans tactiles)
   - Statut « ouvert / fermé » calculé sur les horaires réels (heure de Paris)
   - Surlignage du jour dans le tableau des horaires
   - FAQ (details/summary avec animation grid-template-rows)
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Header ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var setHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    setHeader();
    window.addEventListener('scroll', setHeader, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    var closeMenu = function () {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Révélation au scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });

    // Filet de sécurité : lors d'un saut brutal (ancre, scroll très rapide),
    // on révèle tout élément déjà dans la fenêtre.
    var revealTick = false;
    var revealInView = function () {
      var vh = window.innerHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
      revealTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!revealTick) { revealTick = true; window.requestAnimationFrame(revealInView); }
    }, { passive: true });
    window.addEventListener('load', revealInView);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Manifeste : mots qui s'allument ---------- */
  var manifesto = document.querySelector('.manifesto-text');
  if (manifesto) {
    // Découpe chaque nœud texte en mots, en conservant les <em>.
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              var span = document.createElement('span');
              span.className = 'w';
              span.textContent = part;
              frag.appendChild(span);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrapWords(child);
        }
      });
    };
    wrapWords(manifesto);

    var words = manifesto.querySelectorAll('.w');
    var lastCount = -1;
    var updateWords = function () {
      var rect = manifesto.getBoundingClientRect();
      var vh = window.innerHeight;
      // Progression : 0 quand le haut du bloc est à 85 % de la fenêtre,
      // 1 quand le bas du bloc est à 45 %.
      var start = vh * 0.85;
      var end = vh * 0.45;
      var progress = (start - rect.top) / (start - end + rect.height);
      progress = Math.min(1, Math.max(0, progress));
      var count = Math.round(progress * words.length);
      if (count === lastCount) return;
      lastCount = count;
      for (var i = 0; i < words.length; i++) {
        words[i].classList.toggle('on', i < count);
      }
    };
    if (reduceMotion) {
      words.forEach(function (w) { w.classList.add('on'); });
    } else {
      updateWords();
      window.addEventListener('scroll', updateWords, { passive: true });
      window.addEventListener('resize', updateWords);
    }
  }

  /* ---------- Parallaxe vidéo ---------- */
  var heroMedia = document.querySelector('.hero-media');
  var hero = document.querySelector('.hero');
  if (heroMedia && hero && !reduceMotion && finePointer) {
    var ticking = false;
    var parallax = function () {
      var y = window.scrollY;
      var h = hero.offsetHeight;
      if (y < h) {
        heroMedia.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
      }
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(parallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Vidéo : respect reduced-motion + économie de données ---------- */
  var video = document.querySelector('.hero-media video');
  if (video) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) {
      video.removeAttribute('autoplay');
      video.pause();
    } else {
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
  }

  /* ---------- Horaires & statut ---------- */
  // Service continu 11h00 → 01h50, fermé le mardi.
  // La nuit de lundi se termine mardi à 01h50 : on regarde donc aussi la veille.
  var SCHEDULE = {
    1: { open: '11:00', close: '01:50', enabled: true },  // lundi
    2: { open: '11:00', close: '01:50', enabled: false }, // mardi (fermé)
    3: { open: '11:00', close: '01:50', enabled: true },
    4: { open: '11:00', close: '01:50', enabled: true },
    5: { open: '11:00', close: '01:50', enabled: true },
    6: { open: '11:00', close: '01:50', enabled: true },
    0: { open: '11:00', close: '01:50', enabled: true }   // dimanche
  };

  var parisNow = function () {
    try {
      var parts = new Intl.DateTimeFormat('fr-FR', {
        timeZone: 'Europe/Paris', hour12: false,
        weekday: 'short', hour: '2-digit', minute: '2-digit'
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { 'dim.': 0, 'lun.': 1, 'mar.': 2, 'mer.': 3, 'jeu.': 4, 'ven.': 5, 'sam.': 6 };
      return { day: days[map.weekday], minutes: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  };

  var toMin = function (hhmm) {
    var s = hhmm.split(':');
    return parseInt(s[0], 10) * 60 + parseInt(s[1], 10);
  };

  var computeStatus = function () {
    var now = parisNow();
    var today = SCHEDULE[now.day];
    var yesterday = SCHEDULE[(now.day + 6) % 7];
    var open = toMin(today.open);
    var close = toMin(today.close);
    var overnight = close < open;

    // Fin de service de la veille (après minuit)
    if (yesterday.enabled && toMin(yesterday.close) < toMin(yesterday.open) && now.minutes < toMin(yesterday.close)) {
      return { open: true, label: 'Ouvert · jusqu’à ' + yesterday.close.replace(':', 'h') };
    }
    if (today.enabled) {
      if (overnight ? now.minutes >= open : (now.minutes >= open && now.minutes < close)) {
        return { open: true, label: 'Ouvert · jusqu’à ' + today.close.replace(':', 'h') };
      }
      if (now.minutes < open) {
        return { open: false, label: 'Fermé · ouvre à ' + today.open.replace(':', 'h') };
      }
    }
    // Trouver la prochaine ouverture
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (SCHEDULE[d].enabled) {
        var names = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        var when = i === 1 ? 'demain' : names[d];
        return { open: false, label: 'Fermé · ouvre ' + when + ' à ' + SCHEDULE[d].open.replace(':', 'h') };
      }
    }
    return { open: false, label: 'Fermé' };
  };

  var statusEls = document.querySelectorAll('[data-status]');
  var applyStatus = function () {
    var s = computeStatus();
    statusEls.forEach(function (el) {
      el.setAttribute('data-open', s.open ? 'true' : 'false');
      var label = el.querySelector('[data-status-label]');
      if (label) label.textContent = s.label;
    });
  };
  if (statusEls.length) {
    applyStatus();
    setInterval(applyStatus, 60 * 1000);
  }

  var hoursRows = document.querySelectorAll('.hours tr[data-day]');
  if (hoursRows.length) {
    var today = String(parisNow().day);
    hoursRows.forEach(function (row) {
      row.classList.toggle('today', row.getAttribute('data-day') === today);
    });
  }

  /* ---------- Carte : Plan / Vue 3D ---------- */
  var mapBtns = document.querySelectorAll('[data-map-view]');
  if (mapBtns.length) {
    var showMap = function (view) {
      document.querySelectorAll('[data-map-panel]').forEach(function (panel) {
        var active = panel.getAttribute('data-map-panel') === view;
        panel.classList.toggle('is-hidden', !active);
        // Le plan n'est chargé qu'à la première demande
        var frame = panel.querySelector('iframe[data-src]');
        if (active && frame) {
          frame.src = frame.getAttribute('data-src');
          frame.removeAttribute('data-src');
        }
      });
      mapBtns.forEach(function (b) {
        var on = b.getAttribute('data-map-view') === view;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    };
    mapBtns.forEach(function (b) {
      b.addEventListener('click', function () { showMap(b.getAttribute('data-map-view')); });
    });
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.hasAttribute('open');
      if (isOpen) {
        item.removeAttribute('open');
        q.setAttribute('aria-expanded', 'false');
      } else {
        item.setAttribute('open', '');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Table des matières (pages légales) ---------- */
  var tocLinks = document.querySelectorAll('.legal-toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var sections = Array.prototype.map.call(tocLinks, function (a) {
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);
    var tocIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function (s) { tocIo.observe(s); });
  }

  /* ---------- Pop-up d'accueil : l'application ---------- */
  // Affiché à chaque arrivée sur la page d'accueil, juste après l'entrée du hero.
  var appModal = document.getElementById('app-modal');
  if (appModal) {
    var lastFocus = null;
    var openModal = function () {
      lastFocus = document.activeElement;
      appModal.hidden = false;
      document.body.style.overflow = 'hidden';
      window.requestAnimationFrame(function () {
        appModal.classList.add('is-open');
        var card = appModal.querySelector('.modal-card');
        if (card) card.focus({ preventScroll: true });
      });
    };
    var closeModal = function () {
      // Lance l'entrée du haut de page (voir .intro-wait dans style.css)
      if (document.documentElement.classList.contains('intro-wait')) {
        document.documentElement.classList.remove('intro-wait');
        document.documentElement.classList.add('intro-play');
      }
      appModal.classList.remove('is-open');
      document.body.style.overflow = '';
      window.setTimeout(function () { appModal.hidden = true; }, 300);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    };
    appModal.querySelectorAll('[data-modal-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !appModal.hidden) closeModal();
    });
    window.setTimeout(openModal, 900);
  } else {
    document.documentElement.classList.remove('intro-wait');
  }

  /* ---------- Année du footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
