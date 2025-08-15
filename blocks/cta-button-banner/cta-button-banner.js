import { createElement } from "../../scripts/util.js";

export default function decorate(doc) {
  // Get Data
  const title = doc.children[0].textContent.trim();
  const description = doc.children[1].textContent.trim();
  const button = doc.children[2]?.firstElementChild;
  // Clear the contents of the doc element
  while (doc.firstChild) {
    doc.removeChild(doc.firstChild);
  }

  const template =   `
    <div class="cta-banner-button-text">
      <h5 class="cta-banner-button-text-title">${title}</h5>
      <div class="cta-banner-button-text-description">${description}</div>
    </div>
    <div class="cta-banner-button-action">
      ${button ? button.outerHTML : ''}
    </div>
  `;

  const div = createElement("div")
  div.innerHTML = template;
  doc.appendChild(div);
}