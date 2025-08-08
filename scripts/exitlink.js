export default function initializeHeaderInteractivity(header) {
  let activeAssociation = null;
  let zIndexAcc = 900;

  // Helper functions matching header-nav-bindings.js
  const isDesktopBreakPoint = () => window.matchMedia?.('(min-width: 810px)').matches || false;

  const setVisibilityOfElements = (elementList, visibleStyle) => {
    elementList.forEach((el) => {
      if (el.tagName.toLowerCase() === 'header') {
        return;
      }
      el.style.visibility = typeof visibleStyle === 'string' && visibleStyle.toLowerCase() === 'hidden' ? visibleStyle : '';
    });
  };

  const handleTabTrap = (forceRestore) => {
    const trapSelector = 'footer, body > *, header .language-toggle-wrap, header .nav-text-links .nav-icon, header .nav-mobile-menu a[data-menu-id="mobile-menu"], header .logo-band, header .nav-tag-line';
    const hasOpenMenu = header.querySelector('nav').classList.contains('menu-open') || [...header.querySelector('nav').classList].some((cls) => cls.startsWith('submenu::'));
    const elements = [...document.querySelectorAll(trapSelector)];

    if ((hasOpenMenu && !isDesktopBreakPoint()) && !forceRestore) {
      setVisibilityOfElements(elements, 'hidden');
      return;
    }
    setVisibilityOfElements(elements);
  };

  // Function to find all menu links with submenus
  const topNav = header.querySelector('nav');
  const subMenus = Array.from(topNav.querySelectorAll('[data-submenu-for]'));
  const subMenuButton = header.querySelector('.nav-mobile-menu > a');

  // Create map of links with their associated submenus
  const linksWithSubMenus = Array.from(topNav.querySelectorAll('[data-menu-id]')).map((link) => {
    const menuId = link.getAttribute('data-menu-id');

    return {
      revealDelayId: null,
      hideDelayId: null,
      link,
      subMenus: subMenus.filter((menu) => menu.getAttribute('data-submenu-for') === menuId),
    };
  });

  // Find association by link
  const findAssociated = (link) => {
    const target = link.tagName.toUpperCase() === 'A' ? link : link.closest('a');
    return linksWithSubMenus.find((item) => item.link === target) || null;
  };

  const findOpenMenus = () => [...topNav.classList]
    .filter((c) => c.startsWith('submenu::'))
    .map((c) => c.replace(/^submenu::/i, ''));

  // Helper function to cancel timers
  const cancelRevealAndHide = (associated) => {
    if (associated.revealDelayId) {
      cancelAnimationFrame(associated.revealDelayId);
      associated.revealDelayId = null;
    }
    if (associated.hideDelayId) {
      clearTimeout(associated.hideDelayId);
      associated.hideDelayId = null;
    }
  };

  // Show submenu with optional delay
  const showSubmenu = (associated, delayAction, openCallback) => {
    const menuAction = () => {
      if (associated.revealDelayId !== null) {
        clearTimeout(associated.revealDelayId);
        associated.revealDelayId = null;
      }

      const menuId = associated.link.getAttribute('data-menu-id');
      topNav.classList.add(`submenu::${menuId}`);
      associated.subMenus.forEach((m) => {
        m.classList.add('nav-sub-menu-visible');
        m.style.display = 'flex';
        zIndexAcc += 1;
        m.style.zIndex = zIndexAcc;
      });

      associated.link.setAttribute('aria-expanded', 'true');
      if (typeof openCallback === 'function') openCallback(associated);

      if (subMenuButton === associated.link) {
        subMenuButton.setAttribute('aria-expanded', 'true');
      } else if (associated.link.closest('.nav-submenu-mobile')) {
        subMenuButton.setAttribute('aria-expanded', 'false');
      }
    };

    activeAssociation = associated;
    if (delayAction) {
      associated.revealDelayId = requestAnimationFrame(menuAction);
      return;
    }
    menuAction();
  };

  // Hide submenu with optional delay
  const hideSubmenu = (associated, delayAction, closeHandler) => {
    const menuAction = () => {
      if (associated.hideDelayId !== null) {
        clearTimeout(associated.hideDelayId);
        associated.hideDelayId = null;
      }

      const menuId = associated.link.getAttribute('data-menu-id');
      topNav.classList.remove(`submenu::${menuId}`);
      associated.subMenus.forEach((m) => {
        m.classList.remove('nav-sub-menu-visible');
        m.style.display = 'none';
        m.style.zIndex = undefined;
      });

      associated.link.setAttribute('aria-expanded', 'false');
      if (findOpenMenus().length === 0) {
        zIndexAcc = 900;
      }

      if (subMenuButton === associated.link) {
        subMenuButton.setAttribute('aria-expanded', 'false');
      } else if (associated.link.closest('.nav-submenu-mobile')) {
        subMenuButton.setAttribute('aria-expanded', 'true');
      }

      if (typeof closeHandler === 'function') closeHandler(associated);
    };

    if (activeAssociation === associated) {
      activeAssociation = null;
    }

    if (delayAction) {
      associated.hideDelayId = setTimeout(menuAction, 666);
      return;
    }
    menuAction();
  };

  // Mobile menu handler
  const mobileMenuHandler = (ev) => {
    if (ev instanceof KeyboardEvent && ev.key !== 'Enter') {
      return;
    }
    ev.preventDefault();

    const associated = findAssociated(subMenuButton);
    const isMainMenuOpen = topNav.classList.contains('menu-open');

    if (isMainMenuOpen) {
      subMenuButton.setAttribute('aria-expanded', 'false');
      topNav.classList.remove('menu-open');
      document.querySelector('html').classList.remove('lock-scrolling');
      document.body.classList.remove('lock-scrolling');
      hideSubmenu(associated, false);

      // Force restore visibility of all elements
      handleTabTrap(true);
    } else {
      subMenuButton.setAttribute('aria-expanded', 'true');
      topNav.classList.add('menu-open');
      document.querySelector('html').classList.add('lock-scrolling');
      document.body.classList.add('lock-scrolling');
      showSubmenu(associated, false, () => {
        const firstLink = associated.subMenus[0].querySelector('ul.nav-submenu-items li a');
        if (firstLink) firstLink.focus();
      });
      handleTabTrap();
    }
  };

  // Mouse hover handlers
  const linkOverHandler = (ev, openCallback) => {
    // non desktop & mouse over
    if (ev.type === 'mouseover' && !isDesktopBreakPoint()) {
      return;
    }

    const associated = findAssociated(ev.target);
    if (!associated) {
      return;
    }

    // Cancel any existing timers
    cancelRevealAndHide(associated);

    // Close any menus in the process of closing
    linksWithSubMenus.forEach((link) => {
      if (link.hideDelayId) {
        hideSubmenu(link, false);
      }
    });

    showSubmenu(associated, true, openCallback);
  };

  const linkOutHandler = (ev) => {
    // non desktop & mouse out
    if (ev.type === 'mouseout' && !isDesktopBreakPoint()) {
      return;
    }

    const associated = findAssociated(ev.target);
    if (!associated || (ev instanceof KeyboardEvent && ev.key !== 'Tab')) {
      return;
    }

    cancelRevealAndHide(associated);
    hideSubmenu(associated, true);
  };

  const linkClickHandler = (ev, openCallback) => {
    ev.preventDefault();
    const menuIds = findOpenMenus();
    const associated = findAssociated(ev.target);

    // Close other open menus
    linksWithSubMenus.forEach((l) => {
      const isFound = l.subMenus.some((m) => menuIds.includes(m.getAttribute('data-submenu-for')));

      if (isFound && associated !== l && l.link.getAttribute('data-menu-id') !== 'mobile-menu') {
        cancelRevealAndHide(l);
        hideSubmenu(l, false);
      }
    });

    // Special handling for mobile menu
    const openHandler = !menuIds.includes('mobile-menu') ? openCallback : (a) => {
      const findMobileClose = linksWithSubMenus.find((l) => l.link.getAttribute('data-menu-id') === 'mobile-menu');

      if (findMobileClose) {
        cancelRevealAndHide(findMobileClose);
      }

      if (typeof openCallback === 'function') openCallback(a);
    };

    linkOverHandler(ev, openHandler);
  };

  // Keyboard event handlers
  const enterKeyHandler = (ev) => {
    if (ev.key !== 'Enter') {
      return;
    }

    // stop sympathetic click event handler
    ev.preventDefault();

    const eventAssociated = findAssociated(ev.target);
    if (!eventAssociated) return;

    const menuId = eventAssociated.link.getAttribute('data-menu-id');

    if (topNav.classList.contains(`submenu::${menuId}`)) {
      cancelRevealAndHide(eventAssociated);
      hideSubmenu(eventAssociated, false);
      return;
    }

    const thisSubmenu = ev.target.closest('.nav-submenu');
    const thisMenuId = thisSubmenu ? thisSubmenu.getAttribute('data-submenu-for') : null;

    const openHandler = (associated) => {
      const lastSubNav = associated.subMenus.at(-1);
      if (!lastSubNav) {
        return;
      }

      requestAnimationFrame(() => {
        if (thisMenuId && lastSubNav.classList.contains('nav-submenu')) {
          const preferredFocusElement = lastSubNav.querySelector(`ul.nav-submenu-items li a[data-menu-id="${thisMenuId}"]`);
          if (preferredFocusElement) {
            preferredFocusElement.focus();
            return;
          }
        }

        const firstLink = lastSubNav.querySelector('ul.nav-submenu-items li a');
        if (firstLink) firstLink.focus();
      });
    };

    linkClickHandler(ev, openHandler);
  };

  const escapeKeyHandler = (ev) => {
    if (ev.key !== 'Escape' && ev.key !== 'Esc') {
      return;
    }

    // Close expanded menus
    const expandedSubmenus = document.querySelectorAll('[aria-expanded="true"]');
    expandedSubmenus.forEach((submenu) => {
      submenu.setAttribute('aria-expanded', 'false');
      const submenuId = submenu.getAttribute('aria-controls');
      const submenuElement = document.getElementById(submenuId);
      if (submenuElement) {
        submenuElement.style.display = 'none';
      }
    });

    // If we're closing menus, restore visibility of header elements
    if (expandedSubmenus.length > 0) {
      // Reset mobile menu if needed
      if (topNav.classList.contains('menu-open')) {
        topNav.classList.remove('menu-open');
        document.querySelector('html').classList.remove('lock-scrolling');
        document.body.classList.remove('lock-scrolling');
        if (subMenuButton) {
          subMenuButton.setAttribute('aria-expanded', 'false');
        }
      }

      // Force restore visibility
      handleTabTrap(true);
    }

    // Handle active focus within a menu
    if (document.activeElement === document.body) {
      return;
    }

    // Check if the focused element is a focusable element
    const { activeElement } = document;
    if (!activeElement.matches('input[type="button"], input[type="submit"], button, a[href]')) {
      return;
    }

    // Find the associated menu
    const findAssociatedFromChildLink = (link) => {
      const target = link.tagName.toUpperCase() === 'A' ? link : link.closest('a');
      const submenu = target.closest('.nav-submenu');

      if (!submenu) {
        return null;
      }

      // Get the data-submenu-for attribute to find the matching menu item
      const submenuFor = submenu.getAttribute('data-submenu-for');

      return linksWithSubMenus.find((item) => item.link.getAttribute('data-menu-id') === submenuFor
        // If not found, use the desktop check logic
        || (!isDesktopBreakPoint() || !item.link.closest('[data-submenu-for="mobile-menu"]'))) || null;
    };

    const associated = findAssociatedFromChildLink(document.activeElement);
    if (!associated) {
      return;
    }

    if (isDesktopBreakPoint()) {
      hideSubmenu(associated, false);
      associated.link.focus();
      return;
    }

    const isMobileMenu = associated.subMenus[0] === topNav.querySelector('[data-submenu-for="mobile-menu"]');

    if (isMobileMenu) {
      // Close the mobile menu
      const closeButton = associated.subMenus[0].querySelector('[data-menu-close]');
      if (closeButton) closeButton.click();
      return;
    }

    // Handle back navigation in mobile submenus
    const newEventTarget = associated.subMenus[0].querySelector('[data-menu-id="mobile-menu"]');
    if (newEventTarget) {
      // Simulate an Enter key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      newEventTarget.dispatchEvent(enterEvent);
    }
  };

  // Set up event handlers for menu links
  linksWithSubMenus.forEach((item) => {
    if (item.link !== subMenuButton) {
      item.link.addEventListener('mouseover', linkOverHandler);
      item.link.addEventListener('mouseout', linkOutHandler);
      item.link.addEventListener('click', linkClickHandler);
      item.link.addEventListener('keydown', enterKeyHandler);
    }
  });

  // Add mouse enter/leave handlers for submenus
  subMenus.forEach((menu) => {
    menu.addEventListener('mouseenter', (ev) => {
      const menuIds = findOpenMenus();
      if (menuIds.length === 0) return;

      const associated = linksWithSubMenus.find((link) => (link.hideDelayId
        || link.revealDelayId) && link.subMenus.includes(ev.target));

      if (!associated) return;
      cancelRevealAndHide(associated);

      menu.addEventListener('mouseleave', () => {
        hideSubmenu(associated, true);
      }, { once: true });
    });
  });

  // Close button handlers
  const handleCloseButtonClick = (ev) => {
    ev.preventDefault();

    // Close all menus
    linksWithSubMenus.forEach((item) => {
      cancelRevealAndHide(item);
      hideSubmenu(item, false);
    });

    // Reset mobile menu if needed
    if (topNav.classList.contains('menu-open')) {
      topNav.classList.remove('menu-open');
      document.querySelector('html').classList.remove('lock-scrolling');
      document.body.classList.remove('lock-scrolling');
      subMenuButton.setAttribute('aria-expanded', 'false');

      // Force restore visibility of important elements
      handleTabTrap(true);
    }

    zIndexAcc = 900;
  };

  [...topNav.querySelectorAll('[data-menu-close]')].forEach((closeButton) => {
    closeButton.addEventListener('click', handleCloseButtonClick);
  });

  // Mobile menu button handlers
  if (subMenuButton) {
    subMenuButton.addEventListener('keydown', mobileMenuHandler);
    subMenuButton.addEventListener('click', mobileMenuHandler);
  }

  // Global key handlers
  document.addEventListener('keydown', escapeKeyHandler);

  // Window resize handler with debounce
  const debounce = (fn, delay) => {
    let timeoutId;
    return function debounced(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  window.addEventListener('resize', debounce(handleTabTrap, 100));

  // Initialize exitlink functionality similar to external-links.js
  document.addEventListener('click', (e) => {
    // Check if the clicked element has the exitlink class or
    // is a child of an element with exitlink class
    let targetElement = e.target;
    let isExitLink = false;

    // Check if clicked on an exitlink or child of exitlink
    while (targetElement && targetElement !== document.body) {
      if (targetElement.classList && targetElement.classList.contains('exitlink')) {
        isExitLink = true;
        break;
      }
      targetElement = targetElement.parentNode;
    }

    // If it's an exitlink or its descendant
    if (isExitLink) {
      e.preventDefault();

      // Get the href from the clicked link or its parent
      const link = targetElement.tagName === 'A' ? targetElement : targetElement.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');

      // Skip if no href or it's a placeholder
      if (!href || href === '' || href === '#') {
        return;
      }

      // Check if there's a colorbox function available (modal)
      if (typeof window.jQuery !== 'undefined' && typeof window.jQuery.colorbox === 'function') {
        try {
          const domain = new URL(href).hostname;
          const { jQuery } = window;

          jQuery.colorbox({
            onLoad() {
              jQuery('#cbox-close').remove();
            },
            onComplete() {
              jQuery('#domainSpan').text(`${domain}?`);
            },
            transition: 'none',
            fixed: true,
            open: true,
            scrolling: false,
            escKey: false,
            overlayClose: false,
            focus: true,
            html: jQuery('#external-link-modal-template').length && typeof window.Handlebars !== 'undefined'
              ? window.Handlebars.compile(jQuery('#external-link-modal-template').html())({ className: '' })
              : `<div class="external-link-modal">
                  <h2>You are leaving the NYC.gov domain</h2>
                  <p>Are you sure you want to go to <span id="domainSpan">${domain}?</span></p>
                  <div class="button-group">
                    <button id="external-link-modal-submit" class="btn-primary">Yes</button>
                    <button id="external-link-modal-cancel" class="btn-secondary">No</button>
                  </div>
                </div>`,
          });

          // Set up handlers for modal buttons
          // Remove existing handlers first to prevent duplicates
          jQuery(document).off('click', '#external-link-modal-submit');
          jQuery(document).off('click', '#external-link-modal-cancel');

          // Add new handlers
          jQuery(document).on('click', '#external-link-modal-submit', () => {
            window.location = href;
          });

          jQuery(document).on('click', '#external-link-modal-cancel', (event) => {
            event.preventDefault();
            jQuery.colorbox.close();
          });
        } catch (error) {
          // Fallback to direct navigation if modal fails
          window.location = href;
        }
      } else {
        // If colorbox isn't available, just follow the link
        window.location = href;
      }
    }
  });
}
