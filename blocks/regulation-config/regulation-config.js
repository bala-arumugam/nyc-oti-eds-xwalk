import {
  createElement, detachAndReattach, detachAndReattachAll, shadeBackground,
} from '../../scripts/util.js';

function showHideTab(name) {
  const tabs = document.querySelector('main').querySelector('.tabs').querySelectorAll('.tab');
  
  // First, mark all tabs as hidden in their style - this is more performant than changing display
  tabs.forEach((tab) => {
    const shouldShow = tab.classList.contains(name);
    
    // Cache existing heights to prevent reflows
    if (!tab.dataset.height && shouldShow) {
      // Store the height of the tab to use when showing
      tab.dataset.height = `${tab.scrollHeight}px`;
    }
    
    // Use opacity and visibility for smoother transitions
    // This helps prevent layout shifts compared to display:none
    if (shouldShow) {
      // Apply visibility immediately but opacity with transition
      tab.style.visibility = 'visible';
      tab.style.height = tab.dataset.height || 'auto';
      tab.style.opacity = '0'; // Start hidden
      
      // Set opacity to 1 after a tiny delay to allow transition
      setTimeout(() => {
        tab.style.opacity = '1';
        tab.style.display = 'block';
      }, 10);
    } else {
      tab.style.opacity = '0';
      // Hide completely after transition
      setTimeout(() => {
        tab.style.visibility = 'hidden';
        tab.style.display = 'none';
      }, 300); // Match transition duration
    }
    
    tab.setAttribute('tabindex', shouldShow ? '0' : '-1');
  });
}

function menuMobileComponent() {
  const { show, destroy } = shadeBackground();

  // Listen for window resize events to toggle mobile menu visibility
  const mediaQuery = window.matchMedia('(max-width: 810px)');

  // Function to check if screen is mobile size and apply necessary changes
  function handleScreenSizeChange(e) {
    const menuA = document.querySelector('.menu-regulation-index ul');
    if (!menuA) return;

    if (e.matches) {
      // Mobile view - hide menu until clicked
      menuA.classList.remove('mobile');
    } else {
      // Desktop view - ensure menu is visible and background shade is removed
      menuA.classList.remove('mobile');
      destroy();
    }
  }

  // Set up the initial state
  handleScreenSizeChange(mediaQuery);

  // Add listener for screen size changes
  mediaQuery.addEventListener('change', handleScreenSizeChange);

  function onclick() {
    const menu = document.querySelector('.menu-regulation-index ul');
    show();
    menu.classList.add('mobile');
  }

  function clean() {
    const menu = document.querySelector('.menu-regulation-index ul');
    destroy();
    menu.classList.remove('mobile');
  }
  return {
    onclick,
    clean,
  };
}

function createMenu(main, menuToDisplay, mobileButtonTitle) {
  const mComponent = menuMobileComponent();

  function clickHandler(event) {
    const { target } = event;
    const name = target.classList[1];

    if (target.classList.contains('menu-item-active')) {
      // Skip if the clicked item is already active
      mComponent.clean();
      return;
    }

    // Use requestAnimationFrame to batch DOM changes for better performance
    requestAnimationFrame(() => {
      // Remove active class from all menu items
      const menuItems = document.querySelectorAll('li.menu-item');
      menuItems.forEach((li) => {
        li.classList.remove('menu-item-active');
        li.setAttribute('aria-selected', 'false');
        li.setAttribute('tabindex', '0');
      });

      // Add active class to clicked item
      target.classList.add('menu-item-active');
      target.setAttribute('aria-selected', 'true');
      target.setAttribute('tabindex', '-1');

      mComponent.clean();

      // Use another requestAnimationFrame to ensure DOM changes are batched
      requestAnimationFrame(() => {
        showHideTab(name);
      });
    });
  }

  const order = new Set();
  const tabs = main.querySelectorAll('.tabs > .tab');

  if (tabs.length) {
    tabs.forEach((tab) => {
      const { tabName } = tab.dataset;
      order.add(tabName);
      
      // Pre-cache tab heights to prevent layout shifts
      tab.style.minHeight = '300px';
    });

    const orderArray = Array.from(order);

    // Create the menu container
    const menu = createElement('div', { props: { className: 'menu-regulation-index' } });

    // Create the unordered list
    const ul = createElement('ul');
    ul.setAttribute('role', 'tablist');
    
    // Set height to prevent layout shifts
    ul.style.minHeight = orderArray.length * 40 + 'px';

    let weHaveTheFirst = false;
    // Create and append list items
    orderArray.forEach((item) => {
      const classWithTheTabName = item.toLowerCase().replace(/\s+/g, '-');
      const li = createElement('li', {
        props: {
          className: `menu-item ${classWithTheTabName}`,
        },
      });
      li.textContent = item;
      li.style.display = (menuToDisplay[classWithTheTabName]) ? 'block' : 'none';

      li.onclick = clickHandler;
      li.setAttribute('role', 'tab');
      li.setAttribute('aria-controls', `tab-${classWithTheTabName}`);
      li.setAttribute('id', `tab-button-${classWithTheTabName.replaceAll(' ', '-')}`);
      li.setAttribute('aria-selected', 'false');
      li.setAttribute('tabindex', '-1');

      if (!weHaveTheFirst && li.style.display === 'block') {
        li.classList.add('menu-item-active');
        li.setAttribute('aria-selected', 'true');
        li.setAttribute('tabindex', '0');

        weHaveTheFirst = true;
      }

      ul.appendChild(li);
    });

    const mobileButton = createElement('div', { props: { className: 'mobile-button-menu' } });
    mobileButton.innerText = mobileButtonTitle;

    mobileButton.setAttribute('role', 'button');
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-controls', 'navigation-menu');
    mobileButton.setAttribute('tabindex', '0');
    mobileButton.setAttribute('arial-label', 'Open Navigation Menu');

    mobileButton.onclick = mComponent.onclick;

    menu.appendChild(mobileButton);

    // Assemble the menu
    menu.appendChild(ul);

    return menu;
  }

  return null;
}

function decorateRegulationPage(menuToDisplay, mobileButtonTitle) {
  const list = {};

  document.querySelector('main').querySelectorAll('[data-tab-name]').forEach((t) => {
    const { tabSectionName, tabName } = t.dataset;
    if (tabName in list) {
      if (tabSectionName in list[tabName]) {
        list[tabName][tabSectionName].push(t);
      } else {
        list[tabName][tabSectionName] = [t];
      }
    } else {
      list[tabName] = {
        [tabSectionName]: [t],
      };
    }
  });

  // Save all elements with data-tab-name attribute in a variable
  const tabElements = document.querySelectorAll('[data-tab-name][data-tab-section-name]');
  const sectionsWithoutTabName = document.querySelectorAll('.section:not([data-tab-name])');

  // Detach all tab elements from the DOM to reattach them later
  tabElements.forEach((t) => {
    // Detach the element (don't reattach yet)
    detachAndReattach(t);

    const { tabSectionName, tabName } = t.dataset;

    if (tabName in list) {
      if (tabSectionName in list[tabName]) {
        list[tabName][tabSectionName].push(t);
      } else {
        list[tabName][tabSectionName] = [t];
      }
    } else {
      list[tabName] = {
        [tabSectionName]: [t],
      };
    }
  });

  // Create the tabs container structure as shown in the comment
  const tabsContainer = createElement('div', { props: { className: 'tabs' } });

  // Iterate through the tabs list
  Object.entries(list).forEach(([tabName, sections]) => {
    // Create a new tab for each entry in the list
    const newTab = createElement('div', { props: { className: 'tab' }, attrs: { 'data-tab-name': tabName } });

    newTab.setAttribute('role', 'tabpanel');
    newTab.setAttribute('id', `tab-${tabName.replaceAll(' ', '-')}`);
    newTab.setAttribute('aria-labelledby', `tab-button-${tabName.replaceAll(' ', '-')}`);

    newTab.classList.add(tabName.toLowerCase().replace(/\s+/g, '-'));

    // Create a header element for the tab name
    const tabHeader = createElement('h2', { props: { className: 'tab-header' } });
    tabHeader.textContent = tabName;
    newTab.appendChild(tabHeader);

    // Create containers for this tab's content
    const descriptionContent = createElement('div', { props: { className: 'tab-description' } });
    const additionalContent = createElement('div', { props: { className: 'tab-additional' } });

    // Add content to the appropriate sections
    Object.entries(sections).forEach(([sectionName, elements]) => {
      elements.forEach((element) => {
        if (sectionName === 'Description') {
          descriptionContent.appendChild(element);
        } else if (sectionName === 'Additional') {
          additionalContent.appendChild(element);
        }
      });
    });

    // Add both sections to the tab
    newTab.appendChild(descriptionContent);
    newTab.appendChild(additionalContent);

    // Add the tab to the tabs container
    tabsContainer.appendChild(newTab);
  });

  // Get the main element and append the tabs container to it
  const main = document.querySelector('main');

  // Clear any existing content from main if needed
  main.innerHTML = ''; // Uncomment if you want to clear main first

  // Create a wrapper with the class "regulation-index"
  const regulationIndexWrapper = createElement('div', { props: { className: 'page-container regulation-index' } });

  // Append the menu to the regulation-index wrapper (if it exists)
  const menu = createMenu(tabsContainer, menuToDisplay, mobileButtonTitle);

  if (menu) {
    regulationIndexWrapper.appendChild(menu);
  }
  regulationIndexWrapper.appendChild(tabsContainer);

  // Append the regulation-index wrapper to the main element
  const pageRegulationIndexPage = createElement('div', { props: { className: 'page page-regulation-index' } });

  // Detach all elements without tab names and reattach them to the page regulation index
  detachAndReattachAll(sectionsWithoutTabName, pageRegulationIndexPage);

  pageRegulationIndexPage.appendChild(regulationIndexWrapper);
  main.appendChild(pageRegulationIndexPage);

  const name = main.querySelector('.menu-regulation-index')?.querySelector('li.menu-item-active')?.classList[1];
  if (name) {
    showHideTab(name);
  }
}

export default async function decorate(doc) {
  const [image, text, _mobileButtonTitle, ...booleans] = doc.children;

  const menuOrden = ['about', 'how-to-apply', 'after-you-apply', 'operate-&-renew']; const menuToDisplay = {};

  const mobileButtonTitle = _mobileButtonTitle.querySelector('p').innerText || 'NAVIGATION';

  booleans.forEach((d, idx) => {
    const el = d.querySelector('p');
    const bool = el?.innerText === 'true';
    if (el) {
      menuToDisplay[menuOrden[idx]] = bool;
    }
    d.remove();
  });

  decorateRegulationPage(menuToDisplay, mobileButtonTitle);

  const div = createElement('div', { props: { className: 'regulation-index-hero' } });

  // Extract the image URL from the image element
  const imageDesktop = image.querySelector('source[type="image/webp"][media]')?.srcset || image.querySelector('img')?.src || '';
  const imageMobile = image.querySelector('source[type="image/webp"]:not([media])')?.srcset || imageDesktop || '';

  // Preload hero images to improve LCP performance
  if (imageDesktop) {
    const preloadDesktop = document.createElement('link');
    preloadDesktop.rel = 'preload';
    preloadDesktop.as = 'image';
    preloadDesktop.href = imageDesktop;
    preloadDesktop.media = '(min-width: 810px)'; // Match desktop media query
    document.head.appendChild(preloadDesktop);
  }

  if (imageMobile && imageMobile !== imageDesktop) {
    const preloadMobile = document.createElement('link');
    preloadMobile.rel = 'preload';
    preloadMobile.as = 'image';
    preloadMobile.href = imageMobile;
    preloadMobile.media = '(max-width: 809px)'; // Match mobile media query
    document.head.appendChild(preloadMobile);
  }

  const h1 = createElement('h1', {});

  // Add the text content to the hero div
  const pElement = text.firstElementChild;
  const pText = pElement.textContent.trim();

  h1.textContent = pText;
  h1.className = 'page-container regulation-index-hero-text';
  div.appendChild(h1);

  detachAndReattach(text.firstElementChild, div);

  pElement.remove();

  // Apply the image as a background to the hero div
  if (imageDesktop) {
    div.style.setProperty('--regulation-hero-image-desktop', `url(${imageDesktop})`);
  }
  if (imageMobile) {
    div.style.setProperty('--regulation-hero-image-mobile', `url(${imageMobile})`);
  }

  doc.innerHTML = '';

  doc.appendChild(div);

  // Add content-visibility to improve performance
  doc.style.contentVisibility = 'auto';
  doc.style.containIntrinsicSize = '0 600px';
}
