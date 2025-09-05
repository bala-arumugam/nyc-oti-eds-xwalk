import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Search for the meta tag with name="page-property-name"
  const metaTag = document.querySelector('meta[name="page-property-name"]');
  const metaContent = metaTag ? metaTag.getAttribute('content') : '';
  
  // Find or create the h1 title element
  let titleElement = block.querySelector('h1');
  
  if (!titleElement) {
    // If no h1 exists, create one
    titleElement = document.createElement('h1');
    titleElement.className = 'hero-title';
    block.insertBefore(titleElement, block.firstChild);
  }
  
  // Determine what text to use for the title
  let titleText = '';
  
  if (metaContent && metaContent.trim() !== '') {
    // Use meta content if it exists and is not empty
    titleText = metaContent.trim();
  } else {
    // Fall back to the existing text in the component
    const existingText = titleElement.textContent.trim();
    titleText = existingText || 'Default Hero Title';
  }
  
  // Set the title text
  titleElement.textContent = titleText;
  
  // Process any other content in the hero block
  [...block.children].forEach((child) => {
    if (child !== titleElement) {
      // Apply appropriate classes to other elements
      if (child.tagName === 'P') {
        child.classList.add('hero-description');
      } else if (child.querySelector('a')) {
        child.classList.add('hero-cta');
      }
    }
  });
}
