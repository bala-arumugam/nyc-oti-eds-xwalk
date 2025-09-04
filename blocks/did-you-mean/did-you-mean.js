import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Create the wrapper structure first
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

  // Change to ul, li structure like cards
  const ul = document.createElement('ul');
  ul.className = 'did-you-mean-buttons';

  const maxButtons = 5;
  let buttonCount = 0;

  [...block.children].forEach((row) => {
    if (buttonCount >= maxButtons) {
      return;
    }
    const li = document.createElement('li');
    li.className = 'did-you-mean-button-item';
    moveInstrumentation(row, li);
    
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    [...li.children].forEach((div) => {
      const linkElement = div.querySelector('a[href]');
      if (linkElement) {
        linkElement.className = 'did-you-mean-button';
        div.className = 'did-you-mean-link-container';
      } else if (div.textContent.trim()) {
        // For text content
        div.className = 'did-you-mean-text';
      }
    });

    if (li.children.length > 0) {
      ul.append(li);
      buttonCount += 1;
    }
  });

  content.appendChild(ul);
  container.appendChild(content);
  wrapper.appendChild(container);

  block.textContent = '';
  block.append(wrapper);
}
