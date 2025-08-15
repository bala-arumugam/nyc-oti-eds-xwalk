import { createElement } from "../../scripts/util";

export default function decorate(doc) {
  // Get Data
  const title = doc.children[0].textContent.trim();
  const description = doc.children[1].textContent.trim();
  const button = doc.children[2].doc.children[2].firstElementChild;
    doc.innerHtml = ``;

  const template =   `
    <div class="cta-banner-button-text">
      <div class="cta-banner-button-text-title">${title}</div>
      <div class="cta-banner-button-text-description">${description}</div>
    </div>
    <div class="cta-banner-button-action">
      ${button}
    </div>
  `;

  const div = createElement("div", {props:{className:"cta-banner-button"}})
  div.innerHTML = template;



  doc.appendChild(div);

}
