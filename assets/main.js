// Jahr im Footer
document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

// Stimmen-Slider: Endlosschleife, Autoplay alle 6 s, Pause beim Darüberfahren
(function () {
  var root = document.querySelector('[data-carousel]');
  if (!root) return;
  var track = root.querySelector('.track');
  var slides = Array.prototype.slice.call(track.children);
  var n = slides.length;
  var dotsBox = document.querySelector('[data-dots]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kopien anhängen, damit der Übergang vom letzten zum ersten Eintrag nahtlos ist
  slides.forEach(function (s) { var c = s.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });

  var i = 0, timer = null, hover = false;

  function setPos(animate) {
    track.style.transition = animate ? '' : 'none';
    track.style.transform = 'translateX(' + (-i * slides[0].getBoundingClientRect().width) + 'px)';
    if (!animate) { void track.offsetWidth; track.style.transition = ''; }
    var active = ((i % n) + n) % n;
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === active ? 'true' : 'false'); });
  }

  function go(to) {
    if (to < 0) { i = n; setPos(false); to = n - 1; }
    i = to;
    setPos(!reduce);
    if (i >= n) {
      var done = function () { track.removeEventListener('transitionend', done); i = i - n; setPos(false); };
      if (reduce) done(); else track.addEventListener('transitionend', done);
    }
  }

  var dots = [];
  for (var k = 0; k < n; k++) {
    (function (k) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Zu Bewertung ' + (k + 1));
      b.addEventListener('click', function () { go(k); restart(); });
      dotsBox.appendChild(b);
      dots.push(b);
    })(k);
  }

  root.querySelector('.car-prev').addEventListener('click', function () { go(((i % n) + n) % n - 1); restart(); });
  root.querySelector('.car-next').addEventListener('click', function () { go(((i % n) + n) % n + 1); restart(); });

  function restart() {
    clearInterval(timer);
    if (reduce) return;
    timer = setInterval(function () { if (!hover && !document.hidden) go(((i % n) + n) % n + 1); }, 6000);
  }
  root.addEventListener('mouseenter', function () { hover = true; });
  root.addEventListener('mouseleave', function () { hover = false; });

  // Wischen auf dem Handy
  var x0 = null;
  root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) { go(((i % n) + n) % n + (dx < 0 ? 1 : -1)); restart(); }
  });

  window.addEventListener('resize', function () { setPos(false); });
  setPos(false);
  restart();
})();

// Calendly erst nach Klick laden (Datenschutz: keine Verbindung zu Calendly ohne Einwilligung)
(function () {
  var box = document.querySelector('[data-calendly]');
  if (!box) return;
  var btn = box.querySelector('[data-calendly-load]');
  btn.addEventListener('click', function () {
    var f = document.createElement('iframe');
    f.src = box.getAttribute('data-calendly');
    f.title = 'Calendly – Kostenfreies Erstgespräch buchen';
    box.innerHTML = '';
    box.appendChild(f);
    f.focus();
  });
})();
