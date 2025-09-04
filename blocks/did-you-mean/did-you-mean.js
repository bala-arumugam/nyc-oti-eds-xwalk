import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'did-you-mean-wrapper';

  const container = document.createElement('div');
  container.className = 'did-you-mean-container-inner';

  const heading = document.createElement('h3');
  heading.textContent = 'Did you mean:';
  heading.className = 'did-you-mean-title';
  container.appendChild(heading);

  const content = document.createElement('div');
  content.className = 'did-you-mean-content';

  const buttonsList = document.createElement('ul');
  buttonsList.className = 'did-you-mean-buttons';

  const maxButtons = 5;
  let buttonCount = 0;

  [...block.children].forEach((row) => {
    if (buttonCount >= maxButtons) {
      return;
    }

    const listItem = document.createElement('li');
    listItem.className = 'did-you-mean-button-item';

    moveInstrumentation(row, listItem);

    while (row.firstElementChild) {
      listItem.append(row.firstElementChild);
    }

    const childDivs = [...listItem.children];
    childDivs.forEach((div) => {
      const linkElement = div.querySelector('a[href]');
      if (linkElement) {
        div.className = 'did-you-mean-link';
        linkElement.className = 'did-you-mean-button';
        listItem.appendChild(linkElement);
        div.remove();
      } else if (div.textContent.trim()) {
        div.className = 'did-you-mean-text';
      }
    });

    const hasLink = listItem.querySelector('a[href]');
    if (hasLink) {
      buttonsList.append(listItem);
      buttonCount += 1;
    }
  });

  content.appendChild(buttonsList);
  container.appendChild(content);

  wrapper.appendChild(container);

  block.textContent = '';
  block.append(wrapper);
}
