window.CASHLY_CONFIG = Object.freeze({
  callbackForm: {
    endpoint: "https://pklhknmvgdeytwhjnwxf.supabase.co/functions/v1/submit-callback-request",
    // Production Turnstile site key.
    turnstileSiteKey: "0x4AAAAAAC8juGqteiCCKx2g"
  },
  consent: {
    storageKey: "cashly_cookie_consent",
    version: "2026-05-11",
    policyUrl: "privacy-policy.html",
    analytics: {
      // Add your Google Analytics 4 measurement ID here, for example: G-ABC1234567
      googleAnalyticsMeasurementId: ""
    },
    marketing: {
      // Add your Meta Pixel ID here.
      metaPixelId: ""
    }
  }
});
