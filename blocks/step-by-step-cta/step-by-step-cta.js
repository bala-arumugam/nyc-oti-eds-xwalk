import { createElement } from "../../scripts/util.js";

export default function decorate(block) {
  const [titleElement, descriptionElement, buttonElement,  pictureElement] = block.children;

  const a = createElement('div', {props:{className:"step-by-step-cta-picture"}})
  const b = createElement('div', {props:{className:"step-by-step-cta-content"}})
  const img = pictureElement.querySelector('img');
  if (img) {
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
  }
  a.appendChild(pictureElement);

  const button = buttonElement.children[0].children[0]
  button.querySelector("a").appendChild(createElement('span',{props:{className:"icon icon-arrow-right-white"}}))

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
  return;
}
