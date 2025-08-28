/**
 * Creates a footer link container with header and links
 * @param {string} headerText - The header text for the link section
 * @param {Array} links - Array of link objects from API with linkName and linkValue properties
 * @returns {Element} The created footer link container
 */
function createLinksContainer(headerText, links) {
  const container = document.createElement('div');
  container.className = 'footer-link-container';

  const header = document.createElement('h6');
  header.className = 'footer-link-header';
  const headerSpan = document.createElement('span');
  headerSpan.textContent = headerText;
  header.appendChild(headerSpan);

  const linksListContainer = document.createElement('div');
  linksListContainer.className = 'footer-links-list-container';

  // Split links into columns (max 4 links per column for better layout)
  const linksPerColumn = headerText === 'NYC' ? 4 : 4; // NYC gets 4 per column, Business gets 4
  let currentUl = null;

  links.forEach((link, index) => {
    if (index % linksPerColumn === 0) {
      currentUl = document.createElement('ul');
      currentUl.className = `footer-nyc-links${headerText.includes('Business') ? ' business-links' : ''}`;
      linksListContainer.appendChild(currentUl);
    }

    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.linkValue || link.url || '#'; // Handle both API format (linkValue) and fallback format (url)
    a.className = 'ui-content-small-link';
    const span = document.createElement('span');
    span.textContent = link.linkName || link.text || 'Link'; // Handle both API format (linkName) and fallback format (text)
    a.appendChild(span);
    li.appendChild(a);
    currentUl.appendChild(li);
  });

  // Ensure Business Links section has exactly 2 columns
  if (headerText.includes('Business')) {
    while (linksListContainer.children.length < 2) {
      const emptyUl = document.createElement('ul');
      emptyUl.className = 'footer-nyc-links business-links';
      linksListContainer.appendChild(emptyUl);
    }
  }

  container.append(header, linksListContainer);
  return container;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  try {
    // Fetch footer data from API
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/content/experience-fragments/mycity/us/en/business/global/footer/master.model.json');
    const footerData = await response.json();

    // Extract footer component data from the nested structure
    const footerComponent = footerData[':items']?.root?.[':items']?.footer;

    if (!footerComponent) {
      throw new Error('Footer data structure is invalid');
    }

    // Clear block content
    block.textContent = '';

    // Create footer structure
    const footer = document.createElement('footer');
    const footerSection = document.createElement('div');
    footerSection.className = 'footer-section';

    // Create footer links section
    const footerLinksSection = document.createElement('section');
    footerLinksSection.className = 'footer-links-section';

    // Create NYC links container using dynamic data
    const nycLinksContainer = createLinksContainer(
      footerComponent.sectiononelinktitle || 'NYC',
      footerComponent.firstLineLinks || [],
    );

    // Create Business links container using dynamic data
    const businessLinksContainer = createLinksContainer(
      footerComponent.sectiontwolinktitle || 'Business Links',
      footerComponent.secondLineLinks || [],
    );

    footerLinksSection.append(nycLinksContainer, businessLinksContainer);

    // Create disclaimer section
    const disclaimerSection = document.createElement('section');
    disclaimerSection.className = 'footer-disclaimer-section';

    const details = document.createElement('details');
    details.className = 'ui-content-caption';

    const summary = document.createElement('summary');
    const summaryH6 = document.createElement('h6');
    summaryH6.className = 'ui-content-small-link';
    summaryH6.textContent = footerComponent.disclaimerlinkText || 'Disclaimer';
    summary.appendChild(summaryH6);

    const disclaimerP = document.createElement('p');
    disclaimerP.className = 'ui-content-caption';
    disclaimerP.innerHTML = footerComponent.disclaimerdescription || '<p>Disclaimer content unavailable</p>';

    details.append(summary, disclaimerP);
    disclaimerSection.appendChild(details);

    // Create trademark section
    const trademarkSection = document.createElement('section');
    trademarkSection.className = 'footer-trademark-section';

    const logo = document.createElement('img');
    logo.src = footerComponent.footerLogoPath || 'icons/nyc-logo-dark.svg';
    logo.className = 'nav-logo-img';
    logo.alt = footerComponent.footerLogoAltText || 'NYC Logo';

    const trademarkLayout = document.createElement('div');
    trademarkLayout.className = 'footer-trademark-layout';

    // Process trademark description to split into two separate sections
    const description = footerComponent.description || '© 2025 City of New York. All Rights Reserved. NYC is a trademark and service mark of the City of New York';

    // Remove any HTML tags to work with plain text
    const cleanText = description.replace(/<[^>]*>/g, '');

    let firstPart = '';
    let secondPart = '';

    // Find "All Rights Reserved." to split after it
    const splitPoint = cleanText.indexOf('All Rights Reserved.');

    if (splitPoint !== -1) {
      // Split the content after "All Rights Reserved."
      firstPart = cleanText.substring(0, splitPoint + 'All Rights Reserved.'.length).trim();
      secondPart = cleanText.substring(splitPoint + 'All Rights Reserved.'.length).trim();
    } else {
      // Fallback: try to split after first period followed by space
      const firstPeriodIndex = cleanText.indexOf('. ');
      if (firstPeriodIndex !== -1) {
        firstPart = cleanText.substring(0, firstPeriodIndex + 1).trim();
        secondPart = cleanText.substring(firstPeriodIndex + 2).trim();
      } else {
        firstPart = cleanText;
        secondPart = '';
      }
    }

    // Create first trademark section (copyright)
    const trademarkCopyright = document.createElement('p');
    trademarkCopyright.className = 'footer-content-text footer-copyright';
    trademarkCopyright.innerHTML = firstPart;

    // Create second trademark section (trademark info)
    const trademarkInfo = document.createElement('p');
    trademarkInfo.className = 'footer-content-text footer-trademark-info';
    trademarkInfo.innerHTML = secondPart;

    trademarkLayout.appendChild(trademarkCopyright);
    if (secondPart) {
      trademarkLayout.appendChild(trademarkInfo);
    }
    trademarkSection.append(logo, trademarkLayout);

    // Create hidden content section
    const hiddenContent = document.createElement('div');
    hiddenContent.setAttribute('aria-hidden', 'true');
    hiddenContent.className = 'hidden-content';

    const externalLinkText = document.createElement('div');
    externalLinkText.setAttribute('aria-hidden', 'true');
    externalLinkText.id = 'hidden-content-external-link-text';
    externalLinkText.className = 'hidden-text';
    externalLinkText.textContent = 'external';

    const pdfLinkText = document.createElement('div');
    pdfLinkText.setAttribute('aria-hidden', 'true');
    pdfLinkText.id = 'hidden-content-pdf-link-text';
    pdfLinkText.className = 'hidden-text';
    pdfLinkText.textContent = 'PDF';

    hiddenContent.append(externalLinkText, pdfLinkText);

    // Assemble footer - reordered: trademark, links, disclaimer, hidden content
    footerSection.append(trademarkSection, footerLinksSection, disclaimerSection, hiddenContent);
    footer.appendChild(footerSection);
    block.appendChild(footer);
  } catch (error) {
    block.innerHTML = '<footer><div class="footer-section"><p>Footer content unavailable</p></div></footer>';
  }
}
