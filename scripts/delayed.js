// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here

function checkConsentFormOptions(form) {
  const valuesToCheck = [
    'email',
    'sms',
    'text',
    'agencies', // Share with government agencies
    'third-party', // Share with 3rd parties
    'usage-data', // Allow usage data collection
    'cookies', // Allow cookies
    'newsletters', // Receive newsletters
    'invitations', // Receive event invitations
    'terms', // Agree to terms
    'policy', // Consent to privacy policy
  ];

  valuesToCheck.forEach((value) => {
    const input = form.querySelector(`input[type="checkbox"][value="${value}"]`);
    if (input) {
      input.checked = true;
    }
  });
}

const consentForm = document.querySelector('[data-action="/consent-form"]');
if (consentForm) {
  checkConsentFormOptions(consentForm);
}
