import { decorateButtons } from '../../scripts/aem.js';
import { createElement, detachAndReattach } from '../../scripts/util.js';

export default function decorate(block) {
  const [stepElement, ...others] = block.children;

  const title = undefined;

  const template = createElement('div', { props: { className: 'process-step-content' } });
  const newTitle = createElement('div', { props: { className: 'process-step-title' } });

  if (title) {
    newTitle.innerText = title;
  }

  template.appendChild(newTitle);
  template.appendChild(stepElement.children[0]);

  // Clear the content of doc
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }

  // Create and append the process step template
  const processStep = template.cloneNode(true);
  block.appendChild(processStep);

  if (others.length) {
    const div = createElement('div', { props: { className: 'process-step-components' } });

    others.forEach((element) => {
      const componentType = element.children[0].textContent.trim();
      element.children[0].remove();

      const divElement = createElement('div', { props: { className: 'component-item' } });
      detachAndReattach(element, divElement);

      div.append(divElement);
    });


    decorateButtons(div);
    block.appendChild(div);
  }
}
