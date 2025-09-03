export default function decorate(block) {
  // Create the wrapper structure
  const wrapper = document.createElement('div');
  wrapper.className = 'did-you-mean-container';

  const innerWrapper = document.createElement('div');
  innerWrapper.className = 'did-you-mean-wrapper';

  // Create and add the "Did you mean:" heading
  const heading = document.createElement('h3');
  heading.textContent = 'Did you mean:';
  heading.className = 'did-you-mean-title';
  innerWrapper.appendChild(heading);

  // Create content container
  const content = document.createElement('div');
  content.className = 'did-you-mean-content';

  // Create the buttons list
  const buttonsList = document.createElement('ul');
  buttonsList.className = 'did-you-mean-buttons';

  // Process each row in the block to extract button information
  const rows = [...block.children];
  const maxButtons = 5;
  let buttonCount = 0;

  rows.forEach((row) => {
    // Enforce maximum of 5 buttons
    if (buttonCount >= maxButtons) {
      console.warn(`Did You Mean block: Maximum of ${maxButtons} buttons allowed. Additional buttons will be ignored.`);
      return;
    }

    const buttonContainer = row.querySelector('.button-container');
    if (buttonContainer) {
      const button = buttonContainer.querySelector('a.button');
      if (button) {
        // Create list item
        const listItem = document.createElement('li');
        listItem.className = 'did-you-mean-button-item';

        // Create the link with proper classes
        const link = document.createElement('a');
        link.href = button.href;
        link.title = button.title || button.textContent;
        link.textContent = button.textContent;
        link.className = 'did-you-mean-button';

        listItem.appendChild(link);
        buttonsList.appendChild(listItem);
        buttonCount++;
      }
    }
  });

  content.appendChild(buttonsList);
  innerWrapper.appendChild(content);
  wrapper.appendChild(innerWrapper);

  // Replace the original block content with the new structure
  block.innerHTML = '';
  block.appendChild(wrapper);
}
