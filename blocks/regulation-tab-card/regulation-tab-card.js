import getContentFragment from '../../scripts/regulation-page-labels.js';

export default function decorate(doc) {
  const data = (idx) => {
    const dataList = doc.children;

    const d = dataList[idx];
    return d;
  };

  // - getValues
  const values = {
    'application-fees': data(1)?.innerText.trim() || '',
    'application-reviewed-within': data(2)?.innerText.trim() || '',
    'renewal-fees': data(3)?.innerText.trim() || '',
    'renewal-cycle': data(4)?.innerText.trim() || '',
  };

  // - getContentExternal
  const contentCard = {
    'application-fees': {
      title: 'Application Fees:',
      link: {
        text: 'How to Apply', url: '/',
      },
    },
    'application-reviewed-within': {
      title: 'Application Reviewed:',
      link: {
        text: 'After You Apply', url: '/',
      },
    },
    'renewal-fees': {
      title: 'Renewal Fees:',
      link: {
        text: 'Operating & Renewing', url: '/',
      },
    },
    'renewal-cycle': {
      title: 'Renewal cycle:',
      link: {
        text: 'Operating & Renewing',
        url: '/',
      },
    },
  };

  // Add structure
  const template = `
    <div class="tab-main-card">
      <div class="tab-main-card-card">
      ${Object.keys(contentCard).map((key) => {
    const KEY = contentCard[key];

    const { link } = KEY;

    // Use different getContentFragment.getLabel calls based on the card type
    let labelKey = 'applicationFees';
    if (key === 'application-fees') {
      labelKey = 'applicationFees';
    } else if (key === 'application-reviewed-within') {
      labelKey = 'applicationReviewedWithin';
    } else if (key === 'renewal-fees') {
      labelKey = 'renewalFees';
    } else if (key === 'renewal-cycle') {
      labelKey = 'renewalCycle';
    }

    // Set the button text based on the key
    let buttonKey = 'howToApplyTab';
    if (key === 'application-fees') {
      buttonKey = 'howToApplyTab';
    } else if (key === 'application-reviewed-within') {
      buttonKey = 'afterYouApplyTab';
    } else if (key === 'renewal-fees' || key === 'renewal-cycle') {
      buttonKey = 'operatingAndRenewingTab';
    }

    return `
              <div>
              <h3>${getContentFragment.getLabel(labelKey)}: <span>${values[key]}</span></h3>
              <p><a href="${link.url}">${getContentFragment.getLabel(buttonKey)} <span class="icon icon-arrow-right"></span></a> </p>
              </div>
            `;
  }).join('')}
      </div>
    </div>
  `;

  // Create a container element and set its HTML
  const container = document.createElement('div');
  container.innerHTML = template;

  // Remove all children from the doc
  while (doc.firstChild) {
    doc.removeChild(doc.firstChild);
  }

  // Append the container's child elements to the doc
  while (container.firstChild) {
    doc.appendChild(container.firstChild);
  }
}
