/* Progressive enhancement only: every feature here degrades to the plain page. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- 1. topographic hero ------------------------------------------- */
  function topo() {
    var canvas = document.getElementById('topo');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, raf = null, t = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      /* Measure the header, not the canvas: the canvas is absolutely
         positioned inside it, so this is right even if its own box has not
         settled yet (late fonts, stale CSS, layout shift). */
      var host = canvas.parentElement || canvas;
      w = host.clientWidth || canvas.getBoundingClientRect().width || 0;
      h = host.clientHeight || canvas.getBoundingClientRect().height || 0;
      if (!w || !h) return false;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    }

    /* Sum of a few sines: cheap terrain that reads as contour lines. */
    function field(x, y, phase) {
      return Math.sin(x * 0.011 + phase) * 26 +
             Math.sin(y * 0.017 - phase * 0.7) * 18 +
             Math.sin((x + y) * 0.008 + phase * 0.4) * 22 +
             Math.sin((x - y) * 0.013 - phase * 0.5) * 14;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var accent = getComputedStyle(document.body)
        .getPropertyValue('--topo-line').trim() || 'rgba(138,75,42,.5)';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1;

      var lines = 26, step = 9;
      for (var i = 0; i < lines; i++) {
        var base = (h / lines) * i + 10;
        ctx.globalAlpha = 0.26 + 0.34 * (i / lines);
        ctx.beginPath();
        for (var x = -10; x <= w + 10; x += step) {
          var y = base + field(x, base, t + i * 0.12);
          if (x === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function loop() { t += 0.006; draw(); raf = requestAnimationFrame(loop); }
    function start() { if (raf === null && !reduced.matches) loop(); }
    function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    function remeasure() { if (resize()) draw(); }

    remeasure();
    if (!reduced.matches) start();

    /* Header height changes after webfonts load and on orientation change. */
    window.addEventListener('load', remeasure);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(remeasure).catch(function () {});
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(remeasure).observe(canvas.parentElement || canvas);
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(remeasure, 150);
    });

    /* Don't burn cycles when the hero is scrolled away or the tab is hidden. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
    document.addEventListener('themechange', draw);
    reduced.addEventListener('change', function () {
      reduced.matches ? stop() : start();
      draw();
    });
  }

  /* ---- 2. scroll reveals --------------------------------------------- */
  function reveals() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduced.matches || !('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- 3. nav: highlight the section you're in ------------------------ */
  function activeNav() {
    if (!('IntersectionObserver' in window)) return;
    var links = {}, sections = [];
    document.querySelectorAll('.rail nav a').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var s = document.getElementById(id);
      if (s) { links[id] = a; sections.push(s); }
    });
    if (!sections.length) return;

    var ratios = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { ratios[e.target.id] = e.intersectionRatio; });
      var best = null, bestRatio = 0;
      Object.keys(ratios).forEach(function (id) {
        if (ratios[id] > bestRatio) { bestRatio = ratios[id]; best = id; }
      });
      Object.keys(links).forEach(function (id) {
        links[id].classList.toggle('is-active', id === best && bestRatio > 0);
      });
    }, { threshold: [0, 0.15, 0.4, 0.75] });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---- 4. skill filter ------------------------------------------------ */
  function filter() {
    var chips = document.querySelectorAll('.chip');
    var entries = document.querySelectorAll('[data-tags]');
    var status = document.getElementById('filter-status');
    if (!chips.length || !entries.length) return;

    function apply(tag) {
      var shown = 0;
      entries.forEach(function (el) {
        var tags = (el.getAttribute('data-tags') || '').split(/\s+/);
        var hit = !tag || tags.indexOf(tag) !== -1;
        el.classList.toggle('is-dim', !hit);
        if (hit) shown++;
      });
      chips.forEach(function (c) {
        var on = c.getAttribute('data-tag') === tag;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (status) {
        status.textContent = tag
          ? shown + ' of ' + entries.length + ' roles and projects used ' +
            document.querySelector('.chip[data-tag="' + tag + '"]').textContent
          : '';
      }
    }

    var current = null;
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var tag = c.getAttribute('data-tag');
        current = (current === tag) ? null : tag;
        apply(current);
      });
    });
  }

  /* ---- 5. theme: auto -> light -> dark -------------------------------- */
  function theme() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var label = btn.querySelector('.theme-label');
    var order = ['auto', 'light', 'dark'];

    function read() {
      var v = document.documentElement.getAttribute('data-theme');
      return (v === 'light' || v === 'dark') ? v : 'auto';
    }

    function paint(mode) {
      if (mode === 'auto') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', mode);
      if (label) label.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
      btn.setAttribute('title', 'Theme: ' + mode + ' (click to change)');
      /* The canvas reads --topo-line from CSS, so it has to redraw. */
      document.dispatchEvent(new CustomEvent('themechange'));
    }

    paint(read());

    btn.addEventListener('click', function () {
      var next = order[(order.indexOf(read()) + 1) % order.length];
      try { 
        if (next === 'auto') localStorage.removeItem('theme');
        else localStorage.setItem('theme', next);
      } catch (e) {}
      paint(next);
    });
  }

  function init() { topo(); reveals(); filter(); activeNav(); theme(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
