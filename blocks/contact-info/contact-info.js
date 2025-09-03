import getContentFragment from '../../scripts/regulation-page-labels.js';
import { createElement } from '../../scripts/util.js';

export default function decorate(block) {
  // Clear existing content to rebuild it properly
  const originalContent = Array.from(block.children);
  block.innerHTML = '';

  const v = [
    'none',
    'agencyName',
    'officeDepartment',
    'streetOne',
    'streetTwo',
    'city',
    'state',
    'zipCode',
    'email',
    'website',
    'phone',
    'fax',
    'keyword',
    'instructional',
  ];

  const m = {};
  const list = originalContent.length === 1 ? originalContent[0].children : [...originalContent];
  Array.from(list).forEach((row, idx) => {
    const value = row?.textContent.trim() || '';
    m[v[idx]] = value;
  });

  const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Check if we have a valid 10-digit number
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    // Return original if not a standard 10-digit number
    return phone;
  };

  const template = `
    ${m.agencyName ? `<h5>${m.agencyName}</h5>` : ''}
    ${m.officeDepartment ? `<p>${m.officeDepartment}</p>` : ''}
    ${`<p>${m.streetOne}`} ${m.streetTwo ? `, ${m.streetTwo}</p>` : '</p>'}
    <p>${m.city} ${m.state} ${m.zipCode}</p>
    ${m.email ? `<h6>Email:</h6><p><a href='mailto:${m.email}'>${m.email}</a></p>` : ''}
    ${m.website ? `<h6>Website:</h6><p><a href='${m.website}' target='_blank' rel='noopener noreferrer'>${m.website}<span class='icon icon-outlink'></span></a></p>` : ''}
    ${m.phone ? `<h6>Phone:</h6><p>${formatPhoneNumber(m.phone)}</p>` : ''}
    ${m.fax ? `<h6>Fax:</h6><p>${formatPhoneNumber(m.fax)}</p>` : ''}
    ${m.keyword ? `<p class="italic">For further assistance, please call 311 and ask for: ${m.keyword}</p>` : ''}
    ${m.instructional ? `<p class="italic">${m.instructional}</p>` : ''}
  `;

  // Create a proper structured container for contact info
  const container = document.createElement('div');
  container.className = 'contact-info-container';

  if (originalContent.length > 1) {
    // Create the header with translated text
    const header = document.createElement('h3');
    header.className = 'contact-info-header';
    header.textContent = getContentFragment.getLabel('contactInfo');
    container.appendChild(header);
  }
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

  const div = createElement('div', { props: { className: 'contact-info-content' } });
  div.innerHTML = template;

  container.appendChild(div);

  // Append the fully built container to the block
  block.appendChild(container);

  // Add a processed class to indicate this block has been handled
  block.classList.add('contact-info-processed');
}
