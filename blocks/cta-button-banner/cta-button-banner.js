import { createElement } from '../../scripts/util.js';

export default function decorate(doc) {
  // Get Data
  let docInternal = doc;

  if (doc.children.length === 1) {
    [docInternal] = doc.children;
  }

  // eslint-disable-next-line no-unused-vars
  const type = docInternal.children[0].textContent.trim();

  const title = docInternal.children[1].textContent.trim();
  const description = docInternal.children[2].textContent.trim();
  const button = docInternal.children[3]?.firstElementChild || '';

  // Clear the contents of the doc element
  while (doc.firstChild) {
    doc.removeChild(doc.firstChild);
  }

  const template = `
    <div class="cta-banner-button-text">
      <h5 class="cta-banner-button-text-title">${title}</h5>
      <div class="cta-banner-button-text-description">${description}</div>
    </div>
    <div class="cta-banner-button-action">
      ${button ? button.outerHTML : ''}
    </div>
  `;

  const div = createElement('div');
  div.innerHTML = template;
  doc.appendChild(div);
}
