// --- Add handler to show external-link-modal-template on .block-link.exitlink click ---
// Use Colorbox-style structure for modal popup (from popUp.html)
export default function handleExitLinkClick(e) {
  // Only handle left-clicks and keyboard Enter
  if ((e.type === 'click' && e.button !== 0) || (e.type === 'keydown' && e.key !== 'Enter')) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const link = e.currentTarget;
  const href = link.getAttribute('href');
  if (!href || href === '#' || href === '') return;

  // Remove any existing modal
  let colorbox = document.getElementById('colorbox');
  let cboxOverlay = document.getElementById('cbox-overlay');
  if (colorbox) colorbox.remove();
  if (cboxOverlay) cboxOverlay.style.display = 'block';
  else {
    cboxOverlay = document.createElement('div');
    cboxOverlay.id = 'cbox-overlay';
    cboxOverlay.style.display = 'block';
    cboxOverlay.style.position = 'fixed';
    cboxOverlay.style.top = '0';
    cboxOverlay.style.left = '0';
    cboxOverlay.style.width = '100vw';
    cboxOverlay.style.height = '100vh';
    cboxOverlay.style.background = 'rgba(0,0,0,0.5)';
    cboxOverlay.style.zIndex = '9998';
    document.body.appendChild(cboxOverlay);
  }

  // Build Colorbox modal structure
  colorbox = document.createElement('div');
  colorbox.id = 'colorbox';
  colorbox.setAttribute('role', 'dialog');
  colorbox.setAttribute('tabindex', '-1');
  colorbox.style.display = 'block';
  colorbox.style.position = 'fixed';
  colorbox.style.width = '611px';
  colorbox.style.height = '534px';
  colorbox.style.left = '50%';
  colorbox.style.top = '50%';
  colorbox.style.transform = 'translate(-50%, -50%)';
  colorbox.style.overflow = 'hidden';
  colorbox.style.zIndex = '10000';

  colorbox.innerHTML = `
        <div id="cbox-wrapper" style="height: 534px; width: 611px">
        <div>
            <div id="cbox-top-left" style="float: left"></div>
            <div id="cbox-top-center" style="float: left; width: 611px"></div>
            <div id="cbox-top-right" style="float: left"></div>
        </div>
        <div style="clear: left">
            <div id="cbox-middle-left" style="float: left; height: 534px"></div>
            <div id="cbox-content" style="float: left; width: 611px; height: 534px">
            <div id="cbox-loaded-content" style="width: 531px; overflow: hidden; height: 454px">
                <div class="modal external-link-modal content-block">
                <div class="external-link-modal-header">
                    <div class="logo-container">
                    <img src="https://business-dev.csc.nycnet/nycbusiness/static/img/nyc-logo.svg" class="external-link-modal-logo" alt="NYC Logo">
                    <span>®</span>
                    </div>
                    <a id="external-link-modal-close" href="#" class="external-link-modal-close"></a>
                </div>
                <div class="external-link-modal-body">
                    <h4 class="external-link-modal-title">
                    You are leaving the City of New York’s website
                    </h4>
                    <p class="external-link-modal-description">
                    The city of New York does not imply approval of the listed destinations, warrant the accuracy of
                    any information set out in those destinations, or endorse any opinions expressed therein or any
                    goods or services offered thereby. Like NYC.gov, all other web sites operate under the auspices
                    and at that direction of their respective owners who should be contacted directly with questions
                    regarding the content of these sites.
                    </p>
                    <p class="external-link-modal-page-name">
                    Do you want to go to <b><span id="domainSpan"></span></b>
                    </p>
                </div>
                <div class="external-link-modal-footer">
                    <button id="external-link-modal-cancel" class="button-secondary">Cancel</button>
                    <button id="external-link-modal-submit" class="button external-link-button">Proceed to external link</button>
                </div>
                </div>
            </div>
            <div id="cboxTitle" style="float: left; display: block"></div>
            <div id="cboxCurrent" style="float: left; display: none"></div>
            <button type="button" id="cboxPrevious" style="display: none"></button>
            <button type="button" id="cboxNext" style="display: none"></button>
            <button type="button" id="cboxSlideshow" style="display: none"></button>
            <div id="cboxLoadingOverlay" style="float: left; display: none"></div>
            <div id="cboxLoadingGraphic" style="float: left; display: none"></div>
            </div>
            <div id="cbox-middle-right" style="float: left; height: 534px"></div>
        </div>
        <div style="clear: left">
            <div id="cbox-bottom-left" style="float: left"></div>
            <div id="cbox-bottom-center" style="float: left; width: 611px"></div>
            <div id="cbox-bottom-right" style="float: left"></div>
        </div>
        </div>
        <div style="position: absolute; width: 9999px; visibility: hidden; max-width: none; display: none;"></div>
    `;
  document.body.appendChild(colorbox);

  // Set domainSpan text
  try {
    const urlObj = new URL(href, window.location.origin);
    const domain = urlObj.hostname;
    const domainSpan = colorbox.querySelector('#domainSpan');
    if (domainSpan) domainSpan.textContent = domain;
  } catch (err) {
    // Silently handle errors during overlay cleanup
  }

  // Close modal and overlay on cancel or close button
  const closeModal = () => {
    if (colorbox) colorbox.remove();
    if (cboxOverlay) cboxOverlay.style.display = 'none';
    document.body.style.overflow = '';
  };
  const cancelBtn = colorbox.querySelector('#external-link-modal-cancel');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      closeModal();
    });
  }
  const closeBtn = colorbox.querySelector('#external-link-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      closeModal();
    });
  }
  // Proceed to external link
  const submitBtn = colorbox.querySelector('#external-link-modal-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      window.location = href;
      closeModal();
    });
  }
  // Trap focus inside modal
  setTimeout(() => {
    const focusable = colorbox.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }, 0);
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
}
