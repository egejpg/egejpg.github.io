// egejpg — site etkileşimleri. Bağımlılık yok, ağ isteği yok.
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Üst bar gölgesi ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- E-posta (bot koruması) ----------
  // Adres HTML'de ters çevrilmiş iki parça olarak durur; bağlantı burada kurulur.
  const rev = (s) => [...(s || '')].reverse().join('');
  document.querySelectorAll('[data-mail]').forEach((a) => {
    const addr = `${rev(a.dataset.u)}@${rev(a.dataset.d)}`;
    a.href = `mailto:${addr}${a.dataset.s ? '?subject=' + encodeURIComponent(a.dataset.s) : ''}`;
    if (a.hasAttribute('data-show')) a.textContent = addr;
  });

  // ---------- Dil seçici ----------
  // Seçim hatırlanır; böylece otomatik (saat dilimine göre) geçiş bir daha devreye girmez.
  document.querySelectorAll('.lang-opt').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try { localStorage.setItem('lang', a.dataset.lang); } catch { /* depolama kapalı */ }
      e.preventDefault();
      if (a.getAttribute('aria-current') === 'true') return;
      a.closest('.lang').dataset.active = a.dataset.lang;
      const go = () => { location.href = a.getAttribute('href'); };
      reduceMotion ? go() : setTimeout(go, 230);
    });
  });

  // ---------- Yıl ----------
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // ---------- Görünür olunca belirme ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // ---------- Sahne: fareyi izleyen derinlik ----------
  // CSS, --px ve --py (-1..1) değişkenleriyle kartı eğer ve katmanları kaydırır.
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-parallax]').forEach((stage) => {
      let raf = 0;
      stage.addEventListener('pointermove', (e) => {
        if (stage.classList.contains('is-dragging')) return;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = stage.getBoundingClientRect();
          stage.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
          stage.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        });
      });
      stage.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        stage.style.setProperty('--px', 0);
        stage.style.setProperty('--py', 0);
      });
    });
  }

  // ---------- Yüzen çipler: sahne sınırları içinde sürüklenebilir ----------
  document.querySelectorAll('.floater').forEach((el) => {
    const stage = el.closest('.stage');
    if (!stage) return;
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const s = stage.getBoundingClientRect();
      const f = el.getBoundingClientRect();
      const dx = e.clientX - f.left;
      const dy = e.clientY - f.top;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-held');

      const move = (ev) => {
        const x = Math.min(Math.max(ev.clientX - s.left - dx, 8), s.width - f.width - 8);
        const y = Math.min(Math.max(ev.clientY - s.top - dy, 8), s.height - f.height - 8);
        el.style.setProperty('--x', `${(x / s.width) * 100}%`);
        el.style.setProperty('--y', `${(y / s.height) * 100}%`);
      };
      const up = () => {
        el.classList.remove('is-held');
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });
  });

  // ---------- Kaydırmalı seçici ----------
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  function initCarousel(root) {
    const track = root.querySelector('.carousel-track');
    const slides = [...track.children];
    const n = slides.length;
    const controls = document.querySelector(`[data-controls="${root.id}"]`);
    const dotsBox = controls && controls.querySelector('.c-dots');
    const counter = controls && controls.querySelector('.c-count');
    const caption = document.querySelector(`[data-caption="${root.id}"]`);
    let active = 0;

    const dots = slides.map((s, i) => {
      if (!dotsBox) return null;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'c-dot';
      b.setAttribute('aria-label', `${i + 1}. slayta git: ${s.dataset.title || ''}`.trim());
      b.addEventListener('click', () => go(i));
      dotsBox.append(b);
      return b;
    });

    const focusables = (el) => el.querySelectorAll('a, button, input, select, textarea, [tabindex]');

    function offsetOf(i) {
      let off = i - active;
      if (n > 2) { // dairesel: her iki yanda da bir komşu görünsün
        const half = Math.floor(n / 2);
        off = ((off % n) + n + half) % n - half;
      }
      return off;
    }

    function update() {
      slides.forEach((s, i) => {
        const off = offsetOf(i);
        const abs = Math.abs(off);
        s.style.setProperty('--off', off);
        s.style.setProperty('--abs', Math.min(abs, 2));
        s.style.setProperty('--i', i);
        s.classList.toggle('is-active', off === 0);
        s.classList.toggle('is-far', abs > 1);
        s.setAttribute('aria-hidden', off === 0 ? 'false' : 'true');
        focusables(s).forEach((f) => {
          if (off === 0) f.removeAttribute('tabindex');
          else f.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach((d, i) => d && d.setAttribute('aria-current', i === active ? 'true' : 'false'));
      if (counter) counter.innerHTML = `<b>${String(active + 1).padStart(2, '0')}</b> / ${String(n).padStart(2, '0')}`;
      if (caption) caption.innerHTML = slides[active].dataset.caption || '';
    }

    function go(i) {
      active = ((i % n) + n) % n;
      update();
    }

    controls && controls.querySelector('[data-prev]')?.addEventListener('click', () => go(active - 1));
    controls && controls.querySelector('[data-next]')?.addEventListener('click', () => go(active + 1));

    root.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    });

    // Yandaki karta tıklamak onu seçer (içindeki bağlantıyı açmaz).
    let suppressClick = false;
    track.addEventListener('click', (e) => {
      const slide = e.target.closest('.slide');
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
      if (slide && !slide.classList.contains('is-active')) {
        e.preventDefault();
        e.stopPropagation();
        go(slides.indexOf(slide));
      }
    }, true);

    // Sürükleyerek / kaydırarak geçiş
    let startX = 0, startY = 0, dx = 0, pid = null, dragging = false, held = null;
    track.addEventListener('pointerdown', (e) => {
      held = e.target.closest('.slide');
      if (e.button !== 0 || !held) return;
      pid = e.pointerId; startX = e.clientX; startY = e.clientY; dx = 0; dragging = false;
    });
    track.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pid) return;
      dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 8) return;
        if (Math.abs(e.clientY - startY) > Math.abs(dx)) { pid = null; return; } // dikey kaydırma
        dragging = true;
        held.setPointerCapture(pid);
        root.classList.add('is-dragging');
      }
      track.style.setProperty('--drag', `${dx * 0.9}px`);
    });
    const end = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      track.style.removeProperty('--drag');
      const limit = Math.min(90, track.clientWidth * 0.12);
      if (dx < -limit) go(active + 1);
      else if (dx > limit) go(active - 1);
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 0);
    };
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('dragstart', (e) => e.preventDefault());

    root.setAttribute('aria-roledescription', 'slayt gösterisi');
    slides.forEach((s, i) => {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slayt');
      s.setAttribute('aria-label', `${i + 1} / ${n}${s.dataset.title ? ': ' + s.dataset.title : ''}`);
    });
    update();
  }
})();
