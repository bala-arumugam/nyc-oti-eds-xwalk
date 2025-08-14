import getContentFragment from '../../scripts/regulation-page-labels.js';

export default function decorate(block) {
  // Clear existing content to rebuild it properly
  const originalContent = Array.from(block.children);
  block.innerHTML = '';

  // Create a proper structured container for contact info
  const container = document.createElement('div');
  container.className = 'contact-info-container';

  // Create the header with translated text
  const header = document.createElement('h3');
  header.className = 'contact-info-header';
  header.textContent = getContentFragment.getWord('contactInfo');
  container.appendChild(header);

  // Process the content div if it exists (second div in the original block)
  if (originalContent.length > 1) {
    const contentDiv = originalContent[1];

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'contact-info-content';

    // Transfer the content
    if (contentDiv.innerHTML.trim()) {
      contentContainer.innerHTML = contentDiv.innerHTML;
    } else {
      // If no content, provide a placeholder or default message
      const placeholderText = document.createElement('p');
      placeholderText.className = 'contact-info-placeholder';
      placeholderText.textContent = 'Contact information will be displayed here.';
      contentContainer.appendChild(placeholderText);
    }

    container.appendChild(contentContainer);
  }

  // Append the fully built container to the block
  block.appendChild(container);

  // Add a processed class to indicate this block has been handled
  block.classList.add('contact-info-processed');
}
