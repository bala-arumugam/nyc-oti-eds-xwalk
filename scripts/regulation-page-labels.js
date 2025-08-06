/**
* Makes an API call and returns a utility object with a getWord function
* @returns {Object} Object containing getWord function
*/
async function call() {
  let data = {       
          "aboutTab": "About",
          "contactInfo": "Contact Info",
          "additionalResources": "Additional Resources",
          "applicationFees": "Application Fees",
          "applicationReviewedWithin": "Application Reviewed Within",
          "renewalFees": "Renewal Fees",
          "renewalCycle": "Renewal Cycle",
          "howToApplyTab": "How To Apply",
          "reviewTheseStepsBeforeYouSubmitYourApplication": "Review these steps before you submit your application:",
          "readyToApply": "Ready to Apply?",
          "optionsToApply": "Option(s) to Apply",
          "applyOnline": "Apply Online",
          "stepsToApplyOnline": "Steps to apply online",
          "applyOnlineButton": "Apply online ",
          "applyInPerson": "Apply in person",
          "stepsToApplyInPerson": "Steps to apply in person",
          "applyByMail": "Apply by Mail",
          "stepsToApplyByMail": "Steps to apply by mail",
          "afterYouApplyTab": "After You Apply",
          "afterYouSubmitYourApplicationReviewTheseItems": "After you submit your application, review these items:",
          "checkStatusButton": "Check Status",
          "operatingAndRenewingTab": "Operating and Renewing",
          "operatingRequirements": "Operating Requirements:",
          "readyToRenew": "Ready to Renew",
          "optionsToReview": "Option(s) to review",
          "renewOnline": "Renew Online",
          "stepsToRenewOnline": "Steps to renew online",
          "renewInPerson": "Renew in person",
          "stepsToRenewInPerson": "Steps to renew in person",
          "renewByMail": "Renew by Mail",
          "stepsToRenewByMail": "Steps to renew by mail",
          "renewOnlineButton": "Renew Online"
        };
 
//   try {
//     // Make the API call and save the return to data variable
//     const MAX_RETRIES = 3;
//     let retries = 0;
//     let response;
    
//     const apiUrl = 'https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/graphql/execute.json/mycity/regulationPageLabels';
    
//     while (retries < MAX_RETRIES) {
//       try {
//         response = await fetch(`${apiUrl}`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             'Origin': window.location.origin
//           },
//           mode: 'cors',
//           credentials: 'omit' // Don't send credentials to avoid CORS issues with wildcard origins
//         });
        
//         if (response.ok) break;
//         console.log(`Attempt ${retries + 1} failed, retrying...`);
//         retries++;
//       } catch (error) {
//         console.error(`Fetch attempt ${retries + 1} failed:`, error);
//         if (retries >= MAX_RETRIES - 1) throw error;
//         retries++;
//       }
//       // Wait a bit before retrying (exponential backoff)
//       await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
//     }
    
//     if (!response.ok) {
//       throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
//     }
    
//     data = await response.json();
//     console.log('Data successfully fetched:', data);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
 
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
    
    // Check if we need to navigate through data.data structure (common in GraphQL responses)
    if (data.data && typeof data.data === 'object') {
      return data.data[str] || null;
    }
    
    return data[str] || null;
  }
 
  return {
    getWord
  };
}
 
export const getContentFragment = await call();
 
// Example usage
