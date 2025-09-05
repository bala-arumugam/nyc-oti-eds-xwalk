export default function decorate(block) {
  const metaTag = document.querySelector('meta[name="page-property-name"]');
  const metaContent = metaTag ? metaTag.getAttribute('content') : '';

  let titleElement = block.querySelector('h1');

  if (!titleElement) {
    titleElement = document.createElement('h1');
    titleElement.className = 'hero-title';
    block.insertBefore(titleElement, block.firstChild);
  }

  let titleText = '';

  if (metaContent && metaContent.trim() !== '') {
    titleText = metaContent.trim();
  } else {
    const existingText = titleElement.textContent.trim();
    titleText = existingText || 'Default Hero Title';
  }

  titleElement.textContent = titleText;

  [...block.children].forEach((child) => {
    if (child !== titleElement) {
      if (child.tagName === 'P') {
        child.classList.add('hero-description');
      } else if (child.querySelector('a')) {
        child.classList.add('hero-cta');
      }
    }
  });
}
