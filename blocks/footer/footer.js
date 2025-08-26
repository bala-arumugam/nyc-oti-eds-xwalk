/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  try {
    // Fetch footer data from API
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/content/experience-fragments/mycity/us/en/business/global/footer/master.model.json');
    const footerData = await response.json();
    
    // Clear block content
    block.textContent = '';
    
    // Create footer structure
    const footer = document.createElement('footer');
    const footerSection = document.createElement('div');
    footerSection.className = 'footer-section';
    
    // Create footer links section
    const footerLinksSection = document.createElement('section');
    footerLinksSection.className = 'footer-links-section';
    
    // Create NYC links container
    const nycLinksContainer = createLinksContainer('NYC', [
      { text: 'Directory of City Agencies', url: 'https://www.nyc.gov/nyc-resources/agencies.page' },
      { text: 'Notify NYC', url: 'https://a858-nycnotify.nyc.gov/notifynyc/' },
      { text: 'NYC Mobile Apps', url: 'https://www.nyc.gov/connect/mobile-applications.page' },
      { text: 'Privacy Policy', url: 'https://www.nyc.gov/home/privacy-policy.page' },
      { text: 'Contact NYC Government', url: 'https://www.nyc.gov/home/contact-us.page' },
      { text: 'CityStore', url: 'https://a856-citystore.nyc.gov/' },
      { text: 'Maps', url: 'https://www.nyc.gov/nyc-resources/nyc-maps.page' },
      { text: 'Terms of Use', url: 'https://www.nyc.gov/home/terms-of-use.page' },
      { text: 'City Employees', url: 'https://a127-ess.nyc.gov/psp/prdess/?cmd=login&languageCd=ENG&' },
      { text: 'Stay Connected', url: 'https://www.nyc.gov/connect/social-media.page' },
      { text: 'Resident Toolkit', url: 'https://www.nyc.gov/nyc-resources/resident-toolkit.page' }
    ]);
    
    // Create Business links container
    const businessLinksContainer = createLinksContainer('Business Links', [
      { text: 'My Business Dashboard How-To Guide', url: 'https://nyc-business.nyc.gov/nycbusiness/howtoguide' },
      { text: 'Resources by Industry FAQ', url: '/nycbusiness/global/resources-by-industry-faq' },
      { text: 'Digital Accessibility Resources', url: 'https://www.nyc.gov/nyc-resources/website-accessibility-statement.page' }
    ]);
    
    footerLinksSection.append(nycLinksContainer, businessLinksContainer);
    
    // Create disclaimer section
    const disclaimerSection = document.createElement('section');
    disclaimerSection.className = 'footer-disclaimer-section';
    
    const details = document.createElement('details');
    details.className = 'ui-content-caption';
    
    const summary = document.createElement('summary');
    const summaryH6 = document.createElement('h6');
    summaryH6.className = 'ui-content-small-link';
    summaryH6.textContent = 'Disclaimer';
    summary.appendChild(summaryH6);
    
    const disclaimerP = document.createElement('p');
    disclaimerP.className = 'ui-content-caption';
    disclaimerP.innerHTML = '<p>The City has tried to provide you with correct information on this website. While every effort has been made to ensure that the information provided is accurate and up-to-date, errors are still possible. The information provided is not legal advice. You may need additional information to meet the legal requirements for starting or operating your business.</p>';
    
    details.append(summary, disclaimerP);
    disclaimerSection.appendChild(details);
    
    // Create trademark section
    const trademarkSection = document.createElement('section');
    trademarkSection.className = 'footer-trademark-section';
    
    const logo = document.createElement('img');
    logo.src = '/nycbusiness/static/img/nycb-logo-black.svg';
    logo.className = 'nav-logo-img';
    logo.alt = 'NYC Logo';
    
    const trademarkLayout = document.createElement('div');
    trademarkLayout.className = 'footer-trademark-layout';
    
    const trademarkText = document.createElement('p');
    trademarkText.className = 'footer-content-text';
    trademarkText.innerHTML = '<p>© 2025 City of New York. All Rights Reserved. NYC is a trademark and service mark of the City of New York</p>';
    
    trademarkLayout.appendChild(trademarkText);
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
    
    // Assemble footer
    footerSection.append(footerLinksSection, disclaimerSection, trademarkSection, hiddenContent);
    footer.appendChild(footerSection);
    block.appendChild(footer);
    
  } catch (error) {
    console.error('Failed to load footer data:', error);
    // Fallback to basic footer
    block.innerHTML = '<footer><div class="footer-section"><p>Footer content unavailable</p></div></footer>';
  }
}

/**
 * Creates a footer link container with header and links
 * @param {string} headerText - The header text for the link section
 * @param {Array} links - Array of link objects with text and url properties
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
  const linksPerColumn = Math.ceil(links.length / 3);
  let currentColumn = 0;
  let currentUl = null;
  
  links.forEach((link, index) => {
    if (index % linksPerColumn === 0) {
      currentUl = document.createElement('ul');
      currentUl.className = `footer-nyc-links${headerText.includes('Business') ? ' business-links' : ''}`;
      linksListContainer.appendChild(currentUl);
      currentColumn++;
    }
    
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.url;
    a.className = 'ui-content-small-link';
    const span = document.createElement('span');
    span.textContent = link.text;
    a.appendChild(span);
    li.appendChild(a);
    currentUl.appendChild(li);
  });
  
  // Add extra empty columns if needed for business links
  if (headerText.includes('Business') && linksListContainer.children.length < 2) {
    const emptyUl = document.createElement('ul');
    emptyUl.className = 'footer-nyc-links business-links';
    linksListContainer.appendChild(emptyUl);
  }
  
  container.append(header, linksListContainer);
  return container;
}