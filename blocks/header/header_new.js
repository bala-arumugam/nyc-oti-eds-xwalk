import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Creates a header logo band element with specified logo path and text
 * @param {Object} headerData - Header data from AEM experience fragment
 * @returns {HTMLElement} - Logo band DOM element
 */
function createLogoBand(headerData) {
  const logoBandWrapper = document.createElement('div');
  logoBandWrapper.className = 'logo-band-wrapper';
  
  const logoBand = document.createElement('div');
  logoBand.className = 'logo-band';
  
  const navLogo = document.createElement('div');
  navLogo.className = 'nav-logo';
  
  // Create logo link
  const logoLink = document.createElement('a');
  logoLink.href = 'https://nycmycity--qa.sandbox.my.site.com/s/'; // You may want to make this configurable
  logoLink.className = 'block-link';
  
  // Create logo image
  const logoImg = document.createElement('img');
  logoImg.src = headerData.logoPath;
  logoImg.className = 'nav-logo-img';
  logoImg.alt = headerData.logoAltText || 'NYC';
  
  // Append logo image and text to link
  logoLink.appendChild(logoImg);
  logoLink.appendChild(document.createTextNode(headerData.logotitle));
  
  // Append link to nav-logo
  navLogo.appendChild(logoLink);
  
  // Add subtitle text
  navLogo.appendChild(document.createTextNode(headerData.logosubtitle));
  
  // Build structure
  logoBand.appendChild(navLogo);
  logoBandWrapper.appendChild(logoBand);
  
  return logoBandWrapper;
}

/**
 * Creates a submenu item
 * @param {Object} menuItem - Menu item data
 * @returns {HTMLElement} - Submenu item element
 */
function createSubmenuItem(menuItem) {
  const li = document.createElement('li');
  
  if (menuItem.empty) {
    return li;
  }
  
  const blockLink = document.createElement('div');
  blockLink.className = 'block-link';
  
  const link = document.createElement('a');
  link.href = menuItem.link;
  link.className = 'simplified-header-text';
  link.textContent = menuItem.title;
  
  blockLink.appendChild(link);
  li.appendChild(blockLink);
  
  return li;
}

/**
 * Creates a submenu for a navigation item
 * @param {Object} navItem - Navigation item data
 * @returns {HTMLElement} - Submenu element
 */
function createSubmenu(navItem) {
  const submenu = document.createElement('nav');
  submenu.id = `${navItem.id.replace('item', '')}-submenu`;
  submenu.setAttribute('role', 'presentation');
  submenu.setAttribute('data-submenu-for', navItem.id);
  
  if (navItem.id === 'menu-1') {
    submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-9-row-list';
  } else {
    submenu.className = 'nav-submenu nav-submenu-graphical-list';
  }
  
  // Back button (for mobile)
  const backButton = document.createElement('a');
  backButton.href = '#';
  backButton.className = 'sub-menu-back hidden-text';
  backButton.setAttribute('data-menu-id', 'mobile-menu');
  backButton.setAttribute('aria-controls', 'mobile-menu-submenu');
  
  const backSpan = document.createElement('span');
  backSpan.textContent = 'Back to Main Menu';
  backButton.appendChild(backSpan);
  
  // Title
  const title = document.createElement('h2');
  title.className = 'nav-submenu-title';
  title.textContent = navItem.title;
  
  // Close button
  const closeButton = document.createElement('a');
  closeButton.href = '#';
  closeButton.className = 'sub-menu-close hidden-text';
  closeButton.setAttribute('data-menu-close', '');
  
  const closeSpan = document.createElement('span');
  closeSpan.textContent = 'Close Menu';
  closeButton.appendChild(closeSpan);
  
  // Items list
  const itemsList = document.createElement('ul');
  itemsList.className = 'clean-list nav-submenu-items';
  
  // Add menu items
  if (navItem.menuItems && navItem.menuItems.length) {
    navItem.menuItems.forEach(menuItem => {
      itemsList.appendChild(createSubmenuItem(menuItem));
    });
  }
  
  // Append all elements to the submenu
  submenu.appendChild(backButton);
  submenu.appendChild(title);
  submenu.appendChild(closeButton);
  submenu.appendChild(itemsList);
  
  return submenu;
}

/**
 * Creates a navigation item
 * @param {Object} navItem - Navigation item data
 * @param {boolean} isSpecial - Whether this is a special navigation item (dashboard)
 * @returns {HTMLElement} - Navigation item element
 */
function createNavItem(navItem, isSpecial = false) {
  const li = document.createElement('li');
  li.className = isSpecial ? 'nav-link' : 'nav-link';
  
  // Create main link
  const link = document.createElement('a');
  link.href = isSpecial ? '/nycbusiness/mydashboard' : '#';
  link.className = 'block-link';
  
  if (!isSpecial) {
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', `${navItem.id.replace('item', '')}-submenu`);
    link.setAttribute('data-menu-id', navItem.id);
  }
  
  link.textContent = navItem.title;
  
  li.appendChild(link);
  
  // Add submenu if not a special item
  if (!isSpecial && navItem.menuItems) {
    li.appendChild(createSubmenu(navItem));
  }
  
  return li;
}

/**
 * Creates an icon link item for the navigation
 * @param {string} iconPath - Path to the icon image
 * @param {string} iconAlt - Alt text for the icon
 * @param {string} href - Link URL
 * @returns {HTMLElement} - Icon link element
 */
function createIconLinkItem(iconPath, iconAlt, href) {
  const li = document.createElement('li');
  li.className = 'nav-icon-link';
  
  const link = document.createElement('a');
  link.href = href;
  link.className = 'block-link hidden-text my-city-link';
  
  const img = document.createElement('img');
  img.src = iconPath;
  img.alt = iconAlt || '';
  
  link.appendChild(img);
  li.appendChild(link);
  
  return li;
}

/**
 * Creates the mobile menu button
 * @returns {HTMLElement} - Mobile menu button element
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
  
  // Create mobile submenu
  const mobileSubmenu = document.createElement('nav');
  mobileSubmenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-mobile';
  mobileSubmenu.setAttribute('data-submenu-for', 'mobile-menu');
  mobileSubmenu.id = 'mobile-menu-submenu';
  mobileSubmenu.setAttribute('role', 'presentation');
  
  const mobileTitle = document.createElement('h2');
  mobileTitle.className = 'nav-submenu-title';
  mobileTitle.textContent = 'Menu';
  
  const mobileCloseBtn = document.createElement('a');
  mobileCloseBtn.href = '#';
  mobileCloseBtn.className = 'sub-menu-close hidden-text';
  mobileCloseBtn.setAttribute('data-menu-close', '');
  
  const mobileCloseSpan = document.createElement('span');
  mobileCloseSpan.textContent = 'Close Menu';
  mobileCloseBtn.appendChild(mobileCloseSpan);
  
  const mobileSubmenuMain = document.createElement('div');
  mobileSubmenuMain.className = 'nav-submenu-main';
  
  mobileSubmenu.appendChild(mobileTitle);
  mobileSubmenu.appendChild(mobileCloseBtn);
  mobileSubmenu.appendChild(mobileSubmenuMain);
  
  li.appendChild(mobileSubmenu);
  
  return li;
}

/**
 * Creates the language toggle section
 * @returns {HTMLElement} - Language toggle element
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
 * Decorates the header block
 * @param {Element} block - The header block element
 * @param {Object} headerData - The header data from the headerOutput.json
 */
export default async function decorate(block) {
  // Clear the block first
  block.textContent = '';
  
  // Get the header data from the window object (should be set by the calling page)
  // In a real implementation, this might come from a fetch or other data source
  // For this example, we'll assume headerData is available in the global scope or pass it in
  const headerData = window.headerData || {
    logoPath: "/nycbusiness/static/img/reskin/NYC-logo-white.svg",
    logotitle: "MyCity",
    logosubtitle: "Official website of the City of New York",
    logoAltText: "NYC",
    portaltitle: "Business",
    searchIconPath: "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png",
    searchIconAltText: "Search",
    helpIconPath: "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/help.png",
    helpIconAltText: "Help Icon",
    helpIconLink: "/nycbusiness/global/mycity-business-faq",
    profileIconPath: "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png",
    profileIconAltText: "Click here to view dashboard",
    navigationItems: [
      {
        title: "Resources by Industry",
        link: "/",
        id: "menu-1",
        menuItems: []
      },
      {
        title: "Business Services",
        link: "/content/mycity/us",
        id: "menu-2",
        menuItems: []
      },
      {
        title: "Emergency Preparedness",
        link: "/content/mycity/us",
        id: "menu-3",
        menuItems: []
      },
      {
        title: "Regulations",
        link: "/content/mycity/us",
        id: "menu-4",
        menuItems: []
      },
      {
        title: "Tools",
        link: "/content/mycity/us",
        id: "menu-5",
        menuItems: []
      },
      {
        title: "My Business Dashboard",
        link: "/content/mycity/us",
        id: "menu-6",
        menuItems: []
      }
    ]
  };
  
  // Try to load from window.digitalData if available
  if (window.digitalData && window.digitalData.header) {
    headerData = window.digitalData.header;
  }
  
  // 1. Create skip-to-main link
  const skipMainLink = document.createElement('a');
  skipMainLink.className = 'skip-main';
  skipMainLink.href = '#main';
  skipMainLink.textContent = 'Skip to main content';
  
  // 2. Create header structure
  // Create logo band (top section)
  const logoBand = createLogoBand(headerData);
  
  // 3. Create navigation
  const nav = document.createElement('nav');
  
  // Create main navigation list
  const navList = document.createElement('ul');
  navList.className = 'clean-list main-nav-desktop';
  
  // Add portal title (Business)
  const portalTitleLi = document.createElement('li');
  portalTitleLi.className = 'nav-tag-line';
  
  const portalTitleLink = document.createElement('a');
  portalTitleLink.href = '/nycbusiness/';
  portalTitleLink.className = 'block-link';
  portalTitleLink.textContent = headerData.portaltitle;
  
  portalTitleLi.appendChild(portalTitleLink);
  navList.appendChild(portalTitleLi);
  
  // Add mobile menu button
  navList.appendChild(createMobileMenuButton());
  
  // Add navigation items
  headerData.navigationItems.forEach((navItem, index) => {
    if (index === headerData.navigationItems.length - 1) {
      // Last item is "My Business Dashboard" - special case
      navList.appendChild(createNavItem(navItem, true));
    } else {
      navList.appendChild(createNavItem(navItem));
    }
  });
  
  // Add icon links (search, help, profile)
  navList.appendChild(createIconLinkItem(
    headerData.searchIconPath,
    headerData.searchIconAltText,
    "https://www.nyc.gov/home/search/index.page?search-terms=&sitesearch=https:%2f%2fnyc-business.nyc.gov%2fnycbusiness"
  ));
  
  navList.appendChild(createIconLinkItem(
    headerData.helpIconPath,
    headerData.helpIconAltText,
    headerData.helpIconLink
  ));
  
  navList.appendChild(createIconLinkItem(
    headerData.profileIconPath,
    headerData.profileIconAltText,
    "https://mycity-cs-dev-origin.nyc.gov/login?language=en&amp;redirectURL=https%3A%2F%2Fbusiness-dev.csc.nycnet%2Fnycbusiness%2Flogin%3FreturnPage%3Dhowtoguide%3FreturnFrom%3Dlogin"
  ));
  
  // Add list to nav
  nav.appendChild(navList);
  
  // 4. Create language toggle
  const langToggle = createLanguageToggle();
  
  // 5. Assemble everything
  block.appendChild(skipMainLink);
  
  const header = document.createElement('header');
  header.appendChild(logoBand);
  header.appendChild(nav);
  header.appendChild(langToggle);
  
  block.appendChild(header);
  
  // 6. Add event listeners for interactivity
  addHeaderInteractivity(header);
}

/**
 * Adds interactivity to the header
 * @param {HTMLElement} header - The header element
 */
function addHeaderInteractivity(header) {
  // Mobile menu toggle
  const mobileMenuButton = header.querySelector('[data-menu-id="mobile-menu"]');
  const mobileMenu = header.querySelector('#mobile-menu-submenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.style.display = !isExpanded ? 'block' : 'none';
    });
  }
  
  // Main navigation items
  const mainNavItems = header.querySelectorAll('.nav-link > a[data-menu-id]');
  
  mainNavItems.forEach((navItem) => {
    navItem.addEventListener('click', (e) => {
      e.preventDefault();
      const menuId = navItem.getAttribute('data-menu-id');
      const submenu = header.querySelector(`[data-submenu-for="${menuId}"]`);
      
      if (submenu) {
        const isExpanded = navItem.getAttribute('aria-expanded') === 'true';
        
        // Close all other menus first
        mainNavItems.forEach((item) => {
          if (item !== navItem) {
            item.setAttribute('aria-expanded', 'false');
            const otherMenuId = item.getAttribute('data-menu-id');
            const otherSubmenu = header.querySelector(`[data-submenu-for="${otherMenuId}"]`);
            if (otherSubmenu) {
              otherSubmenu.style.display = 'none';
            }
          }
        });
        
        // Toggle current menu
        navItem.setAttribute('aria-expanded', !isExpanded);
        submenu.style.display = !isExpanded ? 'block' : 'none';
      }
    });
  });
  
  // Close buttons in submenus
  const closeButtons = header.querySelectorAll('[data-menu-close]');
  
  closeButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = button.closest('.nav-submenu');
      if (submenu) {
        submenu.style.display = 'none';
        
        // Find the related nav item and update its aria-expanded attribute
        const menuId = submenu.getAttribute('data-submenu-for');
        const navItem = header.querySelector(`[data-menu-id="${menuId}"]`);
        if (navItem) {
          navItem.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
  
  // Back buttons in mobile submenus
  const backButtons = header.querySelectorAll('.sub-menu-back');
  
  backButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = button.closest('.nav-submenu');
      if (submenu) {
        submenu.style.display = 'none';
        
        // Show mobile menu
        const mobileMenuId = button.getAttribute('data-menu-id');
        if (mobileMenuId === 'mobile-menu') {
          const mobileMenu = header.querySelector('#mobile-menu-submenu');
          if (mobileMenu) {
            mobileMenu.style.display = 'block';
          }
        }
        
        // Update aria-expanded on the related nav item
        const menuId = submenu.getAttribute('data-submenu-for');
        const navItem = header.querySelector(`[data-menu-id="${menuId}"]`);
        if (navItem) {
          navItem.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
  
  // Handle clicks outside of menus to close them
  document.addEventListener('click', (e) => {
    const clickedElement = e.target;
    
    // Check if the clicked element is outside the navigation
    if (!header.contains(clickedElement) || clickedElement === header) {
      // Close all open menus
      const expandedItems = header.querySelectorAll('[aria-expanded="true"]');
      expandedItems.forEach((item) => {
        item.setAttribute('aria-expanded', 'false');
        
        // If it's a nav item, find and hide its submenu
        const menuId = item.getAttribute('data-menu-id');
        if (menuId) {
          const submenu = header.querySelector(`[data-submenu-for="${menuId}"]`);
          if (submenu) {
            submenu.style.display = 'none';
          }
        }
      });
    }
  });
}
