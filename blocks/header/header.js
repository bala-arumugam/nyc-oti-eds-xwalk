import initializeHeaderInteractivity from '../../scripts/exitlink.js';
import { fetchHeaderData } from '../../scripts/fetchHeader.js';
import initializeMobileOptimizations from '../../scripts/initalizedMobileOpt.js';
import handleExitLinkClick from '../../scripts/handleExitLinkClick.js';

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

function createLogoBand(headerData) {
  const logoImg = createElement('img', {
    className: 'nav-logo-img',
    src: headerData.logoPath,
    alt: headerData.logoAltText || 'NYC',
    width: '36',
    height: '24',
    fetchpriority: 'high',
    importance: 'high',
    decoding: 'sync',
  });

  const logoLink = createElement('a', {
    href: 'https://nycmycity--qa.sandbox.my.site.com/s/',
    className: 'block-link exitlink',
  }, [logoImg, headerData.logotitle]);

  const navLogo = createElement('div', { className: 'nav-logo' }, [
    logoLink,
    ` ${headerData.logosubtitle}`,
  ]);

  const logoBand = createElement('div', { className: 'logo-band' }, [navLogo]);

  return createElement('div', { className: 'logo-band-wrapper' }, [logoBand]);
}

function createSubmenu(navItem, isMobile = false) {
  const submenu = document.createElement('nav');

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

  submenu.id = `${controlId}-submenu`;
  submenu.setAttribute('role', 'presentation');
  submenu.setAttribute('data-submenu-for', navItem.id);
  const itemCount = navItem.menuItems ? navItem.menuItems.length : 0;
  const numberOfRows = navItem.numberOfRows || Math.ceil(itemCount / 2.0);

  if (isMobile) {
    submenu.className = `nav-submenu nav-submenu-text-list nav-submenu-text-${numberOfRows}-row-list`;
  } else {
    switch (navItem.id) {
      case 'menu-1':
        submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-9-row-list';
        break;
      case 'menu-2':
        submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-5-row-list';
        break;
      case 'menu-3':
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
      case 'menu-5':
        if (navItem.simplify) {
          submenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-text-2-row-list';
        } else {
          submenu.className = 'nav-submenu nav-submenu-graphical-list';
        }
        break;
      default:
        if (navItem.simplify) {
          submenu.className = `nav-submenu nav-submenu-text-list nav-submenu-text-${numberOfRows}-row-list`;
        } else {
          submenu.className = 'nav-submenu nav-submenu-graphical-list';
        }
    }
  }

  const backButton = document.createElement('a');
  backButton.href = '#';
  backButton.className = 'sub-menu-back hidden-text';
  backButton.setAttribute('data-menu-id', 'mobile-menu');
  backButton.setAttribute('aria-controls', 'mobile-menu-submenu');

  const backSpan = document.createElement('span');
  backSpan.textContent = 'Back to Main Menu';
  backButton.appendChild(backSpan);
  submenu.appendChild(backButton);

  const title = document.createElement('h2');
  title.className = 'nav-submenu-title';
  title.textContent = navItem.title;
  submenu.appendChild(title);

  const closeButton = document.createElement('a');
  closeButton.href = '#';
  closeButton.className = 'sub-menu-close hidden-text';
  closeButton.setAttribute('data-menu-close', '');

  const closeSpan = document.createElement('span');
  closeSpan.textContent = 'Close Menu';
  closeButton.appendChild(closeSpan);
  submenu.appendChild(closeButton);

  const itemsList = document.createElement('ul');
  itemsList.className = 'clean-list nav-submenu-items';

  if (navItem.menuItems && navItem.menuItems.length) {
    navItem.menuItems.forEach((menuItem) => {
      if (menuItem.empty) {
        const emptyLi = document.createElement('li');
        itemsList.appendChild(emptyLi);
        return;
      }

      const li = document.createElement('li');

      if (isMobile || navItem.simplify || submenu.className.includes('nav-submenu-text-list')) {
        const blockLink = document.createElement('div');
        blockLink.className = 'block-link';

        const link = document.createElement('a');
        link.href = menuItem.link;
        link.className = 'simplified-header-text';
        link.textContent = menuItem.title;

        if (!isNycGovUrl(menuItem.link)) {
          link.classList.add('exitlink');
        }

        blockLink.appendChild(link);
        li.appendChild(blockLink);
      } else {
        const blockLink = document.createElement('div');
        blockLink.className = 'block-link';

        const img = document.createElement('img');
        img.src = menuItem.iconPath || '/content/dam/mycity/business/en/icons/blue-icons/default.png';
        img.alt = menuItem.iconAlt || '';
        img.setAttribute('aria-hidden', 'true');
        img.loading = 'lazy';
        img.width = '48';
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

  const mobileMenu = document.createElement('nav');
  mobileMenu.className = 'nav-submenu nav-submenu-text-list nav-submenu-mobile';
  mobileMenu.setAttribute('data-submenu-for', 'mobile-menu');
  mobileMenu.id = 'mobile-menu-submenu';
  mobileMenu.setAttribute('role', 'presentation');
  mobileMenu.style.contentVisibility = 'auto';
  mobileMenu.style.containIntrinsicSize = '0 500px';

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

  const menuList = document.createElement('ul');
  menuList.className = 'clean-list nav-submenu-items';
  menuList.setAttribute('role', 'menu');

  submenuMain.appendChild(menuList);
  mobileMenu.appendChild(submenuMain);

  const isUserLoggedIn = window.digitalData
                         && window.digitalData.user
                         && window.digitalData.user.userGUID;

  if (isUserLoggedIn) {
    const accountOptionsWrapper = document.createElement('div');

    const accountOptionsDiv = document.createElement('div');
    accountOptionsDiv.className = 'top-nav-account-options';

    const manageAccountLink = document.createElement('a');
    manageAccountLink.href = window.digitalData?.profiletarget || '/profile';
    manageAccountLink.className = 'nycb-button nycb-btn-profile content-regular account-options-text manage-account-text';
    manageAccountLink.title = 'Manage Account';
    manageAccountLink.textContent = 'Manage Account';
    accountOptionsDiv.appendChild(manageAccountLink);

    const logoutForm = document.createElement('form');
    logoutForm.action = window.digitalData?.logouttarget || '/logout';
    logoutForm.method = 'POST';

    if (window.digitalData && window.digitalData.csrf) {
      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = window.digitalData.csrf.parameterName;
      csrfInput.value = window.digitalData.csrf.token;
      logoutForm.appendChild(csrfInput);
    }

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

function createNavItem(navItem, isMobile = false) {
  const li = document.createElement('li');
  li.className = 'nav-link';

  const link = document.createElement('a');
  const href = navItem.id && navItem.id !== 'menu-6' ? '#' : '/nycbusiness/mydashboard';
  link.href = href;

  link.className = 'block-link';
  if (!isNycGovUrl(href) && href !== '#') {
    link.classList.add('exitlink');
  }

  link.textContent = navItem.title;

  if (navItem.id && navItem.id !== 'menu-6') {
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
      li.appendChild(createSubmenu({ ...navItem, simplify: isMobile }, isMobile));
    }
  } else {
    li.appendChild(link);
  }

  return li;
}

function createIconLink(iconPath, altText, href) {
  const isExternal = !isNycGovUrl(href);
  const linkClass = `block-link hidden-text my-city-link${isExternal ? ' exitlink' : ''}`;

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

export default async function decorate(block) {
  block.textContent = '';

  let headerData = {};

  if (window.digitalData && window.digitalData.header) {
    headerData = window.digitalData.header;
  } else {
    headerData = await fetchHeaderData();
  }

  const skipLink = createElement('a', {
    className: 'skip-main',
    href: '#main',
    textContent: 'Skip to main content',
  });
  block.appendChild(skipLink);

  const header = createElement('header');


  const logoBand = createLogoBand(headerData);
  header.appendChild(logoBand);
  const nav = createElement('nav');
  const navList = createElement('ul', { className: 'clean-list main-nav-desktop' });
  const tagLink = createElement('a', {
    href: '/nycbusiness/',
    className: 'block-link',
    textContent: headerData.portaltitle,
  });

  const tagLine = createElement('li', { className: 'nav-tag-line' }, [tagLink]);
  navList.appendChild(tagLine);

  const { menuButton, menuList } = createMobileMenuButton();
  navList.appendChild(menuButton);

  const maxNavItems = 5;
  for (let i = 0; i < Math.min(maxNavItems, headerData.navigationItems.length); i += 1) {
    const navItem = headerData.navigationItems[i];

    if (navItem.id && navItem.id.startsWith('menu-item-')) {
      navItem.id = navItem.id.replace('menu-item-', 'menu-');
    }

    if (!navItem.control) {
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

    const navLi = createNavItem(navItem);
    navList.appendChild(navLi);

    if (navItem.id !== 'menu-6') {
      const flyoutLi = document.createElement('li');
      const flyoutLink = document.createElement('a');
      flyoutLink.href = '#';
      flyoutLink.className = 'block-link';
      flyoutLink.textContent = navItem.title;
      flyoutLink.setAttribute('data-menu-id', navItem.id);
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

  const dashboardLi = document.createElement('li');
  dashboardLi.className = 'nav-link';

  const dashboardLink = document.createElement('a');
  dashboardLink.href = '/nycbusiness/mydashboard';
  dashboardLink.className = 'block-link';
  dashboardLink.textContent = 'My Business Dashboard';

  dashboardLi.appendChild(dashboardLink);
  navList.appendChild(dashboardLi);

  const mobileDashboardLi = document.createElement('li');
  const mobileDashboardLink = document.createElement('a');
  mobileDashboardLink.href = '/nycbusiness/mydashboard';
  mobileDashboardLink.className = 'block-link';
  mobileDashboardLink.textContent = 'My Business Dashboard';
  mobileDashboardLi.appendChild(mobileDashboardLink);
  menuList.appendChild(mobileDashboardLi);
  navList.appendChild(
    createIconLink(
      headerData.searchIconPath,
      headerData.searchIconAltText,
      'https://www.nyc.gov/home/search/index.page?search-terms=&sitesearch=https:%2f%2fnyc-business.nyc.gov%2fnycbusiness',
    ),
  );

  navList.appendChild(
    createIconLink(
      headerData.helpIconPath,
      headerData.helpIconAltText,
      headerData.helpIconLink,
    ),
  );

  navList.appendChild(
    createIconLink(
      headerData.profileIconPath,
      headerData.profileIconAltText,
      'https://mycity-cs-dev-origin.nyc.gov/login?language=en&amp;redirectURL=https%3A%2F%2Fbusiness-dev.csc.nycnet%2Fnycbusiness%2Flogin%3FreturnPage%3Dhowtoguide%3FreturnFrom%3Dlogin',
    ),
  );

  nav.appendChild(navList);
  header.appendChild(nav);
  const languageToggle = createLanguageToggle();
  header.appendChild(languageToggle);
  block.appendChild(header);
  initializeHeaderInteractivity(header);

  if (window.innerWidth < 768) {
    initializeMobileOptimizations(header);
  }

  if (!document.getElementById('cbox-overlay')) {
    const cboxOverlay = document.createElement('div');
    cboxOverlay.id = 'cbox-overlay';
    cboxOverlay.style.display = 'none';
    document.body.appendChild(cboxOverlay);
  }

  function attachExitLinkHandlers() {
    document.querySelectorAll('a.block-link.exitlink').forEach((link) => {
      link.removeEventListener('click', handleExitLinkClick, true);
      link.removeEventListener('keydown', handleExitLinkClick, true);
      link.addEventListener('click', handleExitLinkClick, true);
      link.addEventListener('keydown', handleExitLinkClick, true);
    });
  }

  attachExitLinkHandlers();

  const observer = new MutationObserver(attachExitLinkHandlers);
  observer.observe(document.body, { childList: true, subtree: true });

  const headerNavScriptId = 'header-nav-bindings-nonce';
  if (!document.getElementById(headerNavScriptId)) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '/nycbusiness/static/js/header-nav-bindings.js';
    script.id = headerNavScriptId;
    script.defer = true;
    script.setAttribute('nonce', 'hFwe9v/SC1WVWGIlfr8xQg==');
    document.body.appendChild(script);
  }

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

  function loadScriptOnce(src, id, attrs = {}, critical = false) {
    if (id && document.getElementById(id)) return;
    if ([...document.scripts].some((s) => s.src && s.src.includes(src))) return;

    const script = document.createElement('script');
    script.src = src;
    if (id) script.id = id;

    if (!critical) {
      script.defer = true;
    }

    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    document.body.appendChild(script);
  }

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

  loadScriptOnce('/static/js/header-nav-bindings.js', 'header-nav-bindings-lib', {}, true);

  const isMobile = window.matchMedia('(max-width: 810px)').matches;

  window.requestIdleCallback(() => {
    const scripts = [
      // { src: '/static/js/libs/jquery.colorbox-min.js', id: 'colorbox-lib', priority: 'high' },
      // { src: '/static/js/external-links.js', id: 'external-links-lib', priority: 'high' },
      // { src: '/static/js/libs/handlebars.js', id: 'handlebars-lib', priority: 'medium' },
      // { src: '/static/js/language-selector.js', id: 'language-selector-lib', priority: 'medium' },
      // { src: '/static/js/left-nav.js', id: 'left-nav-lib', priority: 'low' },
      // { src: '/static/js/account-accordion.js', id: 'account-accordion-lib', priority: 'low' },
      // { src: '/static/js/team-site/accordion.js', id: 'team-site-accordion-lib', priority: 'low' },
      // { src: '/static/js/utils.js', id: 'utils-lib', priority: 'low' },
      // { src: '/assets/home/js/webtrends/webtrends.nycbusiness-load.js', id: 'webtrends-lib', priority: 'analytics' },
    ];

    if (isMobile) {
      scripts.filter((script) => script.priority === 'high')
        .forEach((script) => loadScriptOnce(script.src, script.id));

      setTimeout(() => {
        scripts.filter((script) => script.priority === 'medium')
          .forEach((script) => loadScriptOnce(script.src, script.id));
      }, 800);

      const loadLowPriorityScripts = () => {
        scripts.filter((script) => script.priority === 'low')
          .forEach((script) => loadScriptOnce(script.src, script.id));
        ['click', 'scroll', 'touchstart'].forEach((event) => document.removeEventListener(event, loadLowPriorityScripts, { passive: true }));
      };

      ['click', 'scroll', 'touchstart'].forEach((event) => document.addEventListener(event, loadLowPriorityScripts, { once: true, passive: true }));

      setTimeout(loadLowPriorityScripts, 4000);

      setTimeout(() => {
        scripts.filter((script) => script.priority === 'analytics')
          .forEach((script) => loadScriptOnce(script.src, script.id));
      }, 5000);
    } else {
      scripts.filter((script) => ['high', 'medium'].includes(script.priority))
        .forEach((script) => loadScriptOnce(script.src, script.id));

      setTimeout(() => {
        scripts.filter((script) => script.priority === 'low')
          .forEach((script) => loadScriptOnce(script.src, script.id));
      }, 500);

      setTimeout(() => {
        scripts.filter((script) => script.priority === 'analytics')
          .forEach((script) => loadScriptOnce(script.src, script.id));
      }, 2000);
    }
  }, isMobile ? { timeout: 1500 } : { timeout: 3000 });

  if (window.useTransperfect) {
    loadScriptOnce('/static/js/transperfect-handler.js', 'transperfect-handler-lib');
  }

  if (typeof window.isBaseDomain !== 'undefined' && !window.isBaseDomain) {
    loadScriptOnce('https://www.onelink-edge.com/moxie.min.js', 'onelink-lib', {
      referrerpolicy: 'no-referrer-when-downgrade',
      'data-oljs': 'PEFE3-E878-E5CB-F4D9',
    });
  }
}
