/**
 * RELAY — Application Entry & Interactive Navigation Controller
 * Initializes the persistent product interface, scroll choreography,
 * accessible mobile navigation with full focus trap & background scroll lock,
 * scenario tabs, and interactive workspace sandbox mode.
 */

import { ConnectorEngine } from './connectors.js?v=2';
import { WorkflowController } from './workflow.js?v=2';
import { MotionController } from './motion.js?v=2';
import { SCENE_ANCHORS } from './scenes.js?v=2';

function initApp() {
  const shellEl = document.getElementById('relay-shell');
  const svgEl = document.getElementById('connector-svg');
  const boardEl = document.getElementById('canvas-board');

  if (!shellEl || !svgEl || !boardEl) return;

  const connectors = new ConnectorEngine(svgEl, boardEl);
  const workflow = new WorkflowController(shellEl, connectors);
  const motion = new MotionController(workflow, connectors);

  motion.init();

  // --- Mobile Drawer Navigation + Full Keyboard Focus Trap + Scroll Lock ---
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const headerEl = document.getElementById('site-header');
  const mainEl = document.getElementById('main-content');
  const footerEl = document.getElementById('site-footer');
  let savedScrollY = 0;
  let lastTriggerEl = null;

  function getDrawerFocusables() {
    if (!mobileDrawer) return [];
    return Array.from(
      mobileDrawer.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null);
  }

  function setPageBackgroundInert(flag) {
    if (headerEl) headerEl.inert = flag;
    if (mainEl) mainEl.inert = flag;
    if (footerEl) footerEl.inert = flag;
  }

  function openMobileDrawer() {
    if (!mobileDrawer || !menuToggle) return;
    lastTriggerEl = document.activeElement instanceof HTMLElement ? document.activeElement : menuToggle;
    savedScrollY = window.scrollY;
    mobileDrawer.hidden = false;
    document.documentElement.classList.add('is-drawer-open');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
    setPageBackgroundInert(true);
    if (drawerClose) drawerClose.focus();
  }

  function closeMobileDrawer(restoreFocus = false) {
    if (!mobileDrawer || !menuToggle || mobileDrawer.hidden) return;
    mobileDrawer.hidden = true;
    document.documentElement.classList.remove('is-drawer-open');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
    setPageBackgroundInert(false);
    if (window.scrollY !== savedScrollY) {
      window.scrollTo(0, savedScrollY);
    }
    if (restoreFocus) {
      const target = lastTriggerEl && document.contains(lastTriggerEl) ? lastTriggerEl : menuToggle;
      target.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.hidden) {
        openMobileDrawer();
      } else {
        closeMobileDrawer(true);
      }
    });
  }

  if (drawerClose) {
    drawerClose.addEventListener('click', () => closeMobileDrawer(true));
  }

  window.addEventListener('keydown', (e) => {
    if (mobileDrawer && !mobileDrawer.hidden) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMobileDrawer(true);
        return;
      }
      if (e.key === 'Tab') {
        const focusables = getDrawerFocusables();
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && (document.activeElement === first || !mobileDrawer.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !mobileDrawer.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
    }

    if (e.key === 'Escape' && motion.sandboxOpen) {
      closeSandbox();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900 && mobileDrawer && !mobileDrawer.hidden) {
      closeMobileDrawer(false);
    }
  });

  // --- Scene Anchor Links (Header, Mobile Drawer, Rail, Secondary CTA) ---
  const anchorIndexById = new Map(
    SCENE_ANCHORS.map((item, idx) => [`#${item.id}`, idx])
  );

  document.querySelectorAll('a[href^="#scene-"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !anchorIndexById.has(href)) return;
      e.preventDefault();
      closeMobileDrawer(false);
      if (motion.sandboxOpen) closeSandbox();
      motion.scrollToSceneIndex(anchorIndexById.get(href));
    });
  });

  // --- Scenario Switcher Controls (Scene 04) ---
  document.querySelectorAll('[data-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const scenarioId = btn.dataset.scenario;
      if (scenarioId) {
        motion.setManualScenario(scenarioId);
      }
    });
  });

  // --- Interactive Platform Sandbox Mode (Header & Scene 06 Primary CTA) ---
  const sandboxBar = document.getElementById('sandbox-bar');
  const sandboxRunBtn = document.getElementById('sandbox-run-btn');
  const sandboxCloseBtn = document.getElementById('sandbox-close-btn');

  function openSandbox() {
    closeMobileDrawer(false);
    if (!sandboxBar) return;
    sandboxBar.hidden = false;
    motion.setSandboxMode(true);
    if (sandboxCloseBtn) sandboxCloseBtn.focus();
  }

  function closeSandbox() {
    if (!sandboxBar) return;
    sandboxBar.hidden = true;
    motion.setSandboxMode(false);
  }

  document.querySelectorAll('[data-action="open-sandbox"]').forEach((btn) => {
    btn.addEventListener('click', openSandbox);
  });

  if (sandboxCloseBtn) {
    sandboxCloseBtn.addEventListener('click', closeSandbox);
  }

  if (sandboxRunBtn) {
    sandboxRunBtn.addEventListener('click', () => {
      workflow.playManualTestRun();
    });
  }

  document.querySelectorAll('[data-sandbox-scenario]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const scenarioId = btn.dataset.sandboxScenario;
      if (scenarioId) workflow.transitionToScenario(scenarioId, false);
    });
  });
}

try {
  initApp();
} catch (err) {
  // Ensure static fallback remains cleanly readable if script initialization fails
  document.documentElement.classList.remove('has-motion');
  console.error('RELAY initialization fallback:', err);
}
