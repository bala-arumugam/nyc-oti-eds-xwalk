

/**
 * Extract property key-value pairs from block content
 * @param {Element} block - The block element to process
 * @returns {Object} Object with extracted properties
 */
function getProps(block) {
  const props = {};
  
  // Process each child element in the block
  [...block.children].forEach(element => {
    const children = element.querySelectorAll("div");

    if (children.length === 2) {
      const [keyDiv, valueDiv] = children;
      
      if (keyDiv && valueDiv) {
        const key = keyDiv.textContent.trim();
        const value = valueDiv.innerHTML.trim();
        
        if (key) {
          props[key] = value;
          keyDiv.remove();
          valueDiv.remove();
        }
      }
    }
  });
  
  return props;
}

/**
 * Decorates the process block
 * @param {Element} block - The block element to decorate
 */
export default function decorate(block) {
  // Extract title and content from block properties
  const { title, content } = getProps(block);
  
  // Get direct div children of the block
  const divs = block.querySelectorAll(':scope > div');
  
  // Destructure divs into header, container, and other elements
  const [header, container, ...otherElements] = [...divs];

  // Set up header if it exists and title is available
  if (header && title) {
    header.classList.add('process-header');
    header.innerHTML = title;
  }
  
  // Set up container if it exists and content is available
  if (container) {
    container.classList.add('process-container');
    
    if (content) {
      container.innerHTML = content;
    }
    
    // Append other elements to container if they exist
    if (otherElements.length > 0) {
      otherElements.forEach(element => {
        if (element) {
          container.appendChild(element);
        }
      });
    }
  }
  
  // Clean up any remaining elements
  otherElements.forEach(element => {
    if (element && element.parentNode === block) {
      element.remove();
    }
  });
}