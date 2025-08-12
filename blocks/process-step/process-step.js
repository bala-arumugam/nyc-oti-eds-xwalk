import { createElement } from '../../scripts/util.js';

/**
 * Optimizes images to prevent layout shifts and improve LCP
 * @param {Element} element The element containing images to optimize
 */
function optimizeImages(element) {
  if (!element) return;
  
  const images = element.querySelectorAll('img');
  const pictures = element.querySelectorAll('picture');
  
  // Handle images within picture elements
  pictures.forEach((picture, index) => {
    const img = picture.querySelector('img');
    if (!img) return;
    
    // First image might be part of LCP, optimize accordingly
    if (index === 0) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
      
      // Create a preload link for potential LCP image
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = img.src;
      preloadLink.type = img.src.endsWith('.svg') ? 'image/svg+xml' : 
                         (img.src.endsWith('.png') ? 'image/png' : 'image/jpeg');
      document.head.appendChild(preloadLink);
    } else {
      img.setAttribute('loading', 'lazy');
    }
    
    // Set dimensions if not present to prevent layout shifts
    if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
      // Default to reasonable dimensions based on parent container
      const parentWidth = element.offsetWidth || 300;
      img.setAttribute('width', img.width || parentWidth);
      img.setAttribute('height', img.height || Math.round(parentWidth * 0.6));
    }
    
    // Add placeholder styling
    picture.style.minHeight = `${img.height}px`;
    picture.style.minWidth = `${img.width}px`;
    picture.style.display = 'block';
    picture.style.backgroundColor = '#f0f0f0';
  });
  
  // Handle direct img elements (not in picture)
  images.forEach((img, index) => {
    // Skip images already handled within picture elements
    if (img.closest('picture')) return;
    
    if (index === 0) {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    } else {
      img.setAttribute('loading', 'lazy');
    }
    
    // Set dimensions if not present
    if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
      const parentWidth = element.offsetWidth || 300;
      img.setAttribute('width', img.width || parentWidth);
      img.setAttribute('height', img.height || Math.round(parentWidth * 0.6));
    }
    
    // Add placeholder styling
    img.style.backgroundColor = '#f0f0f0';
  });
}

export default function decorate(doc) {
  // Get data
  const [titleElement, stepElement] = doc.children;

  const title = titleElement.textContent.trim();

  // Create components with proper dimensions to prevent layout shifts
  const template = createElement('div', { 
    props: { 
      className: 'process-step-content' 
    },
    attrs: {
      // Reserve space to prevent layout shifts
      'style': 'min-height: 60px; contain: content;'
    }
  });
  
  const newTitle = createElement('div', { 
    props: { 
      className: 'process-step-title' 
    },
    attrs: {
      // Reserve space for title to prevent layout shifts
      'style': title ? 'min-height: 24px;' : ''
    }
  });

  if (title) {
    // Use textContent instead of innerText (which is not a function)
    newTitle.textContent = title;
  }

  template.appendChild(newTitle);
  
  // Append content with optimization for layout stability
  const contentElement = stepElement.children[0];
  
  // Add content-visibility for better performance
  if (contentElement) {
    contentElement.style.contentVisibility = 'auto';
    contentElement.style.containIntrinsicSize = '0 40px';
    
    // Optimize images to prevent layout shifts and improve LCP
    optimizeImages(contentElement);
    
    template.appendChild(contentElement);
  }

  // Use more efficient DOM manipulation
  doc.innerHTML = '';
  doc.appendChild(template);

  // Add content-visibility to improve performance
  doc.style.contentVisibility = 'auto';
  doc.style.containIntrinsicSize = '0 100px';

  return template;
}
