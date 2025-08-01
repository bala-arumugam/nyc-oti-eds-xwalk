/**
 * Initializes the header interactivity including navigation menus, mobile handling and more
 * @param {Element} header - The header DOM element
 */
function initializeHeaderInteractivity(header) {
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
    // Check if the clicked element has the exitlink class
    if (e.target.classList.contains('exitlink')
        || (e.target.parentNode && e.target.parentNode.classList.contains('exitlink'))) {
      e.preventDefault();

      // Get the href from the clicked link or its parent
      const link = e.target.tagName === 'A' ? e.target : e.target.closest('a');
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

/**
 * Determines if a URL is an NYC government URL or should be treated as internal
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is an NYC government URL or internal link
 */
function isNycGovUrl(url) {
  if (!url || url === '' || url === '#') return true;

  const patterns = [
    /^https?:\/\/.*\.nyc\.gov/i,
    /^https?:\/\/.*\.csc\.nycnet/i,
    /^https?:\/\/.*\.nycid\.nycnet/i,
    /^\//i,
    /^javascript:/i,
    /^#/i,
    /^mailto:/i,
    /^tel:/i,
  ];

  return patterns.some((pattern) => pattern.test(url));
}

/**
 * Helper function to create DOM elements with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Element attributes
 * @param {Array|Node|string} children - Child elements or text content
 * @returns {HTMLElement} - Created DOM element
 */
function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  // Add children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (child !== null && child !== undefined) {
        element.appendChild(document.createTextNode(String(child)));
      }
    });
  } else if (children instanceof Node) {
    element.appendChild(children);
  } else if (children !== null && children !== undefined) {
    element.textContent = String(children);
  }

  return element;
}

/**
 * Creates a header logo band element with specified logo path and text
 * @param {Object} headerData - Header data from AEM experience fragment
 * @returns {HTMLElement} - Logo band DOM element
 */
function createLogoBand(headerData) {
  const logoImg = createElement('img', {
    className: 'nav-logo-img',
    src: headerData.logoPath,
    alt: headerData.logoAltText || 'NYC',
  });

  const logoLink = createElement('a', {
    href: 'https://nycmycity--qa.sandbox.my.site.com/s/', // This should be configurable
    className: 'block-link exitlink',
  }, [logoImg, headerData.logotitle]);

  const navLogo = createElement('div', { className: 'nav-logo' }, [
    logoLink,
    ` ${headerData.logosubtitle}`, // Space before subtitle as in original
  ]);

  const logoBand = createElement('div', { className: 'logo-band' }, [navLogo]);

  return createElement('div', { className: 'logo-band-wrapper' }, [logoBand]);
}

/**
 * Creates a submenu item for navigation
 * @param {Object} menuItem - Menu item data
 * @param {boolean} isSimplified - Whether this is for a simplified text list menu
 * @returns {HTMLElement} - Submenu item element
 */

/**
 * Creates a submenu for navigation
 * @param {Object} navItem - Navigation item data
 * @param {boolean} isMobile - Whether this is for mobile menu
 * @returns {HTMLElement} - Submenu nav element
 */
function createSubmenu(navItem, isMobile = false) {
  const submenu = document.createElement('nav');

  // Map menu IDs to control names exactly as in the Java backend
  // This ensures submenu IDs match what's in Dev.html (e.g., "business-services-submenu")
  let controlId;
  switch (navItem.id) {
    case 'menu-1':
      controlId = 'resources-by-industry';
      break;
    case 'menu-2':
      controlId = 'business-services';
      break;
    case 'menu-3':
      controlId = 'emergency-preparedness';
      break;
    case 'menu-4':
      controlId = 'regulations';
      break;
    case 'menu-5':
      controlId = 'tools';
      break;
    default:
      controlId = navItem.control || navItem.id.replace('menu-', '');
  }

  // Set ID using the control ID (like "business-services-submenu") to match the Thymeleaf template
  submenu.id = `${controlId}-submenu`;
  submenu.setAttribute('role', 'presentation');
  submenu.setAttribute('data-submenu-for', navItem.id);

  // Add appropriate classes based on menu type (matching the Thymeleaf template structure)
  // Calculate numberOfRows using the same formula as in Java: ceil(menuItems.size() / 2.0)
  const itemCount = navItem.menuItems ? navItem.menuItems.length : 0;
  const numberOfRows = navItem.numberOfRows || Math.ceil(itemCount / 2.0);

  // Set submenu classes based on specific menu IDs to match the structure in Dev.html
  if (isMobile) {
    submenu.className = `nav-submenu nav-submenu-text-list nav-submenu-text-${numberOfRows}-row-list`;
  } else {
    // Match exactly with what's in Dev.html based on menu ID
    switch (navItem.id) {
      case 'menu-1': // Resources by Industry
        // Resources by Industry always uses text list with 9 rows
        submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-9-row-list';
        break;
      case 'menu-2': // Business Services
        // Business Services always uses text list with 5 rows
        submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-5-row-list';
        break;
      case 'menu-3': // Emergency Preparedness
        // Emergency Preparedness uses either text list or graphical based on context
        // In Dev.html, it appears as a text list in mobile menu but graphical in desktop
        if (navItem.simplify) {
          submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-2-row-list';
        } else {
          submenu.className = 'nav-submenu nav-submenu-graphical-list';
        }
        break;
      case 'menu-4': // Regulations
        // Regulations always uses graphical list in Dev.html
        submenu.className = 'nav-submenu nav-submenu-graphical-list';
        break;
      case 'menu-5': // Tools
        // Tools uses either text list or graphical based on context
        if (navItem.simplify) {
          submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-2-row-list';
        } else {
          submenu.className = 'nav-submenu nav-submenu-graphical-list';
        }
        break;
      default:
        // For other menu items, use the simplified or graphical class based on navItem.simplify
        if (navItem.simplify) {
          submenu.className = `nav-submenu nav-submenu-text-list nav-submenu-text-${numberOfRows}-row-list`;
        } else {
          submenu.className = 'nav-submenu nav-submenu-graphical-list';
        }
    }
  }

  // Add back button for mobile navigation (used in mobile menu back navigation)
  const backButton = document.createElement('a');
  backButton.href = '#';
  backButton.className = 'sub-menu-back hidden-text';
  backButton.setAttribute('data-menu-id', 'mobile-menu');
  backButton.setAttribute('aria-controls', 'mobile-menu-submenu');

  const backSpan = document.createElement('span');
  backSpan.textContent = 'Back to Main Menu';
  backButton.appendChild(backSpan);
  submenu.appendChild(backButton);

  // Add title
  const title = document.createElement('h2');
  title.className = 'nav-submenu-title';
  title.textContent = navItem.title;
  submenu.appendChild(title);

  // Add close button
  const closeButton = document.createElement('a');
  closeButton.href = '#';
  closeButton.className = 'sub-menu-close hidden-text';
  closeButton.setAttribute('data-menu-close', '');

  const closeSpan = document.createElement('span');
  closeSpan.textContent = 'Close Menu';
  closeButton.appendChild(closeSpan);
  submenu.appendChild(closeButton);

  // Create items list
  const itemsList = document.createElement('ul');
  itemsList.className = 'clean-list nav-submenu-items';

  // Add menu items if they exist
  if (navItem.menuItems && navItem.menuItems.length) {
    navItem.menuItems.forEach((menuItem) => {
      // Handle empty menu items (placeholder items in the grid)
      if (menuItem.empty) {
        const emptyLi = document.createElement('li');
        itemsList.appendChild(emptyLi);
        return;
      }

      const li = document.createElement('li');

      // For all menu items in text list mode, use a simplified structure with just a link
      // For graphical mode, use a more complex structure with images, headings and descriptions
      if (isMobile || navItem.simplify || submenu.className.includes('nav-submenu-text-list')) {
        // Create simplified link structure for text list menus (matches flyout-content.html)
        const blockLink = document.createElement('div');
        blockLink.className = 'block-link';

        const link = document.createElement('a');
        link.href = menuItem.link;
        link.className = 'simplified-header-text';
        link.textContent = menuItem.title;

        // Add exitlink class if external link
        if (!isNycGovUrl(menuItem.link)) {
          link.classList.add('exitlink');
        }

        blockLink.appendChild(link);
        li.appendChild(blockLink);
      } else {
        // Create graphical link structure for graphical menus (matches flyout-content.html)
        const blockLink = document.createElement('div');
        blockLink.className = 'block-link';

        const img = document.createElement('img');
        img.src = menuItem.iconPath || '/content/dam/mycity/business/en/icons/blue-icons/default.png';
        img.alt = menuItem.iconAlt || '';
        img.setAttribute('aria-hidden', 'true');
        blockLink.appendChild(img);

        const heading = document.createElement('h3');
        heading.className = 'nav-submenu-item-heading';
        heading.textContent = menuItem.title;
        blockLink.appendChild(heading);

        if (menuItem.description) {
          const desc = document.createElement('p');
          desc.className = 'ui-content-small';
          desc.textContent = menuItem.description;
          blockLink.appendChild(desc);
        }

        const ctaLink = document.createElement('a');
        ctaLink.href = menuItem.link;
        ctaLink.className = 'ui-content-small nav-submenu-item-faux-link-styled';
        ctaLink.setAttribute('aria-label', `View More ${menuItem.title}`);
        ctaLink.textContent = menuItem.cta || 'View Details';

        // Add exitlink class if external link
        if (!isNycGovUrl(menuItem.link)) {
          ctaLink.classList.add('exitlink');
        }

        blockLink.appendChild(ctaLink);
        li.appendChild(blockLink);
      }

      itemsList.appendChild(li);
    });
  }

  submenu.appendChild(itemsList);
  return submenu;
}

/**
 * Creates the mobile menu button and submenu
 * @returns {HTMLElement} - Mobile menu button list item
 */
function createMobileMenuButton() {
  const li = document.createElement('li');
  li.className = 'nav-icon nav-mobile-menu';

  const link = document.createElement('a');
  link.href = '#';
  link.className = 'block-link hidden-text';
  link.setAttribute('data-menu-id', 'mobile-menu');
  link.setAttribute('aria-expanded', 'false');
  link.setAttribute('aria-controls', 'mobile-menu-submenu');

  const span = document.createElement('span');
  span.textContent = 'Open Menu';
  link.appendChild(span);
  li.appendChild(link);

  // Create mobile menu container - matching the Thymeleaf template structure
  const mobileMenu = document.createElement('nav');
  mobileMenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-mobile';
  mobileMenu.setAttribute('data-submenu-for', 'mobile-menu');
  mobileMenu.id = 'mobile-menu-submenu';
  mobileMenu.setAttribute('role', 'presentation');

  const title = document.createElement('h2');
  title.className = 'nav-submenu-title';
  title.textContent = 'Menu';
  mobileMenu.appendChild(title);

  const closeButton = document.createElement('a');
  closeButton.href = '#';
  closeButton.className = 'sub-menu-close hidden-text';
  closeButton.setAttribute('data-menu-close', '');

  const closeSpan = document.createElement('span');
  closeSpan.textContent = 'Close Menu';
  closeButton.appendChild(closeSpan);
  mobileMenu.appendChild(closeButton);

  const submenuMain = document.createElement('div');
  submenuMain.className = 'nav-submenu-main';

  // Create menu items list
  const menuList = document.createElement('ul');
  menuList.className = 'clean-list nav-submenu-items';
  menuList.setAttribute('role', 'menu');

  submenuMain.appendChild(menuList);
  mobileMenu.appendChild(submenuMain);

  // Add account options section for logged-in users
  // This matches the structure from mobile-menu.html
  // (th:if="${not #strings.isEmpty(#vars.session.userGUID)}")
  const isUserLoggedIn = window.digitalData
                         && window.digitalData.user
                         && window.digitalData.user.userGUID;

  if (isUserLoggedIn) {
    const accountOptionsWrapper = document.createElement('div');

    const accountOptionsDiv = document.createElement('div');
    accountOptionsDiv.className = 'top-nav-account-options';

    // Create Manage Account button - matches: th:href="${profiletarget}"
    const manageAccountLink = document.createElement('a');
    manageAccountLink.href = window.digitalData?.profiletarget || '/profile';
    manageAccountLink.className = 'nycb-button nycb-btn-profile content-regular account-options-text manage-account-text';
    manageAccountLink.title = 'Manage Account';
    manageAccountLink.textContent = 'Manage Account';
    accountOptionsDiv.appendChild(manageAccountLink);

    // Create Log Out form and button - matches: th:action="${logouttarget}" method="POST"
    const logoutForm = document.createElement('form');
    logoutForm.action = window.digitalData?.logouttarget || '/logout';
    logoutForm.method = 'POST';

    // Add CSRF token if available
    if (window.digitalData && window.digitalData.csrf) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = window.digitalData.csrf.parameterName;
      csrfInput.value = window.digitalData.csrf.token;
      logoutForm.appendChild(csrfInput);
    }

    // Add logout button
    const logoutButton = document.createElement('a');
    logoutButton.href = '#';
    logoutButton.className = 'content-regular account-options-text logout-text log-out-button';
    logoutButton.title = 'Log Out';
    logoutButton.textContent = 'Log Out';
    logoutForm.appendChild(logoutButton);

    accountOptionsDiv.appendChild(logoutForm);
    accountOptionsWrapper.appendChild(accountOptionsDiv);
    mobileMenu.appendChild(accountOptionsWrapper);
  }

  li.appendChild(mobileMenu);

  return {
    menuButton: li,
    menuList,
  };
}

/**
 * Creates a navigation item
 * @param {Object} navItem - Navigation item data
 * @param {boolean} isMobile - Whether this is for mobile menu
 * @returns {HTMLElement} - Navigation list item
 */
function createNavItem(navItem, isMobile = false) {
  const li = document.createElement('li');
  li.className = 'nav-link';

  const link = document.createElement('a');
  // Set appropriate href based on the navigation item
  const href = navItem.id && navItem.id !== 'menu-6' ? '#' : '/nycbusiness/mydashboard';
  link.href = href;

  // Set appropriate classes
  link.className = 'block-link';
  // Add exitlink class if it's an external link
  if (!isNycGovUrl(href) && href !== '#') {
    link.classList.add('exitlink');
  }

  link.textContent = navItem.title;

  if (navItem.id && navItem.id !== 'menu-6') {
    // Map menu IDs to control names for aria-controls to match Dev.html
    let controlId;
    switch (navItem.id) {
      case 'menu-1':
        controlId = 'resources-by-industry';
        break;
      case 'menu-2':
        controlId = 'business-services';
        break;
      case 'menu-3':
        controlId = 'emergency-preparedness';
        break;
      case 'menu-4':
        controlId = 'regulations';
        break;
      case 'menu-5':
        controlId = 'tools';
        break;
      default:
        controlId = navItem.control || navItem.id.replace('menu-', '');
    }
    const submenuId = `${controlId}-submenu`;

    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', submenuId);
    link.setAttribute('data-menu-id', navItem.id);

    li.appendChild(link);

    if (navItem.menuItems && navItem.menuItems.length) {
      // Create submenu with appropriate structure based on mobile flag
      li.appendChild(createSubmenu({ ...navItem, simplify: isMobile }, isMobile));
    }
  } else {
    // Special case for dashboard link
    li.appendChild(link);
  }

  return li;
}

/**
 * Creates an icon link item for navigation
 * @param {string} iconPath - Path to icon image
 * @param {string} altText - Alt text for the icon
 * @param {string} href - Link URL
 * @returns {HTMLElement} - Icon link list item
 */
function createIconLink(iconPath, altText, href) {
  const isExternal = !isNycGovUrl(href);
  const linkClass = `block-link hidden-text my-city-link${isExternal ? ' exitlink' : ''}`;

  const img = createElement('img', { src: iconPath, alt: altText || '' });
  const link = createElement('a', { href, className: linkClass }, [img]);

  return createElement('li', { className: 'nav-icon-link' }, [link]);
}

/**
 * Creates the language toggle section
 * @returns {HTMLElement} - Language toggle div
 */
function createLanguageToggle() {
  const langToggleWrap = document.createElement('div');
  langToggleWrap.className = 'language-toggle-wrap';

  const langToggle = document.createElement('div');
  langToggle.className = 'language-toggle';

  const langSelector = document.createElement('div');
  langSelector.id = 'language-selector';
  langSelector.className = 'language-selector OneLinkNoTx';

  const langLabel = document.createElement('label');
  langLabel.setAttribute('for', 'OLJSLanguageSelector');
  langLabel.setAttribute('lang', 'en');
  langLabel.className = 'language-header translate-icon';
  langLabel.textContent = 'Language';

  const langSelectorBox = document.createElement('div');
  langSelectorBox.className = 'language-selector-box menu-button-actions';

  langSelector.appendChild(langLabel);
  langSelector.appendChild(langSelectorBox);
  langToggle.appendChild(langSelector);
  langToggleWrap.appendChild(langToggle);

  return langToggleWrap;
}

/**
 * Fetches header data from AEM experience fragment Sling Model JSON endpoint
 * @returns {Promise<Object>} The header data
 */
// Use an AbortController to limit fetch time
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

async function fetchHeaderData() {
  try {
    // Cache the response in sessionStorage to avoid repeated fetches
    const cachedData = sessionStorage.getItem('nycHeaderData');
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Fetch the JSON from the absolute path to the experience fragment with timeout
    const response = await fetchWithTimeout(
      'https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/content/experience-fragments/mycity/us/en/business/global/header/master.model.json',
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch header data: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Extract header component data using optional chaining
    const headerComponent = data[':items']?.root?.[':items']?.header || {};

    // Process navigationItems if they exist
    let navigationItems = [];
    if (headerComponent.navigationItems && headerComponent.navigationItems.length > 0) {
      // Filter out empty navigation items (those without a title)
      navigationItems = headerComponent.navigationItems
        .filter((item) => item && (item.title || (item[':type'] === 'mycity/components/business/datacomponents/navigation' && item.id)))
        .map((item, index) => {
          // Convert menu ids from menu-item-# to menu-# format if needed
          const id = item.id || `menu-${index + 1}`;

          // Calculate control and number of rows for templates
          let control = '';
          let numberOfRows = 3;

          // Match control ids with the ones in Thymeleaf templates
          switch (index) {
            case 0:
              control = 'resources-by-industry';
              numberOfRows = 9;
              break;
            case 1:
              control = 'business-services';
              numberOfRows = 5;
              break;
            case 2:
              control = 'emergency-preparedness';
              numberOfRows = 3;
              break;
            case 3:
              control = 'regulations';
              numberOfRows = 3;
              break;
            case 4:
              control = 'tools';
              numberOfRows = 3;
              break;
            default:
              control = id.replace('menu-', 'item-');
              break;
          }

          // Process menu items to ensure they have all needed properties
          const menuItems = (item.menuItems || []).map((menuItem) => ({
            ...menuItem,
            title: menuItem.title || '',
            link: menuItem.link || '#',
            description: menuItem.description || '',
            cta: menuItem.cta || 'View Details',
            iconPath: menuItem.iconPath || '',
            iconAlt: menuItem.iconAlt || '',
          }));

          return {
            ...item,
            id,
            title: item.title || '',
            link: item.link || '#',
            menuItems,
            control,
            numberOfRows,
          };
        });
    }

    const headerResult = {
      logoPath: headerComponent.logoPath || '/nycbusiness/static/img/reskin/NYC-logo-white.svg',
      logotitle: headerComponent.logotitle || 'MyCity',
      logosubtitle: headerComponent.logosubtitle || 'Official website of the City of New York',
      logoAltText: headerComponent.logoAltText || 'NYC White Logo',
      logoDecorative: headerComponent.logoDecorative || false,
      portaltitle: headerComponent.portaltitle || 'Business',
      searchIconPath: headerComponent.searchIconPath || 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png',
      searchIconAltText: headerComponent.searchIconAltText || 'Search',
      profileIconPath: headerComponent.profileIconPath || 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png',
      profileIconAltText: headerComponent.profileIconAltText || 'Click here to view dashboard',
      helpIconPath: headerComponent.helpIconPath || '',
      helpIconAltText: headerComponent.helpIconAltText || 'Help Icon',
      helpIconLink: headerComponent.helpIconLink || '/nycbusiness/global/mycity-business-faq',
      navigationItems,
    };

    // Cache the result in sessionStorage for future use
    try {
      sessionStorage.setItem('nycHeaderData', JSON.stringify(headerResult));
    } catch (cacheErr) {
      // Ignore storage errors - they shouldn't stop the app from working
      console.warn('Could not cache header data in sessionStorage');
    }

    return headerResult;
  } catch (error) {
    // Log error but suppress in production
    // Return default data in case of error
    return {
      logoPath: '/nycbusiness/static/img/reskin/NYC-logo-white.svg',
      logotitle: 'MyCity',
      logosubtitle: 'Official website of the City of New York',
      logoAltText: 'NYC White Logo',
      logoDecorative: false,
      portaltitle: 'Business',
      searchIconPath: 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png',
      searchIconAltText: 'Search',
      profileIconPath: 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png',
      profileIconAltText: 'Click here to view dashboard',
      helpIconPath: '',
      helpIconAltText: 'Help Icon',
      helpIconLink: '/nycbusiness/global/mycity-business-faq',
      navigationItems: [
        {
          id: 'menu-1', title: 'Resources by Industry', link: '#', menuItems: [],
        },
        {
          id: 'menu-2', title: 'Business Services', link: '#', menuItems: [],
        },
        {
          id: 'menu-3', title: 'Emergency Preparedness', link: '#', menuItems: [],
        },
        {
          id: 'menu-4', title: 'Regulations', link: '#', menuItems: [],
        },
        {
          id: 'menu-5', title: 'Tools', link: '#', menuItems: [],
        },
      ],
    };
  }
}
/**
 * Loads and decorates the header block
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Clear existing content
  block.textContent = '';

  // Get header data from digitalData if available or fetch from AEM
  let headerData = {};

  if (window.digitalData && window.digitalData.header) {
    headerData = window.digitalData.header;
  } else {
    headerData = await fetchHeaderData();
  }

  // 1. Create skip-to-main link
  const skipLink = createElement('a', {
    className: 'skip-main',
    href: '#main',
    textContent: 'Skip to main content',
  });
  block.appendChild(skipLink);

  // 2. Create header element
  const header = createElement('header');

  // 3. Create logo band
  const logoBand = createLogoBand(headerData);
  header.appendChild(logoBand);

  // 4. Create main navigation
  const nav = createElement('nav');
  const navList = createElement('ul', { className: 'clean-list main-nav-desktop' });

  // 4.1 Add business tag line
  const tagLink = createElement('a', {
    href: '/nycbusiness/',
    className: 'block-link',
    textContent: headerData.portaltitle,
  });

  const tagLine = createElement('li', { className: 'nav-tag-line' }, [tagLink]);
  navList.appendChild(tagLine);

  // 4.2 Add mobile menu button and container
  const { menuButton, menuList } = createMobileMenuButton();
  navList.appendChild(menuButton);

  // 4.3 Add navigation items
  // Loop through first 5 navigation items
  const maxNavItems = 5;
  for (let i = 0; i < Math.min(maxNavItems, headerData.navigationItems.length); i += 1) {
    const navItem = headerData.navigationItems[i];

    // Use the correct menu ID format
    if (navItem.id && navItem.id.startsWith('menu-item-')) {
      navItem.id = navItem.id.replace('menu-item-', 'menu-');
    }

    // Add control attribute for flyout content matching
    if (!navItem.control) {
      // Create control ids matching the Thymeleaf template naming
      switch (navItem.id) {
        case 'menu-1':
          navItem.control = 'resources-by-industry';
          break;
        case 'menu-2':
          navItem.control = 'business-services';
          break;
        case 'menu-3':
          navItem.control = 'emergency-preparedness';
          break;
        case 'menu-4':
          navItem.control = 'regulations';
          break;
        case 'menu-5':
          navItem.control = 'tools';
          break;
        default:
          navItem.control = navItem.id.replace('menu-', 'item-');
          break;
      }
    }

    // Create nav item for desktop menu
    const navLi = createNavItem(navItem);
    navList.appendChild(navLi);

    // Also create a copy for mobile menu
    if (navItem.id !== 'menu-6') {
      // Create a list item with flyout content structure
      // This matches the structure in mobile-menu.html with th:replace template
      // for flyout-content with index, menu, and simplify parameters
      const flyoutLi = document.createElement('li');

      // Create the flyout link - similar to what would be in flyout-content
      const flyoutLink = document.createElement('a');
      flyoutLink.href = '#';
      flyoutLink.className = 'block-link';
      flyoutLink.textContent = navItem.title;

      // Set attributes for flyout behavior (similar to what's in mobile-menu's submenu links)
      flyoutLink.setAttribute('data-menu-id', navItem.id);

      // Add appropriate attributes to match Thymeleaf template
      const menuIndex = parseInt(navItem.id.replace('menu-', ''), 10);
      if (menuIndex >= 1 && menuIndex <= 5) {
        const controlMap = {
          1: 'resources-by-industry',
          2: 'business-services',
          3: 'emergency-preparedness',
          4: 'regulations',
          5: 'tools',
        };
        const controlId = controlMap[menuIndex];
        flyoutLink.setAttribute('aria-expanded', 'false');
        flyoutLink.setAttribute('aria-controls', `${controlId}-submenu`);
      }

      flyoutLi.appendChild(flyoutLink);
      menuList.appendChild(flyoutLi);
    }
  }

  // Add the dashboard menu item to desktop menu (as shown in Dev.html)
  const dashboardLi = document.createElement('li');
  dashboardLi.className = 'nav-link';

  const dashboardLink = document.createElement('a');
  dashboardLink.href = '/nycbusiness/mydashboard';
  dashboardLink.className = 'block-link';
  dashboardLink.textContent = 'My Business Dashboard';

  dashboardLi.appendChild(dashboardLink);
  navList.appendChild(dashboardLi);

  // Add dashboard link to mobile menu too
  const mobileDashboardLi = document.createElement('li');
  const mobileDashboardLink = document.createElement('a');
  mobileDashboardLink.href = '/nycbusiness/mydashboard';
  mobileDashboardLink.className = 'block-link';
  mobileDashboardLink.textContent = 'My Business Dashboard';
  mobileDashboardLi.appendChild(mobileDashboardLink);
  menuList.appendChild(mobileDashboardLi);

  // 4.4 Add icon links
  // Search icon
  navList.appendChild(
    createIconLink(
      headerData.searchIconPath,
      headerData.searchIconAltText,
      'https://www.nyc.gov/home/search/index.page?search-terms=&sitesearch=https:%2f%2fnyc-business.nyc.gov%2fnycbusiness',
    ),
  );

  // Help icon
  navList.appendChild(
    createIconLink(
      headerData.helpIconPath,
      headerData.helpIconAltText,
      headerData.helpIconLink,
    ),
  );

  // Profile icon
  navList.appendChild(
    createIconLink(
      headerData.profileIconPath,
      headerData.profileIconAltText,
      'https://mycity-cs-dev-origin.nyc.gov/login?language=en&amp;redirectURL=https%3A%2F%2Fbusiness-dev.csc.nycnet%2Fnycbusiness%2Flogin%3FreturnPage%3Dhowtoguide%3FreturnFrom%3Dlogin',
    ),
  );

  nav.appendChild(navList);
  header.appendChild(nav);

  // 5. Create language toggle
  const languageToggle = createLanguageToggle();
  header.appendChild(languageToggle);

  // Add complete header to block
  block.appendChild(header);

  // 6. Initialize header interactivity
  initializeHeaderInteractivity(header);

  // --- Inject #cboxOverlay for top-nav/modal compatibility (matches default-layout.html) ---
  if (!document.getElementById('cbox-overlay')) {
    const cboxOverlay = document.createElement('div');
    cboxOverlay.id = 'cbox-overlay';
    cboxOverlay.style.display = 'none';
    document.body.appendChild(cboxOverlay);
  }

  // --- Add handler to show external-link-modal-template on .block-link.exitlink click ---
  // Use Colorbox-style structure for modal popup (from popUp.html)
  function handleExitLinkClick(e) {
    if (!document.getElementById('material-symbols-font')) {
      const link = document.createElement('link');
      link.id = 'material-symbols-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
      document.head.appendChild(link);
    }
    // Only handle left-clicks and keyboard Enter
    if ((e.type === 'click' && e.button !== 0) || (e.type === 'keydown' && e.key !== 'Enter')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const link = e.currentTarget;
    const href = link.getAttribute('href');
    if (!href || href === '#' || href === '') return;

    // Remove any existing modal
    let colorbox = document.getElementById('colorbox');
    let cboxOverlay = document.getElementById('cbox-overlay');
    if (colorbox) colorbox.remove();
    if (cboxOverlay) cboxOverlay.style.display = 'block';
    else {
      cboxOverlay = document.createElement('div');
      cboxOverlay.id = 'cbox-overlay';
      cboxOverlay.style.display = 'block';
      cboxOverlay.style.position = 'fixed';
      cboxOverlay.style.top = '0';
      cboxOverlay.style.left = '0';
      cboxOverlay.style.width = '100vw';
      cboxOverlay.style.height = '100vh';
      cboxOverlay.style.background = 'rgba(0,0,0,0.5)';
      cboxOverlay.style.zIndex = '9998';
      document.body.appendChild(cboxOverlay);
    }

    // Build Colorbox modal structure
    colorbox = document.createElement('div');
    colorbox.id = 'colorbox';
    colorbox.setAttribute('role', 'dialog');
    colorbox.setAttribute('tabindex', '-1');
    colorbox.style.display = 'block';
    colorbox.style.position = 'fixed';
    colorbox.style.width = '611px';
    colorbox.style.height = '534px';
    colorbox.style.left = '50%';
    colorbox.style.top = '50%';
    colorbox.style.transform = 'translate(-50%, -50%)';
    colorbox.style.overflow = 'hidden';
    colorbox.style.zIndex = '10000';

    colorbox.innerHTML = `
      <div id="cbox-wrapper" style="height: 534px; width: 611px">
        <div>
          <div id="cbox-top-left" style="float: left"></div>
          <div id="cbox-top-center" style="float: left; width: 611px"></div>
          <div id="cbox-top-right" style="float: left"></div>
        </div>
        <div style="clear: left">
          <div id="cbox-middle-left" style="float: left; height: 534px"></div>
          <div id="cbox-content" style="float: left; width: 611px; height: 534px">
            <div id="cbox-loaded-content" style="width: 531px; overflow: hidden; height: 454px">
              <div class="modal external-link-modal content-block">
                <div class="external-link-modal-header">
                  <div class="logo-container">
                    <img src="https://business-dev.csc.nycnet/nycbusiness/static/img/nyc-logo.svg" class="external-link-modal-logo" alt="NYC Logo">
                    <span>®</span>
                  </div>
                  <a id="external-link-modal-close" href="#" class="external-link-modal-close"></a>
                </div>
                <div class="external-link-modal-body">
                  <h4 class="external-link-modal-title">
                    You are leaving the City of New York’s website
                  </h4>
                  <p class="external-link-modal-description">
                    The city of New York does not imply approval of the listed destinations, warrant the accuracy of
                    any information set out in those destinations, or endorse any opinions expressed therein or any
                    goods or services offered thereby. Like NYC.gov, all other web sites operate under the auspices
                    and at that direction of their respective owners who should be contacted directly with questions
                    regarding the content of these sites.
                  </p>
                  <p class="external-link-modal-page-name">
                    Do you want to go to <b><span id="domainSpan"></span></b>
                  </p>
                </div>
                <div class="external-link-modal-footer">
                  <button id="external-link-modal-cancel" class="button-secondary">Cancel</button>
                  <button id="external-link-modal-submit" class="button external-link-button">Proceed to external link</button>
                </div>
              </div>
            </div>
            <div id="cboxTitle" style="float: left; display: block"></div>
            <div id="cboxCurrent" style="float: left; display: none"></div>
            <button type="button" id="cboxPrevious" style="display: none"></button>
            <button type="button" id="cboxNext" style="display: none"></button>
            <button type="button" id="cboxSlideshow" style="display: none"></button>
            <div id="cboxLoadingOverlay" style="float: left; display: none"></div>
            <div id="cboxLoadingGraphic" style="float: left; display: none"></div>
          </div>
          <div id="cbox-middle-right" style="float: left; height: 534px"></div>
        </div>
        <div style="clear: left">
          <div id="cbox-bottom-left" style="float: left"></div>
          <div id="cbox-bottom-center" style="float: left; width: 611px"></div>
          <div id="cbox-bottom-right" style="float: left"></div>
        </div>
      </div>
      <div style="position: absolute; width: 9999px; visibility: hidden; max-width: none; display: none;"></div>
    `;
    document.body.appendChild(colorbox);

    // Set domainSpan text
    try {
      const urlObj = new URL(href, window.location.origin);
      const domain = urlObj.hostname;
      const domainSpan = colorbox.querySelector('#domainSpan');
      if (domainSpan) domainSpan.textContent = domain;
    } catch (err) {
      // Silently handle errors during overlay cleanup
    }

    // Close modal and overlay on cancel or close button
    const closeModal = () => {
      if (colorbox) colorbox.remove();
      if (cboxOverlay) cboxOverlay.style.display = 'none';
      document.body.style.overflow = '';
    };
    const cancelBtn = colorbox.querySelector('#external-link-modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        closeModal();
      });
    }
    const closeBtn = colorbox.querySelector('#external-link-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        closeModal();
      });
    }
    // Proceed to external link
    const submitBtn = colorbox.querySelector('#external-link-modal-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        window.location = href;
        closeModal();
      });
    }
    // Trap focus inside modal
    setTimeout(() => {
      const focusable = colorbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();
    }, 0);
    // Prevent background scroll
    document.body.style.overflow = 'hidden';
  }

  // Attach handler to all current and future .block-link.exitlink anchors using capture phase
  function attachExitLinkHandlers() {
    document.querySelectorAll('a.block-link.exitlink').forEach((link) => {
      link.removeEventListener('click', handleExitLinkClick, true);
      link.removeEventListener('keydown', handleExitLinkClick, true);
      link.addEventListener('click', handleExitLinkClick, true);
      link.addEventListener('keydown', handleExitLinkClick, true);
    });
  }
  // Initial attach
  attachExitLinkHandlers();
  // Re-attach on DOM changes (for SPA navigation)
  const observer = new MutationObserver(attachExitLinkHandlers);
  observer.observe(document.body, { childList: true, subtree: true });

  // --- Inject header-nav-bindings.js with nonce and log-out-button handler ---
  // 1. Inject script with nonce and header-nav-bindings.js source
  const headerNavScriptId = 'header-nav-bindings-nonce';
  if (!document.getElementById(headerNavScriptId)) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/nycbusiness/static/js/header-nav-bindings.js';
    script.id = headerNavScriptId;
    script.setAttribute('nonce', 'hFwe9v/SC1WVWGIlfr8xQg==');
    document.body.appendChild(script);
  }

  // 2. Inject inline script for log-out-button handler (with nonce)
  const logoutHandlerScriptId = 'logout-handler-nonce';
  if (!document.getElementById(logoutHandlerScriptId)) {
    const inlineScript = document.createElement('script');
    inlineScript.type = 'text/javascript';
    inlineScript.id = logoutHandlerScriptId;
    inlineScript.setAttribute('nonce', 'hFwe9v/SC1WVWGIlfr8xQg==');
    inlineScript.text = `
      var elements = document.querySelectorAll('.log-out-button');
      for (var i = 0; i < elements.length;  i++){
        elements[i].onclick = function(event) { event.preventDefault();this.closest('form').submit(); };
      }
    `;
    document.body.appendChild(inlineScript);
  }

  // --- Inject modal template and scripts from scripts.html ---
  // 1. Inject external-link-modal-template (Handlebars template)
  if (!document.getElementById('external-link-modal-template')) {
    const modalScript = document.createElement('script');
    modalScript.type = 'text/x-handlebars-template';
    modalScript.id = 'external-link-modal-template';
    modalScript.innerHTML = `
      <div class="modal external-link-modal content-block">
        <div class="external-link-modal-header">
          <div class="logo-container">
            <img src="/nycbusiness/static/img/nyc-logo.svg" class="external-link-modal-logo" alt="NYC Logo">
            <span>®</span>
          </div>
          <a id="external-link-modal-close" href="#" class="external-link-modal-close"></a>
        </div>
        <div class="external-link-modal-body">
          <h4 class="external-link-modal-title">
            You are leaving the City of New York’s website
          </h4>
          <p class="external-link-modal-description">
            The city of New York does not imply approval of the listed destinations, warrant the accuracy of
            any information set out in those destinations, or endorse any opinions expressed therein or any
            goods or services offered thereby. Like NYC.gov, all other web sites operate under the auspices
            and at that direction of their respective owners who should be contacted directly with questions
            regarding the content of these sites.
          </p>
          <p class="external-link-modal-page-name">
            Do you want to go to <b><span id="domainSpan"></span></b>
          </p>
        </div>
        <div class="external-link-modal-footer">
          <button id="external-link-modal-cancel" class="button-secondary">Cancel</button>
          <button id="external-link-modal-submit" class="button external-link-button">Proceed to external link</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalScript);
  }

  // 2. Add log-out-button handler (matches scripts.html inline script)
  setTimeout(() => {
    const elements = document.querySelectorAll('.log-out-button');
    for (let i = 0; i < elements.length; i += 1) {
      elements[i].onclick = (event) => {
        event.preventDefault();
        const form = this.closest('form');
        if (form) form.submit();
      };
    }
  }, 0);

  // 3. Dynamically load key scripts if not already present (Handlebars, Colorbox, etc.)
  function loadScriptOnce(src, id, attrs = {}) {
    if (id && document.getElementById(id)) return;
    if ([...document.scripts].some((s) => s.src && s.src.includes(src))) return;
    const script = document.createElement('script');
    script.src = src;
    if (id) script.id = id;
    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    document.body.appendChild(script);
  }

  // Handlebars
  loadScriptOnce('/static/js/libs/handlebars.js', 'handlebars-lib');
  // jQuery Colorbox
  loadScriptOnce('/static/js/libs/jquery.colorbox-min.js', 'colorbox-lib');
  // Language selector
  loadScriptOnce('/static/js/language-selector.js', 'language-selector-lib');
  // External links
  loadScriptOnce('/static/js/external-links.js', 'external-links-lib');
  // Header nav bindings
  loadScriptOnce('/static/js/header-nav-bindings.js', 'header-nav-bindings-lib');
  // Left nav
  loadScriptOnce('/static/js/left-nav.js', 'left-nav-lib');
  // Account accordion
  loadScriptOnce('/static/js/account-accordion.js', 'account-accordion-lib');
  // Team site accordion
  loadScriptOnce('/static/js/team-site/accordion.js', 'team-site-accordion-lib');
  // Utils
  loadScriptOnce('/static/js/utils.js', 'utils-lib');
  // Webtrends (analytics)
  loadScriptOnce('/assets/home/js/webtrends/webtrends.nycbusiness-load.js', 'webtrends-lib');

  // Transperfect handler (conditionally, if window.useTransperfect is true)
  if (window.useTransperfect) {
    loadScriptOnce('/static/js/transperfect-handler.js', 'transperfect-handler-lib');
  }

  // OneLink (conditionally, if window.isBaseDomain !== undefined && !window.isBaseDomain)
  if (typeof window.isBaseDomain !== 'undefined' && !window.isBaseDomain) {
    loadScriptOnce('https://www.onelink-edge.com/moxie.min.js', 'onelink-lib', {
      referrerpolicy: 'no-referrer-when-downgrade',
      'data-oljs': 'PEFE3-E878-E5CB-F4D9',
    });
  }
}
