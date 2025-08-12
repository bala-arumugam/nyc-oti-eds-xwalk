/**
 * Optimizes the hero block for performance
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  // Find the hero image
  const heroImg = block.querySelector('img');
  
  if (heroImg) {
    // Mark as high priority (improves LCP)
    heroImg.setAttribute('fetchpriority', 'high');
    
    // Set width and height attributes if not already set
    // This helps prevent layout shifts while the image loads
    if (!heroImg.hasAttribute('width') && !heroImg.hasAttribute('height')) {
      // Set default aspect ratio of 16:9 or use block dimensions
      const blockWidth = block.offsetWidth || 1200;
      const blockHeight = Math.round(blockWidth * (9/16)) || 675;
      
      heroImg.setAttribute('width', blockWidth);
      heroImg.setAttribute('height', blockHeight);
    }
    
    // Preload the hero image
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = heroImg.src;
    preloadLink.type = heroImg.src.endsWith('.svg') ? 'image/svg+xml' : 
                      (heroImg.src.endsWith('.png') ? 'image/png' : 'image/jpeg');
    document.head.appendChild(preloadLink);
    
    // Set loading attribute to eager
    heroImg.setAttribute('loading', 'eager');
    
    // Add onload event to remove placeholder styles
    heroImg.onload = () => {
      // If parent has a min-height, we can adjust it once image is loaded
      if (block.style.minHeight) {
        // Transition to auto height once image is loaded
        block.style.minHeight = 'auto';
      }
    };
  }

  // Calculate and set fixed dimensions for text containers
  // This prevents text layout shifts when fonts load
  const headings = block.querySelectorAll('h1, h2, h3');
  headings.forEach(heading => {
    // Ensure font rendering doesn't cause layout shifts
    heading.style.minHeight = `${heading.clientHeight}px`;
  });
}
