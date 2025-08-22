import { createElement } from '../../scripts/util.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Checks if an element is likely to be in the viewport on initial load
 * @param {HTMLElement} el - The element to check
 * @return {boolean} - True if element is likely in viewport
 */
function isLikelyInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 1.5
  );
}

export default function decorate(block) {
  const [titleElement, descriptionElement, buttonElement, pictureElement] = block.children;

  const a = createElement('div', { props: { className: 'step-by-step-cta-picture' } });
  const b = createElement('div', { props: { className: 'step-by-step-cta-content' } });
  const img = pictureElement.querySelector('img');
  if (img) {
    // Determine if image should load eagerly based on viewport position
    const isEager = isLikelyInViewport(pictureElement);
    
    // Define responsive breakpoints for better performance
    const breakpoints = [
      { media: '(min-width: 900px)', width: '1200' },
      { media: '(min-width: 600px)', width: '900' },
      { width: '600' }
    ];
    
    // Create optimized picture element
    const optimizedPicture = createOptimizedPicture(img.src, img.alt, isEager, breakpoints);
    
    // Apply styles to the new optimized image
    const newImg = optimizedPicture.querySelector('img');
    newImg.style.width = '100%';
    newImg.style.height = '100%';
    newImg.style.objectFit = 'cover';
    newImg.decoding = 'async';
    
    // Replace original image with optimized picture
    pictureElement.innerHTML = '';
    pictureElement.appendChild(optimizedPicture);
  }
  a.appendChild(pictureElement);

  const button = buttonElement.children[0].children[0];
  button.querySelector('a').appendChild(createElement('span', { props: { className: 'icon icon-arrow-right-white' } }));

  const contentHTML = `
    <div>
      <h3>${titleElement.textContent.trim()}</h3>
      <div class="description">${descriptionElement.outerHTML}</div>
      ${button.outerHTML} 
    </div>
  `;

  b.innerHTML = contentHTML;

  // Remove all content inside the block
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }

  // Instead of creating a parent div, append children directly to block
  block.appendChild(a);
  block.appendChild(b);

  // Remove the line that sets block.innerHTML = div.outerHTML;
}
