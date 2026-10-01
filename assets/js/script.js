(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function initTheme() {
    $$('[data-theme-toggle]').forEach((button) => {
      const sync = () => button.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
      sync();
      button.addEventListener('click', () => {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
        $$('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(root.dataset.theme === 'dark')));
      });
    });
  }

  function initMenu() {
    const menu = $('[data-menu]');
    const opener = $('[data-menu-open]');
    if (!menu || !opener || typeof menu.showModal !== 'function') return;
    opener.addEventListener('click', () => menu.showModal());
    menu.addEventListener('click', (event) => {
      const r = menu.getBoundingClientRect();
      const outside = event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
      if (event.target === menu && outside) menu.close();
    });
    window.matchMedia('(min-width: 1130px)').addEventListener('change', (mq) => { if (mq.matches && menu.open) menu.close(); });
  }

  function initNavDot() {
    const nav = $('[data-nav]');
    const dot = $('[data-nav-dot]');
    if (!nav || !dot) return;
    const key = 'nav-dot';
    const place = (animate) => {
      const active = $('[aria-current="page"]', nav);
      if (!active || !nav.offsetParent) {
        dot.classList.remove('is-placed');
        return null;
      }
      const x = active.offsetLeft + active.offsetWidth / 2;
      if (!animate) dot.style.transition = 'none';
      dot.style.left = `${x}px`;
      dot.classList.add('is-placed');
      if (!animate) {
        dot.getBoundingClientRect();
        dot.style.transition = '';
      }
      return x;
    };
    let previous = null;
    try { previous = sessionStorage.getItem(key); } catch (e) {}
    if (previous !== null && !reducedMotion && $('[aria-current="page"]', nav)) {
      dot.style.transition = 'none';
      dot.style.left = `${previous}px`;
      dot.classList.add('is-placed');
      dot.getBoundingClientRect();
      dot.style.transition = '';
      requestAnimationFrame(() => place(true));
    } else {
      place(false);
    }
    window.addEventListener('resize', () => place(false));
    document.fonts && document.fonts.ready.then(() => place(false));
    window.addEventListener('pagehide', () => {
      const x = place(false);
      try {
        if (x === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, String(x));
      } catch (e) {}
    });
  }

  function initToss() {
    const pit = $('[data-toss]');
    if (!pit || reducedMotion || !('IntersectionObserver' in window)) return;
    const tiles = $$('.toss__tile', pit);
    const foot = $('[data-toss-foot]');
    const shakeButton = $('[data-toss-shake]');
    if (!tiles.length) return;

    let size = 0;
    let radius = 0;
    let height = 0;
    let bodies = [];
    let dragging = null;
    let visible = false;
    let dropped = false;
    let lastInput = performance.now();
    let nextIdle = 0;
    let idleCount = 0;
    let last = performance.now();
    let frame = 0;

    const width = () => pit.clientWidth;

    const measure = () => {
      const mobile = window.innerWidth < 760;
      tiles.forEach((t) => $('.key-tile', t).classList.toggle('key-tile--lg', !mobile));
      size = mobile ? 50 : 80;
      radius = size * 0.56;
      height = Math.max(size * 2.6, Math.ceil((tiles.length * size * 1.2) / Math.max(width(), 1)) * size * 1.05 + size * 1.2);
      pit.style.height = `${height}px`;
      bodies.forEach((b) => {
        b.x = clamp(b.x, radius, width() - radius);
        b.y = Math.min(b.y, height - radius);
      });
    };

    pit.classList.add('is-live');
    if (foot) foot.hidden = false;
    measure();

    const n = tiles.length;
    bodies = tiles.map((_, i) => ({
      x: radius + (((i * 7) % n) / (n - 1)) * (width() - 2 * radius),
      y: -size - i * 45 - 2000,
      vx: (Math.random() - 0.5) * 200,
      vy: 0,
      a: (Math.random() - 0.5) * 60,
      w: (Math.random() - 0.5) * 6,
      onFloor: false,
    }));

    const hop = (b, k = 1) => {
      b.vy = -(520 + Math.random() * 380) * k;
      b.vx += (Math.random() - 0.5) * 260;
      b.w += (Math.random() - 0.5) * 8;
    };

    const shake = () => bodies.forEach((b) => {
      b.vy = -(700 + Math.random() * 700);
      b.vx += (Math.random() - 0.5) * 900;
      b.w += (Math.random() - 0.5) * 12;
    });

    const idle = (now) => {
      if (!visible || document.hidden || now - lastInput < 4000 || now < nextIdle) return;
      idleCount += 1;
      if (idleCount % 5 === 0) {
        bodies
          .map((b, i) => i)
          .sort((a, c) => bodies[a].x - bodies[c].x)
          .forEach((i, k) => setTimeout(() => hop(bodies[i], 0.8), k * 90));
        nextIdle = now + 4200;
      } else {
        hop(bodies[Math.floor(Math.random() * bodies.length)]);
        nextIdle = now + 1800 + Math.random() * 1800;
      }
    };

    const isDragged = (i) => dragging && dragging.i === i;

    const step = (now) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      idle(now);
      const w = width();
      const floor = height - radius;

      bodies.forEach((b, i) => {
        if (isDragged(i) || b.y < -1000) return;
        b.vy += 2000 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.a += b.w;
        if (b.y > floor) {
          b.y = floor;
          b.vy *= -0.3;
          b.vx *= 0.86;
          if (Math.abs(b.vy) < 40) b.vy = 0;
          b.w *= 0.7;
          b.onFloor = true;
        } else {
          b.onFloor = false;
        }
        if (b.x < radius) { b.x = radius; b.vx *= -0.5; }
        if (b.x > w - radius) { b.x = w - radius; b.vx *= -0.5; }
        b.w = clamp(b.w * 0.985, -7, 7);
        if (b.onFloor || Math.hypot(b.vx, b.vy) < 160) {
          b.w *= 0.85;
          const upright = Math.round(b.a / 360) * 360;
          b.a += clamp((upright - b.a) * 0.06, -2.2, 2.2);
        }
      });

      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const A = bodies[i];
          const B = bodies[j];
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const d = Math.hypot(dx, dy) || 0.01;
          const min = 2 * radius;
          if (d >= min) continue;
          const nx = dx / d;
          const ny = dy / d;
          const overlap = (min - d) / 2;
          const da = isDragged(i);
          const db = isDragged(j);
          if (!da) { A.x -= nx * overlap * (db ? 2 : 1); A.y -= ny * overlap * (db ? 2 : 1); }
          if (!db) { B.x += nx * overlap * (da ? 2 : 1); B.y += ny * overlap * (da ? 2 : 1); }
          const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
          if (rv < 0) {
            const impulse = (-1.3 * rv) / 2;
            if (!da) { A.vx -= impulse * nx; A.vy -= impulse * ny; }
            if (!db) { B.vx += impulse * nx; B.vy += impulse * ny; }
            const tangent = rv < -120 ? (B.vx - A.vx) * -ny + (B.vy - A.vy) * nx : 0;
            A.w += tangent * 0.003;
            B.w -= tangent * 0.003;
          }
        }
      }

      bodies.forEach((b, i) => {
        tiles[i].style.transform = `translate(${b.x - size / 2}px, ${b.y - size / 2}px) rotate(${b.a}deg)`;
      });
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !dropped) {
        dropped = true;
        bodies.forEach((b) => { b.y += 2000; });
      }
    }, { threshold: 0.3 });
    observer.observe(pit);

    const poke = () => { lastInput = performance.now(); };

    const nudge = (event) => {
      poke();
      if (dragging) return;
      const r = pit.getBoundingClientRect();
      const mx = event.clientX - r.left;
      const my = event.clientY - r.top;
      if (my < -40 || my > height + 20) return;
      bodies.forEach((b) => {
        const dx = b.x - mx;
        const dy = b.y - my;
        const d = Math.hypot(dx, dy);
        if (d < size * 1.1 && d > 1 && b.y > height - radius - 4) {
          b.vx += (dx / d) * 260;
          b.vy = -Math.min(520, 380 + Math.abs(event.movementX || 0) * 8);
          b.w += (dx > 0 ? 1 : -1) * 3;
        }
      });
    };

    window.addEventListener('pointermove', nudge, { passive: true });
    window.addEventListener('scroll', poke, { passive: true });
    window.addEventListener('keydown', poke);
    window.addEventListener('resize', measure);
    if (shakeButton) shakeButton.addEventListener('click', shake);

    tiles.forEach((tile, i) => {
      tile.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        const r = pit.getBoundingClientRect();
        const b = bodies[i];
        const now = performance.now();
        dragging = { i, ox: event.clientX - r.left - b.x, oy: event.clientY - r.top - b.y, lx: event.clientX, ly: event.clientY, lt: now, t0: now, moved: 0 };
        tile.setPointerCapture(event.pointerId);
      });

      tile.addEventListener('pointermove', (event) => {
        if (!dragging || dragging.i !== i) return;
        const r = pit.getBoundingClientRect();
        const b = bodies[i];
        const now = performance.now();
        const dt = Math.max(1, now - dragging.lt) / 1000;
        b.vx = (event.clientX - dragging.lx) / dt;
        b.vy = (event.clientY - dragging.ly) / dt;
        dragging.moved += Math.abs(event.clientX - dragging.lx) + Math.abs(event.clientY - dragging.ly);
        b.x = event.clientX - r.left - dragging.ox;
        b.y = Math.min(height - radius, event.clientY - r.top - dragging.oy);
        dragging.lx = event.clientX;
        dragging.ly = event.clientY;
        dragging.lt = now;
      });

      const release = () => {
        if (!dragging || dragging.i !== i) return;
        const b = bodies[i];
        const tap = dragging.moved < 6 && performance.now() - dragging.t0 < 400;
        tile.dataset.dragged = tap ? '' : 'true';
        if (tap) {
          b.vx = 0;
          b.vy = -300;
        } else {
          b.vx = clamp(b.vx, -2500, 2500);
          b.vy = clamp(b.vy, -2500, 2500);
          b.w = clamp(b.vx * 0.003, -5, 5);
        }
        dragging = null;
      };
      tile.addEventListener('pointerup', release);
      tile.addEventListener('pointercancel', release);

      tile.addEventListener('click', (event) => {
        if (tile.dataset.dragged === 'true') {
          event.preventDefault();
          tile.dataset.dragged = '';
          return;
        }
        if (event.detail === 0 || event.metaKey || event.ctrlKey || event.shiftKey || tile.target === '_blank') return;
        event.preventDefault();
        setTimeout(() => { window.location.href = tile.href; }, 180);
      });
    });

    document.addEventListener('visibilitychange', () => { last = performance.now(); });
    frame = requestAnimationFrame(step);
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  }

  function initPost() {
    const bar = $('[data-read-progress]');
    if (bar) {
      const update = () => {
        const el = document.documentElement;
        const p = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
        bar.style.transform = `scaleX(${clamp(p, 0, 1)})`;
      };
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }

    const toc = $('[data-toc]');
    const source = $('[data-toc-source]');
    if (!toc || !source) return;
    const headings = $$('h2[id], h3[id]', source);
    if (headings.length < 2) return;
    const links = headings.map((h) => {
      const a = document.createElement('a');
      a.className = `toc__link${h.tagName === 'H3' ? ' toc__link--sub' : ''}`;
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      a.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - 24, behavior: reducedMotion ? 'auto' : 'smooth' });
        history.replaceState(null, '', `#${h.id}`);
      });
      toc.appendChild(a);
      return a;
    });
    toc.hidden = false;
    const spy = () => {
      let current = 0;
      headings.forEach((h, i) => { if (h.getBoundingClientRect().top < 140) current = i; });
      links.forEach((a, i) => {
        a.classList.toggle('is-active', i === current);
        if (i === current) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }

  function initPortfolioFilter() {
    const bar = $('[data-filter-bar]');
    const grid = $('[data-filter-grid]');
    if (!bar || !grid) return;
    const buttons = $$('[data-filter]', bar);
    const cards = $$('[data-filters]', grid);
    const apply = (value, updateUrl) => {
      if (!buttons.some((b) => b.dataset.filter === value)) value = 'All';
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === value)));
      cards.forEach((card) => {
        card.hidden = value !== 'All' && !card.dataset.filters.split(',').includes(value);
      });
      grid.removeAttribute('data-rise');
      grid.getBoundingClientRect();
      grid.setAttribute('data-rise', '');
      if (updateUrl) {
        const url = new URL(window.location.href);
        if (value === 'All') url.searchParams.delete('filter');
        else url.searchParams.set('filter', value);
        history.replaceState(null, '', url);
      }
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter, true)));
    const initial = new URLSearchParams(window.location.search).get('filter');
    if (initial) apply(initial, false);
  }

  function initLightbox() {
    const dialog = $('[data-lightbox-dialog]');
    const links = $$('[data-lightbox]');
    if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;
    const image = $('[data-lightbox-image]', dialog);
    const caption = $('[data-lightbox-caption]', dialog);
    const count = $('[data-lightbox-count]', dialog);
    let index = 0;

    const show = (i) => {
      index = (i + links.length) % links.length;
      const link = links[index];
      image.src = link.href;
      image.alt = link.dataset.caption || '';
      caption.textContent = link.dataset.caption || '';
      count.textContent = `${index + 1} / ${links.length}`;
      image.style.animation = 'none';
      image.getBoundingClientRect();
      image.style.animation = '';
    };

    links.forEach((link, i) => link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      show(i);
      dialog.showModal();
    }));

    $$('[data-lightbox-step]', dialog).forEach((b) => b.addEventListener('click', () => show(index + Number(b.dataset.lightboxStep))));
    $('[data-lightbox-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') show(index + 1);
      if (event.key === 'ArrowLeft') show(index - 1);
    });
    dialog.addEventListener('close', () => { image.removeAttribute('src'); });
  }

  initTheme();
  initMenu();
  initNavDot();
  initToss();
  initPost();
  initPortfolioFilter();
  initLightbox();
})();
