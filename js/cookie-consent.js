(function () {
  "use strict";

  var defaultConsentConfig = {
    storageKey: "cashly_cookie_consent",
    version: "2026-05-11",
    policyUrl: "privacy-policy.html",
    analytics: {
      googleAnalyticsMeasurementId: ""
    },
    marketing: {
      metaPixelId: ""
    }
  };

  var pageConfig = window.CASHLY_CONFIG && window.CASHLY_CONFIG.consent ? window.CASHLY_CONFIG.consent : {};
  var consentConfig = {
    storageKey: pageConfig.storageKey || defaultConsentConfig.storageKey,
    version: pageConfig.version || defaultConsentConfig.version,
    policyUrl: pageConfig.policyUrl || defaultConsentConfig.policyUrl,
    analytics: {
      googleAnalyticsMeasurementId: pageConfig.analytics && pageConfig.analytics.googleAnalyticsMeasurementId
        ? pageConfig.analytics.googleAnalyticsMeasurementId
        : defaultConsentConfig.analytics.googleAnalyticsMeasurementId
    },
    marketing: {
      metaPixelId: pageConfig.marketing && pageConfig.marketing.metaPixelId
        ? pageConfig.marketing.metaPixelId
        : defaultConsentConfig.marketing.metaPixelId
    }
  };

  var trackerState = {
    gaLoaded: false,
    metaLoaded: false
  };

  function readConsentRecord() {
    var rawValue;
    var parsedValue;

    try {
      rawValue = window.localStorage.getItem(consentConfig.storageKey);
    } catch (error) {
      return null;
    }

    if (!rawValue) {
      return null;
    }

    try {
      parsedValue = JSON.parse(rawValue);
    } catch (error) {
      return null;
    }

    if (!parsedValue || typeof parsedValue !== "object") {
      return null;
    }

    if (!parsedValue.preferences || typeof parsedValue.preferences !== "object") {
      return null;
    }

    return parsedValue;
  }

  function writeConsentRecord(record) {
    try {
      window.localStorage.setItem(consentConfig.storageKey, JSON.stringify(record));
    } catch (error) {
      // Ignore storage failures so the rest of the experience still works.
    }
  }

  function removeConsentRecord() {
    try {
      window.localStorage.removeItem(consentConfig.storageKey);
    } catch (error) {
      // Ignore storage failures so the rest of the experience still works.
    }
  }

  function buildConsentRecord(status, preferences) {
    return {
      status: status,
      version: consentConfig.version,
      updatedAt: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: Boolean(preferences.analytics),
        marketing: Boolean(preferences.marketing)
      }
    };
  }

  function hasCurrentConsent(record) {
    return Boolean(record && record.version === consentConfig.version && record.preferences);
  }

  function loadGoogleAnalytics() {
    var measurementId = consentConfig.analytics.googleAnalyticsMeasurementId;
    var script;

    if (!measurementId || trackerState.gaLoaded) {
      return;
    }

    trackerState.gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", measurementId);

    script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    script.setAttribute("data-consent-tracker", "google-analytics");
    document.head.appendChild(script);
  }

  function loadMetaPixel() {
    var pixelId = consentConfig.marketing.metaPixelId;

    if (!pixelId || trackerState.metaLoaded) {
      return;
    }

    trackerState.metaLoaded = true;

    !function (f, b, e, v, n, t, s) {
      if (f.fbq) {
        return;
      }

      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };

      if (!f._fbq) {
        f._fbq = n;
      }

      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      t.setAttribute("data-consent-tracker", "meta-pixel");
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
  }

  function applyConsent(record) {
    if (!record || !record.preferences) {
      return;
    }

    if (record.preferences.analytics) {
      loadGoogleAnalytics();
    }

    if (record.preferences.marketing) {
      loadMetaPixel();
    }
  }

  function createConsentBanner() {
    var banner = document.createElement("section");

    banner.className = "cookie-consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie preferences");
    banner.innerHTML =
      '<p class="cookie-consent-banner__eyebrow">Cookie notice</p>' +
      '<h2 class="cookie-consent-banner__title">We use cookies to improve your experience.</h2>' +
      '<p class="cookie-consent-banner__copy">Cashly uses cookies to remember preferences, keep the site working smoothly, and understand how visitors use the website.</p>' +
      '<div class="cookie-consent-banner__actions">' +
        '<button type="button" class="cookie-consent-banner__button cookie-consent-banner__button--primary" data-consent-accept>Accept all</button>' +
        '<button type="button" class="cookie-consent-banner__button cookie-consent-banner__button--secondary" data-consent-reject>Reject optional</button>' +
        '<button type="button" class="cookie-consent-banner__button cookie-consent-banner__button--ghost" data-consent-manage>Manage preferences</button>' +
      '</div>' +
      '<div class="cookie-consent-banner__panel" data-consent-panel hidden>' +
        '<div class="cookie-consent-banner__option">' +
          '<div>' +
            '<strong>Necessary</strong>' +
            '<p>Required for core site functionality and saved automatically.</p>' +
          '</div>' +
          '<label class="cookie-consent-toggle">' +
            '<input type="checkbox" checked disabled>' +
            '<span class="cookie-consent-toggle__slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="cookie-consent-banner__option">' +
          '<div>' +
            '<strong>Analytics</strong>' +
            '<p>Allows Google Analytics after consent to measure site usage.</p>' +
          '</div>' +
          '<label class="cookie-consent-toggle">' +
            '<input type="checkbox" data-consent-analytics>' +
            '<span class="cookie-consent-toggle__slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="cookie-consent-banner__option">' +
          '<div>' +
            '<strong>Marketing</strong>' +
            '<p>Allows Meta Pixel after consent for marketing measurement.</p>' +
          '</div>' +
          '<label class="cookie-consent-toggle">' +
            '<input type="checkbox" data-consent-marketing>' +
            '<span class="cookie-consent-toggle__slider"></span>' +
          '</label>' +
        '</div>' +
        '<div class="cookie-consent-banner__panel-actions">' +
          '<button type="button" class="cookie-consent-banner__button cookie-consent-banner__button--primary" data-consent-save>Save preferences</button>' +
          '<a class="cookie-consent-banner__policy" href="' + consentConfig.policyUrl + '">Privacy policy</a>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="cookie-consent-banner__dismiss" data-consent-close aria-label="Close cookie notice">' +
        '<span aria-hidden="true">&times;</span>' +
      '</button>';

    return banner;
  }

  function ensureConsentTrigger() {
    var existingTrigger = document.querySelector(".cookie-consent-trigger");
    var trigger;

    if (!document.body || existingTrigger) {
      return;
    }

    trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "cookie-consent-trigger";
    trigger.textContent = "Cookie settings";
    trigger.addEventListener("click", function () {
      window.CashlyConsent.openPreferences();
    });

    document.body.appendChild(trigger);
  }

  function mountConsentBanner(savedRecord) {
    var banner;
    var panel;
    var analyticsToggle;
    var marketingToggle;

    if (!document.body || document.querySelector(".cookie-consent-banner")) {
      return;
    }

    banner = createConsentBanner();
    panel = banner.querySelector("[data-consent-panel]");
    analyticsToggle = banner.querySelector("[data-consent-analytics]");
    marketingToggle = banner.querySelector("[data-consent-marketing]");

    if (savedRecord && savedRecord.preferences) {
      analyticsToggle.checked = Boolean(savedRecord.preferences.analytics);
      marketingToggle.checked = Boolean(savedRecord.preferences.marketing);
    }

    function showPanel() {
      panel.hidden = false;
      banner.classList.add("is-managing");
    }

    function hidePanel() {
      panel.hidden = true;
      banner.classList.remove("is-managing");
    }

    function closeBanner() {
      banner.classList.remove("is-visible");

      window.setTimeout(function () {
        if (banner.parentNode) {
          banner.parentNode.removeChild(banner);
        }
      }, 220);
    }

    function saveAndApply(status, preferences) {
      var record = buildConsentRecord(status, preferences);

      writeConsentRecord(record);
      applyConsent(record);
      ensureConsentTrigger();
      closeBanner();
    }

    banner.querySelector("[data-consent-accept]").addEventListener("click", function () {
      saveAndApply("accepted", {
        analytics: true,
        marketing: true
      });
    });

    banner.querySelector("[data-consent-reject]").addEventListener("click", function () {
      saveAndApply("rejected", {
        analytics: false,
        marketing: false
      });
    });

    banner.querySelector("[data-consent-manage]").addEventListener("click", function () {
      showPanel();
    });

    banner.querySelector("[data-consent-save]").addEventListener("click", function () {
      saveAndApply("custom", {
        analytics: analyticsToggle.checked,
        marketing: marketingToggle.checked
      });
    });

    banner.querySelector("[data-consent-close]").addEventListener("click", function () {
      closeBanner();
    });

    document.body.appendChild(banner);

    window.requestAnimationFrame(function () {
      banner.classList.add("is-visible");
    });

    hidePanel();
  }

  function initConsentBanner() {
    var currentRecord = readConsentRecord();

    if (hasCurrentConsent(currentRecord)) {
      applyConsent(currentRecord);
      ensureConsentTrigger();
      return;
    }

    removeConsentRecord();
    mountConsentBanner(currentRecord);
  }

  window.CashlyConsent = {
    getConsent: readConsentRecord,
    openPreferences: function () {
      var savedRecord = readConsentRecord();
      var banner = document.querySelector(".cookie-consent-banner");
      var panel;

      if (!banner) {
        mountConsentBanner(savedRecord);
        banner = document.querySelector(".cookie-consent-banner");
      }

      panel = banner ? banner.querySelector("[data-consent-panel]") : null;

      if (banner && panel) {
        panel.hidden = false;
        banner.classList.add("is-visible", "is-managing");
      }
    },
    reset: function () {
      removeConsentRecord();
      window.location.reload();
    }
  };

  initConsentBanner();
})();
