/**
 * NYC Business Portal Header Script
 * Contains all the interactive functionality for the header component
 */

/**
 * Initializes header functionality once the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeHeader();
});

/**
 * Main function to initialize all header-related functionality
 */
function initializeHeader() {
  initializeMobileMenu();
  initializeDesktopMenu();
  initializeCloseButtons();
  initializeBackButtons();
  initializeClickOutside();
  initializeKeyboardNavigation();
}

/**
 * Initializes mobile menu functionality
 */
function initializeMobileMenu() {
  const mobileMenuButton = document.querySelector('[data-menu-id="mobile-menu"]');
  const mobileMenu = document.querySelector('#mobile-menu-submenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.style.display = !isExpanded ? 'block' : 'none';
      
      // Optional: Add body class to prevent scrolling when menu is open
      if (!isExpanded) {
        document.body.classList.add('mobile-menu-open');
      } else {
        document.body.classList.remove('mobile-menu-open');
      }
    });
  }
}

/**
 * Initializes desktop menu functionality
 */
function initializeDesktopMenu() {
  const mainNavItems = document.querySelectorAll('.nav-link > a[data-menu-id]');
  
  mainNavItems.forEach((navItem) => {
    navItem.addEventListener('click', (e) => {
      e.preventDefault();
      const menuId = navItem.getAttribute('data-menu-id');
      const submenu = document.querySelector(`[data-submenu-for="${menuId}"]`);
      const isExpanded = navItem.getAttribute('aria-expanded') === 'true';
      
      // Close all other menus first
      mainNavItems.forEach((item) => {
        if (item !== navItem) {
          item.setAttribute('aria-expanded', 'false');
          const itemMenuId = item.getAttribute('data-menu-id');
          const itemSubmenu = document.querySelector(`[data-submenu-for="${itemMenuId}"]`);
          if (itemSubmenu) {
            itemSubmenu.style.display = 'none';
          }
        }
      });
      
      if (submenu) {
        const isExpanded = navItem.getAttribute('aria-expanded') === 'true';
        
        // Close all other menus first
        mainNavItems.forEach((item) => {
          if (item !== navItem) {
            item.setAttribute('aria-expanded', 'false');
            const otherMenuId = item.getAttribute('data-menu-id');
            const otherSubmenu = document.querySelector(`[data-submenu-for="${otherMenuId}"]`);
            if (otherSubmenu) {
              otherSubmenu.style.display = 'none';
            }
          }
        });
        
        // Toggle current menu
        navItem.setAttribute('aria-expanded', !isExpanded);
        submenu.style.display = !isExpanded ? 'block' : 'none';
      }
    });
  });
}

/**
 * Initializes close buttons in menus
 */
function initializeCloseButtons() {
  const closeButtons = document.querySelectorAll('[data-menu-close]');
  
  closeButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = button.closest('.nav-submenu');
      if (submenu) {
        submenu.style.display = 'none';
        
        // Find the related nav item and update its aria-expanded attribute
        const menuId = submenu.getAttribute('data-submenu-for');
        const navItem = document.querySelector(`[data-menu-id="${menuId}"]`);
        if (navItem) {
          navItem.setAttribute('aria-expanded', 'false');
        }
        
        // Remove body class if it was mobile menu
        if (menuId === 'mobile-menu') {
          document.body.classList.remove('mobile-menu-open');
        }
      }
    });
  });
}

/**
 * Initializes back buttons in mobile submenus
 */
function initializeBackButtons() {
  const backButtons = document.querySelectorAll('.sub-menu-back');
  
  backButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const submenu = button.closest('.nav-submenu');
      if (submenu) {
        submenu.style.display = 'none';
        
        // Show mobile menu
        const mobileMenuId = button.getAttribute('data-menu-id');
        if (mobileMenuId === 'mobile-menu') {
          const mobileMenu = document.querySelector('#mobile-menu-submenu');
          if (mobileMenu) {
            mobileMenu.style.display = 'block';
          }
        }
        
        // Update aria-expanded on the related nav item
        const menuId = submenu.getAttribute('data-submenu-for');
        const navItem = document.querySelector(`[data-menu-id="${menuId}"]`);
        if (navItem) {
          navItem.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
}

/**
 * Handles clicks outside of menus to close them
 */
function initializeClickOutside() {
  document.addEventListener('click', (e) => {
    const header = document.querySelector('header');
    const clickedElement = e.target;
    
    // Check if the clicked element is outside the navigation
    if (header && (!header.contains(clickedElement) || clickedElement === header)) {
      // Close all open menus
      const expandedItems = document.querySelectorAll('[aria-expanded="true"]');
      expandedItems.forEach((item) => {
        item.setAttribute('aria-expanded', 'false');
        
        // If it's a nav item, find and hide its submenu
        const menuId = item.getAttribute('data-menu-id');
        if (menuId) {
          const submenu = document.querySelector(`[data-submenu-for="${menuId}"]`);
          if (submenu) {
            submenu.style.display = 'none';
          }
        }
      });
      
      // Remove body class if mobile menu was open
      document.body.classList.remove('mobile-menu-open');
    }
  });
}

/**
 * Adds keyboard navigation support
 */
function initializeKeyboardNavigation() {
  // Close menus with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const expandedItems = document.querySelectorAll('[aria-expanded="true"]');
      if (expandedItems.length > 0) {
        expandedItems.forEach((item) => {
          item.setAttribute('aria-expanded', 'false');
          
          // If it's a nav item, find and hide its submenu
          const menuId = item.getAttribute('data-menu-id');
          if (menuId) {
            const submenu = document.querySelector(`[data-submenu-for="${menuId}"]`);
            if (submenu) {
              submenu.style.display = 'none';
            }
          }
        });
        
        // Remove body class if mobile menu was open
        document.body.classList.remove('mobile-menu-open');
        
        // Return focus to the most recently expanded nav item
        if (expandedItems[0].tagName === 'A') {
          expandedItems[0].focus();
        }
      }
    }
  });
  
  // Support arrow key navigation within menus
  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;
    
    // If we're in a submenu
    if (activeElement.closest('.nav-submenu')) {
      const submenu = activeElement.closest('.nav-submenu');
      const links = Array.from(submenu.querySelectorAll('a'));
      const currentIndex = links.indexOf(activeElement);
      
      if (currentIndex >= 0) {
        // Down arrow
        if (e.key === 'ArrowDown' && currentIndex < links.length - 1) {
          e.preventDefault();
          links[currentIndex + 1].focus();
        }
        
        // Up arrow
        if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          links[currentIndex - 1].focus();
        }
      }
    }
    
    // If we're on a main nav item with a dropdown
    if (activeElement.hasAttribute('data-menu-id')) {
      // Enter or Space to open dropdown
      if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
        e.preventDefault();
        activeElement.click();
        
        // If menu is now expanded, focus the first item
        if (activeElement.getAttribute('aria-expanded') === 'true') {
          const menuId = activeElement.getAttribute('data-menu-id');
          const submenu = document.querySelector(`[data-submenu-for="${menuId}"]`);
          
          if (submenu) {
            const firstLink = submenu.querySelector('a');
            if (firstLink) {
              firstLink.focus();
            }
          }
        }
      }
      
      // Handle left/right navigation between main menu items
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        
        const mainNavItems = Array.from(document.querySelectorAll('.nav-link > a[data-menu-id]'));
        const currentIndex = mainNavItems.indexOf(activeElement);
        
        if (currentIndex >= 0) {
          // Right arrow
          if (e.key === 'ArrowRight' && currentIndex < mainNavItems.length - 1) {
            mainNavItems[currentIndex + 1].focus();
          }
          
          // Left arrow
          if (e.key === 'ArrowLeft' && currentIndex > 0) {
            mainNavItems[currentIndex - 1].focus();
          }
        }
      }
    }
  });
}

// Export functions for potential use in other modules
export {
  initializeHeader,
  initializeMobileMenu,
  initializeDesktopMenu,
  initializeCloseButtons,
  initializeBackButtons,
  initializeClickOutside,
  initializeKeyboardNavigation
};
