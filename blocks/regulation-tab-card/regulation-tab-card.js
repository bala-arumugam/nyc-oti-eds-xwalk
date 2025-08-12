export default function decorate(doc) {
  const data = (idx) => {
    const dataList = doc.children;

    const d = dataList[idx];
    return d;
  };

  // get content
  // - getDescriptions
  const descriptionHtml = data(0)?.children[0]?.innerHTML || '<div></div>';

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

  // Create SVG arrow icon inline to avoid network request
  const arrowSvg = `<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M13.97 19.6912L12.378 18.0618L15.803 14.6374H3.832V12.3624H15.803L12.378 8.93794L13.97 7.30859L20.167 13.4999L13.97 19.6912Z' fill='%23025ADF'/></svg>`;

  // Add structure - Using template literals with precomputed values
  // This avoids layout shifts by having all data ready before rendering
  const template = `
    <div class="tab-main-card">
      <div class="tab-main-card-description">
      ${descriptionHtml}
      </div>
      <div class="tab-main-card-card">
      ${Object.keys(contentCard).map((key) => {
    const KEY = contentCard[key];
    const { title, link } = KEY;
    return `
        <div>
        <h3>${title} <span>${values[key]}</span></h3>
        <p><a href="${link.url}">${link.text} <span class="icon icon-arrow-right">${arrowSvg}</span></a> </p>
        </div>
      `;
  }).join('')}
      </div>
    </div>
  `;

  // Use a more efficient DOM manipulation approach
  doc.innerHTML = template;
  
  // Add content-visibility attribute to improve performance
  doc.style.contentVisibility = 'auto';
  doc.style.containIntrinsicSize = '0 300px';
}
