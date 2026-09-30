/* MyBestLoan production interactions
   Consolidated developer handoff: one bootstrap entry point, modular initializers. */

function initCoreUI() {
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const dropdowns = [...document.querySelectorAll('[data-dropdown]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mobileBreakpoint = 1120;
  const hero = document.querySelector('.hero, .blog-hero');

  const usesMobileNavigation = () => window.innerWidth <= mobileBreakpoint;

  const setHeaderState = () => {
    if (!header) return;
    const scrollY = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', scrollY > 24);

    const hasHero = Boolean(hero);
    const switchPoint = hasHero ? Math.max((hero.offsetHeight || 0) - 140, 90) : 0;
    const useLightHeader = !hasHero || scrollY > switchPoint;
    header.classList.toggle('is-light', useLightHeader);
  };

  const closeDropdowns = (exception = null) => {
    dropdowns.forEach((dropdown) => {
      if (dropdown === exception) return;
      dropdown.classList.remove('is-open');
      dropdown.querySelector('.dropdown-trigger')?.setAttribute('aria-expanded', 'false');
    });
  };

  const closeMobileNav = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    closeDropdowns();
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(willOpen));
      navMenu.classList.toggle('is-open', willOpen);
      document.body.classList.toggle('nav-open', willOpen);
      if (!willOpen) closeDropdowns();
    });
  }

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    if (!trigger) return;

    let closeTimer = null;
    const open = () => {
      window.clearTimeout(closeTimer);
      closeDropdowns(dropdown);
      dropdown.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      window.clearTimeout(closeTimer);
      dropdown.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (usesMobileNavigation()) {
        const willOpen = !dropdown.classList.contains('is-open');
        closeDropdowns(dropdown);
        dropdown.classList.toggle('is-open', willOpen);
        trigger.setAttribute('aria-expanded', String(willOpen));
      } else {
        open();
      }
    });

    dropdown.addEventListener('pointerenter', () => {
      if (!usesMobileNavigation()) open();
    });
    dropdown.addEventListener('pointerleave', () => {
      if (!usesMobileNavigation()) closeTimer = window.setTimeout(close, 120);
    });
    dropdown.addEventListener('focusin', () => {
      // On touch/mobile, focus is dispatched before click. Opening here caused the
      // subsequent click handler to immediately close the dropdown, requiring a second tap.
      if (!usesMobileNavigation()) open();
    });
    dropdown.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
    dropdown.addEventListener('focusout', (event) => {
      if (dropdown.contains(event.relatedTarget)) return;
      if (usesMobileNavigation()) close();
      else closeTimer = window.setTimeout(close, 80);
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-dropdown]')) closeDropdowns();
    if (
      usesMobileNavigation() &&
      navMenu?.classList.contains('is-open') &&
      !event.target.closest('[data-nav-menu]') &&
      !event.target.closest('[data-nav-toggle]')
    ) {
      closeMobileNav();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') {
        event.preventDefault();
        return;
      }
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      closeMobileNav();
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  // Scroll-triggered blur-to-sharp reveal. This is a visual entrance effect, not content lazy-loading.
  // Existing data-reveal elements are retained; additional meaningful blocks are enrolled automatically
  // so every page gets the same motion language without duplicating page markup.
  const autoRevealSelectors = [
    'main .legal-card',
    'main .loan-explorer',
    'main .loan-offer-grid-card',
    'main .image-feature-card',
    'main .team-profile-card',
    'main .three-grid-card',
    'main .timeline-step',
    'main .step-card',
    'main .metric-card',
    'main .comparison-row',
    'main .partner-row',
    'main .partner-image-row',
    'main .support-route',
    'main .contact-method',
    'main .faq-item',
    'main .faq-tab-system',
    'main .contact-form-card',
    'main .contact-faq-panel',
    'main .final-cta-box',
    'main .ai-strip',
    'main .testimonial-marquee',
    '.site-footer .footer-brand',
    '.site-footer .footer-column',
    '.site-footer .footer-trust'
  ];

  document.querySelectorAll(autoRevealSelectors.join(',')).forEach((item) => {
    if (!item.hasAttribute('data-reveal')) item.classList.add('scroll-blur-reveal');
  });

  const revealItems = [...document.querySelectorAll('[data-reveal], .scroll-blur-reveal')];
  const revealGroups = new Map();
  revealItems.forEach((item) => {
    const group = item.closest('section, footer, main') || document.body;
    if (!revealGroups.has(group)) revealGroups.set(group, []);
    revealGroups.get(group).push(item);
  });
  revealGroups.forEach((items) => {
    items.forEach((item, index) => {
      // Short cascading delay gives grouped cards a polished wave without making the page feel slow.
      item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
    });
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  if (!reducedMotion && finePointer) {
    document.querySelectorAll('[data-tilt]').forEach((item) => {
      let frameId = null;
      const setActive = () => item.classList.add('is-tilting');
      const updateTilt = (event) => {
        const bounds = item.getBoundingClientRect();
        const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
        const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        if (frameId) cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(() => {
          item.style.setProperty('--tilt-x', `${normalizedY * 5.2}deg`);
          item.style.setProperty('--tilt-y', `${normalizedX * -6.2}deg`);
          item.style.setProperty('--image-shift-x', `${normalizedX * -10}px`);
          item.style.setProperty('--image-shift-y', `${normalizedY * -9}px`);
        });
      };
      const reset = () => {
        if (frameId) cancelAnimationFrame(frameId);
        item.classList.remove('is-tilting');
        item.style.setProperty('--tilt-x', '0deg');
        item.style.setProperty('--tilt-y', '0deg');
        item.style.setProperty('--image-shift-x', '0px');
        item.style.setProperty('--image-shift-y', '0px');
      };
      item.addEventListener('pointerenter', setActive, { passive: true });
      item.addEventListener('pointermove', updateTilt, { passive: true });
      item.addEventListener('pointerleave', reset);
      item.addEventListener('pointercancel', reset);
    });
  }

  document.querySelectorAll('[data-card-link]').forEach((card) => {
    const cardLink = card.querySelector('a.button:not(.button--disabled):not([aria-disabled="true"])');
    if (!cardLink) return;
    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button, input, select, textarea, label')) return;
      cardLink.click();
    });
  });

  document.querySelectorAll('.faq-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      if (!item) return;
      const willOpen = !item.classList.contains('is-open');
      item.classList.toggle('is-open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });


  document.querySelectorAll('[data-faq-tabs]').forEach((system) => {
    const tabs = [...system.querySelectorAll('[role="tab"]')];
    const panels = [...system.querySelectorAll('[role="tabpanel"]')];
    if (!tabs.length || !panels.length) return;

    const activateTab = (tab, focus = false) => {
      const key = tab.dataset.faqTab;
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        const active = panel.dataset.faqPanel === key;
        panel.hidden = !active;
        if (!active) {
          panel.querySelectorAll('.faq-item.is-open').forEach((item) => {
            item.classList.remove('is-open');
            item.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
          });
        }
      });
      if (focus) tab.focus();

      // Mobile FAQ tabs behave like a navigable horizontal rail. Keep the active
      // choice at the leading edge so later categories never disappear off-screen.
      const tabList = tab.closest('.faq-tab-list');
      if (tabList && window.innerWidth <= 767) {
        const targetLeft = Math.max(0, tab.offsetLeft - 8);
        tabList.scrollTo({
          left: targetLeft,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        activateTab(tabs[nextIndex], true);
      });
    });

    const selected = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
    activateTab(selected);
  });

  /* Current testimonial experience uses the marquee/modal system below. */

  const form = document.querySelector('[data-enquiry-form]');
  if (form) {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type && form.elements.enquiryType) form.elements.enquiryType.value = type;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const status = form.querySelector('[data-form-status]');
      const submit = form.querySelector('[type="submit"]');
      const endpoint = window.MBL_CONFIG?.enquiryEndpoint?.trim();
      if (!endpoint) {
        status.textContent = 'The form is ready, but an approved CRM/form endpoint must be added in js/config.js before enquiries can be transmitted.';
        status.classList.add('is-visible');
        status.focus?.();
        return;
      }
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.page = location.pathname.split('/').pop() || 'contact-us.html';
      payload.source = location.search;
      try {
        if (submit) submit.disabled = true;
        status.textContent = 'Sending your enquiry…';
        status.classList.add('is-visible');
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        status.textContent = 'Thank you. Your enquiry has been submitted successfully.';
        form.reset();
      } catch (error) {
        console.error('MyBestLoan enquiry submission failed:', error);
        status.textContent = 'We could not submit the enquiry right now. Please use the approved phone, email or WhatsApp contact method.';
      } finally {
        if (submit) submit.disabled = false;
        status.focus?.();
      }
    });
  }

  document.querySelectorAll('[data-config-route]').forEach((link) => {
    const key = link.dataset.configRoute;
    const configured = window.MBL_CONFIG?.[key]?.trim();
    if (configured) {
      link.href = configured;
      if (key === 'aiUrl') {
        link.classList.remove('button--disabled');
        link.removeAttribute('aria-disabled');
      }
    }
  });

  document.querySelectorAll('.brand img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      if (img.nextElementSibling?.style) img.nextElementSibling.style.display = 'inline';
    });
  });

  window.addEventListener('scroll', setHeaderState, { passive: true });
  window.addEventListener('resize', () => {
    closeDropdowns();
    if (window.innerWidth > mobileBreakpoint) closeMobileNav();
    setHeaderState();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeDropdowns();
    closeMobileNav();
  });

  setHeaderState();
}

function initInteractiveExperience() {
  const reducedMotionV3 = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const attachMagnetic = (element, prefix) => {
    if (!element || !finePointer) return;
    const reset = () => {
      element.style.setProperty(`--${prefix}-x`, '0px');
      element.style.setProperty(`--${prefix}-y`, '0px');
      element.classList.remove('is-hovered');
    };
    element.addEventListener('pointerenter', () => element.classList.add('is-hovered'));
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 16;
      element.style.setProperty(`--${prefix}-x`, `${x}px`);
      element.style.setProperty(`--${prefix}-y`, `${y}px`);
    });
    element.addEventListener('pointerleave', reset);
    element.addEventListener('blur', reset);
  };

  const enableStageCarousel = ({ rootSelector, cardSelector, prevSelector, nextSelector, dotSelector, autoMs = 0, magneticPrefix = 'card', progressSelector = null, offerMode = false, hoverScale = false }) => {
    document.querySelectorAll(rootSelector).forEach((root) => {
      const cards = [...root.querySelectorAll(cardSelector)];
      if (!cards.length) return;
      const dots = dotSelector ? [...root.querySelectorAll(dotSelector)] : [];
      const progress = progressSelector ? root.querySelector(progressSelector) : null;
      let active = 0;
      let paused = false;
      let timer = null;
      let hoveredIndex = null;

      root.style.setProperty('--offer-count', cards.length);
      if (progress) root.style.setProperty('--offer-auto-duration', `${autoMs}ms`);

      const visibleRange = () => (window.innerWidth <= 767 ? 0 : window.innerWidth <= 1024 ? 1 : 2);
      const signedDistance = (index) => {
        const n = cards.length;
        let d = (index - active + n) % n;
        if (d > n / 2) d -= n;
        return d;
      };

      const restartProgress = () => {
        if (!progress) return;
        progress.classList.remove('is-animating');
        void progress.offsetWidth;
        progress.classList.add('is-animating');
      };

      const render = () => {
        const range = visibleRange();
        cards.forEach((card, index) => {
          const d = signedDistance(index);
          card.classList.remove('is-center', 'is-left-1', 'is-right-1', 'is-left-2', 'is-right-2', 'is-hidden-left', 'is-hidden-right', 'is-hover-scale');
          const hidden = Math.abs(d) > range;
          card.setAttribute('aria-hidden', hidden ? 'true' : 'false');
          card.tabIndex = hidden ? -1 : 0;
          if (d === 0) card.classList.add('is-center');
          else if (d === -1 && range >= 1) card.classList.add('is-left-1');
          else if (d === 1 && range >= 1) card.classList.add('is-right-1');
          else if (d === -2 && range >= 2) card.classList.add('is-left-2');
          else if (d === 2 && range >= 2) card.classList.add('is-right-2');
          else if (d < 0) card.classList.add('is-hidden-left');
          else card.classList.add('is-hidden-right');

          if (hoverScale && hoveredIndex === index && Math.abs(d) <= range) card.classList.add('is-hover-scale');
        });

        dots.forEach((dot, index) => {
          const on = index === active;
          dot.classList.toggle('is-active', on);
          dot.setAttribute('aria-current', on ? 'true' : 'false');
        });

        if (progress) {
          root.style.setProperty('--offer-index', active);
          restartProgress();
        }
      };

      const go = (index) => {
        active = (index + cards.length) % cards.length;
        render();
      };

      const start = () => {
        window.clearInterval(timer);
        if (!reducedMotionV3 && autoMs) timer = window.setInterval(() => { if (!paused) go(active + 1); }, autoMs);
      };

      cards.forEach((card, index) => {
        attachMagnetic(card, magneticPrefix);
        card.addEventListener('click', (event) => {
          const d = signedDistance(index);
          if (offerMode && d === 0) {
            card.dispatchEvent(new CustomEvent('mbl:offer-open', { bubbles: true, detail: { card } }));
            return;
          }
          if (d !== 0) {
            event.preventDefault();
            go(index);
          }
        });
        card.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          const d = signedDistance(index);
          if (offerMode && d === 0) {
            card.dispatchEvent(new CustomEvent('mbl:offer-open', { bubbles: true, detail: { card } }));
            return;
          }
          if (d !== 0) go(index);
        });
        card.addEventListener('pointerenter', () => {
          paused = true;
          root.classList.add('is-paused');
          hoveredIndex = index;
          if (hoverScale) render();
        });
        card.addEventListener('pointerleave', () => {
          hoveredIndex = null;
          if (hoverScale) render();
          paused = false;
          root.classList.remove('is-paused');
          restartProgress();
        });
      });

      root.querySelector(prevSelector)?.addEventListener('click', () => go(active - 1));
      root.querySelector(nextSelector)?.addEventListener('click', () => go(active + 1));
      dots.forEach((dot, index) => dot.addEventListener('click', () => go(index)));
      root.addEventListener('focusin', () => { paused = true; root.classList.add('is-paused'); });
      root.addEventListener('focusout', (event) => {
        if (root.contains(event.relatedTarget)) return;
        paused = false;
        root.classList.remove('is-paused');
        restartProgress();
      });
      root.addEventListener('pointerenter', () => { paused = true; root.classList.add('is-paused'); });
      root.addEventListener('pointerleave', () => { paused = false; root.classList.remove('is-paused'); hoveredIndex = null; if (hoverScale) render(); restartProgress(); });
      window.addEventListener('resize', render);
      render();
      start();
    });
  };

  const loanExplorer = document.querySelector('[data-loan-explorer]');
  if (loanExplorer) {
    let loanData = [];
    try { loanData = JSON.parse(loanExplorer.dataset.loans || '[]'); } catch (error) { console.error('Loan explorer data could not be parsed.', error); }

    const loanBackground = loanExplorer.querySelector('[data-loan-background]');
    const loanScrim = loanExplorer.querySelector('.loan-explorer-scrim');
    const loanCopy = loanExplorer.querySelector('[data-loan-copy]');
    const loanCategory = loanExplorer.querySelector('[data-loan-category]');
    const loanTitle = loanExplorer.querySelector('[data-loan-title]');
    const loanDescription = loanExplorer.querySelector('[data-loan-description]');
    const loanCta = loanExplorer.querySelector('[data-loan-cta]');
    const loanCounter = loanExplorer.querySelector('[data-loan-counter]');
    const loanTimerBar = loanExplorer.querySelector('[data-loan-progress]');
    const loanThumbContainer = loanExplorer.querySelector('[data-loan-thumbs]');
    const loanThumbs = [...loanExplorer.querySelectorAll('[data-loan-thumb]')];

    const BENCHMARK_EASE = 'cubic-bezier(.37,0,.63,1)';
    const BENCHMARK_LINEAR = 'linear';
    const TIMER_TRAVEL_MS = 2000;
    const TIMER_HOLD_MS = 300;
    const TIMER_EXIT_MS = 800;
    const CARD_STEP_MS = 500;
    const QUEUE_STAGGER_MS = 100;
    const SCRIM_REVEAL_MS = 900;
    const loanMotionState = new WeakMap();

    let loanIndex = 0;
    let loanDestroyed = false;
    let loanPaused = false;
    let loanAnimating = false;
    let loanLoopToken = 0;
    let resizeTimer = null;

    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const waitForPaint = () => new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    const stateFor = (el) => {
      if (!loanMotionState.has(el)) loanMotionState.set(el, { x: 0, y: 0, scale: 1 });
      return loanMotionState.get(el);
    };
    const transformFor = (state) => `translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
    const setMotion = (el, vars = {}) => {
      if (!el) return;
      const state = stateFor(el);
      if (vars.x !== undefined) state.x = vars.x;
      if (vars.y !== undefined) state.y = vars.y;
      if (vars.scale !== undefined) state.scale = vars.scale;
      if (vars.x !== undefined || vars.y !== undefined || vars.scale !== undefined) el.style.transform = transformFor(state);
      if (vars.opacity !== undefined) el.style.opacity = String(vars.opacity);
      if (vars.visibility !== undefined) el.style.visibility = vars.visibility;
    };
    const tweenMotion = (el, vars = {}) => {
      if (!el || reducedMotionV3) { setMotion(el, vars); return Promise.resolve(); }
      const duration = vars.duration ?? CARD_STEP_MS;
      const delay = vars.delay ?? 0;
      const easing = vars.easing ?? BENCHMARK_EASE;
      const current = { ...stateFor(el) };
      const target = { ...current };
      if (vars.x !== undefined) target.x = vars.x;
      if (vars.y !== undefined) target.y = vars.y;
      if (vars.scale !== undefined) target.scale = vars.scale;
      const from = {};
      const to = {};
      if (vars.x !== undefined || vars.y !== undefined || vars.scale !== undefined) {
        from.transform = transformFor(current);
        to.transform = transformFor(target);
      }
      const computed = getComputedStyle(el);
      if (vars.opacity !== undefined) { from.opacity = computed.opacity; to.opacity = String(vars.opacity); }
      const animation = el.animate([from, to], { duration, delay, easing, fill: 'forwards' });
      return new Promise((resolve) => {
        animation.onfinish = () => { setMotion(el, vars); animation.cancel(); resolve(); };
        animation.oncancel = resolve;
      });
    };

    const renderLoanContent = (index) => {
      const item = loanData[index];
      if (!item) return;
      if (loanCategory) loanCategory.textContent = item.category;
      if (loanTitle) loanTitle.textContent = item.title;
      if (loanDescription) loanDescription.textContent = item.desc;
      if (loanCta) { loanCta.textContent = item.cta; loanCta.href = item.href; }
    };

    const queueGeometry = () => {
      const containerStyle = getComputedStyle(loanThumbContainer);
      const sample = loanThumbs.find((thumb) => !thumb.classList.contains('is-expanding-card')) || loanThumbs[0];
      const width = parseFloat(getComputedStyle(sample).width) || 260;
      const gap = parseFloat(containerStyle.getPropertyValue('--loan-thumb-gap')) || 10;
      const padX = parseFloat(containerStyle.getPropertyValue('--loan-thumb-pad-x')) || 48;
      const padY = parseFloat(containerStyle.getPropertyValue('--loan-thumb-pad-y')) || 38;
      return { width, gap, padX, padY };
    };

    const cancelThumbAnimations = (thumb) => {
      thumb?.getAnimations().forEach((animation) => animation.cancel());
      if (thumb) thumb.style.transform = '';
    };

    const placeQueueThumb = (thumb, distance) => {
      if (!thumb) return;
      const { width, gap, padX, padY } = queueGeometry();
      const slot = Math.max(0, distance - 1);
      thumb.style.left = `${padX + slot * (width + gap)}px`;
      thumb.style.top = `${padY}px`;
      thumb.style.zIndex = String(30 + distance);
      thumb.style.opacity = '1';
    };

    const setQueueState = (activeIndex, { expandingIndex = null, deferredIndex = null, cancelAnimations = true } = {}) => {
      loanThumbs.forEach((thumb, index) => {
        if (cancelAnimations) cancelThumbAnimations(thumb);
        const isActive = index === activeIndex;
        const isExpanding = index === expandingIndex;
        const isDeferred = index === deferredIndex;
        const distance = (index - activeIndex + loanThumbs.length) % loanThumbs.length;
        thumb.classList.toggle('is-active', (isActive && !isExpanding) || isDeferred);
        thumb.setAttribute('aria-current', isActive ? 'true' : 'false');
        thumb.setAttribute('aria-hidden', isActive || isDeferred ? 'true' : 'false');
        thumb.tabIndex = isActive || isDeferred ? -1 : 0;
        if (!isActive && !isDeferred) placeQueueThumb(thumb, distance);
      });
    };

    const resetCopyForReveal = () => {
      if (!loanCopy) return;
      const elements = [loanCopy.querySelector('.eyebrow'), loanCategory, loanTitle, loanDescription, loanCta].filter(Boolean);
      elements.forEach((el) => { el.getAnimations().forEach((animation) => animation.cancel()); el.style.opacity = '0'; });
      setMotion(elements[0], { y: 80 });
      setMotion(loanCategory, { y: 70 });
      setMotion(loanTitle, { y: 100 });
      setMotion(loanDescription, { y: 42 });
      setMotion(loanCta, { y: 52 });
    };

    const revealCopy = async () => {
      if (!loanCopy) return;
      const eyebrow = loanCopy.querySelector('.eyebrow');
      await Promise.all([
        tweenMotion(eyebrow, { y: 0, opacity: 1, duration: 700 }),
        tweenMotion(loanCategory, { y: 0, opacity: 1, duration: 700, delay: 40 }),
        tweenMotion(loanTitle, { y: 0, opacity: 1, duration: 700, delay: 70 }),
        tweenMotion(loanDescription, { y: 0, opacity: 1, duration: 400, delay: 280 }),
        tweenMotion(loanCta, { y: 0, opacity: 1, duration: 400, delay: 350 })
      ]);
    };

    const fadeScrimIn = () => {
      if (!loanScrim) return Promise.resolve();
      loanScrim.getAnimations().forEach((animation) => animation.cancel());
      if (reducedMotionV3) { loanScrim.style.opacity = '1'; return Promise.resolve(); }
      loanScrim.style.opacity = '0';
      const animation = loanScrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SCRIM_REVEAL_MS, easing: BENCHMARK_EASE, fill: 'forwards' });
      return new Promise((resolve) => {
        animation.onfinish = () => { loanScrim.style.opacity = '1'; animation.cancel(); resolve(); };
        animation.oncancel = resolve;
      });
    };

    const fadeScrimOutForTransition = () => {
      if (!loanScrim) return;
      loanScrim.getAnimations().forEach((animation) => animation.cancel());
      if (reducedMotionV3) { loanScrim.style.opacity = '0'; return; }
      const fromOpacity = Number.parseFloat(getComputedStyle(loanScrim).opacity);
      const animation = loanScrim.animate([{ opacity: Number.isFinite(fromOpacity) ? fromOpacity : 1 }, { opacity: 0 }], { duration: 240, easing: BENCHMARK_EASE, fill: 'forwards' });
      animation.onfinish = () => { loanScrim.style.opacity = '0'; animation.cancel(); };
    };

    const animateCounter = (index) => {
      if (!loanCounter) return;
      const nextText = String(index + 1).padStart(2, '0');
      if (reducedMotionV3) { loanCounter.textContent = nextText; return; }
      loanCounter.getAnimations().forEach((animation) => animation.cancel());
      const out = loanCounter.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-36px)', opacity: 0 }], { duration: 250, easing: BENCHMARK_EASE, fill: 'forwards' });
      out.onfinish = () => {
        loanCounter.textContent = nextText;
        out.cancel();
        loanCounter.animate([{ transform: 'translateY(36px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 350, easing: BENCHMARK_EASE });
      };
    };

    const animateQueueShift = (previousActive, nextIndex, before) => {
      setQueueState(nextIndex, { expandingIndex: nextIndex, deferredIndex: previousActive, cancelAnimations: false });
      const jobs = [];
      loanThumbs.forEach((thumb, index) => {
        if (index === nextIndex || index === previousActive || !before.has(thumb)) return;
        const oldRect = before.get(thumb);
        const newRect = thumb.getBoundingClientRect();
        if (!oldRect || !newRect.width) return;
        const dx = oldRect.left - newRect.left;
        const distance = (index - nextIndex + loanThumbs.length) % loanThumbs.length;
        thumb.classList.add('is-queue-moving');
        const animation = thumb.animate([{ transform: `translate3d(${dx}px,0,0)` }, { transform: 'translate3d(0,0,0)' }], { duration: CARD_STEP_MS, delay: QUEUE_STAGGER_MS * Math.max(1, distance), easing: BENCHMARK_EASE, fill: 'both' });
        jobs.push(new Promise((resolve) => {
          animation.onfinish = () => { animation.cancel(); thumb.classList.remove('is-queue-moving'); resolve(); };
          animation.oncancel = () => { thumb.classList.remove('is-queue-moving'); resolve(); };
        }));
      });
      return Promise.all(jobs);
    };

    const expandActualQueueCard = async (source, item, previousActive, nextIndex) => {
      if (!source || !item) return;
      loanThumbs.forEach(cancelThumbAnimations);
      setQueueState(previousActive, { cancelAnimations: false });

      const explorerRect = loanExplorer.getBoundingClientRect();
      const sourceRect = source.getBoundingClientRect();
      const startLeft = sourceRect.left - explorerRect.left;
      const startTop = sourceRect.top - explorerRect.top;
      const startWidth = sourceRect.width;
      const startHeight = sourceRect.height;
      const movableBefore = new Map(loanThumbs.filter((thumb, index) => index !== nextIndex && index !== previousActive && !thumb.classList.contains('is-active')).map((thumb) => [thumb, thumb.getBoundingClientRect()]));

      const originalParent = source.parentNode;
      const sourceAnchor = document.createComment('loan-explorer-expanding-card');
      originalParent.insertBefore(sourceAnchor, source);
      loanExplorer.appendChild(source);
      source.classList.add('is-expanding-card');
      source.classList.remove('is-active');
      source.style.left = `${startLeft}px`;
      source.style.top = `${startTop}px`;
      source.style.width = `${startWidth}px`;
      source.style.height = `${startHeight}px`;
      source.style.borderRadius = `${Math.min(18, startWidth * .08)}px`;
      source.style.transform = 'none';
      source.style.opacity = '1';
      source.style.zIndex = '6';

      const label = source.querySelector('span');
      const sourceLabelAnimation = label && !reducedMotionV3 ? label.animate([{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(70px)', opacity: 0 }], { duration: 300, easing: BENCHMARK_EASE, fill: 'forwards' }) : null;
      fadeScrimOutForTransition();
      const bgAnimation = !reducedMotionV3 && loanBackground ? loanBackground.animate([{ transform: 'scale(1.015)' }, { transform: 'scale(1.5)' }], { duration: CARD_STEP_MS, easing: BENCHMARK_EASE, fill: 'forwards' }) : null;
      const queueJob = animateQueueShift(previousActive, nextIndex, movableBefore);
      const expansion = reducedMotionV3 ? null : source.animate([
        { left: `${startLeft}px`, top: `${startTop}px`, width: `${startWidth}px`, height: `${startHeight}px`, borderRadius: getComputedStyle(source).borderRadius },
        { left: '0px', top: '0px', width: `${explorerRect.width}px`, height: `${explorerRect.height}px`, borderRadius: '0px' }
      ], { duration: CARD_STEP_MS, easing: BENCHMARK_EASE, fill: 'forwards' });

      if (expansion) await new Promise((resolve) => { expansion.onfinish = resolve; expansion.oncancel = resolve; });
      else {
        source.style.left = '0px'; source.style.top = '0px'; source.style.width = `${explorerRect.width}px`; source.style.height = `${explorerRect.height}px`; source.style.borderRadius = '0px';
      }

      if (loanBackground) {
        const mappedLoanImage = window.__MBL_ASSETS__?.[item.image] || item.image;
        loanBackground.style.backgroundImage = `url("${mappedLoanImage}")`;
        bgAnimation?.cancel();
        loanBackground.style.transform = 'scale(1.015)';
      }
      renderLoanContent(nextIndex);
      resetCopyForReveal();
      animateCounter(nextIndex);

      /* Keep the real expanded card as the visual background during the handoff.
         It is lowered beneath the scrim/copy, so there is never a frame where the
         recycled queue or old image can become visible while the CSS background paints. */
      source.style.zIndex = '0';
      source.style.pointerEvents = 'none';
      source.style.opacity = '1';
      await waitForPaint();

      const previous = loanThumbs[previousActive];
      const previousDistance = (previousActive - nextIndex + loanThumbs.length) % loanThumbs.length;
      if (previous) {
        previous.classList.remove('is-active');
        previous.setAttribute('aria-hidden', 'false');
        previous.tabIndex = 0;
        placeQueueThumb(previous, previousDistance);
      }
      const recycleJob = previous && !reducedMotionV3 ? new Promise((resolve) => {
        const animation = previous.animate([{ opacity: 0, transform: 'translate3d(70px,0,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }], { duration: 380, easing: BENCHMARK_EASE });
        animation.onfinish = resolve; animation.oncancel = resolve;
      }) : Promise.resolve();

      const revealJob = Promise.all([revealCopy(), fadeScrimIn()]);
      await Promise.all([queueJob, recycleJob, revealJob]);

      /* Only recycle the expanded card after the replacement background, scrim and
         incoming copy are fully established. This makes the handoff visually atomic. */
      await waitForPaint();
      sourceLabelAnimation?.cancel();
      source.classList.remove('is-expanding-card');
      source.removeAttribute('style');
      if (sourceAnchor.parentNode) { sourceAnchor.parentNode.insertBefore(source, sourceAnchor); sourceAnchor.remove(); }
      setQueueState(nextIndex);
    };

    const transitionToLoan = async (targetIndex) => {
      if (!loanData.length || loanAnimating) return;
      const nextIndex = (targetIndex + loanData.length) % loanData.length;
      if (nextIndex === loanIndex) return;
      loanAnimating = true;
      const previousActive = loanIndex;
      try { await expandActualQueueCard(loanThumbs[nextIndex], loanData[nextIndex], previousActive, nextIndex); loanIndex = nextIndex; }
      finally { loanAnimating = false; }
    };

    const runTimerCycle = async (token) => {
      if (!loanTimerBar || reducedMotionV3) { await wait(TIMER_TRAVEL_MS + TIMER_HOLD_MS + TIMER_EXIT_MS); return; }
      loanTimerBar.getAnimations().forEach((animation) => animation.cancel());
      loanTimerBar.style.transform = 'translate3d(-100%,0,0)';
      while (loanPaused && !loanDestroyed && token === loanLoopToken) await wait(80);
      if (loanDestroyed || token !== loanLoopToken) return;
      const travel = loanTimerBar.animate([{ transform: 'translate3d(-100%,0,0)' }, { transform: 'translate3d(0,0,0)' }], { duration: TIMER_TRAVEL_MS, easing: BENCHMARK_LINEAR, fill: 'forwards' });
      await new Promise((resolve) => { travel.onfinish = resolve; travel.oncancel = resolve; });
      if (loanDestroyed || token !== loanLoopToken) return;
      while (loanPaused && !loanDestroyed && token === loanLoopToken) await wait(80);
      await wait(TIMER_HOLD_MS);
      if (loanDestroyed || token !== loanLoopToken) return;
      const exit = loanTimerBar.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(100%,0,0)' }], { duration: TIMER_EXIT_MS, easing: BENCHMARK_EASE, fill: 'forwards' });
      await new Promise((resolve) => { exit.onfinish = resolve; exit.oncancel = resolve; });
      travel.cancel(); exit.cancel(); loanTimerBar.style.transform = 'translate3d(-100%,0,0)';
    };

    const autoLoop = async (token) => {
      while (!loanDestroyed && token === loanLoopToken) {
        await runTimerCycle(token);
        if (loanDestroyed || token !== loanLoopToken) break;
        while ((loanPaused || loanAnimating) && !loanDestroyed && token === loanLoopToken) await wait(80);
        if (loanDestroyed || token !== loanLoopToken) break;
        await transitionToLoan((loanIndex + 1) % loanData.length);
      }
    };

    const restartAutoLoop = () => {
      loanLoopToken += 1;
      const token = loanLoopToken;
      loanTimerBar?.getAnimations().forEach((animation) => animation.cancel());
      if (loanTimerBar) loanTimerBar.style.transform = 'translate3d(-100%,0,0)';
      if (!reducedMotionV3 && loanData.length > 1) autoLoop(token);
    };
    const manualGo = async (index) => {
      if (loanAnimating) return;
      loanLoopToken += 1;
      loanTimerBar?.getAnimations().forEach((animation) => animation.cancel());
      await transitionToLoan(index);
      restartAutoLoop();
    };

    loanThumbs.forEach((thumb, index) => thumb.addEventListener('click', () => manualGo(index)));
    loanExplorer.querySelector('[data-loan-explorer-prev]')?.addEventListener('click', () => manualGo(loanIndex - 1));
    loanExplorer.querySelector('[data-loan-explorer-next]')?.addEventListener('click', () => manualGo(loanIndex + 1));
    loanExplorer.addEventListener('focusin', () => { loanPaused = true; });
    loanExplorer.addEventListener('focusout', (event) => { if (!loanExplorer.contains(event.relatedTarget)) loanPaused = false; });

    const relayoutLoanQueue = () => {
      if (loanAnimating) return;
      loanThumbs.forEach(cancelThumbAnimations);
      setQueueState(loanIndex, { cancelAnimations: false });
    };
    window.addEventListener('resize', () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(relayoutLoanQueue, 180); });
    window.addEventListener('beforeunload', () => { loanDestroyed = true; loanLoopToken += 1; });

    renderLoanContent(0);
    setQueueState(0);
    if (loanCounter) loanCounter.textContent = '01';
    if (loanTimerBar) loanTimerBar.style.transform = 'translate3d(-100%,0,0)';
    if (loanScrim) loanScrim.style.opacity = '1';

    if (!reducedMotionV3) {
      const openingCards = loanThumbs.map((thumb, index) => ({ thumb, distance: (index - loanIndex + loanThumbs.length) % loanThumbs.length })).filter(({ distance }) => distance > 0).sort((a, b) => a.distance - b.distance);
      openingCards.forEach(({ thumb }, position) => thumb.animate([{ transform: 'translate3d(360px,0,0)' }, { transform: 'translate3d(0,0,0)' }], { duration: CARD_STEP_MS, delay: 600 + position * 50, easing: BENCHMARK_EASE }));
      window.setTimeout(restartAutoLoop, 1100);
    } else restartAutoLoop();
  }

  document.querySelectorAll('[data-testimonial-marquee] .testimonial-marquee-track').forEach((track) => {
    if (track.dataset.loopReady === 'true') return;
    const originals = [...track.children];
    originals.forEach((panel) => {
      const clone = panel.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.loopReady = 'true';
    requestAnimationFrame(() => {
      const first = originals[0];
      if (first) track.style.setProperty('--testimonial-loop-distance', `${first.getBoundingClientRect().width + 24}px`);
    });
  });

  const modal = document.querySelector('[data-offer-modal]');
  const modalBank = modal?.querySelector('[data-offer-modal-bank]');
  const modalRate = modal?.querySelector('[data-offer-modal-rate]');
  const modalLoan = modal?.querySelector('[data-offer-modal-loan]');
  const modalLogo = modal?.querySelector('[data-offer-modal-logo]');
  const bankInput = modal?.querySelector('[data-offer-bank-input]');
  const loanInput = modal?.querySelector('[data-offer-loan-input]');
  let lastFocusedElement = null;

  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const trapFocus = (event) => {
    if (event.key !== 'Tab' || !modal?.classList.contains('is-open')) return;
    const focusable = [...modal.querySelectorAll(focusableSelector)].filter((el) => !el.hasAttribute('hidden'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openOfferModal = (card) => {
    if (!modal || !card) return;
    lastFocusedElement = document.activeElement;
    const bank = card.dataset.bank || 'Selected lender';
    const rate = card.dataset.rate || '';
    const logo = card.dataset.logo || '';
    const loanType = card.dataset.loanType || 'Loan';
    if (modalBank) modalBank.textContent = bank;
    if (modalRate) modalRate.textContent = rate;
    if (modalLoan) modalLoan.textContent = loanType;
    if (modalLogo) { modalLogo.src = logo; modalLogo.alt = `${bank} logo`; }
    if (bankInput) bankInput.value = bank;
    if (loanInput) loanInput.value = loanType;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('offer-modal-open');
    document.addEventListener('keydown', trapFocus);
    window.setTimeout(() => modal.querySelector('input')?.focus(), 260);
  };

  const closeOfferModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('offer-modal-open');
    document.removeEventListener('keydown', trapFocus);
    lastFocusedElement?.focus?.();
  };

  document.addEventListener('mbl:offer-open', (event) => openOfferModal(event.detail.card));

  enableStageCarousel({
    rootSelector: '[data-offer-carousel]',
    cardSelector: '[data-offer-card]',
    prevSelector: '[data-offer-prev]',
    nextSelector: '[data-offer-next]',
    autoMs: 3000,
    magneticPrefix: 'offer',
    progressSelector: '[data-offer-progress]',
    offerMode: true
  });

  modal?.querySelectorAll('[data-offer-close]').forEach((button) => button.addEventListener('click', closeOfferModal));
  modal?.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-offer-close]')) closeOfferModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeOfferModal();
  });

  const bankOfferForm = document.querySelector('[data-bank-offer-form]');
  bankOfferForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!bankOfferForm.reportValidity()) return;
    const status = bankOfferForm.querySelector('[data-offer-form-status]');
    const submit = bankOfferForm.querySelector('[type="submit"]');
    const endpoint = window.MBL_CONFIG?.enquiryEndpoint?.trim();
    const payload = Object.fromEntries(new FormData(bankOfferForm).entries());
    payload.enquiryType = 'offer';
    payload.page = location.pathname.split('/').pop() || '';

    if (!endpoint) {
      if (status) {
        status.textContent = 'This offer form is ready for launch. Add the approved enquiry endpoint in js/config.js to transmit registrations.';
        status.classList.add('is-visible');
        status.focus?.();
      }
      return;
    }

    try {
      if (submit) submit.disabled = true;
      if (status) {
        status.textContent = 'Sending your request…';
        status.classList.add('is-visible');
      }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Network error');
      bankOfferForm.reset();
      if (status) status.textContent = 'Thank you. Your request has been shared and our team will connect with you soon.';
      closeOfferModal();
    } catch (error) {
      if (status) status.textContent = 'Something went wrong while sending your request. Please try again or contact us directly.';
    } finally {
      if (submit) submit.disabled = false;
    }
  });

  /* Homepage rate strip opens the lender-offer modal. */
  const rateTicker = document.querySelector('[data-rate-ticker]');
  if (rateTicker) {
    const hydrateRateCard = (card) => {
      if (!card) return;
      const bank = card.querySelector('.rate-ticker-bank > span')?.textContent?.trim() || 'Selected lender';
      const rate = card.querySelector(':scope > strong')?.textContent?.trim() || '';
      const loanType = card.querySelector(':scope > small')?.textContent?.trim() || 'Loan';
      const logo = card.querySelector('.rate-ticker-bank img')?.getAttribute('src') || '';
      card.dataset.bank = bank;
      card.dataset.rate = rate;
      card.dataset.loanType = loanType;
      card.dataset.logo = logo;
      card.setAttribute('aria-label', `${bank}, ${loanType}, starting ${rate}. Open lender offer form.`);
      if (!card.closest('.rate-ticker-copy')) {
        card.setAttribute('role', 'button');
        card.tabIndex = 0;
      }
    };

    rateTicker.querySelectorAll('.rate-ticker-card').forEach(hydrateRateCard);
    rateTicker.addEventListener('click', (event) => {
      const card = event.target.closest('.rate-ticker-card');
      if (!card || !rateTicker.contains(card)) return;
      hydrateRateCard(card);
      openOfferModal(card);
    });
    rateTicker.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.rate-ticker-card');
      if (!card || card.closest('.rate-ticker-copy')) return;
      event.preventDefault();
      hydrateRateCard(card);
      openOfferModal(card);
    });
  }

  /* Testimonial detail modal; marquee clones use event delegation. */
  const testimonialModal = document.querySelector('[data-testimonial-modal]');
  const testimonialModalStars = testimonialModal?.querySelector('[data-testimonial-modal-stars]');
  const testimonialModalTitle = testimonialModal?.querySelector('[data-testimonial-modal-title]');
  const testimonialModalCopy = testimonialModal?.querySelector('[data-testimonial-modal-copy]');
  const testimonialModalMeta = testimonialModal?.querySelector('[data-testimonial-modal-meta]');
  const testimonialMarquee = document.querySelector('[data-testimonial-marquee]');
  let lastTestimonialFocus = null;

  const openTestimonialModal = (card) => {
    if (!testimonialModal || !card) return;
    lastTestimonialFocus = document.activeElement;
    if (testimonialModalStars) testimonialModalStars.textContent = card.querySelector('.stars')?.textContent?.trim() || '★★★★★';
    if (testimonialModalTitle) testimonialModalTitle.textContent = card.querySelector('h3')?.textContent?.trim() || 'Customer Story';
    if (testimonialModalCopy) testimonialModalCopy.textContent = card.querySelector('p')?.textContent?.trim() || '';
    if (testimonialModalMeta) testimonialModalMeta.textContent = card.querySelector('.testimonial-meta')?.textContent?.trim() || '';
    testimonialModal.classList.add('is-open');
    testimonialModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('testimonial-modal-open');
    window.setTimeout(() => testimonialModal.querySelector('.testimonial-modal-close')?.focus(), 180);
  };

  const closeTestimonialModal = () => {
    if (!testimonialModal) return;
    testimonialModal.classList.remove('is-open');
    testimonialModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('testimonial-modal-open');
    lastTestimonialFocus?.focus?.();
  };

  if (testimonialMarquee && testimonialModal) {
    testimonialMarquee.querySelectorAll('.bento-testimonial').forEach((card) => {
      if (card.closest('[aria-hidden="true"]')) return;
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `Open testimonial: ${card.querySelector('h3')?.textContent?.trim() || 'customer story'}`);
    });
    testimonialMarquee.addEventListener('click', (event) => {
      const card = event.target.closest('.bento-testimonial');
      if (card) openTestimonialModal(card);
    });
    testimonialMarquee.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.bento-testimonial');
      if (!card || card.closest('[aria-hidden="true"]')) return;
      event.preventDefault();
      openTestimonialModal(card);
    });
  }

  testimonialModal?.querySelectorAll('[data-testimonial-close]').forEach((el) => el.addEventListener('click', closeTestimonialModal));
  testimonialModal?.addEventListener('click', (event) => {
    if (event.target === testimonialModal || event.target.closest('.testimonial-modal-backdrop')) closeTestimonialModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && testimonialModal?.classList.contains('is-open')) closeTestimonialModal();
  });

}

function initLoanAndContentModules() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Loan landing pages: apply-to-unlock lender offers. */
  document.querySelectorAll('[data-loan-unlock-system]').forEach((system) => {
    const loanType = system.dataset.loanType || 'Loan';
    const gate = system.querySelector('[data-loan-unlock-gate]');
    const trigger = system.querySelector('[data-loan-unlock-trigger]');
    const lockedCards = [...system.querySelectorAll('.loan-offer-grid-card--locked')];
    const modal = document.querySelector('[data-loan-unlock-modal]');
    const form = modal?.querySelector('[data-loan-unlock-form]');
    const status = modal?.querySelector('[data-loan-unlock-status]');
    const loanInput = modal?.querySelector('[data-loan-unlock-type]');
    const storageKey = `mbl-loan-offers-unlocked:${location.pathname}`;
    let returnFocus = null;

    if (!gate || !trigger || !lockedCards.length || !modal || !form) return;
    if (loanInput) loanInput.value = loanType;

    const setUnlocked = (animate = true) => {
      lockedCards.forEach((card, index) => {
        card.removeAttribute('aria-hidden');
        card.removeAttribute('inert');
        card.querySelectorAll('a,button,input,select,textarea').forEach((el) => el.removeAttribute('tabindex'));
        const reveal = () => {
          card.classList.add('is-unlocking');
          window.setTimeout(() => {
            card.classList.add('is-unlocked');
            card.classList.remove('is-unlocking');
          }, reducedMotion ? 0 : 760);
        };
        if (animate && !reducedMotion) window.setTimeout(reveal, index * 100);
        else reveal();
      });
      gate.classList.add('is-unlocked');
      const copy = gate.querySelector('.loan-unlock-gate-copy div');
      if (copy) copy.innerHTML = `<strong>More ${loanType.toLowerCase()} offers unlocked.</strong><span>You can now review and compare the complete lender set below.</span>`;
      try { sessionStorage.setItem(storageKey, '1'); } catch (error) { /* storage is optional */ }
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('loan-unlock-modal-open');
      if (returnFocus) returnFocus.focus?.();
    };

    const openModal = () => {
      returnFocus = document.activeElement;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('loan-unlock-modal-open');
      window.setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), reducedMotion ? 0 : 180);
    };

    trigger.addEventListener('click', openModal);
    modal.querySelectorAll('[data-loan-unlock-close]').forEach((el) => el.addEventListener('click', closeModal));
    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.classList.contains('loan-unlock-modal-backdrop')) closeModal();
    });
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submit = form.querySelector('[type="submit"]');
      const endpoint = window.MBL_CONFIG?.enquiryEndpoint?.trim();
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.enquiryType = 'unlock-offers';
      payload.loanType = loanType;
      payload.page = location.pathname.split('/').pop() || '';
      try {
        if (submit) submit.disabled = true;
        if (status) {
          status.textContent = endpoint ? 'Submitting your details…' : 'Unlocking your lender comparison…';
          status.classList.add('is-visible');
        }
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        setUnlocked(true);
        if (status) status.textContent = endpoint ? 'Application received. More lender offers are now unlocked.' : 'Preview unlocked. Connect the approved CRM endpoint in js/config.js for production submissions.';
        window.setTimeout(() => {
          closeModal();
          lockedCards[0]?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
        }, reducedMotion ? 0 : 620);
      } catch (error) {
        console.error('Loan offer unlock submission failed:', error);
        if (status) status.textContent = 'We could not submit the application right now. Please try again or use the approved contact route.';
      } finally {
        if (submit) submit.disabled = false;
        status?.focus?.();
      }
    });

    try {
      if (sessionStorage.getItem(storageKey) === '1') setUnlocked(false);
    } catch (error) { /* storage is optional */ }
  });

  /* Homepage interactive lender comparison. */
  const compare = document.querySelector('[data-loan-compare]');
  if (compare) {
    const form = compare.querySelector('[data-compare-form]');
    const start = compare.querySelector('[data-compare-start]');
    const submit = compare.querySelector('[data-compare-submit]');
    const note = compare.querySelector('[data-compare-gate-note]');
    const amountRange = compare.querySelector('[data-compare-amount-range]');
    const amountInput = compare.querySelector('[data-compare-amount-input]');
    const tenureRange = compare.querySelector('[data-compare-tenure-range]');
    const tenureInput = compare.querySelector('[data-compare-tenure-input]');
    const category = compare.querySelector('[data-compare-category]');
    const results = compare.querySelector('[data-compare-results]');
    const resultOffers = [...compare.querySelectorAll('[data-result-offer]')];
    let hasInteracted = false;
    let countdown = null;
    let countdownSeconds = 12 * 60 + 43;

    const rateMap = {
      'Home Loan': [7.15, 7.2, 7.3],
      'Personal Loan': [10.75, 11.1, 11.5],
      'Loan Against Property': [9.6, 9.75, 10.1],
      'Education Loan': [8.25, 8.4, 8.6],
      'Vehicle Loan': [9.25, 9.5, 9.75],
      'Business Loan': [15.5, 15.9, 16.25],
      'Machinery Finance': [12, 12.25, 12.6]
    };

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
    const formatRate = (rate) => `${Number(rate.toFixed(2)).toString()}%`;
    const calculate = (principal, annualRate, years) => {
      const months = Math.max(1, Math.round(years * 12));
      const monthlyRate = annualRate / 1200;
      const factor = Math.pow(1 + monthlyRate, months);
      const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * factor / (factor - 1);
      const total = emi * months;
      return { emi: Math.round(emi), interest: Math.max(0, Math.round(total - principal)) };
    };

    const setInteracted = () => {
      if (hasInteracted) return;
      hasInteracted = true;
      form?.classList.add('is-interacted');
      if (submit) {
        submit.disabled = false;
        submit.removeAttribute('aria-disabled');
      }
      if (note) note.textContent = 'Ready. Compare your personalised sample offers.';
    };

    const syncPair = (source, target, min, max) => {
      const value = clamp(Number(source.value) || min, min, max);
      source.value = String(value);
      target.value = String(value);
    };

    const updateResults = () => {
      const principal = clamp(Number(amountInput?.value || 500000), 100000, 50000000);
      const years = clamp(Number(tenureInput?.value || 10), 1, 30);
      const loanType = category?.value || 'Home Loan';
      const rates = rateMap[loanType] || rateMap['Home Loan'];
      resultOffers.forEach((card, index) => {
        const rate = rates[index] ?? rates[0];
        const calc = calculate(principal, rate, years);
        card.dataset.rate = String(rate);
        const emi = card.querySelector('[data-result-emi]');
        if (emi) emi.textContent = currency.format(calc.emi);
        card.querySelectorAll('[data-result-rate], [data-result-rate-text]').forEach((el) => { el.textContent = formatRate(rate); });
        card.querySelectorAll('[data-result-interest], [data-result-interest-inline], [data-result-interest-copy]').forEach((el) => { el.textContent = currency.format(calc.interest); });
        card.querySelectorAll('[data-result-tenure-inline]').forEach((el) => { el.textContent = `${years} Year${years === 1 ? '' : 's'}`; });
      });
      const bestCalc = calculate(principal, rates[0], years);
      const summaryRate = compare.querySelector('[data-summary-rate]');
      const summaryEmi = compare.querySelector('[data-summary-emi]');
      const summaryInterest = compare.querySelector('[data-summary-interest]');
      const detailType = compare.querySelector('[data-details-loan-type]');
      const detailTenure = compare.querySelector('[data-details-tenure]');
      if (summaryRate) summaryRate.textContent = formatRate(rates[0]);
      if (summaryEmi) summaryEmi.textContent = currency.format(bestCalc.emi);
      if (summaryInterest) summaryInterest.textContent = currency.format(bestCalc.interest);
      if (detailType) detailType.textContent = loanType;
      if (detailTenure) detailTenure.textContent = `${years} Year${years === 1 ? '' : 's'}`;
    };

    const updateTimer = () => {
      const minutes = Math.floor(countdownSeconds / 60);
      const seconds = countdownSeconds % 60;
      const minuteEl = compare.querySelector('[data-timer-minutes]');
      const secondEl = compare.querySelector('[data-timer-seconds]');
      if (minuteEl) minuteEl.textContent = String(minutes).padStart(2, '0');
      if (secondEl) secondEl.textContent = String(seconds).padStart(2, '0');
      if (countdownSeconds > 0) countdownSeconds -= 1;
    };

    const startCountdown = () => {
      if (countdown) return;
      updateTimer();
      countdown = window.setInterval(updateTimer, 1000);
    };

    amountRange?.addEventListener('input', () => { syncPair(amountRange, amountInput, 100000, 50000000); setInteracted(); updateResults(); });
    amountInput?.addEventListener('input', () => { syncPair(amountInput, amountRange, 100000, 50000000); setInteracted(); updateResults(); });
    tenureRange?.addEventListener('input', () => { syncPair(tenureRange, tenureInput, 1, 30); setInteracted(); updateResults(); });
    tenureInput?.addEventListener('input', () => { syncPair(tenureInput, tenureRange, 1, 30); setInteracted(); updateResults(); });
    category?.addEventListener('change', () => { setInteracted(); updateResults(); });

    start?.addEventListener('click', () => {
      form?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      window.setTimeout(() => amountRange?.focus(), reducedMotion ? 0 : 450);
    });

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!hasInteracted) {
        if (note) note.textContent = 'Please adjust at least one comparison control first.';
        return;
      }
      updateResults();
      results?.classList.add('is-open');
      results?.setAttribute('aria-hidden', 'false');
      startCountdown();
      window.setTimeout(() => results?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' }), reducedMotion ? 0 : 360);
    });

    updateResults();
  }

  /* Runtime marker; system fonts remain the offline fallback. */
  document.documentElement.classList.add('mbl-runtime-ready');


  /* Keep the LIVE starting-rate rail permanently visible on the homepage. */
  if (document.querySelector('.rate-ticker-section')) {
    document.body.classList.add('bottom-rate-ticker-always');
  }

  /* Opening offers popup: once per browsing session. */
  (() => {
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem('mbl-offer-popup-seen') === '1'; } catch (err) {}
    if (alreadySeen) return;
    const popup = document.createElement('div');
    popup.className = 'site-offer-popup';
    popup.hidden = true;
    popup.setAttribute('aria-hidden','true');
    popup.innerHTML = `
      <div class="site-offer-popup-backdrop" data-site-offer-close></div>
      <div class="site-offer-popup-dialog" role="dialog" aria-modal="true" aria-labelledby="site-offer-popup-title">
        <button type="button" class="site-offer-popup-close" data-site-offer-close aria-label="Close loan offer">×</button>
        <div class="site-offer-popup-top"><span class="offer-live-pill"><i></i>LOAN OFFER</span><span class="offer-validity">Limited-period sample</span></div>
        <div class="site-offer-popup-bank"><img src="${window.__MBL_ASSETS__?.['img/hp/axis.svg'] || 'img/hp/axis.svg'}" alt="Axis Bank logo"><div><strong>Axis Bank</strong><span>Personal Loan</span></div></div>
        <h2 id="site-offer-popup-title">Indicative ROI from 10.99% p.a.*</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipiscing elit. Explore lender promotions focused on ROI and processing-fee benefits.</p>
        <div class="site-offer-popup-facts"><div><span>Processing Fee</span><strong>Special rate*</strong></div><div><span>Validity</span><strong>Limited period</strong></div></div>
        <a class="button" data-site-offer-link href="offers.html">Explore More Offers</a>
      </div>`;
    document.body.appendChild(popup);
    const link = popup.querySelector('[data-site-offer-link]');
    if (link && window.MBL_STANDALONE_PAGE) link.href='?page=offers';
    const markSeen = () => { try { sessionStorage.setItem('mbl-offer-popup-seen','1'); } catch (err) {} };
    const close = () => { popup.hidden=true; popup.setAttribute('aria-hidden','true'); document.body.classList.remove('offer-modal-open'); markSeen(); };
    popup.querySelectorAll('[data-site-offer-close]').forEach(el => el.addEventListener('click',close));
    popup.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    window.setTimeout(()=>{popup.hidden=false;popup.setAttribute('aria-hidden','false');document.body.classList.add('offer-modal-open');popup.querySelector('.site-offer-popup-close')?.focus();}, reducedMotion ? 0 : 450);
  })();


  /* Persistent contextual quick actions on every page except the homepage. */
  (() => {
    const pageKey = document.body.dataset.page || '';
    if (!pageKey || pageKey === 'index') return;
    const contexts = {
      'home-loan': { eyebrow:'Need help deciding?', title:'Home Loan support is always within reach.', primary:'Apply Now', loanType:'Home Loan', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Home%20Loan&source=sticky-cta', mobileAnchor:'#home-loan-journey', finalAnchor:'#final-cta' },
      'personal-loan': { eyebrow:'Need help deciding?', title:'Personal Loan support is always within reach.', primary:'Apply Now', loanType:'Personal Loan', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Personal%20Loan&source=sticky-cta', mobileAnchor:'#personal-loan-journey', finalAnchor:'#final-cta' },
      'loan-against-property': { eyebrow:'Need help deciding?', title:'Property-backed finance guidance is always within reach.', primary:'Apply Now', loanType:'Loan Against Property', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Loan%20Against%20Property&source=sticky-cta', mobileAnchor:'#lap-journey', finalAnchor:'#final-cta' },
      'education-loan': { eyebrow:'Planning education finance?', title:'Get support for your Education Loan next step.', primary:'Apply Now', loanType:'Education Loan', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Education%20Loan&source=sticky-cta', mobileAnchor:'#education-loan-journey', finalAnchor:'#final-cta' },
      'vehicle-loan': { eyebrow:'Ready to move forward?', title:'Vehicle Loan support is always within reach.', primary:'Apply Now', loanType:'Vehicle Loan', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Vehicle%20Loan&source=sticky-cta', mobileAnchor:'#vehicle-finance-journey', finalAnchor:'#final-cta' },
      'business-loan': { eyebrow:'Planning business funding?', title:'Get guided support for your Business Loan requirement.', primary:'Apply Now', loanType:'Business Loan', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Business%20Loan&source=sticky-cta', mobileAnchor:'#business-loan-journey', finalAnchor:'#final-cta' },
      'machinery-finance': { eyebrow:'Planning an equipment upgrade?', title:'Machinery Finance support is always within reach.', primary:'Apply Now', loanType:'Machinery Finance', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?loan=Machinery%20Finance&source=sticky-cta', mobileAnchor:'#machinery-finance-journey', finalAnchor:'#final-cta' },
      'about-us': { eyebrow:'Ready for a clearer next step?', title:'Turn what you’ve learned into the right loan conversation.', primary:'Explore Loan Options', primaryHref:'index.html#loans', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?source=about-quick-cta', mobileAnchor:'#vision-mission', finalAnchor:'#final-cta' },
      'offers': { eyebrow:'Found an offer worth exploring?', title:'Compare the benefit and understand what applies to your profile.', primary:'View Live Offers', primaryHref:'#featured-offers', secondary:'Get Offer Guidance', secondaryHref:'contact-us.html?source=offers-quick-cta', mobileAnchor:'#featured-offers', finalAnchor:'#offer-guide' },
      'blog': { eyebrow:'Want guidance beyond the article?', title:'Move from research to the loan options relevant to you.', primary:'Explore Loan Options', primaryHref:'index.html#loans', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?source=blog-quick-cta', mobileAnchor:'#featured-reads', finalAnchor:'#blog-library' },
      'blog-article': { eyebrow:'Ready for the next step?', title:'Use what you’ve learned to start a guided loan conversation.', primary:'Explore Loan Options', primaryHref:'index.html#loans', secondary:'Talk to a Loan Expert', secondaryHref:'contact-us.html?source=article-quick-cta', mobileAnchor:'#start-with-context', finalAnchor:'#next-step-article' },
      'faqs': { eyebrow:'Still have a question?', title:'A loan expert can help you turn the answer into a next step.', primary:'Book a Consultation', primaryHref:'contact-us.html#book-appointment', secondary:'Explore Loan Options', secondaryHref:'index.html#loans', mobileAnchor:'#popular-questions', finalAnchor:'.final-cta-section' },
      'contact-us': { eyebrow:'Need help scheduling?', title:'Choose a consultation time whenever you’re ready to talk.', primary:'Choose a Time', primaryHref:'#book-appointment', secondary:'Explore Loan Options', secondaryHref:'index.html#loans', mobileAnchor:'#book-appointment', finalAnchor:'#fallback-cta' },
      'builder-channel-partner': { eyebrow:'Building a stronger buyer journey?', title:'Talk to us about a home-finance support partnership.', primary:'Discuss Partnership', primaryHref:'#final-enquiry', secondary:'Become a Partner', secondaryHref:'become-a-partner.html', mobileAnchor:'#partnership-process', finalAnchor:'#final-enquiry' },
      'become-a-partner': { eyebrow:'Ready to partner with us?', title:'Start your MyBestLoan partner conversation.', primary:'Start Registration', primaryHref:'#registration', secondary:'Talk to the Partnership Team', secondaryHref:'contact-us.html?source=partner-quick-cta', mobileAnchor:'#who-can-join', finalAnchor:'#registration' },
      'builder-project-aurora': { eyebrow:'Interested in Project Aurora?', title:'Discuss the home-finance route for this project.', primary:'Talk About Home Finance', primaryHref:'contact-us.html?loan=Home%20Loan&source=project-aurora', secondary:'View Project Gallery', secondaryHref:'#gallery', mobileAnchor:'#overview', finalAnchor:'#project-documents' },
      'builder-project-bluecrest': { eyebrow:'Interested in Project Bluecrest?', title:'Discuss the home-finance route for this project.', primary:'Talk About Home Finance', primaryHref:'contact-us.html?loan=Home%20Loan&source=project-bluecrest', secondary:'View Project Gallery', secondaryHref:'#gallery', mobileAnchor:'#overview', finalAnchor:'#project-documents' },
      'builder-project-meridian': { eyebrow:'Interested in Project Meridian?', title:'Discuss the home-finance route for this project.', primary:'Talk About Home Finance', primaryHref:'contact-us.html?loan=Home%20Loan&source=project-meridian', secondary:'View Project Gallery', secondaryHref:'#gallery', mobileAnchor:'#overview', finalAnchor:'#project-documents' },
      'builder-project-northline': { eyebrow:'Interested in Project Northline?', title:'Discuss the home-finance route for this project.', primary:'Talk About Home Finance', primaryHref:'contact-us.html?loan=Home%20Loan&source=project-northline', secondary:'View Project Gallery', secondaryHref:'#gallery', mobileAnchor:'#overview', finalAnchor:'#project-documents' },
      'privacy-policy': { eyebrow:'Need help with your enquiry?', title:'Speak to MyBestLoan if you need support with your application or data request.', primary:'Contact Support', primaryHref:'contact-us.html?source=privacy-quick-cta', secondary:'Explore Loan Options', secondaryHref:'index.html#loans', mobileAnchor:'main', finalAnchor:null },
      'terms': { eyebrow:'Need help understanding the next step?', title:'Speak to MyBestLoan before you proceed with an application.', primary:'Contact Support', primaryHref:'contact-us.html?source=terms-quick-cta', secondary:'Explore Loan Options', secondaryHref:'index.html#loans', mobileAnchor:'main', finalAnchor:null }
    };
    const context = contexts[pageKey];
    if (!context) return;
    const quick = document.createElement('aside');
    quick.className = 'site-quick-actions';
    quick.dataset.siteQuickActions = '';
    quick.setAttribute('aria-label', `${context.eyebrow} quick actions`);
    const mobileQuick = window.matchMedia('(max-width: 767px)');
    if (mobileQuick.matches) quick.classList.add('is-mobile-pending');
    const primaryMarkup = context.loanType
      ? `<button class="button" data-sticky-loan-apply data-loan-type="${context.loanType}" type="button">${context.primary}</button>`
      : `<a class="button" href="${context.primaryHref}">${context.primary}</a>`;
    quick.innerHTML = `
      <button class="site-quick-actions-close" data-site-quick-close type="button" aria-label="Collapse quick actions">×</button>
      <div class="site-quick-actions-copy"><span>${context.eyebrow}</span><strong>${context.title}</strong></div>
      <div class="site-quick-actions-buttons">
        ${primaryMarkup}
        <a class="button button--light site-quick-actions-talk" href="${context.secondaryHref}">${context.secondary}</a>
      </div>
      <button class="site-quick-actions-icon" data-site-quick-expand type="button" aria-label="Open quick actions" aria-expanded="false"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M5 11h11l-4-4 2-2 7 7-7 7-2-2 4-4H5z" fill="currentColor"></path></svg></button>`;
    document.body.appendChild(quick);
    const finalCta = context.finalAnchor ? document.querySelector(context.finalAnchor) : null;
    const mobileAnchor = context.mobileAnchor ? document.querySelector(context.mobileAnchor) : null;
    const icon = quick.querySelector('[data-site-quick-expand]');
    const closeButton = quick.querySelector('[data-site-quick-close]');
    let finalVisible = false;
    let manuallyExpanded = false;
    let userCollapsed = false;
    let mobileReady = !mobileQuick.matches;
    const updateMobileReady = () => {
      if (!mobileQuick.matches) mobileReady = true;
      else if (mobileAnchor) {
        const triggerY = mobileAnchor.getBoundingClientRect().top + window.scrollY - (window.innerHeight * .72);
        mobileReady = window.scrollY >= Math.max(0, triggerY);
      } else mobileReady = window.scrollY > Math.min(420, window.innerHeight * .55);
    };
    const render = () => {
      updateMobileReady();
      const autoCollapsed = finalVisible && !manuallyExpanded;
      const collapse = userCollapsed || autoCollapsed;
      quick.classList.toggle('is-collapsed', collapse);
      quick.classList.toggle('is-manually-expanded', finalVisible && manuallyExpanded && !userCollapsed);
      const unavailable = mobileQuick.matches && !mobileReady;
      quick.classList.toggle('is-mobile-pending', unavailable);
      quick.setAttribute('aria-hidden', String(unavailable));
      quick.inert = unavailable;
      const buttonGroup = quick.querySelector('.site-quick-actions-buttons');
      if (buttonGroup) buttonGroup.inert = collapse;
      if (closeButton) closeButton.tabIndex = collapse ? -1 : 0;
      icon?.setAttribute('aria-expanded', String(!collapse));
    };
    icon?.addEventListener('click', () => {
      if (userCollapsed) { userCollapsed = false; manuallyExpanded = finalVisible; }
      else if (finalVisible) manuallyExpanded = true;
      render();
    });
    closeButton?.addEventListener('click', () => { userCollapsed = true; manuallyExpanded = false; render(); icon?.focus?.(); });
    window.addEventListener('scroll', render, { passive:true });
    window.addEventListener('resize', render, { passive:true });
    mobileQuick.addEventListener?.('change', render);
    if (finalCta && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        finalVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.18);
        if (!finalVisible) manuallyExpanded = false;
        render();
      }, { threshold:[0,.18,.45] });
      observer.observe(finalCta);
    }
    render();
  })();

  /* Shared contextual application modal for loan-page cards and Offers cards. */
  (() => {
    const applicationTriggers = [...document.querySelectorAll('[data-loan-offer-apply], [data-offer-application-open], [data-sticky-loan-apply]')];
    if (!applicationTriggers.length) return;

    const modal = document.createElement('div');
    modal.className = 'offer-modal';
    modal.dataset.applicationModal = '';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="offer-modal-backdrop" data-application-close></div>
      <div class="offer-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="application-modal-title">
        <div class="offer-modal-head">
          <div><span class="offer-modal-kicker" data-application-kicker>Loan application</span><h2 id="application-modal-title" data-application-heading>Apply for this loan offer</h2></div>
          <button type="button" class="offer-modal-close" data-application-close aria-label="Close application form">×</button>
        </div>
        <div class="offer-modal-body">
          <div class="offer-modal-summary">
            <div class="offer-modal-summary-head">
              <div class="offer-modal-logo"><img data-application-logo src="" alt=""></div>
              <div><p class="eyebrow" data-application-summary-label>Selected lender</p><h3 data-application-bank>Selected lender</h3></div>
            </div>
            <div class="offer-modal-summary-metrics">
              <div class="offer-modal-stat offer-modal-stat--rate"><span data-application-rate-label>Starting interest rate</span><strong data-application-rate>—</strong></div>
              <div class="offer-modal-stat"><span>Loan type</span><strong data-application-loan>Loan</strong></div>
            </div>
            <ul class="check-list">
              <li><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M3 12l5 5L21 4l-2 2L8 14l-3-3z" fill="currentColor"></path></svg><span data-application-benefit-1>Share one enquiry for guided next steps</span></li>
              <li><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M3 12l5 5L21 4l-2 2L8 14l-3-3z" fill="currentColor"></path></svg><span data-application-benefit-2>Review lender conditions before proceeding</span></li>
              <li><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M3 12l5 5L21 4l-2 2L8 14l-3-3z" fill="currentColor"></path></svg><span data-application-benefit-3>Get assistance from a MyBestLoan expert</span></li>
            </ul>
          </div>
          <form class="offer-modal-form" data-application-form novalidate>
            <div class="form-field"><label for="application-name">Full Name *</label><input autocomplete="name" id="application-name" name="name" placeholder="Enter your full name" required></div>
            <div class="form-field"><label for="application-mobile">Mobile Number *</label><input autocomplete="tel" id="application-mobile" inputmode="numeric" name="phone" pattern="[0-9]{10}" placeholder="Enter 10-digit mobile" required></div>
            <div class="form-field"><label for="application-email">Email Address <span>(optional)</span></label><input autocomplete="email" id="application-email" name="email" placeholder="you@example.com" type="email"></div>
            <div class="form-field"><label for="application-amount">Approx. Loan Amount <span>(optional)</span></label><input id="application-amount" inputmode="numeric" name="loanAmount" placeholder="e.g. 2500000"></div>
            <input data-application-bank-input name="bank" type="hidden">
            <input data-application-loan-input name="loanType" type="hidden">
            <input data-application-context-input name="context" type="hidden">
            <input data-application-date-input name="appointmentDate" type="hidden">
            <input data-application-time-input name="appointmentTime" type="hidden">
            <div class="application-appointment appointment-calendar-card" data-application-appointment>
              <div class="contact-step-heading"><span>01</span><div><p>CHOOSE AN APPOINTMENT</p><h3>Choose Your Preferred Time</h3><p style="margin:4px 0 0; text-transform:none; letter-spacing:normal; font-size:.85rem; color:#587087; font-weight:500;">Aapki convenience ki date aur time choose karein!</p></div></div>
              <div class="appointment-calendar-head">
                <button class="appointment-month-control" data-application-prev type="button" aria-label="Previous month"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="M15.5 4.5 8 12l7.5 7.5-1.8 1.8L4.4 12l9.3-9.3z" fill="currentColor"></path></svg></button>
                <div><span>Availability</span><h3 data-application-month>Month Year</h3></div>
                <button class="appointment-month-control" data-application-next type="button" aria-label="Next month"><svg aria-hidden="true" class="icon" viewBox="0 0 24 24"><path d="m8.5 4.5 7.5 7.5-7.5 7.5 1.8 1.8 9.3-9.3-9.3-9.3z" fill="currentColor"></path></svg></button>
              </div>
              <div class="appointment-weekdays" aria-hidden="true"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
              <div class="appointment-days" data-application-days aria-label="Appointment dates" role="grid"></div>
              <div class="appointment-calendar-key"><span><i class="is-available"></i>Available</span><span><i class="is-selected"></i>Selected</span><span><i class="is-unavailable"></i>Unavailable</span></div>
              <p style="margin:14px 0 0; font-size:.82rem; color:#587087;">Don’t worry, we won’t call you unless you share your preferred time to connect.</p>
              <div class="contact-times-block"><div><p class="eyebrow">Available times</p><p data-application-selection>Choose an available date to see appointment times.</p></div><div class="appointment-times" data-application-times aria-live="polite"></div></div>
              <div class="appointment-summary" data-application-summary><span>No appointment selected yet.</span></div>
            </div>
            <button class="button offer-submit" disabled type="submit">Book My Call</button>
            <p class="offer-form-note" data-application-note>Submitting this form creates an enquiry request. Approval, rate and terms remain subject to lender assessment.</p>
            <div class="form-status" data-application-status role="status" tabindex="-1"></div>
          </form>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const form = modal.querySelector('[data-application-form]');
    const status = modal.querySelector('[data-application-status]');
    const bankText = modal.querySelector('[data-application-bank]');
    const summaryLabel = modal.querySelector('[data-application-summary-label]');
    const loanText = modal.querySelector('[data-application-loan]');
    const logo = modal.querySelector('[data-application-logo]');
    const rate = modal.querySelector('[data-application-rate]');
    const rateLabel = modal.querySelector('[data-application-rate-label]');
    const kicker = modal.querySelector('[data-application-kicker]');
    const heading = modal.querySelector('[data-application-heading]');
    const note = modal.querySelector('[data-application-note]');
    const bankInput = modal.querySelector('[data-application-bank-input]');
    const loanInput = modal.querySelector('[data-application-loan-input]');
    const contextInput = modal.querySelector('[data-application-context-input]');
    const benefits = [1, 2, 3].map((index) => modal.querySelector(`[data-application-benefit-${index}]`));
    const applicationAppointment = modal.querySelector('[data-application-appointment]');
    const applicationMonth = modal.querySelector('[data-application-month]');
    const applicationDays = modal.querySelector('[data-application-days]');
    const applicationTimes = modal.querySelector('[data-application-times]');
    const applicationSelection = modal.querySelector('[data-application-selection]');
    const applicationSummary = modal.querySelector('[data-application-summary]');
    const applicationPrev = modal.querySelector('[data-application-prev]');
    const applicationNext = modal.querySelector('[data-application-next]');
    const applicationDateInput = modal.querySelector('[data-application-date-input]');
    const applicationTimeInput = modal.querySelector('[data-application-time-input]');
    const applicationSubmit = modal.querySelector('.offer-submit');
    const applicationAvailability = window.MBL_CONFIG?.appointmentAvailability || {};
    const applicationWeekly = applicationAvailability.weekly || {};
    const applicationOverrides = applicationAvailability.dateOverrides || {};
    const applicationBlocked = new Set(applicationAvailability.blockedDates || []);
    const applicationTimeZone = applicationAvailability.timeZone || 'Asia/Kolkata';
    const applicationLeadHours = Number(applicationAvailability.minLeadHours || 0);
    const previewStorageKey = 'mbl-appointment-preview-bookings';
    let applicationSelectedDate = '';
    let applicationSelectedTime = '';
    let applicationViewMonth = null;
    let applicationCurrentMonth = null;
    let returnFocus = null;

    const appPad = (value) => String(value).padStart(2, '0');
    const appKey = (date) => `${date.getFullYear()}-${appPad(date.getMonth()+1)}-${appPad(date.getDate())}`;
    const appNowParts = () => {
      const parts = new Intl.DateTimeFormat('en-GB',{timeZone:applicationTimeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
      const get=(type)=>Number(parts.find((part)=>part.type===type)?.value||0);
      return {year:get('year'),month:get('month'),day:get('day'),hour:get('hour'),minute:get('minute')};
    };
    const appHumanDate = (date) => new Intl.DateTimeFormat('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(date);
    const appHumanTime = (value) => { const [h,m]=value.split(':').map(Number); return new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(2000,0,1,h,m)); };
    const appBookings = () => { try { return new Set(JSON.parse(localStorage.getItem(previewStorageKey) || '[]')); } catch (error) { return new Set(); } };
    const saveAppBooking = (value) => { const booked=appBookings(); booked.add(value); try { localStorage.setItem(previewStorageKey,JSON.stringify([...booked])); } catch (error) {} };
    const appSlots = (date) => {
      const key=appKey(date); if(applicationBlocked.has(key)) return [];
      let slots=Object.prototype.hasOwnProperty.call(applicationOverrides,key)?applicationOverrides[key]:applicationWeekly[String(date.getDay())];
      slots=Array.isArray(slots)?[...slots]:[];
      const now=appNowParts(); const today=`${now.year}-${appPad(now.month)}-${appPad(now.day)}`;
      if(key<today) return [];
      const booked=appBookings(); slots=slots.filter((slot)=>!booked.has(`${key}T${slot}`));
      if(key===today){ const cutoff=now.hour*60+now.minute+applicationLeadHours*60; slots=slots.filter((slot)=>{const [h,m]=slot.split(':').map(Number);return h*60+m>=cutoff;}); }
      return slots;
    };
    const updateApplicationSubmit = () => {
      const ready = Boolean(applicationSelectedDate && applicationSelectedTime);
      if(applicationDateInput) applicationDateInput.value=applicationSelectedDate;
      if(applicationTimeInput) applicationTimeInput.value=applicationSelectedTime;
      if(applicationSubmit) applicationSubmit.disabled=!ready;
      if(!applicationSummary) return;
      if(!ready) applicationSummary.innerHTML = '<span>No appointment selected yet.</span>';
      else {
        const [year, month, day] = applicationSelectedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        applicationSummary.innerHTML = `<span>Your appointment</span><strong>${appHumanDate(date)} · ${appHumanTime(applicationSelectedTime)}</strong><small>${applicationTimeZone.replace('_',' ')}</small>`;
      }
    };
    const renderApplicationTimes = (date) => {
      if(!applicationTimes) return; applicationTimes.innerHTML=''; const slots=appSlots(date);
      if(applicationSelection) applicationSelection.textContent = slots.length ? `${appHumanDate(date)} — choose an available time.` : `${appHumanDate(date)} has no available time slots.`;
      if(!slots.length){
        const empty = document.createElement('p');
        empty.className = 'appointment-times-empty';
        empty.textContent = 'No appointment times are available on this date. Choose another available day.';
        applicationTimes.appendChild(empty);
        return;
      }
      slots.forEach((slot)=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='appointment-time';
        button.textContent=appHumanTime(slot);
        button.dataset.appointmentTime = slot;
        button.classList.toggle('is-selected',slot===applicationSelectedTime);
        button.setAttribute('aria-pressed', String(slot === applicationSelectedTime));
        button.addEventListener('click',()=>{
          applicationSelectedTime=slot;
          applicationTimes.querySelectorAll('.appointment-time').forEach((item)=>{
            const active = item.dataset.appointmentTime === slot;
            item.classList.toggle('is-selected', active);
            item.setAttribute('aria-pressed', String(active));
          });
          updateApplicationSubmit();
        });
        applicationTimes.appendChild(button);
      });
    };
    const selectApplicationDate = (date) => {
      applicationSelectedDate = appKey(date);
      applicationSelectedTime = '';
      renderApplicationCalendar();
      renderApplicationTimes(date);
      updateApplicationSubmit();
    };
    const renderApplicationCalendar = () => {
      if(!applicationDays || !applicationMonth || !applicationViewMonth) return;
      applicationMonth.textContent=new Intl.DateTimeFormat('en-IN',{month:'long',year:'numeric'}).format(applicationViewMonth);
      applicationDays.innerHTML='';
      const y=applicationViewMonth.getFullYear(),m=applicationViewMonth.getMonth(),first=new Date(y,m,1).getDay(),total=new Date(y,m+1,0).getDate();
      for(let i=0;i<first;i+=1){
        const spacer=document.createElement('span');
        spacer.className = 'appointment-day-spacer';
        spacer.setAttribute('aria-hidden','true');
        applicationDays.appendChild(spacer);
      }
      const currentClock = appNowParts();
      const todayKey = `${currentClock.year}-${appPad(currentClock.month)}-${appPad(currentClock.day)}`;
      for(let day=1;day<=total;day+=1){
        const date=new Date(y,m,day),key=appKey(date),slots=appSlots(date);
        const available = slots.length > 0;
        const button=document.createElement('button');
        button.type='button';
        button.className='appointment-day';
        button.textContent=String(day);
        button.disabled=!available;
        button.classList.toggle('is-available', available);
        button.classList.toggle('is-selected',key===applicationSelectedDate);
        button.classList.toggle('is-today', key === todayKey);
        button.setAttribute('aria-label',`${appHumanDate(date)}${available ? `, ${slots.length} appointment time${slots.length === 1 ? '' : 's'} available` : ', unavailable'}`);
        button.setAttribute('aria-pressed', String(key === applicationSelectedDate));
        if(available) button.addEventListener('click',()=>selectApplicationDate(date));
        applicationDays.appendChild(button);
      }
      if(applicationPrev&&applicationCurrentMonth) {
        const atFirstMonth = applicationViewMonth.getFullYear() === applicationCurrentMonth.getFullYear() && applicationViewMonth.getMonth() === applicationCurrentMonth.getMonth();
        applicationPrev.disabled = atFirstMonth;
      }
    };
    const changeApplicationMonth = (direction) => {
      if(!applicationViewMonth || !applicationCurrentMonth) return;
      const candidate = new Date(applicationViewMonth.getFullYear(), applicationViewMonth.getMonth() + direction, 1);
      if(candidate < applicationCurrentMonth) return;
      applicationViewMonth = candidate;
      applicationSelectedDate = '';
      applicationSelectedTime = '';
      if(applicationSelection) applicationSelection.textContent = 'Choose an available date to see appointment times.';
      if(applicationTimes) applicationTimes.innerHTML = '';
      updateApplicationSubmit();
      renderApplicationCalendar();
    };
    const resetApplicationPicker = () => {
      const now=appNowParts();
      applicationCurrentMonth=new Date(now.year,now.month-1,1);
      applicationViewMonth=new Date(applicationCurrentMonth);
      applicationSelectedDate='';
      applicationSelectedTime='';
      if(applicationTimes) applicationTimes.innerHTML='';
      if(applicationSelection) applicationSelection.textContent='Choose an available date to see appointment times.';
      renderApplicationCalendar();
      updateApplicationSubmit();
    };
    applicationPrev?.addEventListener('click', () => changeApplicationMonth(-1));
    applicationNext?.addEventListener('click', () => changeApplicationMonth(1));

    const focusables = () => [...modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((el) => !el.hidden);
    const close = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('offer-modal-open');
      form?.reset();
      resetApplicationPicker();
      status?.classList.remove('is-visible');
      if (status) status.textContent = '';
      returnFocus?.focus?.();
    };

    const open = (trigger) => {
      const card = trigger.closest('.loan-offer-grid-card, .offer-detail-card');
      const stickyLoanType = trigger.dataset.loanType || '';
      if (!card && !stickyLoanType) return;
      returnFocus = trigger;
      const isSticky = Boolean(stickyLoanType);
      const isOffersPageCard = Boolean(card?.classList.contains('offer-detail-card'));
      const bank = isSticky ? 'MyBestLoan' : (card.dataset.bank || card.querySelector('.loan-offer-bank-copy h3,.offer-bank-line strong')?.textContent?.trim() || 'Selected lender');
      const loanType = stickyLoanType || card.dataset.loanType || card.dataset.loan || card.querySelector('.loan-offer-bank-copy p,.offer-bank-line span')?.textContent?.trim() || 'Loan';
      const logoPath = isSticky ? (window.__MBL_ASSETS__?.['img/MyBestLoan logo.png'] || 'img/MyBestLoan logo.png') : (card.dataset.logo || card.querySelector('.loan-offer-bank-logo img,.offer-bank-line img')?.getAttribute('src') || '');
      const rateValue = isSticky ? 'Guided application' : (card.dataset.rate || card.querySelector('.loan-offer-rate-block strong,.offer-detail-value strong')?.textContent?.trim() || 'Offer benefit');
      const offerTitle = card?.dataset.offerTitle || '';

      if (bankText) bankText.textContent = bank;
      if (summaryLabel) summaryLabel.textContent = isSticky ? 'MyBestLoan support' : (isOffersPageCard ? 'Selected offer' : 'Selected lender');
      if (loanText) loanText.textContent = loanType;
      if (logo) { logo.src = logoPath; logo.alt = logoPath ? `${bank} logo` : ''; }
      if (bankInput) bankInput.value = bank;
      if (loanInput) loanInput.value = loanType;
      if (contextInput) contextInput.value = isSticky ? 'sticky-loan-cta' : (isOffersPageCard ? 'offers-page' : 'loan-category-page');

      resetApplicationPicker();
      if (isSticky) {
        if (kicker) kicker.textContent = `${loanType} consultation`;
        if (heading) heading.textContent = `Start your ${loanType} application`;
        if (rateLabel) rateLabel.textContent = 'Next step';
        if (rate) rate.textContent = 'Book My Call';
        if (benefits[0]) benefits[0].textContent = `Discuss your ${loanType.toLowerCase()} requirement with a loan expert`;
        if (benefits[1]) benefits[1].textContent = 'Review indicative lender options, eligibility factors and documents';
        if (benefits[2]) benefits[2].textContent = 'Choose an available date and time without leaving this page';
        if (note) note.textContent = 'This is an initial application and consultation request. Final approval, pricing, documentation and terms remain subject to lender assessment.';
      } else if (isOffersPageCard) {
        if (kicker) kicker.textContent = 'Offer application';
        if (heading) heading.textContent = `Apply for this ${loanType} offer`;
        if (rateLabel) rateLabel.textContent = 'Featured offer benefit';
        if (rate) rate.textContent = rateValue;
        if (benefits[0]) benefits[0].textContent = 'We will verify the selected promotion and your eligibility';
        if (benefits[1]) benefits[1].textContent = 'An expert can explain ROI, fees, validity and important conditions';
        if (benefits[2]) benefits[2].textContent = 'Your enquiry stays linked to this lender offer for the next step';
        if (note) note.textContent = 'This request is linked to the selected promotional offer. Final eligibility, validity, charges and lender terms apply.';
      } else {
        if (kicker) kicker.textContent = 'Personalised loan application';
        if (heading) heading.textContent = `Apply for this ${loanType}`;
        if (rateLabel) rateLabel.textContent = 'Starting interest rate';
        if (rate) rate.textContent = rateValue;
        if (benefits[0]) benefits[0].textContent = 'Share your requirement for guided application next steps';
        if (benefits[1]) benefits[1].textContent = 'Expert assistance through the application next steps';
        if (benefits[2]) benefits[2].textContent = 'The selected lender and loan type stay attached to your request';
        if (note) note.textContent = 'Submitting this form creates an enquiry request. Approval, rate and terms remain subject to lender assessment.';
      }

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('offer-modal-open');
      window.setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), reducedMotion ? 0 : 180);
    };

    applicationTriggers.forEach((trigger) => trigger.addEventListener('click', () => open(trigger)));
    modal.querySelectorAll('[data-application-close]').forEach((el) => el.addEventListener('click', close));
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { close(); return; }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!applicationSelectedDate || !applicationSelectedTime) {
        if (status) { status.textContent = 'Choose an available consultation date and time before continuing.'; status.classList.add('is-visible'); status.focus?.(); }
        return;
      }
      const submit = form.querySelector('[type="submit"]');
      const endpoint = window.MBL_CONFIG?.appointmentEndpoint?.trim() || window.MBL_CONFIG?.enquiryEndpoint?.trim();
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.enquiryType = payload.context === 'offers-page' ? 'promotional-offer-consultation' : 'loan-application-consultation';
      payload.timeZone = applicationTimeZone;
      payload.page = location.pathname.split('/').pop() || '';
      try {
        if (submit) submit.disabled = true;
        if (status) {
          status.textContent = endpoint ? 'Submitting your application and appointment…' : 'Reserving your application consultation in preview mode…';
          status.classList.add('is-visible');
        }
        if (endpoint) {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          if (status) status.textContent = 'Thank you. Your application and preferred consultation time have been submitted.';
        } else if (status) {
          saveAppBooking(`${applicationSelectedDate}T${applicationSelectedTime}`);
          status.textContent = 'Application consultation reserved in preview mode. Add appointmentEndpoint (or enquiryEndpoint) in js/config.js for live transmission.';
        }
      } catch (error) {
        console.error('MyBestLoan application submission failed:', error);
        if (status) status.textContent = 'We could not submit this application right now. Please use the Talk to a Loan Expert option.';
      } finally {
        if (submit) submit.disabled = false;
        status?.focus?.();
      }
    });
  })();

  /* Contact-page appointment scheduler. Availability is controlled in js/config.js. */
  const appointmentSystem = document.querySelector('[data-appointment-system]');
  if (appointmentSystem) {
    const availability = window.MBL_CONFIG?.appointmentAvailability || {};
    const weekly = availability.weekly || {};
    const dateOverrides = availability.dateOverrides || {};
    const blockedDates = new Set(availability.blockedDates || []);
    const timeZone = availability.timeZone || 'Asia/Kolkata';
    const minLeadHours = Number.isFinite(Number(availability.minLeadHours)) ? Number(availability.minLeadHours) : 0;
    const monthLabel = appointmentSystem.querySelector('[data-appointment-month]');
    const daysRoot = appointmentSystem.querySelector('[data-appointment-days]');
    const timesRoot = appointmentSystem.querySelector('[data-appointment-times]');
    const selectionCopy = appointmentSystem.querySelector('[data-appointment-selection]');
    const summary = appointmentSystem.querySelector('[data-appointment-summary]');
    const prev = appointmentSystem.querySelector('[data-appointment-prev]');
    const next = appointmentSystem.querySelector('[data-appointment-next]');
    const form = appointmentSystem.querySelector('[data-appointment-form]');
    const dateInput = appointmentSystem.querySelector('[data-appointment-date-input]');
    const timeInput = appointmentSystem.querySelector('[data-appointment-time-input]');
    const submit = form?.querySelector('[type="submit"]');
    const status = appointmentSystem.querySelector('[data-appointment-status]');
    const previewStorageKey = 'mbl-appointment-preview-bookings';
    let selectedDate = '';
    let selectedTime = '';

    const numberPart = (parts, type) => Number(parts.find((part) => part.type === type)?.value || 0);
    const nowParts = () => {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(new Date());
      return { year:numberPart(parts,'year'), month:numberPart(parts,'month'), day:numberPart(parts,'day'), hour:numberPart(parts,'hour'), minute:numberPart(parts,'minute') };
    };
    const pad = (value) => String(value).padStart(2, '0');
    const keyFor = (date) => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
    const humanDate = (date) => new Intl.DateTimeFormat('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(date);
    const humanTime = (value) => {
      const [hour, minute] = value.split(':').map(Number);
      const date = new Date(2000,0,1,hour,minute);
      return new Intl.DateTimeFormat('en-IN', { hour:'numeric', minute:'2-digit', hour12:true }).format(date);
    };
    const previewBookings = () => {
      try { return new Set(JSON.parse(localStorage.getItem(previewStorageKey) || '[]')); }
      catch (error) { return new Set(); }
    };
    const savePreviewBooking = (value) => {
      const bookings = previewBookings();
      bookings.add(value);
      try { localStorage.setItem(previewStorageKey, JSON.stringify([...bookings])); } catch (error) { /* local preview storage is optional */ }
    };
    const getSlots = (date) => {
      const key = keyFor(date);
      if (blockedDates.has(key)) return [];
      let slots = Object.prototype.hasOwnProperty.call(dateOverrides, key) ? dateOverrides[key] : weekly[String(date.getDay())];
      slots = Array.isArray(slots) ? [...slots] : [];
      const current = nowParts();
      const todayKey = `${current.year}-${pad(current.month)}-${pad(current.day)}`;
      if (key < todayKey) return [];
      const locallyBooked = previewBookings();
      slots = slots.filter((slot) => !locallyBooked.has(`${key}T${slot}`));
      if (key === todayKey) {
        const cutoff = current.hour * 60 + current.minute + minLeadHours * 60;
        slots = slots.filter((slot) => {
          const [hour, minute] = slot.split(':').map(Number);
          return hour * 60 + minute >= cutoff;
        });
      }
      return slots;
    };

    const current = nowParts();
    const currentMonth = new Date(current.year, current.month - 1, 1);
    let viewMonth = new Date(currentMonth);

    const updateBookingState = () => {
      const ready = Boolean(selectedDate && selectedTime);
      if (submit) submit.disabled = !ready;
      if (dateInput) dateInput.value = selectedDate;
      if (timeInput) timeInput.value = selectedTime;
      if (!summary) return;
      if (!ready) summary.innerHTML = '<span>No appointment selected yet.</span>';
      else {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        summary.innerHTML = `<span>Your appointment</span><strong>${humanDate(date)} · ${humanTime(selectedTime)}</strong><small>${timeZone.replace('_',' ')}</small>`;
      }
    };

    const renderTimes = (date) => {
      if (!timesRoot) return;
      timesRoot.innerHTML = '';
      const slots = getSlots(date);
      if (selectionCopy) selectionCopy.textContent = slots.length ? `${humanDate(date)} — choose an available time.` : `${humanDate(date)} has no available time slots.`;
      if (!slots.length) {
        const empty = document.createElement('p');
        empty.className = 'appointment-times-empty';
        empty.textContent = 'No appointment times are available on this date. Choose another available day.';
        timesRoot.appendChild(empty);
        return;
      }
      slots.forEach((slot) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'appointment-time';
        button.textContent = humanTime(slot);
        button.dataset.appointmentTime = slot;
        button.classList.toggle('is-selected', slot === selectedTime);
        button.setAttribute('aria-pressed', String(slot === selectedTime));
        button.addEventListener('click', () => {
          selectedTime = slot;
          timesRoot.querySelectorAll('.appointment-time').forEach((item) => {
            const active = item.dataset.appointmentTime === slot;
            item.classList.toggle('is-selected', active);
            item.setAttribute('aria-pressed', String(active));
          });
          updateBookingState();
        });
        timesRoot.appendChild(button);
      });
    };

    const selectDate = (date) => {
      selectedDate = keyFor(date);
      selectedTime = '';
      renderCalendar();
      renderTimes(date);
      updateBookingState();
    };

    function renderCalendar() {
      if (!daysRoot || !monthLabel) return;
      monthLabel.textContent = new Intl.DateTimeFormat('en-IN', { month:'long', year:'numeric' }).format(viewMonth);
      daysRoot.innerHTML = '';
      const year = viewMonth.getFullYear();
      const month = viewMonth.getMonth();
      const firstWeekday = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      for (let index = 0; index < firstWeekday; index += 1) {
        const spacer = document.createElement('span');
        spacer.className = 'appointment-day-spacer';
        spacer.setAttribute('aria-hidden','true');
        daysRoot.appendChild(spacer);
      }
      const currentClock = nowParts();
      const todayKey = `${currentClock.year}-${pad(currentClock.month)}-${pad(currentClock.day)}`;
      for (let day = 1; day <= totalDays; day += 1) {
        const date = new Date(year, month, day);
        const key = keyFor(date);
        const slots = getSlots(date);
        const available = slots.length > 0;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'appointment-day';
        button.textContent = String(day);
        button.disabled = !available;
        button.classList.toggle('is-available', available);
        button.classList.toggle('is-selected', key === selectedDate);
        button.classList.toggle('is-today', key === todayKey);
        button.setAttribute('aria-label', `${humanDate(date)}${available ? `, ${slots.length} appointment time${slots.length === 1 ? '' : 's'} available` : ', unavailable'}`);
        button.setAttribute('aria-pressed', String(key === selectedDate));
        if (available) button.addEventListener('click', () => selectDate(date));
        daysRoot.appendChild(button);
      }
      if (prev) {
        const atFirstMonth = viewMonth.getFullYear() === currentMonth.getFullYear() && viewMonth.getMonth() === currentMonth.getMonth();
        prev.disabled = atFirstMonth;
      }
    }

    const changeMonth = (direction) => {
      const candidate = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + direction, 1);
      if (candidate < currentMonth) return;
      viewMonth = candidate;
      selectedDate = '';
      selectedTime = '';
      if (selectionCopy) selectionCopy.textContent = 'Choose an available date to see appointment times.';
      if (timesRoot) timesRoot.innerHTML = '';
      updateBookingState();
      renderCalendar();
    };
    prev?.addEventListener('click', () => changeMonth(-1));
    next?.addEventListener('click', () => changeMonth(1));

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!selectedDate || !selectedTime) {
        if (status) { status.textContent = 'Choose an available appointment date and time first.'; status.classList.add('is-visible'); status.focus?.(); }
        return;
      }
      const loanChoices = [...form.querySelectorAll('[data-loan-choice-input]')];
      if (loanChoices.length && !loanChoices.some((input) => input.checked)) {
        if (status) { status.textContent = 'Select at least one loan category so we can prepare the right expert.'; status.classList.add('is-visible'); status.focus?.(); }
        loanChoices[0]?.focus();
        return;
      }
      if (!form.reportValidity()) return;
      const endpoint = window.MBL_CONFIG?.appointmentEndpoint?.trim();
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.timeZone = timeZone;
      payload.enquiryType = 'loan-consultation';
      payload.loanCategories = [...form.querySelectorAll('[data-loan-choice-input]:checked')].map((input) => input.value);
      payload.page = location.pathname.split('/').pop() || 'contact-us.html';
      try {
        if (submit) submit.disabled = true;
        if (status) { status.textContent = endpoint ? 'Booking your appointment…' : 'Reserving this appointment in interactive preview mode…'; status.classList.add('is-visible'); }
        if (endpoint) {
          const response = await fetch(endpoint, {
            method:'POST',
            headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
            body:JSON.stringify(payload)
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          if (status) status.textContent = `Appointment request submitted for ${selectedDate} at ${humanTime(selectedTime)}. Please await final confirmation.`;
        } else {
          savePreviewBooking(`${selectedDate}T${selectedTime}`);
          if (status) status.textContent = `Appointment reserved in preview mode for ${selectedDate} at ${humanTime(selectedTime)}. Add appointmentEndpoint in js/config.js to transmit bookings to the live scheduling backend.`;
        }
        selectedTime = '';
        renderCalendar();
        const [year, month, day] = selectedDate.split('-').map(Number);
        renderTimes(new Date(year, month - 1, day));
        updateBookingState();
      } catch (error) {
        console.error('MyBestLoan appointment booking failed:', error);
        if (status) status.textContent = 'We could not book this appointment right now. Please choose another slot or send an enquiry.';
        updateBookingState();
      } finally {
        status?.focus?.();
      }
    });

    const loanChoiceInputs = [...appointmentSystem.querySelectorAll('[data-loan-choice-input]')];
    const syncLoanChoiceState = () => loanChoiceInputs.forEach((input) => input.closest('.loan-choice-card')?.classList.toggle('is-selected', input.checked));
    loanChoiceInputs.forEach((input) => input.addEventListener('change', syncLoanChoiceState));
    const routedSearch = window.__MBL_ROUTE__?.search || location.search;
    const requestedLoan = new URLSearchParams(routedSearch || '').get('loan');
    if (requestedLoan) {
      const target = loanChoiceInputs.find((input) => input.value.toLowerCase() === requestedLoan.toLowerCase());
      if (target) target.checked = true;
    }
    syncLoanChoiceState();
    renderCalendar();
    updateBookingState();
  }

  /* Offers page: category tabs and benefit filters work together. */
  const offerFilter = document.querySelector('[data-offer-filter]');
  const offerCards = [...document.querySelectorAll('.offer-detail-card[data-offer-card]')];
  if (offerFilter && offerCards.length) {
    const toolbar = document.querySelector('[data-offers-filter-toolbar]');
    const tabs = [...offerFilter.querySelectorAll('[data-offer-filter-value]')];
    const advanced = toolbar?.querySelector('[data-offer-advanced-filter]');
    const filterToggle = advanced?.querySelector('[data-offer-filter-toggle]');
    const filterMenu = advanced?.querySelector('[data-offer-filter-menu]');
    const criteriaInputs = [...(advanced?.querySelectorAll('[data-offer-criteria]') || [])];
    const filterCount = advanced?.querySelector('[data-offer-filter-count]');
    const clearFilter = advanced?.querySelector('[data-offer-filter-clear]');
    const applyFilter = advanced?.querySelector('[data-offer-filter-apply]');
    const closeFilterButton = advanced?.querySelector('[data-offer-filter-close]');
    const filterSummary = document.querySelector('[data-offer-filter-summary]');
    const emptyState = document.querySelector('[data-offer-filter-empty]');
    let activeCategory = tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.offerFilterValue || 'all';
    let appliedCriteria = new Set();

    const renderOfferFilters = () => {
      let visible = 0;
      offerCards.forEach((card) => {
        const categoryMatch = activeCategory === 'all' || card.dataset.offerCategory === activeCategory;
        const tags = new Set((card.dataset.offerTags || '').split(/\s+/).filter(Boolean));
        const criteriaMatch = !appliedCriteria.size || [...appliedCriteria].some((value) => tags.has(value));
        const show = categoryMatch && criteriaMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (filterCount) {
        filterCount.textContent = String(appliedCriteria.size);
        filterCount.hidden = appliedCriteria.size === 0;
      }
      if (emptyState) emptyState.hidden = visible !== 0;
      if (filterSummary) {
        const categoryName = tabs.find((tab) => tab.dataset.offerFilterValue === activeCategory)?.textContent?.trim() || 'All Offers';
        const criteriaNames = criteriaInputs.filter((input) => appliedCriteria.has(input.value)).map((input) => input.closest('label')?.querySelector('strong')?.textContent?.trim()).filter(Boolean);
        filterSummary.textContent = `Showing ${visible} ${visible === 1 ? 'offer' : 'offers'} in ${categoryName}${criteriaNames.length ? ` filtered by ${criteriaNames.join(', ')}` : ''}.`;
      }
    };

    const activateCategory = (tab, focus = false) => {
      if (!tab) return;
      activeCategory = tab.dataset.offerFilterValue || 'all';
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      renderOfferFilters();
      tab.scrollIntoView({ behavior:reducedMotion ? 'auto' : 'smooth', block:'nearest', inline:'nearest' });
      if (focus) tab.focus();
    };

    const setFilterMenu = (open, returnFocus = false) => {
      if (!filterMenu || !filterToggle) return;
      filterMenu.hidden = !open;
      filterToggle.setAttribute('aria-expanded', String(open));
      if (open) window.setTimeout(() => criteriaInputs[0]?.focus(), 0);
      else if (returnFocus) filterToggle.focus();
    };

    offerFilter.addEventListener('click', (event) => {
      const tab = event.target.closest('[data-offer-filter-value]');
      if (tab) activateCategory(tab);
    });
    tabs.forEach((tab, index) => tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      activateCategory(tabs[nextIndex], true);
    }));

    filterToggle?.addEventListener('click', () => setFilterMenu(filterToggle.getAttribute('aria-expanded') !== 'true'));
    closeFilterButton?.addEventListener('click', () => setFilterMenu(false, true));
    applyFilter?.addEventListener('click', () => {
      appliedCriteria = new Set(criteriaInputs.filter((input) => input.checked).map((input) => input.value));
      renderOfferFilters();
      setFilterMenu(false, true);
    });
    clearFilter?.addEventListener('click', () => {
      criteriaInputs.forEach((input) => { input.checked = false; });
      appliedCriteria.clear();
      renderOfferFilters();
    });
    document.addEventListener('click', (event) => {
      if (!advanced || !filterMenu || filterMenu.hidden || advanced.contains(event.target)) return;
      setFilterMenu(false);
    });
    advanced?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && filterMenu && !filterMenu.hidden) {
        event.preventDefault();
        setFilterMenu(false, true);
      }
    });

    activateCategory(tabs.find((tab) => tab.classList.contains('is-active')) || tabs[0]);
  }

  /* Blog category filtering rail. */
  const blogFilter = document.querySelector('[data-blog-filter]');
  const blogCards = [...document.querySelectorAll('[data-blog-category]')];
  if (blogFilter && blogCards.length) {
    const blogTabs = [...blogFilter.querySelectorAll('[data-blog-filter-value]')];
    const activateBlogCategory = (button, focus = false) => {
      if (!button) return;
      const value = button.dataset.blogFilterValue || 'home';
      blogTabs.forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      blogCards.forEach((card) => {
        card.hidden = card.dataset.blogCategory !== value;
      });
      button.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' });
      if (focus) button.focus();
    };
    blogFilter.addEventListener('click', (event) => {
      const button = event.target.closest('[data-blog-filter-value]');
      if (button) activateBlogCategory(button);
    });
    blogTabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % blogTabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + blogTabs.length) % blogTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = blogTabs.length - 1;
        activateBlogCategory(blogTabs[nextIndex], true);
      });
    });
    activateBlogCategory(blogTabs.find((tab) => tab.classList.contains('is-active')) || blogTabs[0]);
  }

  /* Builder project galleries: accessible lightbox. */
  document.querySelectorAll('[data-project-gallery]').forEach((gallery) => {
    const items=[...gallery.querySelectorAll('[data-project-gallery-item]')];const lightbox=document.querySelector('[data-project-lightbox]');if(!items.length||!lightbox)return;const image=lightbox.querySelector('[data-project-lightbox-image]');const caption=lightbox.querySelector('[data-project-lightbox-caption]');let index=0,lastTrigger=null;
    const render=(i)=>{index=(i+items.length)%items.length;const src=items[index].querySelector('img');if(!src||!image)return;image.src=src.currentSrc||src.src;image.alt=src.alt||'Project gallery view';if(caption)caption.textContent=`${src.alt} — ${index+1} of ${items.length}`;};
    const close=()=>{lightbox.hidden=true;lightbox.setAttribute('aria-hidden','true');document.body.classList.remove('project-lightbox-open');lastTrigger?.focus();};
    items.forEach((item,i)=>item.addEventListener('click',()=>{lastTrigger=item;render(i);lightbox.hidden=false;lightbox.setAttribute('aria-hidden','false');document.body.classList.add('project-lightbox-open');lightbox.querySelector('[data-project-lightbox-close]')?.focus();}));
    lightbox.querySelectorAll('[data-project-lightbox-close]').forEach(el=>el.addEventListener('click',close));lightbox.querySelector('[data-project-lightbox-prev]')?.addEventListener('click',()=>render(index-1));lightbox.querySelector('[data-project-lightbox-next]')?.addEventListener('click',()=>render(index+1));lightbox.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='ArrowLeft')render(index-1);if(e.key==='ArrowRight')render(index+1);});
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCoreUI();
  initInteractiveExperience();
  initLoanAndContentModules();
});
