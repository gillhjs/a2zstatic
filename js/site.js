/* ═══════════════════════════════════════════════════════════════
   A2Z DETAILING — site.js  v3.0  (Complete Overhaul)
   ─────────────────────────────────────────────────────────────
   Systems: component-loader · custom-cursor · particle-canvas
            word-reveal · card-tilt · magnetic-btns · parallax
            scroll-progress · transparent-header · counters
            footer-accordion · breadcrumb-schema · ga4-tracking
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── HELPERS ─────────────────────────────────────────────── */
  const qs  = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const raf = requestAnimationFrame;

  /* ─── COMPONENT LOADER ────────────────────────────────────── */
  function execScripts(container) {
    qsa('script', container).forEach(old => {
      const ns = document.createElement('script');
      [...old.attributes].forEach(a => ns.setAttribute(a.name, a.value));
      ns.textContent = old.textContent;
      old.parentNode.replaceChild(ns, old);
    });
  }

  async function loadComponents() {
    const path  = window.location.pathname;
    const depth = (path.match(/\//g) || []).length;
    const base  = depth >= 2 ? '../' : '/';
    try {
      const [h, f] = await Promise.all([
        fetch(base + 'components/header.html').then(r => r.text()),
        fetch(base + 'components/footer.html').then(r => r.text())
      ]);
      const hEl = document.getElementById('header');
      const fEl = document.getElementById('footer');
      if (hEl) { hEl.innerHTML = h; execScripts(hEl); }
      if (fEl) { fEl.innerHTML = f; execScripts(fEl); }
    } catch (e) { console.warn('[A2Z] component load', e); }

    if (window.feather) feather.replace();
    initHeader();
    initFooterAccordion();
    initReveal();
    initCounters();
    initTextReveal();
    initTilt();
    initMagnetic();
    initParallax();
    initScrollProgress();
    initCursor();
    initParticles();
    initHeroParallax();
    injectBreadcrumb();
  }

  /* ─── HEADER ──────────────────────────────────────────────── */
  function initHeader() {
    const btn    = document.getElementById('hMenuBtn');
    const menu   = document.getElementById('hMobileMenu');
    const header = document.getElementById('siteHeader');
    const hWrap  = document.getElementById('header');  /* outer wrapper div */

    /* ── Mobile menu toggle ───────────────────────────────── */
    if (btn && menu) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = menu.classList.toggle('menu-open');
        menu.style.display = open ? 'block' : 'none';
        btn.setAttribute('aria-expanded', String(open));
        if (window.feather) feather.replace();
      });
      document.addEventListener('click', e => {
        if (menu.classList.contains('menu-open') &&
            !btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.remove('menu-open');
          menu.style.display = 'none';
        }
      });
    }

    if (!header) return;

    const heroMode = document.body.classList.contains('page-hero');

    /* ── HERO MODE: fix outer wrapper, transparent header ─── */
    if (heroMode && hWrap) {
      /* Make the outer #header div FIXED so hero fills full viewport */
      hWrap.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'right:0',
        'width:100%',
        'z-index:5000'
      ].join(';') + ';';

      /* Hide top bar for clean transparent look */
      const tb = hWrap.querySelector('.top-bar');
      if (tb) tb.style.display = 'none';

      /* siteHeader is now inside a fixed container — make it relative */
      header.style.position = 'relative';

      /* Set initial transparent state */
      applyTransparentHeader(header);
    }

    /* ── Scroll handler ───────────────────────────────────── */
    const onScroll = () => {
      const scrolled = window.scrollY > 50;
      if (heroMode) {
        header.classList.toggle('header-scrolled', scrolled);
        if (scrolled) {
          applySolidHeader(header);
        } else {
          applyTransparentHeader(header);
        }
      } else {
        header.style.boxShadow = scrolled ? '0 4px 32px rgba(0,0,0,.08)' : '';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* run once on load */

    /* ── Active nav link ─────────────────────────────────── */
    qsa('.hnav-link, .mob-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const p = window.location.pathname;
      const match =
        (href === '/index.html' && (p === '/' || p === '/index.html')) ||
        (href !== '/index.html' && href !== '/' &&
         p.includes(href.replace(/^\//, '').replace('.html', '')));
      if (match) link.classList.add('active');
    });
  }

  /* Apply fully transparent header (hero at top) */
  function applyTransparentHeader(header) {
    header.style.background         = 'transparent';
    header.style.borderBottomColor  = 'transparent';
    header.style.boxShadow          = 'none';
    header.style.backdropFilter     = 'none';
    header.style.webkitBackdropFilter = 'none';
  }

  /* Apply solid white header (scrolled or non-hero) */
  function applySolidHeader(header) {
    header.style.background         = 'rgba(255,255,255,0.97)';
    header.style.borderBottomColor  = 'var(--border)';
    header.style.boxShadow          = '0 4px 32px rgba(0,0,0,.08)';
    header.style.backdropFilter     = 'blur(20px)';
    header.style.webkitBackdropFilter = 'blur(20px)';
  }

  /* ─── FOOTER ACCORDION ────────────────────────────────────── */
  function initFooterAccordion() {
    if (window.innerWidth > 640) return;
    qsa('.ft-acc-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const section = toggle.closest('.ft-acc');
        const body = section.querySelector('.ft-acc-body');
        const isOpen = section.classList.contains('open');
        qsa('.ft-acc').forEach(s => {
          s.classList.remove('open');
          const b = s.querySelector('.ft-acc-body');
          if (b) b.style.maxHeight = '0';
        });
        if (!isOpen && body) {
          section.classList.add('open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  /* ─── SCROLL REVEAL ───────────────────────────────────────── */
  function initReveal() {
    const els = qsa('[data-reveal]');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const delay = Number(e.target.dataset.revealDelay || 0);
        setTimeout(() => e.target.classList.add('revealed'), delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ─── WORD-BY-WORD TEXT REVEAL ────────────────────────────── */
  function initTextReveal() {
    qsa('[data-split]').forEach(el => {
      // Get plain text only — strip <br>, <em>, <strong> etc to avoid broken HTML
      // Then re-inject with spans around each word
      // We only split TEXT nodes to preserve HTML structure
      let delay = 0;
      function wrapTextNode(node) {
        if (node.nodeType === 3) { // TEXT_NODE
          const text = node.textContent;
          const words = text.split(/\b/); // split on word boundaries
          if (!text.trim()) return; // skip pure whitespace nodes
          const frag = document.createDocumentFragment();
          // Split by spaces, wrap each real word
          text.split(' ').forEach((word, wi) => {
            if (wi > 0) frag.appendChild(document.createTextNode(' '));
            if (!word) return;
            const wrap  = document.createElement('span');
            wrap.className = 'word-wrap';
            const inner = document.createElement('span');
            inner.className = 'word-inner';
            inner.style.transitionDelay = delay + 'ms';
            inner.textContent = word;
            delay += 45;
            wrap.appendChild(inner);
            frag.appendChild(wrap);
          });
          node.parentNode.replaceChild(frag, node);
        } else if (node.nodeType === 1 && !['SCRIPT','STYLE'].includes(node.tagName)) {
          Array.from(node.childNodes).forEach(wrapTextNode);
        }
      }
      Array.from(el.childNodes).forEach(wrapTextNode);

      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        qsa('.word-inner', el).forEach(w => w.classList.add('word-visible'));
        io.unobserve(el);
      }, { threshold: 0.2, rootMargin: '0px 0px -20px 0px' });
      io.observe(el);
    });
  }

  /* ─── 3D CARD TILT ────────────────────────────────────────── */
  function initTilt() {
    if (window.innerWidth < 900) return; /* desktop only */
    qsa('[data-tilt]').forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform .1s ease';

      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - .5) * 16;
        const y = ((e.clientY - r.top)  / r.height - .5) * 16;
        card.style.transform =
          `perspective(1000px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(8px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s cubic-bezier(.2,.65,.3,1)';
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform .1s ease';
      });
    });
  }

  /* ─── MAGNETIC BUTTONS ────────────────────────────────────── */
  function initMagnetic() {
    if (window.innerWidth < 900) return;
    qsa('[data-magnetic]').forEach(btn => {
      let tx = 0, ty = 0;
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width  / 2) * .35;
        ty = (e.clientY - r.top  - r.height / 2) * .35;
        btn.style.transform = `translate(${tx}px, ${ty}px)`;
        btn.style.transition = 'transform .1s ease';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
        btn.style.transition = 'transform .5s cubic-bezier(.2,.65,.3,1)';
      });
    });
  }

  /* ─── SCROLL PROGRESS BAR ─────────────────────────────────── */
  function initScrollProgress() {
    const bar = document.getElementById('scrollBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (!h) return;
      bar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
  }

  /* ─── PARALLAX ON HERO IMAGE ──────────────────────────────── */
  function initHeroParallax() {
    const bg = document.getElementById('heroBg');
    if (!bg) return;
    setTimeout(() => bg.classList.add('loaded'), 100);
    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight) return;
      bg.style.transform = `scale(1.04) translateY(${window.scrollY * 0.3}px)`;
    }, { passive: true });
  }

  /* ─── GENERAL PARALLAX ────────────────────────────────────── */
  function initParallax() {
    const els = qsa('[data-parallax]');
    if (!els.length) return;
    window.addEventListener('scroll', () => {
      els.forEach(el => {
        const speed  = parseFloat(el.dataset.parallax || .15);
        const rect   = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * speed}px)`;
      });
    }, { passive: true });
  }

  /* ─── ANIMATED COUNTERS ───────────────────────────────────── */
  function initCounters() {
    const els = qsa('[data-count]');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        animateCounter(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .5 });
    els.forEach(el => io.observe(el));
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 2000;
    const start    = performance.now();
    const isInt    = Number.isInteger(target);
    function step(now) {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4); /* quartic ease-out */
      const v = target * e;
      el.textContent = prefix + (isInt ? Math.floor(v) : v.toFixed(1)) + suffix;
      if (p < 1) raf(step); else el.textContent = prefix + target + suffix;
    }
    raf(step);
  }

  /* ─── CUSTOM CURSOR ───────────────────────────────────────── */
  function initCursor() {
    if (window.innerWidth < 1024 || window.matchMedia('(pointer:coarse)').matches) return;
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mx = -100, my = -100, rx = -100, ry = -100;
    dot.style.display  = 'block';
    ring.style.display = 'block';

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    });

    (function animRing() {
      rx += (mx - rx) * .1;
      ry += (my - ry) * .1;
      ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      raf(animRing);
    })();

    /* Grow ring on interactive elements */
    qsa('a, button, [data-tilt], [data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
    });
  }

  /* ─── CANVAS PARTICLE SYSTEM (hero) ──────────────────────── */
  function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const N = 55;
    const particles = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + .4,
      dx: (Math.random() - .5) * .35,
      dy: (Math.random() - .5) * .35,
      op: Math.random() * .45 + .08,
      pulse: Math.random() * Math.PI * 2
    }));

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.pulse += .008;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;

        const opacity = p.op * (.7 + .3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,147,58,${opacity})`;
        ctx.fill();
      });

      /* Connect nearby particles with faint lines */
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,147,58,${.12 * (1 - dist / 110)})`;
            ctx.lineWidth = .5;
            ctx.stroke();
          }
        }
      }
      raf(draw);
    }
    raf(draw);
  }

  /* ─── BEFORE/AFTER SLIDER ─────────────────────────────────── */
  window.initBASlider = function() {
    const slider  = document.getElementById('baSlider');
    const bWrap   = document.getElementById('baBeforeWrap');
    const divider = document.getElementById('baDivider');
    if (!slider || !bWrap || !divider) return;

    let dragging = false;
    const setPos = x => {
      const r   = slider.getBoundingClientRect();
      const pct = Math.max(3, Math.min(97, (x - r.left) / r.width * 100));
      bWrap.style.width  = pct + '%';
      divider.style.left = pct + '%';
    };
    divider.addEventListener('mousedown',  ()  => dragging = true);
    window.addEventListener ('mouseup',    ()  => dragging = false);
    window.addEventListener ('mousemove',  e   => { if (dragging) setPos(e.clientX); });
    divider.addEventListener('touchstart', e   => { dragging = true; e.preventDefault(); }, { passive: false });
    window.addEventListener ('touchend',   ()  => dragging = false);
    window.addEventListener ('touchmove',  e   => { if (dragging) setPos(e.touches[0].clientX); });
  };

  /* ─── BREADCRUMB SCHEMA ───────────────────────────────────── */
  function injectBreadcrumb() {
    const path  = window.location.pathname;
    const base  = 'https://a2zdetailing.ca';
    const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' }];
    const MAP = { services:'Services', contact:'Contact', about:'About', faq:'FAQ',
                  gallery:'Gallery', pricing:'Pricing', fleet:'Fleet Services', blog:'Blog' };
    if (path.includes('/locations/')) {
      items.push({ '@type':'ListItem', position:2, name:'Services', item:base+'/services.html' });
      const city = path.split('/').pop().replace('.html','').replace('detailing_','').replace(/_/g,' ');
      items.push({ '@type':'ListItem', position:3, name:'Auto Detailing '+city.charAt(0).toUpperCase()+city.slice(1)+' BC', item:base+path });
    } else if (path.includes('/blog/') && path.length > '/blog/'.length) {
      items.push({ '@type':'ListItem', position:2, name:'Blog', item:base+'/blog/' });
      items.push({ '@type':'ListItem', position:3, name:(document.title||'').split('|')[0].trim(), item:base+path });
    } else {
      for (const [k,v] of Object.entries(MAP)) {
        if (path.includes(k)) { items.push({ '@type':'ListItem', position:2, name:v, item:base+path }); break; }
      }
    }
    if (items.length > 1) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify({ '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:items });
      document.head.appendChild(s);
    }
  }

  /* ─── GA4 TRACKING ────────────────────────────────────────── */
  const ga = (ev, p) => { if (typeof gtag === 'function') gtag('event', ev, p); };
  window.trackCallClick    = () => ga('phone_click',          { event_category:'conversion',  event_label:'header_phone'  });
  window.trackQuoteClick   = () => ga('quote_click',           { event_category:'conversion',  event_label:'header_quote'  });
  window.trackContactPhone = () => ga('phone_click',          { event_category:'conversion',  event_label:'contact_page'  });
  window.trackInstagram    = () => ga('social_click',         { event_category:'engagement',  event_label:'instagram'     });
  window.trackFacebook     = () => ga('social_click',         { event_category:'engagement',  event_label:'facebook'      });
  window.trackGallery      = c  => ga('gallery_click',        { event_category:'gallery',     event_label:c               });
  window.trackService      = s  => ga('service_interest',     { event_category:'services',    event_label:s               });
  window.trackBlog         = t  => ga('blog_read',            { event_category:'content',     event_label:t               });
  window.trackSubscription = () => ga('subscription_interest',{ event_category:'conversion',  event_label:'care_club'     });
  window.trackFleet        = () => ga('fleet_inquiry',        { event_category:'conversion',  event_label:'fleet_page'    });

  /* Scroll depth */
  const fired = {};
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (!h) return;
    const pct = Math.round(window.scrollY / h * 100);
    [25, 50, 75, 90].forEach(m => {
      if (pct >= m && !fired[m]) { fired[m] = true; ga('scroll_depth', { event_category:'engagement', event_label:m+'%', value:m }); }
    });
  }, { passive: true });

  /* ─── BOOT ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    loadComponents();
    /* Before/After init if on homepage */
    if (document.getElementById('baSlider')) {
      setTimeout(window.initBASlider, 800);
    }
  });

})();

/* ═══════════════════════════════════════════════════════════════
   GA4 ENHANCED EVENTS — appended to site.js
   Covers: form_submit · phone_click · page_view enrichment
           service_view · quote_funnel · care_club_funnel
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── FORM SUBMIT EVENTS ────────────────────────────────────── */
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', () => {
      const sub = form.querySelector('[name="_subject"]');
      const label = sub ? sub.value : 'form_submit';
      // determine form type
      let formType = 'general_enquiry';
      if (label.includes('Care Club') || label.includes('Membership')) formType = 'care_club_signup';
      else if (label.includes('Fleet'))  formType = 'fleet_enquiry';
      else if (label.includes('Quote'))  formType = 'quote_request';

      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          event_category: 'conversion',
          event_label:     formType,
          form_type:       formType,
          value:           formType === 'care_club_signup' ? 1000 :
                           formType === 'fleet_enquiry'    ?  500 : 150,
          currency:        'CAD'
        });
        gtag('event', 'form_submit', {
          event_category: 'engagement',
          event_label:     formType,
          form_id:         form.id || 'unnamed_form'
        });
      }
    });
  });

  /* ── ALL PHONE LINK CLICKS ─────────────────────────────────── */
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'phone_call', {
          event_category: 'conversion',
          event_label:     window.location.pathname,
          value:           150,
          currency:        'CAD'
        });
      }
    });
  });

  /* ── GA4 PAGE VIEW ENRICHMENT ──────────────────────────────── */
  if (typeof gtag === 'function') {
    const path = window.location.pathname;
    let pageType = 'other';
    if (path === '/' || path.includes('index'))          pageType = 'homepage';
    else if (path.includes('services'))                  pageType = 'services';
    else if (path.includes('pricing'))                   pageType = 'pricing';
    else if (path.includes('contact'))                   pageType = 'contact';
    else if (path.includes('gallery'))                   pageType = 'gallery';
    else if (path.includes('fleet'))                     pageType = 'fleet';
    else if (path.includes('blog'))                      pageType = 'blog';
    else if (path.includes('locations') || path.includes('detailing_')) pageType = 'location';
    else if (path.includes('about'))                     pageType = 'about';
    else if (path.includes('faq'))                       pageType = 'faq';
    else if (path.includes('thanks'))                    pageType = 'thank_you';

    gtag('event', 'page_view_enriched', {
      page_type:      pageType,
      page_path:      path,
      has_hero:       document.body.classList.contains('page-hero') ? 'yes' : 'no',
      device_type:    window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
    });

    /* Track time on page */
    let timeMarks = [30, 60, 120, 300];
    timeMarks.forEach(secs => {
      setTimeout(() => {
        gtag('event', 'time_on_page', {
          event_category: 'engagement',
          event_label:     secs + 's',
          page_type:       pageType,
          value:           secs
        });
      }, secs * 1000);
    });
  }

  /* ── OUTBOUND LINK TRACKING ────────────────────────────────── */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isExternal = href.startsWith('http') && !href.includes('a2zdetailing.ca');
    const isSocial   = href.includes('instagram') || href.includes('facebook');
    if (isExternal && typeof gtag === 'function') {
      link.addEventListener('click', () => {
        gtag('event', isSocial ? 'social_click' : 'outbound_link', {
          event_category: isSocial ? 'social' : 'outbound',
          event_label:    href,
          link_url:       href
        });
      });
    }
  });

  /* ── CARE CLUB INTEREST FUNNEL ─────────────────────────────── */
  const careClub = document.getElementById('join') || document.querySelector('.care-club-card');
  if (careClub && typeof gtag === 'function') {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      gtag('event', 'care_club_view', {
        event_category: 'funnel',
        event_label:     'care_club_section_viewed'
      });
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(careClub);
  }

  /* ── BEFORE/AFTER INTERACTION ──────────────────────────────── */
  const baSlider = document.getElementById('baSlider');
  if (baSlider) {
    let baTracked = false;
    baSlider.addEventListener('mousedown', () => {
      if (baTracked || typeof gtag !== 'function') return;
      baTracked = true;
      gtag('event', 'ba_slider_interact', {
        event_category: 'engagement',
        event_label:     'before_after_drag'
      });
    });
    baSlider.addEventListener('touchstart', () => {
      if (baTracked || typeof gtag !== 'function') return;
      baTracked = true;
      gtag('event', 'ba_slider_interact', {
        event_category: 'engagement',
        event_label:     'before_after_touch'
      });
    });
  }

  /* ── SERVICE CARD CLICKS ───────────────────────────────────── */
  document.querySelectorAll('.svc-card, .fleet-card, .price-card').forEach(card => {
    card.addEventListener('click', () => {
      if (typeof gtag !== 'function') return;
      const tag  = card.querySelector('.svc-card-tag, .fleet-icon + h3');
      const name = tag ? tag.textContent.trim() : 'unknown';
      gtag('event', 'service_card_click', {
        event_category: 'services',
        event_label:     name
      });
    });
  });

});
