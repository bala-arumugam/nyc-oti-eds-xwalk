/**
 * Fetches data with a timeout
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Fetches header data from AEM experience fragment Sling Model JSON endpoint
 * @returns {Promise<Object>} The header data
 */
export async function fetchHeaderData() {
  try {
    // Check for local data first to avoid network requests
    // (digitalData may contain pre-rendered header data)
    if (window.digitalData && window.digitalData.header) {
      return window.digitalData.header;
    }

    // Cache the response in sessionStorage to avoid repeated fetches
    const cachedData = sessionStorage.getItem('nycHeaderData');
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Fetch the JSON from the absolute path to the experience fragment with timeout
    // Use a shorter timeout for better mobile experience and reduced network hanging
    const response = await fetchWithTimeout(
      'https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/content/experience-fragments/mycity/us/en/business/global/header/master.model.json',
      { credentials: 'same-origin' }, // Add credentials to improve caching
      3000, // Reduced timeout for faster fallback on mobile
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch header data: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Extract header component data using optional chaining
    const headerComponent = data[':items']?.root?.[':items']?.header || {};

    // Process navigationItems if they exist
    let navigationItems = [];
    if (headerComponent.navigationItems && headerComponent.navigationItems.length > 0) {
      // Filter out empty navigation items (those without a title)
      navigationItems = headerComponent.navigationItems
        .filter((item) => item && (item.title || (item[':type'] === 'mycity/components/business/datacomponents/navigation' && item.id)))
        .map((item, index) => {
          // Convert menu ids from menu-item-# to menu-# format if needed
          const id = item.id || `menu-${index + 1}`;

          // Calculate control and number of rows for templates
          let control = '';
          let numberOfRows = 3;

          // Match control ids with the ones in Thymeleaf templates
          switch (index) {
            case 0:
              control = 'resources-by-industry';
              numberOfRows = 9;
              break;
            case 1:
              control = 'business-services';
              numberOfRows = 5;
              break;
            case 2:
              control = 'emergency-preparedness';
              numberOfRows = 3;
              break;
            case 3:
              control = 'regulations';
              numberOfRows = 3;
              break;
            case 4:
              control = 'tools';
              numberOfRows = 3;
              break;
            default:
              control = id.replace('menu-', 'item-');
              break;
          }

          // Process menu items to ensure they have all needed properties
          const menuItems = (item.menuItems || []).map((menuItem) => ({
            ...menuItem,
            title: menuItem.title || '',
            link: menuItem.link || '#',
            description: menuItem.description || '',
            cta: menuItem.cta || 'View Details',
            iconPath: menuItem.iconPath || '',
            iconAlt: menuItem.iconAlt || '',
          }));

          return {
            ...item,
            id,
            title: item.title || '',
            link: item.link || '#',
            menuItems,
            control,
            numberOfRows,
          };
        });
    }

    const headerResult = {
      logoPath: headerComponent.logoPath || '/nycbusiness/static/img/reskin/NYC-logo-white.svg',
      logotitle: headerComponent.logotitle || 'MyCity',
      logosubtitle: headerComponent.logosubtitle || 'Official website of the City of New York',
      logoAltText: headerComponent.logoAltText || 'NYC White Logo',
      logoDecorative: headerComponent.logoDecorative || false,
      portaltitle: headerComponent.portaltitle || 'Business',
      searchIconPath: headerComponent.searchIconPath || 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png',
      searchIconAltText: headerComponent.searchIconAltText || 'Search',
      profileIconPath: headerComponent.profileIconPath || 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png',
      profileIconAltText: headerComponent.profileIconAltText || 'Click here to view dashboard',
      helpIconPath: headerComponent.helpIconPath || '',
      helpIconAltText: headerComponent.helpIconAltText || 'Help Icon',
      helpIconLink: headerComponent.helpIconLink || '/nycbusiness/global/mycity-business-faq',
      navigationItems,
    };

    // Cache the result in sessionStorage for future use
    try {
      sessionStorage.setItem('nycHeaderData', JSON.stringify(headerResult));
    } catch (cacheErr) {
      // Ignore storage errors - they shouldn't stop the app from working

    }

    return headerResult;
  } catch (error) {
    // Log error but suppress in production
    // Return default data in case of error
    return {
      logoPath: '/nycbusiness/static/img/reskin/NYC-logo-white.svg',
      logotitle: 'MyCity',
      logosubtitle: 'Official website of the City of New York',
      logoAltText: 'NYC White Logo',
      logoDecorative: false,
      portaltitle: 'Business',
      searchIconPath: 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/search.png',
      searchIconAltText: 'Search',
      profileIconPath: 'https://oti-wcms-dev-publish.nyc.gov/content/dam/mycity/business/en/icons/white-icons/account_circle-1.png',
      profileIconAltText: 'Click here to view dashboard',
      helpIconPath: '',
      helpIconAltText: 'Help Icon',
      helpIconLink: '/nycbusiness/global/mycity-business-faq',
      navigationItems: [
        {
          id: 'menu-1', title: 'Resources by Industry', link: '#', menuItems: [],
        },
        {
          id: 'menu-2', title: 'Business Services', link: '#', menuItems: [],
        },
        {
          id: 'menu-3', title: 'Emergency Preparedness', link: '#', menuItems: [],
        },
        {
          id: 'menu-4', title: 'Regulations', link: '#', menuItems: [],
        },
        {
          id: 'menu-5', title: 'Tools', link: '#', menuItems: [],
        },
      ],
    };
  }
}
