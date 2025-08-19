// import { createElement } from '../../scripts/util.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {

    const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
      const li = document.createElement('li');
      moveInstrumentation(row, li);
      
      ul.append(li);
    });

  block.textContent = '';
  block.append(ul);


  // // Get data
  // const [titleElement, stepElement] = doc.children;

  // const title = titleElement.textContent.trim();

  // const template = createElement('div', { props: { className: 'process-step-content' } });
  // const newTitle = createElement('div', { props: { className: 'process-step-title' } });

  // if (title) {
  //   newTitle.innerText(title);
  // }

  // template.appendChild(newTitle);
  // template.appendChild(stepElement.children[0]);

  // // Clear the content of doc
  // while (doc.firstChild) {
  //   doc.removeChild(doc.firstChild);
  // }

  // // Create and append the process step template
  // const processStep = template.cloneNode(true);
  // doc.appendChild(processStep);

  // return processStep;
  

  





}
