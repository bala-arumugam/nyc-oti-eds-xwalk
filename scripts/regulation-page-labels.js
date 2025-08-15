async function call() {
  let data = {};

  const defaultData = {
    data: {
      regulationPageLabelsConfigList: {
        items: [
          {
            // about tab
            aboutTab: 'About',
            // sub title
            contactInfo: 'Contact Info',
            // sub title
            additionalResources: 'Additional Resources',

            // card titles
            applicationFees: 'Application Fees',
            applicationReviewedWithin: 'Application Reviewed',
            renewalFees: 'Renewal Fees',
            renewalCycle: 'Renewal Cycle',

            // how to apply tab
            howToApplyTab: 'How To Apply',
            reviewTheseStepsBeforeYouSubmitYourApplication: 'Review these steps before you submit your application:',

            // title for acc section
            readyToApply: 'Ready to Apply?',
            // sub heading
            optionsToApply: 'Option(s) to Apply',
            // acc title
            applyOnline: 'Apply Online',
            // acc sub heading in acc
            stepsToApplyOnline: 'Steps to apply online',
            // acc sub text button (blue button)
            applyOnlineButton: 'Apply online ',
            // acc title
            applyInPerson: 'Apply in person',
            // acc sub heading in acc
            stepsToApplyInPerson: 'Steps to apply in person',
            // acc title
            applyByMail: 'Apply by Mail',
            // acc sub heading in acc
            stepsToApplyByMail: 'Steps to apply by mail',

            // after you apply tab
            afterYouApplyTab: 'After You Apply',
            afterYouSubmitYourApplicationReviewTheseItems: 'After you submit your application, review these items:',
            checkStatusButton: 'Check Status',

            // operating and renewing tab
            operatingAndRenewingTab: 'Operating and Renewing',
            operatingRequirements: 'Operating Requirements:',

            // acc title
            readyToRenew: 'Ready to Renew',
            // acc sub heading in acc
            optionsToReview: 'Option(s) to review',
            // acc title
            renewOnline: 'Renew Online',
            // acc sub heading in acc
            stepsToRenewOnline: 'Steps to renew online',
            // acc title
            renewInPerson: 'Renew in person',
            // acc sub heading in acc
            stepsToRenewInPerson: 'Steps to renew in person',
            // acc title
            renewByMail: 'Renew by Mail',
            // acc sub heading in acc,
            stepsToRenewByMail: 'Steps to renew by mail',
            // acc sub text button (blue button)
            renewOnlineButton: 'Renew Online',
          },
        ],
      },
    },
  };

  try {
    const apiUrl = 'https://oti-wcms-dev-publish.nyc.gov/graphql/execute.json/mycity/regulationPageLabels';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);
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

  function getLabel(str) {
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
    getLabel,
  };
}

const getContentFragment = await call();

export default getContentFragment;
