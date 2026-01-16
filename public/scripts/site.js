  // Año footer
    document.getElementById('y').textContent = new Date().getFullYear();

    // ── Menú móvil robusto: anti-doble-toggle + desbloqueo garantizado
    (function () {
      const root = document.documentElement;
      const body = document.body;
      const btn = document.getElementById('menuToggle');
      const nav = document.getElementById('mobileNav');
      const overlay = document.getElementById('mobileOverlay');
      const closeBtn = document.getElementById('menuClose');
      const DUR = 250; // debe coincidir con CSS
      let isAnimating = false;

      const isOpen = () => root.classList.contains('mobile-open');

      function setAria(open) {
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        nav.setAttribute('aria-hidden', open ? 'false' : 'true');
        overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
      }

      function endAfterTransition(cb) {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          clearTimeout(t);
          nav.removeEventListener('transitionend', finish, true);
          isAnimating = false;
          cb && cb();
        };
        const t = setTimeout(finish, DUR + 60);
        nav.addEventListener('transitionend', finish, true);
      }

      function open() {
        if (isAnimating || isOpen()) return;
        isAnimating = true;
        root.classList.add('mobile-open');
        body.classList.add('no-scroll');
        setAria(true);
        endAfterTransition();
      }

      function close() {
        if (isAnimating || !isOpen()) return;
        isAnimating = true;
        root.classList.remove('mobile-open');
        body.classList.remove('no-scroll');
        setAria(false);
        endAfterTransition();
      }

      function toggle(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        }
        isOpen() ? close() : open();
      }

      btn?.addEventListener('click', toggle, { passive: false });
      overlay?.addEventListener('click', close, { passive: true });
      closeBtn?.addEventListener('click', close, { passive: true });
      nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', close, { passive: true }));

      // Escape para cerrar
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

      // Swipe derecha para cerrar
      let sx = null, sy = null, drag = false;
      nav.addEventListener('touchstart', e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; drag = true; }, { passive: true });
      nav.addEventListener('touchmove', e => {
        if (!drag) return;
        const t = e.touches[0]; const dx = t.clientX - sx; const dy = t.clientY - sy;
        if (Math.abs(dy) > Math.abs(dx)) return;
        if (dx > 40) { close(); drag = false; }
      }, { passive: true });
      nav.addEventListener('touchend', () => { drag = false; }, { passive: true });

      // Salvaguardas extra
      window.addEventListener('hashchange', close);
      document.addEventListener('visibilitychange', () => { if (document.hidden) close(); });
      window.addEventListener('orientationchange', close);
    })();

    // Parallax fondo solo desktop
    (function () {
      const bg = document.querySelector('.bg-anim'); if (!bg) return;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) return;
      window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / innerWidth - .5) * 24;
        const y = (e.clientY / innerHeight - .5) * 36;
        bg.style.setProperty('--gx', x.toFixed(1) + 'px');
        bg.style.setProperty('--gy', y.toFixed(1) + 'px');
      }, { passive: true });
    })();

    // Partículas (no en móvil/ahorro de datos)
    (function () {
      const cvs = document.getElementById('particles'); if (!cvs) return;
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const save = conn && (conn.saveData || (conn.effectiveType && /2g/.test(conn.effectiveType)));
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const enable = !(save || isMobile || prefersReduced);
      if (!enable) { cvs.remove(); return; }
      const ctx = cvs.getContext('2d'); let w, h, dpr; const N = Math.max(34, Math.round(innerWidth / 40));
      const dots = []; const speed = .22;
      function resize() { dpr = Math.max(1, devicePixelRatio || 1); w = innerWidth; h = innerHeight; cvs.width = w * dpr; cvs.height = h * dpr; cvs.style.width = w + 'px'; cvs.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
      function rnd(n) { return Math.random() * n }
      function resetDot(d) { d.x = rnd(w); d.y = rnd(h); d.vx = (Math.random() - .5) * speed; d.vy = (Math.random() - .5) * speed; d.r = 1 + Math.random() * 1.8 }
      function init() { resize(); dots.length = 0; for (let i = 0; i < N; i++) { const d = {}; resetDot(d); dots.push(d); } loop() }
      function step() { ctx.clearRect(0, 0, w, h); ctx.globalAlpha = .8; ctx.fillStyle = '#60a5fa'; for (const d of dots) { d.x += d.vx; d.y += d.vy; if (d.x < -20 || d.x > w + 20 || d.y < -20 || d.y > h + 20) resetDot(d); ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); } }
      let raf; function loop() { step(); raf = requestAnimationFrame(loop) }
      window.addEventListener('resize', resize, { passive: true }); init();
      window.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); } else { loop(); } });
    })();

    // Cookies + GA4 (como lo tenías)
    (function () {
      const BANNER = document.getElementById('cookieBanner');
      const ACCEPT = document.getElementById('cookieAccept');
      const REJECT = document.getElementById('cookieReject');
      const KEY = 'cookie-consent-v1';
      const GA_ID = 'G-XXXXXXXXXX';
      const saved = localStorage.getItem(KEY); if (!saved) { BANNER.hidden = false; }
      if (saved === 'accepted') { loadGAandPing('restore'); }
      ACCEPT?.addEventListener('click', () => { localStorage.setItem(KEY, 'accepted'); BANNER.hidden = true; loadGAandPing('accept'); });
      REJECT?.addEventListener('click', () => { localStorage.setItem(KEY, 'rejected'); BANNER.hidden = true; });
      function loadGAandPing(source) {
        if (window.gaLoaded || !GA_ID || GA_ID === 'G-XXXXXXXXXX') return;
        window.gaLoaded = true;
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_ID);
        gtag('event', 'cookie_consent', { consent_state: 'accepted', consent_source: source });
      }
    })();