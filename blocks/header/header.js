// Import the initializeHeaderInteractivity function from exitlink.js
import initializeHeaderInteractivity from '../../scripts/exitlink.js';
import { fetchHeaderData } from '../../scripts/fetchHeader.js';

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
  // Add width and height attributes to prevent layout shifts (improves CLS)
  // Add fetchpriority for critical logo image
  const logoImg = createElement('img', {
    className: 'nav-logo-img',
    src: headerData.logoPath,
    alt: headerData.logoAltText || 'NYC',
    width: '36',
    height: '24',
    fetchpriority: 'high',
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

        // Use lazy loading for submenu images to improve performance
        const img = document.createElement('img');
        img.src = menuItem.iconPath || '/content/dam/mycity/business/en/icons/blue-icons/default.png';
        img.alt = menuItem.iconAlt || '';
        img.setAttribute('aria-hidden', 'true');
        img.loading = 'lazy'; // Add lazy loading for better performance
        img.width = '48'; // Add explicit dimensions to prevent layout shifts
        img.height = '48';
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

  // Add loading="lazy" for non-critical icons to improve performance
  // Add width/height to prevent layout shifts (improves CLS)
  const img = createElement('img', {
    src: iconPath,
    alt: altText || '',
    loading: 'lazy',
    width: '24',
    height: '24',
  });
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
    script.defer = true; // Add defer to improve page load performance
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
  // Optimized script loading function that supports deferring and prioritization
  function loadScriptOnce(src, id, attrs = {}, critical = false) {
    if (id && document.getElementById(id)) return;
    if ([...document.scripts].some((s) => s.src && s.src.includes(src))) return;

    const script = document.createElement('script');
    script.src = src;
    if (id) script.id = id;

    // Add defer by default for non-critical scripts to improve page loading performance
    if (!critical) {
      script.defer = true;
    }

    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    document.body.appendChild(script);
  }

  // Use requestIdleCallback to load non-critical scripts during browser idle time
  // This dramatically improves mobile performance and Lighthouse scores
  window.requestIdleCallback = window.requestIdleCallback || function requestIdleCallback(cb) {
    const start = Date.now();
    return setTimeout(() => {
      cb({
        didTimeout: false,
        timeRemaining: function calculateTimeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

  // Load only critical scripts immediately
  // Header nav bindings is critical for navigation
  loadScriptOnce('/static/js/header-nav-bindings.js', 'header-nav-bindings-lib', {}, true);

  // Defer all non-critical scripts using requestIdleCallback
  window.requestIdleCallback(() => {
    // UI libraries
    loadScriptOnce('/static/js/libs/handlebars.js', 'handlebars-lib');
    loadScriptOnce('/static/js/libs/jquery.colorbox-min.js', 'colorbox-lib');

    // Feature scripts
    loadScriptOnce('/static/js/language-selector.js', 'language-selector-lib');
    loadScriptOnce('/static/js/external-links.js', 'external-links-lib');
    loadScriptOnce('/static/js/left-nav.js', 'left-nav-lib');
    loadScriptOnce('/static/js/account-accordion.js', 'account-accordion-lib');
    loadScriptOnce('/static/js/team-site/accordion.js', 'team-site-accordion-lib');
    loadScriptOnce('/static/js/utils.js', 'utils-lib');

    // Delay analytics loading even further (lowest priority)
    setTimeout(() => {
      loadScriptOnce('/assets/home/js/webtrends/webtrends.nycbusiness-load.js', 'webtrends-lib');
    }, 2000); // Load analytics after initial page render is complete
  }, { timeout: 3000 });

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
