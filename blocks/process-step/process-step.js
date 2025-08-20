import {
  loadBlock,
} from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { createElement, detachAndReattach } from '../../scripts/util.js';

export default async function decorate(block) {
 const [data, ...datab] = block.children;

  const isEmpty = !data.textContent.trim();

  let stepElement=data, others=datab;
  
  if(isEmpty){
    stepElement = datab;
    others = [];
  }

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

    others.forEach(async (element) => {
      const componentType = element.children[0].textContent.trim();
      element.children[0].textContent = '';

      const divElement = createElement('div', { props: { className: componentType } });
      detachAndReattach(element, divElement);
      moveInstrumentation(element, divElement);
      divElement.dataset.blockStatus = 'ini';
      divElement.dataset.blockName = componentType;
      await loadBlock(divElement);
      div.append(divElement);
    });

    block.appendChild(div);
  }
}
