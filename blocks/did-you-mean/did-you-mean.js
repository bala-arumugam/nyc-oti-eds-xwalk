// export default function decorate(block) {
//   // Create the main container structure
//   const container = document.createElement('div');
//   container.className = 'did-you-mean-container-inner';

//   // Create and add the "Did you mean:" heading
//   const heading = document.createElement('h3');
//   heading.textContent = 'Did you mean:';
//   heading.className = 'did-you-mean-title';
//   container.appendChild(heading);

//   // Create content container
//   const content = document.createElement('div');
//   content.className = 'did-you-mean-content';

//   // Create the buttons list
//   const buttonsList = document.createElement('ul');
//   buttonsList.className = 'did-you-mean-buttons';

//   // Process each row in the block to extract button information
//   const rows = [...block.children];
//   const maxButtons = 5;
//   let buttonCount = 0;

//   rows.forEach((row) => {
//     // Enforce maximum of 5 buttons
//     if (buttonCount >= maxButtons) {
//       return;
//     }

//     // Handle did-you-mean-item structure
//     const linkElement = row.querySelector('a[href]');

//     let button;
//     let buttonText;

//     if (linkElement) {
//       // Direct link found
//       button = linkElement;
//       buttonText = linkElement.textContent;
//     } else {
//       // Look for did-you-mean-item structure with separate link and text
//       const linkField = row.querySelector('[data-aue-prop="link"]');
//       const textField = row.querySelector('[data-aue-prop="linkText"]');
//       if (linkField && textField) {
//         button = { href: linkField.textContent || linkField.innerText };
//         buttonText = textField.textContent || textField.innerText;
//       } else {
//         // Fallback to original button structure
//         const buttonContainer = row.querySelector('.button-container');
//         button = buttonContainer ? buttonContainer.querySelector('a.button, a[href]') : row.querySelector('a.button, a[href]');
//         buttonText = button ? button.textContent : null;
//       }
//     }

//     if (button && (button.href || (typeof button === 'object' && button.href)) && buttonText) {
//       // Create list item
//       const listItem = document.createElement('li');
//       listItem.className = 'did-you-mean-button-item';

//       // Create the link with proper classes
//       const link = document.createElement('a');
//       link.href = typeof button === 'object' ? button.href : button.href;
//       link.title = button.title || buttonText;
//       link.textContent = buttonText;
//       link.className = 'did-you-mean-button';

//       listItem.appendChild(link);
//       buttonsList.appendChild(listItem);
//       buttonCount += 1;
//     }
//   });

//   content.appendChild(buttonsList);
//   container.appendChild(content);

//   // Replace the original block content with the new structure
//   block.innerHTML = '';
//   block.appendChild(container);
// }
