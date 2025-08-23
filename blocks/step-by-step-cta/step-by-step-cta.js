import { createElement } from '../../scripts/util.js';

export default function decorate(block) {
  const [titleElement, descriptionElement, buttonElement, pictureElement] = block.children;

  const a = createElement('div', { props: { className: 'step-by-step-cta-picture' } });
  const b = createElement('div', { props: { className: 'step-by-step-cta-content', style: 'contain-intrinsic-size: 100% 468px' } });
  const img = pictureElement.querySelector('img');
  if (img) {
    // Set explicit width/height attributes to reduce CLS
    if (!img.hasAttribute('width')) img.setAttribute('width', '100%');
    if (!img.hasAttribute('height')) img.setAttribute('height', 'auto');
    // Set CSS properties after attributes are defined
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    // Add loading attribute if not already present
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'eager');
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
