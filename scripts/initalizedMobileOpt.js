export default function initializeMobileOptimizations(header) {
  // 1. Defer loading of non-critical submenu content
  const submenus = header.querySelectorAll('.nav-submenu:not(.nav-submenu-mobile)');

  if (window.IntersectionObserver) {
    const submenuObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const submenu = entry.target;
            // Apply the optimized loading
            submenu.style.contentVisibility = 'visible';
            submenuObserver.unobserve(submenu);
          }
        });
      },
      { rootMargin: '100px' },
    );

    submenus.forEach((submenu) => {
      // Set initial state for better performance
      submenu.style.contentVisibility = 'auto';
      submenu.style.containIntrinsicSize = '0 300px';
      submenuObserver.observe(submenu);
    });
  }

  // 2. Optimize mobile menu button interaction
  const mobileMenuButton = header.querySelector('[data-menu-id="mobile-menu"]');
  if (mobileMenuButton) {
    // Use passive event listeners to improve scroll performance
    mobileMenuButton.addEventListener('touchstart', () => {}, { passive: true });

    // Preconnect to domains that will be used when menu opens
    const preconnectUrls = [
      'https://oti-wcms-dev-publish.nyc.gov',
      'https://nycmycity--qa.sandbox.my.site.com',
    ];

    preconnectUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      document.head.appendChild(link);
    });

    // Only load mobile menu content when button is clicked
    const mobileMenu = document.getElementById('mobile-menu-submenu');
    if (mobileMenu) {
      // Apply optimized rendering approach
      mobileMenuButton.addEventListener('click', () => {
        // Allow menu transitions to be hardware-accelerated
        mobileMenu.style.willChange = 'transform';
      });
    }
  }

  // 3. Reduce paint complexity for mobile
  document.documentElement.classList.add('mobile-optimized');

  // 4. Add resource hints for critical assets
  const resourceHints = [
    { rel: 'dns-prefetch', href: 'https://oti-wcms-dev-publish.nyc.gov' },
    { rel: 'preconnect', href: 'https://oti-wcms-dev-publish.nyc.gov', crossorigin: true },
  ];

  resourceHints.forEach((hint) => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossorigin) link.crossorigin = hint.crossorigin;
    document.head.appendChild(link);
  });
}
