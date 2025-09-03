import {createElement, getKeyValueData} from '../../scripts/util.js';
import { decorateIcons } from '../../scripts/aem.js';


export default function decorate(block) {
  const data = getKeyValueData(block, {richtext:'html'});

  const div = createElement('div');

  // Clear the content of the block
  block.innerHTML = '';

  // Add the icon.
  if (data.richtext) {
    // Create icons for different link types
    const createLinkIcon = (type) => {
      const icon = document.createElement('span');
      icon.className = `icon icon-${type}`;
      
      return icon;
    };

    const element = Array.from(data.richtext).map(el => el.outerHTML).join('')

    div.innerHTML = element;

    // Get all links from the HTMLCollection
    // Get all links from the div element
    const links = div.querySelectorAll('a');
    
    // Add icons to all links
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
      const iconType = href.toLowerCase().endsWith('.pdf') ? 'pdf' : 'outlink';
      link.appendChild(createLinkIcon(iconType));
      }
    });



    decorateIcons(div)
  }


  // Check if div exists before using it in the template
  const template = `
  <h3>${data.title || ''}</h3>
  <div>${div ? div.innerHTML : ''}</div>
  `

  block.innerHTML = template
}
