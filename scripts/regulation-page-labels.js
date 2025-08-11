/**
* Makes an API call and returns a utility object with a getWord function
* @returns {Object} Object containing getWord function
*/
async function call() {
  // Initialize with an empty object
  let data = {};

  // Define the default data as a fallback
  const defaultData = {
    data: {
      regulationPageLabelsConfigList: {
        items: [
          {
            aboutTab: 'About',
            contactInfo: 'Contact Info',
            additionalResources: 'Additional Resources',
            applicationFees: 'Application Fees',
            applicationReviewedWithin: 'Application Reviewed',
            renewalFees: 'Renewal Fees',
            renewalCycle: 'Renewal Cycle',
            howToApplyTab: 'How To Apply',
            reviewTheseStepsBeforeYouSubmitYourApplication: 'Review these steps before you submit your application:',
            readyToApply: 'Ready to Apply?',
            optionsToApply: 'Option(s) to Apply',
            applyOnline: 'Apply Online',
            stepsToApplyOnline: 'Steps to apply online',
            applyOnlineButton: 'Apply online ',
            applyInPerson: 'Apply in person',
            stepsToApplyInPerson: 'Steps to apply in person',
            applyByMail: 'Apply by Mail',
            stepsToApplyByMail: 'Steps to apply by mail',
            afterYouApplyTab: 'After You Apply',
            afterYouSubmitYourApplicationReviewTheseItems: 'After you submit your application, review these items:',
            checkStatusButton: 'Check Status',
            operatingAndRenewingTab: 'Operating and Renewing',
            operatingRequirements: 'Operating Requirements:',
            readyToRenew: 'Ready to Renew',
            optionsToReview: 'Option(s) to review',
            renewOnline: 'Renew Online',
            stepsToRenewOnline: 'Steps to renew online',
            renewInPerson: 'Renew in person',
            stepsToRenewInPerson: 'Steps to renew in person',
            renewByMail: 'Renew by Mail',
            stepsToRenewByMail: 'Steps to renew by mail',
            renewOnlineButton: 'Renew Online',
          },
        ],
      },
    },
  };

  // Track if we got valid API data
  let apiSuccess = false;

  try {
    // Make the API call and save the return to data variable
    const MAX_RETRIES = 3;
    const apiUrl = 'https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/graphql/execute.json/mycity/regulationPageLabels';

    // Define a recursive function for retrying the API call
    const fetchWithRetry = async (retriesLeft) => {
      if (retriesLeft <= 0) {
        // Out of retries, return failure
        return false;
      }

      try {
        const response = await fetch(`${apiUrl}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Origin: window.location.origin,
          },
          mode: 'cors',
          credentials: 'omit', // Don't send credentials to avoid CORS issues with wildcard origins
        });

        if (response.ok) {
          try {
            // Get the raw text first to see what we're dealing with
            const responseText = await response.text();

            // Only try to parse if we have content
            if (responseText && responseText.trim()) {
              try {
                const responseData = JSON.parse(responseText);

                // Only update data if the response contains valid structure
                if (responseData
                    && (responseData.regulationPageLabelsConfigList?.items || responseData.data)) {
                  data = responseData;
                  return true; // Success!
                }
              } catch (parseError) {
                // JSON parse error - continue to retry
              }
            }
          } catch (textError) {
            // Text reading error - continue to retry
          }
        }
      } catch (fetchError) {
        // Fetch error - continue to retry
      }

      // Wait before retrying (exponential backoff)
      const delayMs = 1000 * 2 ** (MAX_RETRIES - retriesLeft);

      // Use a separate function for the delay to avoid ESLint confusion
      const delay = async (ms) => new Promise((resolve) => {
        setTimeout(resolve, ms);
      });

      await delay(delayMs);

      // Retry with one fewer retry remaining
      return fetchWithRetry(retriesLeft - 1);
    };

    // Start the retry process
    apiSuccess = await fetchWithRetry(MAX_RETRIES);

    // If API call failed after all retries, use default data
    if (!apiSuccess) {
      data = defaultData;
    }
  } catch (error) {
    // Use default data if there was an error
    data = defaultData;
  }

  /**
   * Gets a word from the data object
   * @param {string} str - The key to look up in the data
   * @returns {string|null} The word if found, null otherwise
   */
  function getWord(str) {
    // Safeguard when no parameter is provided or data doesn't have the content
    if (!str) {
      return null;
    }

    // Structure 1: API response format where items is an array with a single object
    // Like: { data: { regulationPageLabelsConfigList: { items: [{ key: value, ... }] } } }
    if (data.data?.regulationPageLabelsConfigList?.items
        && Array.isArray(data.data.regulationPageLabelsConfigList.items)
        && data.data.regulationPageLabelsConfigList.items.length > 0) {
      return data.data.regulationPageLabelsConfigList.items[0][str] || null;
    }

    // Structure 2: Format where items is an object directly
    // Like: { regulationPageLabelsConfigList: { items: { key: value, ... } } }
    if (data.regulationPageLabelsConfigList?.items
        && typeof data.regulationPageLabelsConfigList.items === 'object') {
      return data.regulationPageLabelsConfigList.items[str] || null;
    }

    // Structure 3: Direct access at data level
    // Like: { key: value, ... }
    return data[str] || null;
  }

  return {
    getWord,
  };
}

// Create the content fragment object
const getContentFragment = await call();

// Use default export since this is the only export from this file
export default getContentFragment;
