import { decorateSections, decorateBlocks } from "./aem.js"

// /**
//  * Processes and groups elements with tab-related data attributes within the given main element.
//  * 
//  * This function:
//  * - Decorates sections within the main element.
//  * - Finds all elements with a `data-tab-name` attribute.
//  * - Groups these elements by their `tabGroup` and `tabName` data attributes.
//  * - For each group, creates a new div with the same dataset and style as the first tab,
//  *   moves all child nodes from the grouped tabs into this new div, and appends it to the main element.
//  * - Removes the original tab elements from the DOM.
//  * - Decorates blocks within the main element after processing.
//  *
//  * @param {HTMLElement} main - The root element containing tab sections to process and group.
//  */
// export function preTabs(main) {
//   decorateSections(main)

//   const group = {}
//   const order = new Set()

//   function createTabDiv(tab) {
//     const dataset = tab.dataset;
//     const div = document.createElement('div');
//     div.className = "section session";

//     // Copy all dataset properties from tab to div
//     Object.keys(dataset).forEach(function(key) {
//       div.dataset[key] = dataset[key];
//     });

//     // Copy style properties from tab to div
//     if (tab.style && div.style) {
//       for (let i = 0; i < tab.style.length; i++) {
//         const prop = tab.style[i];
//         div.style[prop] = tab.style[prop];
//       }
//     }
//     return div;
//   }

//   function getDataset(tab) {
//     return tab.dataset
//   }

//   const tabs = main.querySelectorAll('[data-tab-name]');

//   tabs.forEach(tab => {
//     const {
//       tabName,
//       tabGroup
//     } = getDataset(tab);


//     if (!group[tabGroup]) {
//       group[tabGroup] = {};
//     }
//     if (!group[tabGroup][tabName]) {
//       group[tabGroup][tabName] = [];
//       order.add(tabName)
//     }
//     group[tabGroup][tabName].push(tab);
//   });



//   Object.keys(group).forEach(tabGroup => {
//     Object.keys(group[tabGroup]).forEach(tabName => {
//       const tabsWithSameName = group[tabGroup][tabName] || [];
//       if (tabsWithSameName.length > 0) {
//         const div = createTabDiv(tabsWithSameName[0]);
//         tabsWithSameName.forEach(_tab => {
//           // Move all children from _tab to div
//           while (_tab.firstChild) {
//             div.appendChild(_tab.firstChild);
//           }
//           _tab.remove();
//         });
//         main.appendChild(div);
//       }
//     });
//   });



//   decorateBlocks(main)

// }

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
    // preTabs(main);
  }
}


/**
 * Creates a DOM element with specified properties, styles, and children.
 * 
 * @param {string} tagName - The type of element to create (div, span, etc.)
 * @param {Object} [options={}] - Configuration options for the element
 * @param {Object} [options.props={}] - DOM properties to set on the element
 * @param {Object} [options.attrs={}] - Attributes to set on the element
 * @param {Object} [options.dataset={}] - Dataset attributes to set on the element
 * @param {Object} [options.styles={}] - CSS styles to apply to the element
 * @param {Array|HTMLElement|string} [options.children=[]] - Child elements to append
 * @returns {HTMLElement} The created DOM element
 */
export function createElement(tagName, options = {}) {
  const { 
    props = {}, 
    attrs = {}, 
    dataset = {}, 
    styles = {}, 
    children = []
  } = options;
  
  const element = document.createElement(tagName);
  
  // Set properties
  Object.entries(props).forEach(([key, value]) => {
    element[key] = value;
  });
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  // Set dataset attributes
  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = value;
  });
  
  // Apply styles
  Object.entries(styles).forEach(([key, value]) => {
    element.style[key] = value;
  });
  
  // Append children
  if (Array.isArray(children)) {
    children.forEach(child => appendChild(element, child));
  } else {
    appendChild(element, children);
  }
  
  return element;
}

/**
 * Helper function to append a child to an element
 * 
 * @param {HTMLElement} parent - The parent element
 * @param {HTMLElement|string} child - The child to append (element or string)
 */
export function appendChild(parent, child) {
  if (child === null || child === undefined) return;
  
  if (typeof child === 'string') {
    parent.appendChild(document.createTextNode(child));
  } else {
    parent.appendChild(child);
  }
}