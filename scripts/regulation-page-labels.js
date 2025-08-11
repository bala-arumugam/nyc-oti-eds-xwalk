async function call() {
  let data = {};

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

  const isCI = typeof window === 'undefined'
               || !!(window.navigator?.userAgent?.includes('Headless'))
               || !!(window.navigator?.webdriver);

  if (isCI) {
    data = defaultData;
  } else {
    try {
      const apiUrl = 'https://cors-anywhere.herokuapp.com/https://oti-wcms-dev-publish.nyc.gov/graphql/execute.json/mycity/regulationPageLabels';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          signal: controller.signal,
          cache: 'force-cache',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          try {
            const responseData = await response.json();

            if (responseData
                && (responseData.regulationPageLabelsConfigList?.items || responseData.data)) {
              data = responseData;
            } else {
              data = defaultData;
            }
          } catch (parseError) {
            data = defaultData;
          }
        } else {
          data = defaultData;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        data = defaultData;
      }
    } catch (error) {
      data = defaultData;
    }
  }

  function getWord(str) {
    if (!str) {
      return null;
    }

    if (data.data?.regulationPageLabelsConfigList?.items
        && Array.isArray(data.data.regulationPageLabelsConfigList.items)
        && data.data.regulationPageLabelsConfigList.items.length > 0) {
      return data.data.regulationPageLabelsConfigList.items[0][str] || null;
    }

    if (data.regulationPageLabelsConfigList?.items
        && typeof data.regulationPageLabelsConfigList.items === 'object') {
      return data.regulationPageLabelsConfigList.items[str] || null;
    }

    return data[str] || null;
  }

  return {
    getWord,
  };
}

const getContentFragment = await call();

export default getContentFragment;
