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
    children = [],
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
    children.forEach((child) => appendChild(element, child));
  } else {
    appendChild(element, children);
  }

  return element;
}

/**
 * Detaches an element from its parent and optionally reattaches it to a new parent.
 * This function allows for DOM elements to be moved rather than cloned.
 *
 * @param {HTMLElement} element - The element to detach
 * @param {HTMLElement} [newParent=null] - Optional new parent to attach the element to
 * @returns {HTMLElement} The detached element
 */
export function detachAndReattach(element, newParent = null) {
  // First check if the element is in the DOM
  const parent = element.parentNode;

  // Only try to remove if there's a parent
  if (parent) {
    // Detach the element from its current parent
    parent.removeChild(element);
  }

  // If a new parent is provided, attach the element to it
  if (newParent) {
    newParent.appendChild(element);
  }

  // Return the element for chaining
  return element;
}

/**
 * Detaches multiple elements from their parents and optionally reattaches them to a new parent.
 * This is a batch version of detachAndReattach.
 *
 * @param {NodeList|HTMLCollection|Array} elements - Collection of elements to detach
 * @param {HTMLElement} [newParent=null] - Optional new parent to attach all elements to
 * @returns {Array} Array of the detached elements
 */
export function detachAndReattachAll(elements, newParent = null) {
  // Convert to array if it's a NodeList or HTMLCollection
  const elementsArray = Array.from(elements);

  // Process each element
  return elementsArray.map((element) => detachAndReattach(element, newParent));
}

export function shadeBackground() {
  function show() {
    const shadeBackgroundElement = createElement('div', { props: { className: 'shade-background' } });
    document.querySelector('body').append(shadeBackgroundElement);
  }

  function destroy() {
    const shadeBackgroundElement = document.querySelector('body').querySelector('.shade-background');
    if (shadeBackgroundElement) {
      shadeBackgroundElement.remove();
    }
  }

  return {
    show,
    destroy,
  };
}


  export function getKeyValueData(block, format={}){
  const data = [...block.children];
  const r = {}

  data.forEach(function(ele){
    const [keyContent, valueContent] = [...ele.children];
    const key = keyContent.textContent.trim();

    const f= format[key] || 'default';

    // if(key in keys){
        switch (f) {
          case 'html':
            r[key] = valueContent.children
            break;
          default:
           r[key] = valueContent.textContent.trim();
            break;
        }
    // }
    
    
  });



  return r;
}