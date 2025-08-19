import {
  createElement, detachAndReattach, detachAndReattachAll, shadeBackground,
} from '../../scripts/util.js';
import getContentFragment from '../../scripts/regulation-page-labels.js';
import { decorateIcons } from '../../scripts/aem.js';

function showHideTab(name) {
  const tabs = document.querySelector('main').querySelector('.tabs').querySelectorAll('.tab');
  tabs.forEach((tab) => {
    const t = tab.classList.contains(name);
    tab.style.display = t ? 'block' : 'none';
    tab.setAttribute('tabindex', t ? '0' : -1);
  });
}

function menuMobileComponent() {
  const { show, destroy } = shadeBackground();

  // Listen for window resize events to toggle mobile menu visibility
  const mediaQuery = window.matchMedia('(max-width: 810px)');

  // Function to check if screen is mobile size and apply necessary changes
  function handleScreenSizeChange(e) {
    const menuA = document.querySelector('.menu-regulation-page ul');
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
    const menu = document.querySelector('.menu-regulation-page ul');
    show();
    menu.classList.add('mobile');
  }

  function clean() {
    const menu = document.querySelector('.menu-regulation-page ul');
    destroy();
    menu.classList.remove('mobile');
  }
  return {
    onclick,
    clean,
  };
}

const additionalTitleLabels = {
  about: {
    title: getContentFragment.getLabel('readyToApply'),
  },
};

const accordionLabels = {
  applyOnline: {
    title: getContentFragment.getLabel('applyOnline'),
    heading: getContentFragment.getLabel('stepsToApplyOnline'),
    button: 'applyOnlineButton',
    icon: 'icon-online',
  },
  applyInPerson: {
    title: getContentFragment.getLabel('applyInPerson'),
    heading: getContentFragment.getLabel('stepsToApplyInPerson'),
    icon: 'icon-person',
  },
  applyByMail: {
    title: getContentFragment.getLabel('applyByMail'),
    heading: getContentFragment.getLabel('stepsToApplyByMail'),
    icon: 'icon-mail',
  },
  readyToRenew: {
    title: getContentFragment.getLabel('readyToRenew'),
    heading: getContentFragment.getLabel('optionsToReview'),
    icon: 'icon-online',
  },
  renewOnline: {
    title: getContentFragment.getLabel('renewOnline'),
    heading: getContentFragment.getLabel('stepsToRenewOnline'),
    icon: 'icon-online',
  },
  renewInPerson: {
    title: getContentFragment.getLabel('renewInPerson'),
    heading: getContentFragment.getLabel('stepsToRenewInPerson'),
    icon: 'icon-person',
  },
  renewByMail: {
    title: getContentFragment.getLabel('renewByMail'),
    heading: getContentFragment.getLabel('stepsToRenewByMail'),
    button: 'renewOnlineButton',
    icon: 'icon-mail',
  },
};

function createAccordion(element) {
  function openCloseAction(ev) {
    const accordionItem = ev.target.closest('.accordion-item');
    if (accordionItem) {
      const isExpanded = !accordionItem.classList.contains('close');
      accordionItem.classList.toggle('close');

      // Update ARIA attributes
      const header = accordionItem.querySelector('.accordion-header');
      // Toggle aria-expanded based on the new state
      header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    }
  }

  const { accordionTitle } = element.dataset;

  const contentAccordion = accordionLabels[accordionTitle] || {};

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = `
    <div class="accordion-item close" role="region" aria-label="${contentAccordion.title}">
      <div class="accordion-header" role="button" aria-expanded="false" tabindex="0">
        <div class="accordion-title">
          ${contentAccordion.icon ? `<span class="icon ${contentAccordion.icon}" aria-hidden="true"></span>` : ''}
          ${contentAccordion.title}
        </div>
        <div class="accordion-caret" aria-hidden="true"></div>
      </div>
      <div class="accordion-content" ${contentAccordion.button ? `data-accordion-button="${contentAccordion.button}"` : ''} id="accordion-content-${accordionTitle}">
          ${contentAccordion.heading ? `<div class="accordion-content-header"><h5>${contentAccordion.heading}</h5></div>` : ''}
      </div>
    </div>
  `;

  tempDiv.querySelector('.accordion-header').onclick = openCloseAction;
  tempDiv.querySelector('.accordion-content').appendChild(element);

  decorateIcons(tempDiv);

  return tempDiv.firstElementChild;
}

function addTabSectionHeaders(tabType, descriptionContainer) {
  // Map tab types to their corresponding content fragment keys
  const tabHeaderMapping = {
    'how-to-apply': 'reviewTheseStepsBeforeYouSubmitYourApplication',
    'after-you-apply': 'afterYouSubmitYourApplicationReviewTheseItems',
    'operating-and-renewing': 'operatingRequirements',
  };
  // Check if this tab type needs a special header
  const labelKey = tabHeaderMapping[tabType];
  if (!labelKey) return;
  // Get the text from content fragment
  const headerText = getContentFragment.getLabel(labelKey);
  if (!headerText) return;
  // Find the section element in the description container
  // First try to find a process-step-container section (prioritize this)
  let section = descriptionContainer.querySelector('.section.process-step-container[data-tab-section-name="Description"]');
  // If not found, try to find a standard section with Description tab section name
  if (!section) {
    section = descriptionContainer.querySelector('.section[data-tab-section-name="Description"]');
  }
  // If still not found, look for any section with Description tab section name
  if (!section) {
    section = descriptionContainer.querySelector('[data-tab-section-name="Description"]');
  }
  if (!section) return;
  // Check for existing h4 anywhere in the section
  const existingH4 = Array.from(section.querySelectorAll('h4'))
    .find((h) => h.textContent.includes(headerText));
  if (existingH4) {
    // If h4 exists but isn't at the top, move it to the top
    if (section.firstChild !== existingH4) {
      section.insertBefore(existingH4, section.firstChild);
    }
    return;
  }
  // Create the h4 element with an ID
  const h4 = createElement('h4', { props: { className: 'sub-title-description-section' } });
  h4.textContent = headerText;
  h4.id = headerText.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  // For process-step-container, insert h4 directly at the beginning of the section
  if (section.classList.contains('process-step-container')) {
    // Create a default-content-wrapper if needed
    let contentWrapper = section.querySelector('.default-content-wrapper');
    if (!contentWrapper) {
      contentWrapper = createElement('div', { props: { className: 'default-content-wrapper' } });
      // Insert the wrapper at the beginning of the section
      section.insertBefore(contentWrapper, section.firstChild);
    }
    // Add h4 to the content wrapper
    contentWrapper.appendChild(h4);
  } else {
    // Standard section handling
    let contentWrapper = section.querySelector('.default-content-wrapper');
    if (!contentWrapper) {
      contentWrapper = createElement('div', { props: { className: 'default-content-wrapper' } });
      section.appendChild(contentWrapper);
    }
    // Insert the h3 at the beginning of content wrapper
    contentWrapper.insertBefore(h4, contentWrapper.firstChild);
  }
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

    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('li.menu-item');
    menuItems.forEach((li) => {
      li.classList.remove('menu-item-active');
      li.setAttribute('aria-selected', 'false');
      li.setAttribute('tabindex', '0');
    });

    // Add active class to all menu items
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

    showHideTab(name);
  }

  const order = new Set();
  const tabs = main.querySelectorAll('.tabs > .tab');

  if (tabs.length) {
    tabs.forEach((tab) => {
      const { tabName } = tab.dataset;
      order.add(tabName);
    });

    const orderArray = Array.from(order);

    // Create the menu container
    const menu = createElement('div', { props: { className: 'menu-regulation-page' } });

    // Create the unordered list
    const ul = createElement('ul');
    ul.setAttribute('role', 'tablist');

    let weHaveTheFirst = false;
    // Create and append list items
    orderArray.forEach((item) => {
      const classWithTheTabName = item.toLowerCase().replace(/\s+/g, '-');
      const li = createElement('li', {
        props: {
          className: `menu-item ${classWithTheTabName}`,
        },
      });
      // Use getContentFragment.getLabel() to get the translated text based on tab name
      if (classWithTheTabName === 'about') {
        li.textContent = getContentFragment.getLabel('aboutTab');
      } else if (classWithTheTabName === 'how-to-apply') {
        li.textContent = getContentFragment.getLabel('howToApplyTab');
      } else if (classWithTheTabName === 'after-you-apply') {
        li.textContent = getContentFragment.getLabel('afterYouApplyTab');
      } else if (classWithTheTabName === 'operating-and-renewing') {
        li.textContent = getContentFragment.getLabel('operatingAndRenewingTab');
      } else {
        li.textContent = item; // Fallback to the original text if no match
      }

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

  const main = document.querySelector('main');
  main.querySelectorAll('[data-tab-name]').forEach((t) => {
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

  const sectionsWithoutTabName = document.querySelectorAll('.section:not([data-tab-name])');

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

    // Map tab names to their corresponding label keys and use getContentFragment.getLabel()
    // to get the appropriate text for each tab
    const tabNameLower = tabName.toLowerCase().replace(/\s+/g, '-');
    if (tabNameLower === 'about') {
      tabHeader.textContent = getContentFragment.getLabel('aboutTab');
    } else if (tabNameLower === 'how-to-apply') {
      tabHeader.textContent = getContentFragment.getLabel('howToApplyTab');
    } else if (tabNameLower === 'after-you-apply') {
      tabHeader.textContent = getContentFragment.getLabel('afterYouApplyTab');
    } else if (tabNameLower === 'operating-and-renewing') {
      tabHeader.textContent = getContentFragment.getLabel('operatingAndRenewingTab');
    } else {
      tabHeader.textContent = tabName; // Fallback to the original tab name
    }

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
          if (tabNameLower === 'about') { // Render Normal
            additionalContent.appendChild(element);
          } else { // Render as accordion
            if (additionalTitleLabels[tabNameLower]) { // Add the title for the rendered accordion
              additionalContent.appendChild(additionalTitleLabels[tabNameLower].title);
            }
            additionalContent.appendChild(createAccordion(element));
          }
        }
      });
    });

    // Add section headers to descriptions based on tab type
    addTabSectionHeaders(tabNameLower, descriptionContent);

    // Add both sections to the tab
    newTab.appendChild(descriptionContent);
    newTab.appendChild(additionalContent);

    // Add the tab to the tabs container
    tabsContainer.appendChild(newTab);
  });

  // Create a wrapper with the class "regulation-page"
  const regulationIndexWrapper = createElement('div', { props: { className: 'page-container regulation-page' } });

  // Append the menu to the regulation-page wrapper (if it exists)
  const menu = createMenu(tabsContainer, menuToDisplay, mobileButtonTitle);

  if (menu) {
    regulationIndexWrapper.appendChild(menu);
  }
  regulationIndexWrapper.appendChild(tabsContainer);

  // Append the regulation-page wrapper to the main element
  const pageRegulationIndexPage = createElement('div', { props: { className: 'page page-regulation-page' } });

  // Detach all elements without tab names and reattach them to the page regulation index
  detachAndReattachAll(sectionsWithoutTabName, pageRegulationIndexPage);

  pageRegulationIndexPage.appendChild(regulationIndexWrapper);
  // main.appendChild(pageRegulationIndexPage);

  return pageRegulationIndexPage;
}

export default async function decorate(doc) {
  const [image, text, _mobileButtonTitle, ...booleans] = doc.children;

  const menuOrden = ['about', 'how-to-apply', 'after-you-apply', 'operating-and-renewing'];
  const menuToDisplay = {};

  const mobileButtonTitle = _mobileButtonTitle?.querySelector('p')?.innerText || 'NAVIGATION';

  booleans.forEach((d, idx) => {
    const el = d.querySelector('p');
    const bool = el?.innerText === 'true';
    if (el) {
      menuToDisplay[menuOrden[idx]] = bool;
    }
    d.remove();
  });

  const div = createElement('div', { props: { className: 'regulation-page-hero' } });

  // Extract the image URL from the image element
  const imageDesktop = image.querySelector('source[type="image/webp"][media]')?.srcset;
  const imageMobile = image.querySelector('source[type="image/webp"]:not([media])')?.srcset;

  const h1 = createElement('h1', {});

  // Get the page metadata for jcr:title instead of using the text from pElement
  // This will use the "Page Name" from the page metadata
  const pageTitle = document.querySelector('meta[name="page-property-name"]')?.content
                  || document.title;
  h1.textContent = pageTitle;
  h1.className = 'page-container regulation-page-hero-text';
  div.appendChild(h1);

  // Still need to handle the original text element for cleanup
  const pElement = text.firstElementChild;
  detachAndReattach(text.firstElementChild, div);

  pElement.remove();

  // Apply the image as a background to the hero div
  div.style.setProperty('--regulation-hero-image-desktop', `url(${imageDesktop})`);
  div.style.setProperty('--regulation-hero-image-mobile', `url(${imageMobile})`);

  doc.innerHTML = '';
  doc.style.display = 'none';
  doc.appendChild(div);

  const pageRegulationIndexPage = decorateRegulationPage(menuToDisplay, mobileButtonTitle);
  pageRegulationIndexPage.style.display = 'none';

  // Get the main element and append the tabs container to it
  const main = document.querySelector('main');

  // Clear any existing content from main if needed
  main.innerHTML = ''; // Uncomment if you want to clear main first

  main.appendChild(pageRegulationIndexPage);

  const name = main.querySelector('.menu-regulation-page')?.querySelector('li.menu-item-active')?.classList[1];
  if (name) {
    showHideTab(name);
  }

  doc.style.display = 'block';
  pageRegulationIndexPage.style.display = 'block';
}
