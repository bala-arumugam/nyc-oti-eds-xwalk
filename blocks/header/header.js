import { getMetadata } from "../../scripts/aem.js";

/**
 * Determines if a URL is an NYC government URL or should be treated as internal
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is an NYC government URL or internal link
 */
function isNycGovUrl(url) {
  const urlPredicates = [
    (url) => url == undefined || url == null || url == '' || url == '#',
    (url) => url.match(/^https?:\/\/.*\.*nyc\.gov/i),
    (url) => url.match(/^http:\/\/.*\.*nyc\.gov/i),
    (url) => url.match(/^http:\/\/.*\.*csc\.nycnet/i),
    (url) => url.match(/^https:\/\/.*\.*csc\.nycnet/i),
    (url) => url.match(/^http:\/\/.*\.*nycid\.nycnet/i),
    (url) => url.match(/^https:\/\/.*\.*nycid\.nycnet/i),
    (url) => url.match(/^\//i),
    (url) => url.match(/^javascript:/i),
    (url) => url.match(/^#/i),
    (url) => url.match(/^mailto:/i),
    (url) => url.match(/^tel:/i),
  ];
  
  return urlPredicates.some(testFn => testFn(url));
}

/**
 * Creates a header logo band element with specified logo path and text
 * @param {Object} headerData - Header data from AEM experience fragment
 * @returns {HTMLElement} - Logo band DOM element
 */
function createLogoBand(headerData) {
  const logoBandWrapper = document.createElement("div");
  logoBandWrapper.className = "logo-band-wrapper";

  const logoBand = document.createElement("div");
  logoBand.className = "logo-band";

  const navLogo = document.createElement("div");
  navLogo.className = "nav-logo";

  // Create logo link
  const logoLink = document.createElement("a");
  logoLink.href = "https://nycmycity--qa.sandbox.my.site.com/s/"; // This should be configurable
  logoLink.className = "block-link exitlink";

  // Create logo image
  const logoImg = document.createElement("img");
  logoImg.src = headerData.logoPath;
  logoImg.className = "nav-logo-img";
  logoImg.alt = headerData.logoAltText || "NYC";

  // Append logo image and text to link
  logoLink.appendChild(logoImg);
  logoLink.appendChild(document.createTextNode(headerData.logotitle));

  // Append link to nav-logo
  navLogo.appendChild(logoLink);
  
  // Add subtitle text as a separate text node outside the link
  // This matches the structure in the Thymeleaf template
  navLogo.appendChild(document.createTextNode(" " + headerData.logosubtitle));

  // Build structure
  logoBand.appendChild(navLogo);
  logoBandWrapper.appendChild(logoBand);

  return logoBandWrapper;
}

/**
 * Creates a submenu item for navigation
 * @param {Object} menuItem - Menu item data
 * @returns {HTMLElement} - Submenu item element
 */
function createSubmenuItem(menuItem) {
  if (menuItem.empty) {
    return document.createElement("li");
  }

  const li = document.createElement("li");

  const blockLink = document.createElement("div");
  blockLink.className = "block-link";

  const link = document.createElement("a");
  link.href = menuItem.link;
  link.className = "simplified-header-text";
  // Add exitlink class if it's an external link
  if (!isNycGovUrl(menuItem.link)) {
    link.classList.add("exitlink");
  }
  link.textContent = menuItem.title;

  blockLink.appendChild(link);
  li.appendChild(blockLink);

  return li;
}

/**
 * Creates a submenu for navigation
 * @param {Object} navItem - Navigation item data
 * @param {boolean} isMobile - Whether this is for mobile menu
 * @returns {HTMLElement} - Submenu nav element
 */
function createSubmenu(navItem, isMobile = false) {
  const submenu = document.createElement("nav");
  submenu.id = `${navItem.id.replace("item", "")}-submenu`;
  submenu.setAttribute("role", "presentation");
  submenu.setAttribute("data-submenu-for", navItem.id);

  // Add appropriate classes based on menu type
  if (navItem.id === "menu-item-1" || navItem.id === "menu-1") {
    submenu.className =
      "nav-submenu nav-submenu-text-list nav-submenu-text-9-row-list";
  } else if (navItem.id === "menu-item-2" || navItem.id === "menu-2") {
    submenu.className =
      "nav-submenu nav-submenu-text-list nav-submenu-text-5-row-list";
  } else if (navItem.id === "menu-item-3" || navItem.id === "menu-3") {
    submenu.className = "nav-submenu nav-submenu-graphical-list";
    submenu.style.zIndex = "902";
  } else {
    submenu.className = "nav-submenu nav-submenu-graphical-list";
  }

  // Add back button for mobile navigation (used in mobile menu back navigation)
  const backButton = document.createElement("a");
  backButton.href = "#";
  backButton.className = "sub-menu-back hidden-text";
  backButton.setAttribute("data-menu-id", "mobile-menu");
  backButton.setAttribute("aria-controls", "mobile-menu-submenu");
  
  const backSpan = document.createElement("span");
  backSpan.textContent = "Back to Main Menu";
  backButton.appendChild(backSpan);
  submenu.appendChild(backButton);

  // Add title
  const title = document.createElement("h2");
  title.className = "nav-submenu-title";
  title.textContent = navItem.title;
  submenu.appendChild(title);

  // Add close button
  const closeButton = document.createElement("a");
  closeButton.href = "#";
  closeButton.className = "sub-menu-close hidden-text";
  closeButton.setAttribute("data-menu-close", "");

  const closeSpan = document.createElement("span");
  closeSpan.textContent = "Close Menu";
  closeButton.appendChild(closeSpan);
  submenu.appendChild(closeButton);

  // Create items list
  const itemsList = document.createElement("ul");
  itemsList.className = "clean-list nav-submenu-items";

  // Add menu items if they exist
  if (navItem.menuItems && navItem.menuItems.length) {
    navItem.menuItems.forEach((menuItem) => {
      itemsList.appendChild(createSubmenuItem(menuItem));
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
  const li = document.createElement("li");
  li.className = "nav-icon nav-mobile-menu";

  const link = document.createElement("a");
  link.href = "#";
  link.className = "block-link hidden-text";
  link.setAttribute("data-menu-id", "mobile-menu");
  link.setAttribute("aria-expanded", "false");
  link.setAttribute("aria-controls", "mobile-menu-submenu");

  const span = document.createElement("span");
  span.textContent = "Open Menu";
  link.appendChild(span);
  li.appendChild(link);

  // Create mobile menu container
  const mobileMenu = document.createElement("nav");
  mobileMenu.className = "nav-submenu nav-submenu-text-list nav-submenu-mobile";
  mobileMenu.setAttribute("data-submenu-for", "mobile-menu");
  mobileMenu.id = "mobile-menu-submenu";
  mobileMenu.setAttribute("role", "presentation");

  const title = document.createElement("h2");
  title.className = "nav-submenu-title";
  title.textContent = "Menu";
  mobileMenu.appendChild(title);

  const closeButton = document.createElement("a");
  closeButton.href = "#";
  closeButton.className = "sub-menu-close hidden-text";
  closeButton.setAttribute("data-menu-close", "");

  const closeSpan = document.createElement("span");
  closeSpan.textContent = "Close Menu";
  closeButton.appendChild(closeSpan);
  mobileMenu.appendChild(closeButton);

  const submenuMain = document.createElement("div");
  submenuMain.className = "nav-submenu-main";

  // Create menu items list
  const menuList = document.createElement("ul");
  menuList.className = "clean-list nav-submenu-items";
  menuList.setAttribute("role", "menu");

  submenuMain.appendChild(menuList);
  mobileMenu.appendChild(submenuMain);
  li.appendChild(mobileMenu);

  return {
    menuButton: li,
    menuList: menuList,
  };
}

/**
 * Creates a navigation item
 * @param {Object} navItem - Navigation item data
 * @returns {HTMLElement} - Navigation list item
 */
function createNavItem(navItem) {
  const li = document.createElement("li");
  li.className = "nav-link";

  const link = document.createElement("a");
  // Set appropriate href based on the navigation item
  const href = navItem.id && navItem.id !== "menu-6" ? "#" : "/nycbusiness/mydashboard";
  link.href = href;
  
  // Set appropriate classes
  link.className = "block-link";
  // Add exitlink class if it's an external link
  if (!isNycGovUrl(href) && href !== "#") {
    link.classList.add("exitlink");
  }
  
  link.textContent = navItem.title;

  if (navItem.id && navItem.id !== "menu-6") {
    link.setAttribute("aria-expanded", "false");
    link.setAttribute(
      "aria-controls",
      `${navItem.id.replace("item", "")}-submenu`
    );
    link.setAttribute("data-menu-id", navItem.id);

    li.appendChild(link);

    if (navItem.menuItems && navItem.menuItems.length) {
      li.appendChild(createSubmenu(navItem));
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
  const li = document.createElement("li");
  li.className = "nav-icon-link";

  const link = document.createElement("a");
  link.href = href;
  
  // Check if this is an external link that should have the exitlink class
  const isExternal = !isNycGovUrl(href);
  link.className = isExternal 
    ? "block-link hidden-text my-city-link exitlink" 
    : "block-link hidden-text my-city-link";

  const img = document.createElement("img");
  img.src = iconPath;
  img.alt = altText || "";

  link.appendChild(img);
  li.appendChild(link);

  return li;
}

/**
 * Creates the language toggle section
 * @returns {HTMLElement} - Language toggle div
 */
function createLanguageToggle() {
  const langToggleWrap = document.createElement("div");
  langToggleWrap.className = "language-toggle-wrap";

  const langToggle = document.createElement("div");
  langToggle.className = "language-toggle";

  const langSelector = document.createElement("div");
  langSelector.id = "language-selector";
  langSelector.className = "language-selector OneLinkNoTx";

  const langLabel = document.createElement("label");
  langLabel.setAttribute("for", "OLJSLanguageSelector");
  langLabel.setAttribute("lang", "en");
  langLabel.className = "language-header translate-icon";
  langLabel.textContent = "Language";

  const langSelectorBox = document.createElement("div");
  langSelectorBox.className = "language-selector-box menu-button-actions";

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
async function fetchHeaderData() {
  try {
    // Fetch the JSON from the absolute path to the experience fragment
    const response = await fetch(
      "https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/content/experience-fragments/mycity/us/en/business/global/header/master.model.json"
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch header data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract header component data
    const root = data[":items"]?.root || {};
    const rootItemsInner = root[":items"] || {};
    const headerComponent = rootItemsInner.header || {};

    // Process navigationItems if they exist
    let navigationItems = [];
    if (headerComponent.navigationItems && headerComponent.navigationItems.length > 0) {
      // Filter out empty navigation items (those without a title)
      navigationItems = headerComponent.navigationItems
        .filter(item => item && (item.title || (item[":type"] === "mycity/components/business/datacomponents/navigation" && item.id)))
        .map((item, index) => {
          // Convert menu ids from menu-item-# to menu-# format if needed
          const id = item.id || `menu-${index + 1}`;
          return {
            ...item,
            id: id,
            title: item.title || "",
            link: item.link || "#",
            menuItems: item.menuItems || []
          };
        });
    }

    return {
      logoPath:
        headerComponent.logoPath ||
        "/nycbusiness/static/img/reskin/NYC-logo-white.svg",
      logotitle: headerComponent.logotitle || "MyCity",
      logosubtitle:
        headerComponent.logosubtitle ||
        "Official website of the City of New York",
      logoAltText: headerComponent.logoAltText || "NYC White Logo",
      logoDecorative: headerComponent.logoDecorative || false,
      portaltitle: headerComponent.portaltitle || "Business",
      searchIconPath:
        headerComponent.searchIconPath ||
        "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png",
      searchIconAltText: headerComponent.searchIconAltText || "Search",
      profileIconPath:
        headerComponent.profileIconPath ||
        "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png",
      profileIconAltText:
        headerComponent.profileIconAltText || "Click here to view dashboard",
      helpIconPath: headerComponent.helpIconPath || "",
      helpIconAltText: headerComponent.helpIconAltText || "Help Icon",
      helpIconLink:
        headerComponent.helpIconLink || "/nycbusiness/global/mycity-business-faq",
      navigationItems: navigationItems
    };
  } catch (error) {
    console.error("Error fetching header data:", error);
    // Return default data in case of error
    return {
      logoPath: "/nycbusiness/static/img/reskin/NYC-logo-white.svg",
      logotitle: "MyCity",
      logosubtitle: "Official website of the City of New York",
      logoAltText: "NYC White Logo",
      logoDecorative: false,
      portaltitle: "Business",
      searchIconPath: "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png",
      searchIconAltText: "Search",
      profileIconPath: "https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png",
      profileIconAltText: "Click here to view dashboard",
      helpIconPath: "",
      helpIconAltText: "Help Icon",
      helpIconLink: "/nycbusiness/global/mycity-business-faq",
      navigationItems: [
        { id: "menu-1", title: "Resources by Industry", link: "#", menuItems: [] },
        { id: "menu-2", title: "Business Services", link: "#", menuItems: [] },
        { id: "menu-3", title: "Emergency Preparedness", link: "#", menuItems: [] },
        { id: "menu-4", title: "Regulations", link: "#", menuItems: [] },
        { id: "menu-5", title: "Tools", link: "#", menuItems: [] }
      ]
    };
  }
}
/**
 * Loads and decorates the header block
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Clear existing content
  block.textContent = "";

  // Get header data from digitalData if available or fetch from AEM
  let headerData = {};

  if (window.digitalData && window.digitalData.header) {
    headerData = window.digitalData.header;
  } else {
    headerData = await fetchHeaderData();
  }

  // 1. Create skip-to-main link
  const skipLink = document.createElement("a");
  skipLink.className = "skip-main";
  skipLink.href = "#main";
  skipLink.textContent = "Skip to main content";
  block.appendChild(skipLink);

  // 2. Create header element
  const header = document.createElement("header");

  // 3. Create logo band
  const logoBand = createLogoBand(headerData);
  header.appendChild(logoBand);

  // 4. Create main navigation
  const nav = document.createElement("nav");
  const navList = document.createElement("ul");
  navList.className = "clean-list main-nav-desktop";

  // 4.1 Add business tag line
  const tagLine = document.createElement("li");
  tagLine.className = "nav-tag-line";

  const tagLink = document.createElement("a");
  tagLink.href = "/nycbusiness/";
  tagLink.className = "block-link";
  tagLink.textContent = headerData.portaltitle;

  tagLine.appendChild(tagLink);
  navList.appendChild(tagLine);

  // 4.2 Add mobile menu button and container
  const { menuButton, menuList } = createMobileMenuButton();
  navList.appendChild(menuButton);

  // 4.3 Add navigation items
  // Loop through first 5 navigation items (Resources by Industry, Business Services, Emergency Preparedness, Regulations, Tools)
  for (let i = 0; i < Math.min(5, headerData.navigationItems.length); i++) {
    const navItem = headerData.navigationItems[i];
    
    // Use the correct menu ID format
    if (navItem.id && navItem.id.startsWith("menu-item-")) {
      navItem.id = navItem.id.replace("menu-item-", "menu-");
    }
    
    // Create nav item for desktop menu
    const navLi = createNavItem(navItem);
    navList.appendChild(navLi);

    // Also create a copy for mobile menu
    if (navItem.id !== "menu-6") {
      // Skip dashboard for mobile menu
      const mobileNavItem = document.createElement("li");
      mobileNavItem.className = "nav-link";

      const mobileLink = document.createElement("a");
      mobileLink.href = "#";
      mobileLink.className = "block-link";
      mobileLink.setAttribute("aria-expanded", "false");
      mobileLink.setAttribute(
        "aria-controls",
        `${navItem.id.replace("item", "")}-submenu`
      );
      mobileLink.setAttribute("data-menu-id", navItem.id);
      mobileLink.textContent = navItem.title;
      mobileNavItem.appendChild(mobileLink);

      menuList.appendChild(mobileNavItem);
    }
  }
  
  // Add the dashboard menu item (as shown in Dev.html)
  const dashboardLi = document.createElement("li");
  dashboardLi.className = "nav-link";
  
  const dashboardLink = document.createElement("a");
  dashboardLink.href = "/nycbusiness/mydashboard";
  dashboardLink.className = "block-link";
  dashboardLink.textContent = "My Business Dashboard";
  
  dashboardLi.appendChild(dashboardLink);
  navList.appendChild(dashboardLi);

  // 4.4 Add icon links
  // Search icon
  navList.appendChild(
    createIconLink(
      headerData.searchIconPath,
      headerData.searchIconAltText,
      "https://www.nyc.gov/home/search/index.page?search-terms=&sitesearch=https:%2f%2fnyc-business.nyc.gov%2fnycbusiness"
    )
  );

  // Help icon
  navList.appendChild(
    createIconLink(
      headerData.helpIconPath,
      headerData.helpIconAltText,
      headerData.helpIconLink
    )
  );

  // Profile icon
  navList.appendChild(
    createIconLink(
      headerData.profileIconPath,
      headerData.profileIconAltText,
      "https://mycity-cs-dev-origin.nyc.gov/login?language=en&amp;redirectURL=https%3A%2F%2Fbusiness-dev.csc.nycnet%2Fnycbusiness%2Flogin%3FreturnPage%3Dhowtoguide%3FreturnFrom%3Dlogin"
    )
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
}

/**
 * Initialize header interactivity
 * @param {HTMLElement} header - Header element
 */
function initializeHeaderInteractivity(header) {
  let activeAssociation = null;
  let zIndexAcc = 900;
  
  // Helper functions matching header-nav-bindings.js
  const isDesktopBreakPoint = function() {
    if (!window.matchMedia) {
      return false; // Mobile-first approach
    }
    return window.matchMedia("(min-width: 810px)").matches;
  };

  const setVisibilityOfElements = function(elementList, visibleStyle) {
    elementList.forEach(function(el) {
      if (el.tagName.toLowerCase() === 'header') {
        return;
      }
      el.style.visibility = typeof visibleStyle === 'string' && visibleStyle.toLowerCase() === 'hidden' ? visibleStyle : '';
    });
  };

  const handleTabTrap = function() {
    const trapSelector = 'footer, body > *, header .language-toggle-wrap, header .nav-text-links .nav-icon, header .nav-mobile-menu a[data-menu-id="mobile-menu"], header .logo-band, header .nav-tag-line';
    const hasOpenMenu = !!Array.from(header.querySelector('nav').classList).find(function(className) {
      return className.indexOf('submenu::') >= 0;
    });
    const elements = Array.from(document.querySelectorAll(trapSelector));
    
    if (hasOpenMenu && !isDesktopBreakPoint()) {
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
  const linksWithSubMenus = Array.from(topNav.querySelectorAll('[data-menu-id]')).map(function(link) {
    const menuId = link.getAttribute('data-menu-id');
    
    return {
      revealDelayId: null,
      hideDelayId: null,
      link: link,
      subMenus: subMenus.filter(function(menu) {
        return menu.getAttribute('data-submenu-for') === menuId;
      })
    };
  });
  
  // Find association by link
  const findAssociated = function(link) {
    const target = link.tagName.toUpperCase() === 'A' ? link : link.closest('a');
    return linksWithSubMenus.find(function(item) {
      return item.link === target;
    }) || null;
  };
  
  const findOpenMenus = function() {
    const menuIds = Array.from(topNav.classList).filter(function(c) {
      return c.indexOf('submenu::') === 0;
    }).map(function(c) {
      return c.replace(/^submenu\:\:/i, '');
    });
    return menuIds;
  };
  
  // Helper function to cancel timers
  const cancelRevealAndHide = function(associated) {
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
  const showSubmenu = function(associated, delayAction, openCallback) {
    const menuAction = function() {
      if (associated.revealDelayId !== null) {
        clearTimeout(associated.revealDelayId);
        associated.revealDelayId = null;
      }

      const menuId = associated.link.getAttribute('data-menu-id');
      topNav.classList.add('submenu::' + menuId);
      associated.subMenus.forEach(function(m) {
        m.classList.add('nav-sub-menu-visible');
        m.style.display = "block";
        zIndexAcc++;
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
  const hideSubmenu = function(associated, delayAction, closeHandler) {
    const menuAction = function() {
      if (associated.hideDelayId !== null) {
        clearTimeout(associated.hideDelayId);
        associated.hideDelayId = null;
      }

      const menuId = associated.link.getAttribute('data-menu-id');
      topNav.classList.remove('submenu::' + menuId);
      associated.subMenus.forEach(function(m) {
        m.classList.remove('nav-sub-menu-visible');
        m.style.display = "none";
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
  const mobileMenuHandler = function(ev) {
    if (ev instanceof KeyboardEvent && ev.key !== 'Enter') {
      return;
    }
    ev.preventDefault();
    
    const associated = findAssociated(subMenuButton);
    const isMainMenuOpen = !!(topNav.classList.contains('menu-open'));

    if (isMainMenuOpen) {
      subMenuButton.setAttribute('aria-expanded', 'false');
      topNav.classList.remove('menu-open');
      document.querySelector('html').classList.remove('lock-scrolling');
      document.body.classList.remove('lock-scrolling');
      hideSubmenu(associated, false);
      handleTabTrap();
    } else {
      subMenuButton.setAttribute('aria-expanded', 'true');
      topNav.classList.add('menu-open');
      document.querySelector('html').classList.add('lock-scrolling');
      document.body.classList.add('lock-scrolling');
      showSubmenu(associated, false, function() {
        const firstLink = associated.subMenus[0].querySelector('ul.nav-submenu-items li a');
        if (firstLink) firstLink.focus();
      });
      handleTabTrap();
    }
  };
  
  // Mouse hover handlers
  const linkOverHandler = function(ev, openCallback) {
    // non desktop & mouse over
    if (ev.type.toLowerCase() === 'mouseover' && !isDesktopBreakPoint()) {
      return;
    }
    
    const associated = findAssociated(ev.target);
    if (!associated) {
      return;
    }
    
    // Cancel any existing timers
    cancelRevealAndHide(associated);
    
    // Close any menus in the process of closing
    linksWithSubMenus.forEach(function(link) {
      if (!!link.hideDelayId) {
        hideSubmenu(link, false);
      }
    });
    
    showSubmenu(associated, true, openCallback);
  };
  
  const linkOutHandler = function(ev) {
    // non desktop & mouse out
    if (ev.type.toLowerCase() === 'mouseout' && !isDesktopBreakPoint()) {
      return;
    }
    
    const associated = findAssociated(ev.target);
    if (!associated || (ev instanceof KeyboardEvent && ev.keyCode !== 9)) {
      return;
    }
    
    cancelRevealAndHide(associated);
    hideSubmenu(associated, true);
  };
  
  const linkClickHandler = function(ev, openCallback) {
    ev.preventDefault();
    const menuIds = findOpenMenus();
    const associated = findAssociated(ev.target);
    
    // Close other open menus
    linksWithSubMenus.forEach(function(l) {
      const isFound = l.subMenus.find(function(m) {
        return menuIds.includes(m.getAttribute('data-submenu-for'));
      });

      if (!!isFound && associated !== l && l.link.getAttribute('data-menu-id') !== 'mobile-menu') {
        cancelRevealAndHide(l);
        hideSubmenu(l, false);
      }
    });

    // Special handling for mobile menu
    const openHandler = !menuIds.includes('mobile-menu') ? openCallback : function(a) {
      const findMobileClose = linksWithSubMenus.find(function(l) {
        return l.link.getAttribute('data-menu-id') === 'mobile-menu';
      });
      
      if (findMobileClose) {
        cancelRevealAndHide(findMobileClose);
      }
      
      if (typeof openCallback === 'function') openCallback(a);
    };
    
    linkOverHandler(ev, openHandler);
  };
  
  // Keyboard event handlers
  const enterKeyHandler = function(ev) {
    if (ev.key !== 'Enter') {
      return;
    }
    
    // stop sympathetic click event handler
    ev.preventDefault();

    const eventAssociated = findAssociated(ev.target);
    if (!eventAssociated) return;
    
    const menuId = eventAssociated.link.getAttribute('data-menu-id');
    
    if (topNav.classList.contains('submenu::' + menuId)) {
      cancelRevealAndHide(eventAssociated);
      hideSubmenu(eventAssociated, false);
      return;
    }
    
    const thisSubmenu = ev.target.closest('.nav-submenu');
    const thisMenuId = thisSubmenu ? thisSubmenu.getAttribute('data-submenu-for') : null;
    
    const openHandler = function(associated) {
      const lastSubNav = associated.subMenus[associated.subMenus.length - 1];
      if (!lastSubNav) {
        return;
      }
      
      requestAnimationFrame(function() {
        let preferredFocusElement = null;
        
        if (thisMenuId && lastSubNav.classList.contains('nav-submenu')) {
          preferredFocusElement = lastSubNav.querySelector(`ul.nav-submenu-items li a[data-menu-id="${thisMenuId}"]`);
        }
        
        if (preferredFocusElement) {
          preferredFocusElement.focus();
          return;
        }
        
        const firstLink = lastSubNav.querySelector('ul.nav-submenu-items li a');
        if (firstLink) firstLink.focus();
      });
    };
    
    linkClickHandler(ev, openHandler);
  };
  
  const escapeKeyHandler = function(ev) {
    if (ev.key !== 'Escape' && ev.key !== 'Esc') {
      return;
    }

    // Handle active focus within a menu
    if (document.activeElement === document.body) {
      return;
    }
    
    // Check if the focused element is a focusable element
    const matchesActiveEl = function(selector) {
      return document.activeElement.matches(selector);
    };
    
    if (!['input[type="button"], input[type="submit"]', 'button', 'a[href]'].find(matchesActiveEl)) {
      return;
    }
    
    // Find the associated menu
    const findAssociatedFromChildLink = function(link) {
      const target = link.tagName.toUpperCase() === 'A' ? link : link.closest('a');
      const submenu = target.closest('.nav-submenu');
      
      if (!submenu) {
        return null;
      }
      
      return linksWithSubMenus.find(function(item) {
        const isDesktop = isDesktopBreakPoint();
        if (!isDesktop) {
          return true;
        }
        return !item.link.closest('[data-submenu-for="mobile-menu"]');
      }) || null;
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
  linksWithSubMenus.forEach(function(item) {
    if (item.link !== subMenuButton) {
      item.link.addEventListener('mouseover', linkOverHandler);
      item.link.addEventListener('mouseout', linkOutHandler);
      item.link.addEventListener('click', linkClickHandler);
      item.link.addEventListener('keydown', enterKeyHandler);
    }
  });
  
  // Add mouse enter/leave handlers for submenus
  subMenus.forEach(function(menu) {
    menu.addEventListener('mouseenter', function(ev) {
      const menuIds = findOpenMenus();
      if (menuIds.length === 0) return;
      
      const associated = linksWithSubMenus.find(function(link) {
        if (!(link.hideDelayId || link.revealDelayId)) {
          return false;
        }
        return link.subMenus.includes(ev.target);
      });
      
      if (!associated) return;
      cancelRevealAndHide(associated);
      
      menu.addEventListener('mouseleave', function() {
        hideSubmenu(associated, true);
      }, { once: true });
    });
  });
  
  // Close button handlers
  Array.from(topNav.querySelectorAll('[data-menu-close]')).forEach(function(closeButton) {
    closeButton.addEventListener('click', function(ev) {
      ev.preventDefault();
      
      // Close all menus
      linksWithSubMenus.forEach(function(item) {
        cancelRevealAndHide(item);
        hideSubmenu(item, false);
      });
      
      // Reset mobile menu if needed
      if (topNav.classList.contains('menu-open')) {
        topNav.classList.remove('menu-open');
        document.querySelector('html').classList.remove('lock-scrolling');
        document.body.classList.remove('lock-scrolling');
        subMenuButton.setAttribute('aria-expanded', 'false');
      }
      
      zIndexAcc = 900;
    });
  });
  
  // Mobile menu button handlers
  if (subMenuButton) {
    subMenuButton.addEventListener('keydown', mobileMenuHandler);
    subMenuButton.addEventListener('click', mobileMenuHandler);
  }
  
  // Global key handlers
  document.addEventListener('keydown', escapeKeyHandler);
  
  // Window resize handler
  let resizeBounceId = null;
  window.addEventListener('resize', function() {
    if (resizeBounceId) {
      clearTimeout(resizeBounceId);
      resizeBounceId = null;
    }
    
    resizeBounceId = setTimeout(function() {
      if (resizeBounceId) {
        clearTimeout(resizeBounceId);
        resizeBounceId = null;
      }
      handleTabTrap();
    }, 100);
  });
  
  // Initialize exitlink functionality similar to external-links.js
  document.addEventListener('click', function(e) {
    // Check if the clicked element has the exitlink class
    if (e.target.classList.contains('exitlink') || 
        (e.target.parentNode && e.target.parentNode.classList.contains('exitlink'))) {
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
          const jQuery = window.jQuery;
          
          jQuery.colorbox({
            onLoad: function() {
              jQuery('#cboxClose').remove();
            },
            onComplete: function() {
              jQuery('#domainSpan').text(`${domain}?`);
            },
            transition: 'none',
            fixed: true,
            open: true,
            scrolling: false,
            escKey: false,
            overlayClose: false,
            focus: true,
            html: jQuery('#external-link-modal-template').length && typeof Handlebars !== 'undefined'
              ? Handlebars.compile(jQuery('#external-link-modal-template').html())({ className: '' })
              : `<div class="external-link-modal">
                  <h2>You are leaving the NYC.gov domain</h2>
                  <p>Are you sure you want to go to <span id="domainSpan">${domain}?</span></p>
                  <div class="button-group">
                    <button id="external-link-modal-submit" class="btn-primary">Yes</button>
                    <button id="external-link-modal-cancel" class="btn-secondary">No</button>
                  </div>
                </div>`
          });
          
          // Set up handlers for modal buttons
          jQuery(document).on('click', '#external-link-modal-submit', function() {
            window.location = href;
          });
          
          jQuery(document).on('click', '#external-link-modal-cancel', function(e) {
            e.preventDefault();
            jQuery.colorbox.close();
          });
        } catch (error) {
          console.error('Error processing exitlink:', error);
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
