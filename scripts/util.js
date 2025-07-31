import { decorateSections, decorateBlocks } from "./aem.js"

/**
 * Processes and groups elements with tab-related data attributes within the given main element.
 * 
 * This function:
 * - Decorates sections within the main element.
 * - Finds all elements with a `data-tab-name` attribute.
 * - Groups these elements by their `tabGroup` and `tabName` data attributes.
 * - For each group, creates a new div with the same dataset and style as the first tab,
 *   moves all child nodes from the grouped tabs into this new div, and appends it to the main element.
 * - Removes the original tab elements from the DOM.
 * - Decorates blocks within the main element after processing.
 *
 * @param {HTMLElement} main - The root element containing tab sections to process and group.
 */
export function preTags(main) {
  decorateSections(main)

  const group = {}
  const order = new Set()

  function createTabDiv(tab) {
    const { sectionStatus, tabName, tabGroup } = tab.dataset;
    const div = document.createElement('div');
    div.className = "section session";
    div.dataset.sectionStatus = sectionStatus;
    div.dataset.tabName = tabName;
    div.dataset.tabGroup = tabGroup;
    // Copy style properties from tab to div
    if (tab.style && div.style) {
      for (let i = 0; i < tab.style.length; i++) {
        const prop = tab.style[i];
        div.style[prop] = tab.style[prop];
      }
    }
    return div;
  }

  function getDataset(tab) {
    return tab.dataset
  }

  const tabs = main.querySelectorAll('[data-tab-name]');

  tabs.forEach(tab => {
    const {
      tabName,
      tabGroup
    } = getDataset(tab);


    if (!group[tabGroup]) {
      group[tabGroup] = {};
    }
    if (!group[tabGroup][tabName]) {
      group[tabGroup][tabName] = [];
      order.add(tabName)
    }
    group[tabGroup][tabName].push(tab);
  });



  Object.keys(group).forEach(tabGroup => {
    Object.keys(group[tabGroup]).forEach(tabName => {
      const tabsWithSameName = group[tabGroup][tabName] || [];
      if (tabsWithSameName.length > 0) {
        const div = createTabDiv(tabsWithSameName[0]);
        tabsWithSameName.forEach(_tab => {
          // Move all children from _tab to div
          while (_tab.firstChild) {
            div.appendChild(_tab.firstChild);
          }
          _tab.remove();
        });
        main.appendChild(div);
      }
    });
  });



  decorateBlocks(main)

}

/**
 * Automatically processes the given main element by checking for elements with the 'data-tab-name' attribute.
 * If such elements are found, it calls the preTags function on the main element.
 *
 * @async
 * @param {HTMLElement} main - The main DOM element to process.
 * @returns {Promise<void>} A promise that resolves when processing is complete.
 */
export async function autoBlock(main) {
  if (main.querySelectorAll('[data-tab-name]')) {
    preTags(main);
  }
}