import { createElement, detachAndReattach, detachAndReattachAll } from '../../scripts/util.js';

function showHideTab(name) {
  const tabs = document.querySelector('main').querySelector('.tabs').querySelectorAll('.tab');
  tabs.forEach((tab) => {
    const t = tab.classList.contains(name);
    tab.style.display = t ? 'block' : 'none';
  });
}

function createMenu(main, menuToDisplay) {
  function clickHandler(event) {
    const { target } = event;
    const name = target.classList[1];

    if (target.classList.contains('menu-item-active')) {
      // Skip if the clicked item is already active
      return;
    }

    // Remove active class from all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((item) => item.classList.remove('menu-item-active'));

    // Add active class to clicked item
    target.classList.add('menu-item-active');
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
    const menu = createElement('div', { props: { className: 'menu-regulation-index' } });

    // Create the unordered list
    const ul = createElement('ul');

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

      if (!weHaveTheFirst && li.style.display === 'block') {
        li.classList.add('menu-item-active');
        weHaveTheFirst = true;
      }

      ul.appendChild(li);
    });

    // Assemble the menu
    menu.appendChild(ul);

    return menu;
  }

  return null;
}

function decorateRegulationPage(menuToDisplay) {
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

    newTab.classList.add(tabName.toLowerCase().replace(/\s+/g, '-'));

    // Create a header element for the tab name
    const tabHeader = createElement('h3', { props: { className: 'tab-header' } });
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
  const menu = createMenu(tabsContainer, menuToDisplay);

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
  const [image, text, ...booleans] = doc.children;

  const menuOrden = ['about', 'how-to-apply', 'after-you-apply', 'operate-&-renew']; const menuToDisplay = {};

  booleans.forEach((d, idx) => {
    const el = d.querySelector('p');
    const bool = el?.innerText === 'true';
    if (el) {
      menuToDisplay[menuOrden[idx]] = bool;
    }
    d.remove();
  });

  decorateRegulationPage(menuToDisplay);

  const div = createElement('div', { props: { className: 'regulation-index-hero' } });

  // Extract the image URL from the image element
  const imageUrl = image.querySelector('img')?.src || '';

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
  if (imageUrl) {
    div.style.setProperty('--regulation-hero-image', `url(${imageUrl})`);
  }

  doc.innerHTML = '';

  doc.appendChild(div);
}
