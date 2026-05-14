document.addEventListener("DOMContentLoaded", () => {
  const googleCalendarBookingUrl = "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2PwLnMIboXJYLmTsCPplmIsfxdOpZLqBosbVhaP4f5xH1Wp7McyVyYGjV9aMC20yGazrkx0koT";
  const callbackFormConfigs = [
    {
      form: document.getElementById("homeCallbackForm"),
      messageElement: document.getElementById("homeCallbackMessage"),
      submitButton: document.getElementById("homeCallbackSubmitButton"),
      turnstileContainer: document.getElementById("homeCallbackTurnstile")
    },
    {
      form: document.getElementById("productCallbackForm"),
      messageElement: document.getElementById("productCallbackMessage"),
      submitButton: document.getElementById("productCallbackSubmitButton"),
      turnstileContainer: document.getElementById("productCallbackTurnstile")
    }
  ];
  const calculatorModal = document.getElementById("borrowerCalculatorModal");
  const calculatorForm = document.getElementById("mortgageCalculatorForm");
  const calculatorNextButton = document.getElementById("calculatorNextButton");
  const calculatorLeadForm = document.getElementById("calculatorLeadForm");
  const calculatorLeadMessage = document.getElementById("calculatorLeadMessage");
  const calculatorLeadSubmitButton = document.getElementById("calculatorLeadSubmitButton");
  const calculatorBackButton = document.getElementById("calculatorBackButton");
  const calculatorLeadFirstName = document.getElementById("calculator-lead-first-name");
  const calculatorLeadLockedState = document.getElementById("calculatorLeadLockedState");
  const calculatorLeadModal = document.getElementById("calculatorLeadModal");
  const calculatorLeadTurnstileContainer = document.getElementById("calculatorLeadTurnstile");
  const calculatorResultModal = document.getElementById("calculatorResultModal");
  const calculatorResultDate = document.getElementById("calculator-result-date");
  const pricingCalculators = Array.from(document.querySelectorAll("[data-pricing-calculator]"));
  const defaultCalculatorLeadButtonText = calculatorLeadSubmitButton ? calculatorLeadSubmitButton.textContent.trim() : "Get Your Rates";
  const calculatorModalHash = "#borrowerCalculatorModal";
  let calculatorLeadTurnstileWidgetId = null;
  let calculatorLeadTurnstileToken = "";
  let calculatorLeadTurnstileReady = false;
  let calculatorLeadTurnstileRenderPromise = null;
  let calculatorTransitioningToLeadModal = false;
  let calculatorReopenAfterLeadModal = false;
  let calculatorOpenResultAfterLeadModal = false;

  if (window.AOS) {
    window.AOS.init({
      duration: 900,
      once: true
    });
  }

  const mobileNavMediaQuery = window.matchMedia("(max-width: 991px)");
  const navDropdowns = Array.from(document.querySelectorAll(".main-nav .dropdown"));

  if (navDropdowns.length > 0) {
    const closeDropdown = (dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      const menu = dropdown.querySelector(".dropdown-menu");

      dropdown.classList.remove("is-open");

      if (menu) {
        menu.classList.remove("show");
      }

      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    };

    const closeAllDropdowns = () => {
      navDropdowns.forEach(closeDropdown);
    };

    navDropdowns.forEach((dropdown) => {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      const menu = dropdown.querySelector(".dropdown-menu");

      if (!toggle || !menu) {
        return;
      }

      toggle.addEventListener("click", (event) => {
        if (!mobileNavMediaQuery.matches) {
          return;
        }

        const isServiceToggle = dropdown.classList.contains("service-nav");
        const clickedIcon = Boolean(event.target.closest("span, i"));

        if (isServiceToggle && !clickedIcon) {
          return;
        }

        event.preventDefault();

        const willOpen = !dropdown.classList.contains("is-open");

        closeAllDropdowns();

        if (willOpen) {
          dropdown.classList.add("is-open");
          menu.classList.add("show");
          toggle.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!mobileNavMediaQuery.matches) {
        return;
      }

      if (!event.target.closest(".main-nav .dropdown")) {
        closeAllDropdowns();
      }
    });

    const resetDropdowns = () => {
      if (!mobileNavMediaQuery.matches) {
        closeAllDropdowns();
      }
    };

    if (typeof mobileNavMediaQuery.addEventListener === "function") {
      mobileNavMediaQuery.addEventListener("change", resetDropdowns);
    } else if (typeof mobileNavMediaQuery.addListener === "function") {
      mobileNavMediaQuery.addListener(resetDropdowns);
    }
  }

  const mainNav = document.querySelector(".main-nav");
  const isHomePage = document.body.classList.contains("home-page");
  const demoPopupWidget = document.getElementById("demoPopupWidget");
  const demoPopupLauncher = document.getElementById("demoPopupLauncher");
  const demoPopupBackdrop = document.getElementById("demoPopupBackdrop");
  const demoPopupPanel = document.getElementById("demoPopupPanel");
  const demoPopupClose = document.getElementById("demoPopupClose");
  const demoPopupOpenTriggers = Array.from(document.querySelectorAll("[data-demo-popup-open]"));
  const demoBookingForm = document.getElementById("demoBookingForm");
  const demoBookingName = document.getElementById("demoBookingName");
  const demoBookingDate = document.getElementById("demoBookingDate");
  const demoBookingTime = document.getElementById("demoBookingTime");
  const demoBookingTimezone = document.getElementById("demoBookingTimezone");
  const demoBookingSlotLabel = document.getElementById("demoBookingSlotLabel");
  const demoBookingMessage = document.getElementById("demoBookingMessage");
  const demoBookingSubmitButton = document.getElementById("demoBookingSubmitButton");
  const defaultDemoBookingButtonText = demoBookingSubmitButton
    ? demoBookingSubmitButton.textContent.trim()
    : "Schedule Appointment";
  const demoBookingTimeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00"
  ];

  const formatLocalDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getNextBusinessDateValue = () => {
    const nextBusinessDate = new Date();
    nextBusinessDate.setHours(0, 0, 0, 0);

    do {
      nextBusinessDate.setDate(nextBusinessDate.getDate() + 1);
    } while (nextBusinessDate.getDay() === 0 || nextBusinessDate.getDay() === 6);

    return formatLocalDateInputValue(nextBusinessDate);
  };

  const formatDemoTimeLabel = (timeValue) => {
    if (!timeValue) {
      return "";
    }

    const [hoursValue, minutesValue] = timeValue.split(":");
    const hours = Number(hoursValue);
    const minutes = Number(minutesValue);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return timeValue;
    }

    const period = hours >= 12 ? "PM" : "AM";
    const normalizedHours = hours % 12 || 12;
    const normalizedMinutes = String(minutes).padStart(2, "0");

    return `${normalizedHours}:${normalizedMinutes} ${period}`;
  };

  const formatDemoDateLabel = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const [yearValue, monthValue, dayValue] = dateValue.split("-").map((value) => Number(value));

    if (!yearValue || !monthValue || !dayValue) {
      return dateValue;
    }

    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(new Date(yearValue, monthValue - 1, dayValue));
  };

  const populateDemoBookingTimeOptions = () => {
    if (!demoBookingTime) {
      return;
    }

    const currentValue = demoBookingTime.value;

    demoBookingTime.innerHTML = '<option value="">Select a time</option>';

    demoBookingTimeSlots.forEach((slotValue) => {
      const option = document.createElement("option");
      option.value = slotValue;
      option.textContent = formatDemoTimeLabel(slotValue);
      demoBookingTime.appendChild(option);
    });

    if (currentValue) {
      demoBookingTime.value = currentValue;
    }
  };

  const isDemoBookingWeekend = (dateValue) => {
    if (!dateValue) {
      return false;
    }

    const [yearValue, monthValue, dayValue] = dateValue.split("-").map((value) => Number(value));
    const selectedDate = new Date(yearValue, monthValue - 1, dayValue);
    const day = selectedDate.getDay();
    return day === 0 || day === 6;
  };

  const updateDemoBookingSlotLabel = () => {
    if (!demoBookingSlotLabel) {
      return "";
    }

    const formattedDate = formatDemoDateLabel(demoBookingDate ? demoBookingDate.value : "");
    const formattedTime = formatDemoTimeLabel(demoBookingTime ? demoBookingTime.value : "");
    const timezone = demoBookingTimezone ? demoBookingTimezone.value : "";
    const slotLabelParts = [formattedDate, formattedTime].filter(Boolean);
    let slotLabel = slotLabelParts.join(" at ");

    if (slotLabel && timezone) {
      slotLabel = `${slotLabel} (${timezone})`;
    }

    demoBookingSlotLabel.value = slotLabel;
    return slotLabel;
  };

  if (
    demoPopupWidget &&
    demoPopupLauncher &&
    demoPopupBackdrop &&
    demoPopupPanel &&
    demoPopupClose
  ) {
    const setDemoPopupOpen = (isOpen) => {
      demoPopupWidget.classList.toggle("is-open", isOpen);
      demoPopupLauncher.setAttribute("aria-expanded", String(isOpen));
      demoPopupPanel.setAttribute("aria-hidden", String(!isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    const focusDemoBookingForm = () => {
      if (!demoBookingName) {
        return;
      }

      window.setTimeout(() => {
        demoBookingName.focus();
      }, 120);
    };

    const openDemoPopup = () => {
      setDemoPopupOpen(true);
      focusDemoBookingForm();
    };

    demoPopupLauncher.addEventListener("click", () => {
      setDemoPopupOpen(!demoPopupWidget.classList.contains("is-open"));
    });

    demoPopupClose.addEventListener("click", () => {
      setDemoPopupOpen(false);
    });

    demoPopupBackdrop.addEventListener("click", () => {
      setDemoPopupOpen(false);
    });

    demoPopupOpenTriggers.forEach((trigger) => {
      trigger.addEventListener("click", (event) => {
        event.preventDefault();

        if (trigger.closest(".feature-interest-modal")) {
          closeFeatureInterestModal();
        }

        openDemoPopup();
      });
    });

    setDemoPopupOpen(false);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setDemoPopupOpen(false);
      }
    });

    if (demoBookingForm && demoBookingSubmitButton) {
      const todayValue = formatLocalDateInputValue(new Date());

      populateDemoBookingTimeOptions();

      if (demoBookingDate) {
        demoBookingDate.min = todayValue;
        demoBookingDate.value = getNextBusinessDateValue();
      }

      if (demoBookingTimezone) {
        demoBookingTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      }

      updateDemoBookingSlotLabel();

      if (demoBookingDate) {
        demoBookingDate.addEventListener("change", () => {
          if (isDemoBookingWeekend(demoBookingDate.value)) {
            demoBookingDate.setCustomValidity("Please choose a weekday for your demo request.");
          } else {
            demoBookingDate.setCustomValidity("");
          }

          updateDemoBookingSlotLabel();
        });
      }

      if (demoBookingTime) {
        demoBookingTime.addEventListener("change", () => {
          updateDemoBookingSlotLabel();
        });
      }

      demoBookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (demoBookingDate && isDemoBookingWeekend(demoBookingDate.value)) {
          demoBookingDate.setCustomValidity("Please choose a weekday for your demo request.");
        }

        if (!demoBookingForm.reportValidity()) {
          return;
        }

        const requestedSlotLabel = updateDemoBookingSlotLabel();

        demoBookingSubmitButton.disabled = true;
        demoBookingSubmitButton.innerHTML = 'Sending Request <i class="ti-reload"></i>';

        if (demoBookingMessage) {
          demoBookingMessage.className = "callback-message";
          demoBookingMessage.textContent = "";
        }

        try {
          const formData = new FormData(demoBookingForm);

          if (requestedSlotLabel) {
            formData.set("requested_slot", requestedSlotLabel);
          }

          if (demoBookingTimezone && demoBookingTimezone.value) {
            formData.set("timezone", demoBookingTimezone.value);
          }

          const response = await fetch(demoBookingForm.action, {
            method: "POST",
            body: formData,
            headers: {
              Accept: "application/json"
            }
          });

          if (!response.ok) {
            throw new Error("Something went wrong. Please try again or email support@gocashly.io.");
          }

          demoBookingForm.reset();
          populateDemoBookingTimeOptions();

          if (demoBookingDate) {
            demoBookingDate.min = todayValue;
            demoBookingDate.value = getNextBusinessDateValue();
            demoBookingDate.setCustomValidity("");
          }

          if (demoBookingTimezone) {
            demoBookingTimezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
          }

          updateDemoBookingSlotLabel();

          if (demoBookingMessage) {
            demoBookingMessage.className = "callback-message is-success";
            demoBookingMessage.textContent = "Your demo request has been sent. We will confirm your selected time by email.";
          }
        } catch (error) {
          if (demoBookingMessage) {
            demoBookingMessage.className = "callback-message is-error";
            demoBookingMessage.textContent = error.message || "Network error. Please try again in a moment.";
          }
        } finally {
          demoBookingSubmitButton.disabled = false;
          demoBookingSubmitButton.innerHTML = `${defaultDemoBookingButtonText}`;
        }
      });
    }
  }

  if (mainNav && isHomePage) {
    const updateNavState = () => {
      mainNav.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    window.addEventListener("scroll", updateNavState, { passive: true });
    updateNavState();
  }

  const interactiveHero = document.querySelector(".home-hero--product-update");
  const heroTiltStage = interactiveHero ? interactiveHero.querySelector("[data-hero-tilt]") : null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (isHomePage && !prefersReducedMotion.matches) {
    document.body.classList.add("js-motion-ready");

    const motionRevealSelectors = [
      ".stat-highlight-card",
      ".capability-card",
      ".advantage-card",
      ".value-card",
      ".journey-step",
      ".showcase-image",
      ".showcase-copy",
      ".workspace-panel__shell",
      ".workspace-panel__visual",
      ".faq-item-modern",
      ".cta-banner"
    ];
    const motionRevealElements = Array.from(
      document.querySelectorAll(motionRevealSelectors.join(","))
    );

    if ("IntersectionObserver" in window && motionRevealElements.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.16,
          rootMargin: "0px 0px -8% 0px"
        }
      );

      motionRevealElements.forEach((element, index) => {
        element.classList.add("motion-reveal");
        element.style.setProperty("--motion-delay", `${(index % 6) * 70}ms`);
        revealObserver.observe(element);
      });
    }

    const statValues = Array.from(document.querySelectorAll(".stat-highlight-card strong"));
    const animatedStatValues = statValues.filter((element) => /^\d+/.test(element.textContent.trim()));

    if ("IntersectionObserver" in window && animatedStatValues.length > 0) {
      const animateNumber = (element) => {
        const originalText = element.textContent.trim();
        const match = originalText.match(/^(\d+)(.*)$/);

        if (!match) {
          return;
        }

        const targetValue = Number.parseInt(match[1], 10);
        const suffix = match[2] || "";
        const duration = 1100;
        const startTime = performance.now();

        const updateValue = (currentTime) => {
          const progress = Math.min((currentTime - startTime) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          const currentValue = Math.round(targetValue * easedProgress);

          element.textContent = `${currentValue}${suffix}`;

          if (progress < 1) {
            window.requestAnimationFrame(updateValue);
          } else {
            element.textContent = originalText;
          }
        };

        window.requestAnimationFrame(updateValue);
      };

      const statObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            animateNumber(entry.target);
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.4
        }
      );

      animatedStatValues.forEach((element) => {
        statObserver.observe(element);
      });
    }
  }

  if (interactiveHero && heroTiltStage && !prefersReducedMotion.matches) {
    const updateHeroMotion = (x, y) => {
      heroTiltStage.style.setProperty("--hero-tilt-x", `${(-y * 6).toFixed(2)}deg`);
      heroTiltStage.style.setProperty("--hero-tilt-y", `${(x * 7).toFixed(2)}deg`);
      heroTiltStage.style.setProperty("--hero-parallax-x", `${(x * 16).toFixed(2)}px`);
      heroTiltStage.style.setProperty("--hero-parallax-y", `${(y * 12).toFixed(2)}px`);
    };

    const handleHeroPointerMove = (event) => {
      const rect = interactiveHero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;

      updateHeroMotion(x, y);
    };

    const resetHeroMotion = () => {
      updateHeroMotion(0, 0);
    };

    interactiveHero.addEventListener("pointermove", handleHeroPointerMove);
    interactiveHero.addEventListener("pointerleave", resetHeroMotion);
    resetHeroMotion();
  }

  const heroParticlesTarget = document.getElementById("particles-js");

  if (heroParticlesTarget && window.particlesJS) {
    window.particlesJS("particles-js", {
      particles: {
        number: {
          value: 56,
          density: {
            enable: true,
            value_area: 1000
          }
        },
        color: {
          value: "#5c7ff5"
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: 0.34,
          random: false,
          anim: {
            enable: true,
            speed: 1.2,
            opacity_min: 0.16,
            sync: false
          }
        },
        size: {
          value: 4.5,
          random: true,
          anim: {
            enable: false,
            speed: 4,
            size_min: 1.5,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 140,
          color: "#5c7ff5",
          opacity: 0.24,
          width: 1.2
        },
        move: {
          enable: true,
          speed: 1.8,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab"
          },
          onclick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.22
            }
          },
          push: {
            particles_nb: 3
          }
        }
      },
      retina_detect: true
    });
  }

  const scarlettModal = document.getElementById("scarlettModal");
  const scarlettSuccessModal = document.getElementById("scarlettSuccessModal");
  const integrationCardTriggers = Array.from(document.querySelectorAll("[data-integration-open]"));
  const scarlettModalCloseTriggers = Array.from(document.querySelectorAll("[data-scarlett-close]:not([data-scarlett-success-close])"));
  const scarlettConfigureButtons = Array.from(document.querySelectorAll(".scarlett-configure-open"));
  const scarlettSuccessCloseTriggers = Array.from(document.querySelectorAll("[data-scarlett-success-close]"));
  const brokerCopilotModal = document.getElementById("brokerCopilotModal");
  const brokerCopilotTriggers = Array.from(document.querySelectorAll("[data-broker-copilot-open]"));
  const brokerCopilotCloseTriggers = Array.from(document.querySelectorAll("[data-broker-copilot-close]"));
  const brokerCopilotPromptButtons = Array.from(document.querySelectorAll("[data-broker-prompt]"));
  const brokerCopilotComposer = document.getElementById("brokerCopilotComposer");
  const brokerCopilotInput = document.getElementById("brokerCopilotInput");
  const brokerCopilotChat = document.getElementById("brokerCopilotChat");
  const brokerCopilotUserMessage = document.getElementById("brokerCopilotUserMessage");
  const brokerCopilotUserText = document.getElementById("brokerCopilotUserText");
  const brokerCopilotAssistantMessage = document.getElementById("brokerCopilotAssistantMessage");
  const brokerCopilotTyping = document.getElementById("brokerCopilotTyping");
  const brokerCopilotAssistantLead = document.getElementById("brokerCopilotAssistantLead");
  const brokerCopilotAssistantBody = document.getElementById("brokerCopilotAssistantBody");
  const brokerCopilotAssistantFooter = document.getElementById("brokerCopilotAssistantFooter");
  const opportunityPipelineModal = document.getElementById("opportunityPipelineModal");
  const opportunityPipelineTriggers = Array.from(document.querySelectorAll("[data-opportunity-pipeline-open]"));
  const opportunityPipelineCloseTriggers = Array.from(document.querySelectorAll("[data-opportunity-pipeline-close]"));
  const opportunityPipelineCardLists = opportunityPipelineModal
    ? Array.from(opportunityPipelineModal.querySelectorAll(".pipeline-column__cards"))
    : [];
  const campaignCallingModal = document.getElementById("campaignCallingModal");
  const campaignCallingTriggers = Array.from(document.querySelectorAll("[data-campaign-calling-open]"));
  const campaignCallingCloseTriggers = Array.from(document.querySelectorAll("[data-campaign-calling-close]"));
  const campaignCallingStartButton = document.getElementById("campaignCallingStart");
  const campaignCallingStartButtonLabel = campaignCallingStartButton
    ? campaignCallingStartButton.querySelector("span")
    : null;
  const campaignCallingStatus = document.getElementById("campaignCallingStatus");
  const campaignCallingCurrentLead = document.getElementById("campaignCallingCurrentLead");
  const campaignCallingCurrentMeta = document.getElementById("campaignCallingCurrentMeta");
  const campaignCallingProgressText = document.getElementById("campaignCallingProgressText");
  const campaignCallingProgressBar = document.getElementById("campaignCallingProgressBar");
  const campaignCallingConnectedCount = document.getElementById("campaignCallingConnectedCount");
  const campaignCallingFollowUpCount = document.getElementById("campaignCallingFollowUpCount");
  const campaignCallingRemainingCount = document.getElementById("campaignCallingRemainingCount");
  const campaignCallingDialerMode = document.getElementById("campaignCallingDialerMode");
  const campaignCallingDialerDisplay = document.getElementById("campaignCallingDialerDisplay");
  const campaignCallingRows = campaignCallingModal
    ? Array.from(campaignCallingModal.querySelectorAll(".campaign-row"))
    : [];
  const featureInterestModal = document.getElementById("featureInterestModal");
  const featureInterestTriggers = Array.from(document.querySelectorAll("[data-feature-interest-open]"));
  const featureInterestCloseTriggers = Array.from(document.querySelectorAll("[data-feature-interest-close]"));
  const featureInterestModalEyebrow = document.getElementById("featureInterestModalEyebrow");
  const featureInterestModalHeading = document.getElementById("featureInterestModalHeading");
  const featureInterestModalLead = document.getElementById("featureInterestModalLead");
  const featureInterestModalIcon = document.getElementById("featureInterestModalIcon");
  const featureInterestModalCardTitle = document.getElementById("featureInterestModalCardTitle");
  const featureInterestModalCardCopy = document.getElementById("featureInterestModalCardCopy");
  const featureInterestModalQuote = document.getElementById("featureInterestModalQuote");
  const featureInterestModalCta = document.getElementById("featureInterestModalCta");
  const pricingTierModal = document.getElementById("pricingTierModal");
  const pricingTierTriggers = Array.from(document.querySelectorAll("[data-pricing-tier-open]"));
  const pricingTierCloseTriggers = Array.from(document.querySelectorAll("[data-pricing-tier-close]"));
  const pricingTierModalEyebrow = document.getElementById("pricingTierModalEyebrow");
  const pricingTierModalTitle = document.getElementById("pricingTierModalTitle");
  const pricingTierModalLead = document.getElementById("pricingTierModalLead");
  const pricingTierModalMonthly = document.getElementById("pricingTierModalMonthly");
  const pricingTierModalMonthlyNote = document.getElementById("pricingTierModalMonthlyNote");
  const pricingTierModalYearly = document.getElementById("pricingTierModalYearly");
  const pricingTierModalYearlyNote = document.getElementById("pricingTierModalYearlyNote");
  const pricingTierModalDiscount = document.getElementById("pricingTierModalDiscount");
  const pricingTierModalAnnualAmount = document.getElementById("pricingTierModalAnnualAmount");
  const pricingTierModalSavings = document.getElementById("pricingTierModalSavings");
  const pricingTierModalCloseButton = pricingTierModal
    ? pricingTierModal.querySelector(".pricing-tier-modal__close")
    : null;
  const scarlettModalIcon = document.getElementById("scarlettModalIcon");
  const scarlettModalTitle = document.getElementById("scarlettModalTitle");
  const scarlettModalDescription = document.getElementById("scarlettModalDescription");
  const scarlettModalStatus = document.getElementById("scarlettModalStatus");
  const scarlettModalSummaryHeading = document.getElementById("scarlettModalSummaryHeading");
  const scarlettModalSummaryNoteOne = document.getElementById("scarlettModalSummaryNoteOne");
  const scarlettModalSummaryNoteTwo = document.getElementById("scarlettModalSummaryNoteTwo");
  const scarlettConfigureButton = document.getElementById("scarlettConfigureButton");
  const scarlettSuccessModalTitle = document.getElementById("scarlettSuccessModalTitle");
  const scarlettSuccessModalMessage = document.getElementById("scarlettSuccessModalMessage");
  const capabilityTourWrap = document.querySelector("[data-capability-tour-wrap]");
  const capabilityTour = document.getElementById("capabilityTour");
  const capabilityTourBubble = capabilityTour
    ? capabilityTour.querySelector(".capability-tour__bubble")
    : null;
  const capabilityTourCursor = capabilityTour
    ? capabilityTour.querySelector(".capability-tour__cursor")
    : null;
  const capabilityTourPrimaryTarget = capabilityTourWrap
    ? capabilityTourWrap.querySelector(".capability-card--tour-target")
    : null;
  const capabilityTourTargets = capabilityTourWrap
    ? Array.from(capabilityTourWrap.querySelectorAll(".capability-card--interactive"))
    : [];
  let activeIntegrationKey = "scarlett";
  let capabilityTourIsInView = false;
  let capabilityTourIsVisible = false;
  let capabilityTourHasShownForCurrentEntry = false;
  let capabilityTourShowTimer = null;
  let capabilityTourHideTimer = null;
  let capabilityTourResetTimer = null;
  let capabilityTourObserver = null;
  let activePricingTierTrigger = null;
  const featureInterestModalContent = {
    "call-analytics": {
      eyebrow: "Call Analytics Preview",
      heading: "Want to see how call analytics works inside Cashly?",
      lead: "Book a live demo with us and we will show you how teams track connection rates, handle time, user activity, and call volume without leaving the CRM workflow.",
      iconClass: "ti-headphone-alt",
      cardTitle: "Call Analytics",
      cardCopy: "See how call performance stays visible at both the team and user level, so managers and brokers can spot patterns faster and make better follow-up decisions.",
      quote: "We will walk through activity visibility, team performance tracking, and how call data supports daily brokerage execution."
    },
    dealsense: {
      eyebrow: "DealSense Preview",
      heading: "Excited to know more about DealSense ranking?",
      lead: "Book a live demo with us and we will walk you through the full lender-ranking process in detail, including scoring logic, recommendation confidence, and how brokers use it inside the workflow.",
      iconClass: "ti-target",
      cardTitle: "DealSense Ranking",
      cardCopy: "See how Cashly can surface stronger lender-fit recommendations while keeping the final decision grounded in borrower context, file stage, and operational reality.",
      quote: "We will cover ranking logic, workflow fit, explainability, and what the end-to-end experience looks like for your team."
    },
    docsense: {
      eyebrow: "DocSense Preview",
      heading: "Excited to know more about DocSense?",
      lead: "Book a live demo with us and we will go through the whole document process in detail, from extraction and review to routing, file organization, and how everything stays connected to the active deal.",
      iconClass: "ti-files",
      cardTitle: "DocSense",
      cardCopy: "See how document handling becomes cleaner, faster, and easier to review when extraction, file context, and next actions live inside the same operating system.",
      quote: "We will cover document intake, metadata review, routing logic, and how teams keep every file tied to the right borrower and opportunity."
    }
  };
  const integrationModalContent = {
    velocity: {
      iconClass: "ti-exchange-vertical",
      title: "Velocity Submission Sync",
      description: "Connect brokerage submission flow, routing updates, and partner handoff visibility through Velocity.",
      status: "Available",
      summaryHeading: "Ready for brokerage setup",
      summaryNoteOne: "Submission credentials can be mapped organization-wide",
      summaryNoteTwo: "Routing and workflow updates stay visible inside Cashly",
      actionLabel: "Connect Velocity",
      successTitle: "Velocity connected",
      successMessage: "Congratulations — your organization is connected with Velocity. Submission flow and operating visibility can now stay closer to your Cashly CRM workflow."
    },
    scarlett: {
      iconClass: "ti-link",
      title: "Scarlett Opportunity Sync",
      description: "Organization-owned Scarlett credentials for opportunity preview, import, and lender submissions refresh.",
      status: "Configured",
      summaryHeading: "Enabled for this organization",
      summaryNoteOne: "Primary API key stored",
      summaryNoteTwo: "Uses primary key for submissions",
      actionLabel: "Configured",
      successTitle: "Scarlett connected",
      successMessage: "Congratulations — your organization is connected with Scarlett. You can now push and pull deals directly from Cashly CRM through Scarlett"
    },
    boss: {
      iconClass: "ti-briefcase",
      title: "BOSS Brokerage Sync",
      description: "Keep brokerage-side records, operational context, and deal coordination aligned through BOSS connectivity.",
      status: "Available",
      summaryHeading: "Connection path available",
      summaryNoteOne: "Brokerage account mapping can be enabled per organization",
      summaryNoteTwo: "Operational records stay closer to the active deal workflow",
      actionLabel: "Connect BOSS",
      successTitle: "BOSS connected",
      successMessage: "Congratulations — your organization is connected with BOSS. Brokerage operations and deal coordination can now flow more directly through Cashly CRM."
    }
  };

  const applyIntegrationModalContent = (integrationKey) => {
    const content = integrationModalContent[integrationKey] || integrationModalContent.scarlett;
    activeIntegrationKey = integrationKey in integrationModalContent ? integrationKey : "scarlett";

    if (scarlettModalIcon) {
      scarlettModalIcon.className = content.iconClass;
    }

    if (scarlettModalTitle) {
      scarlettModalTitle.textContent = content.title;
    }

    if (scarlettModalDescription) {
      scarlettModalDescription.textContent = content.description;
    }

    if (scarlettModalStatus) {
      scarlettModalStatus.textContent = content.status;
    }

    if (scarlettModalSummaryHeading) {
      scarlettModalSummaryHeading.textContent = content.summaryHeading;
    }

    if (scarlettModalSummaryNoteOne) {
      scarlettModalSummaryNoteOne.textContent = content.summaryNoteOne;
    }

    if (scarlettModalSummaryNoteTwo) {
      scarlettModalSummaryNoteTwo.textContent = content.summaryNoteTwo;
    }

    if (scarlettConfigureButton) {
      scarlettConfigureButton.textContent = content.actionLabel;
    }

    if (scarlettSuccessModalTitle) {
      scarlettSuccessModalTitle.textContent = content.successTitle;
    }

    if (scarlettSuccessModalMessage) {
      scarlettSuccessModalMessage.textContent = content.successMessage;
    }
  };

  const positionCapabilityTour = () => {
    if (!capabilityTourWrap || !capabilityTour || !capabilityTourPrimaryTarget || !capabilityTourBubble || !capabilityTourCursor) {
      return;
    }

    const wrapRect = capabilityTourWrap.getBoundingClientRect();
    const targetRect = capabilityTourPrimaryTarget.getBoundingClientRect();
    const bubbleWidth = capabilityTourBubble.offsetWidth || 250;
    const isCompact = window.innerWidth <= 767;

    if (isCompact) {
      capabilityTour.style.removeProperty("--capability-tour-bubble-x");
      capabilityTour.style.removeProperty("--capability-tour-bubble-y");
      capabilityTour.style.removeProperty("--capability-tour-cursor-x");
      capabilityTour.style.removeProperty("--capability-tour-cursor-y");
      return;
    }

    const bubbleX = Math.max(0, Math.min(
      targetRect.left - wrapRect.left,
      Math.max(0, wrapRect.width - bubbleWidth - 12)
    ));
    const bubbleY = Math.max(0, targetRect.top - wrapRect.top - 62);
    const cursorX = targetRect.left - wrapRect.left + Math.min(targetRect.width - 42, targetRect.width * 0.56);
    const cursorY = targetRect.top - wrapRect.top + Math.min(targetRect.height - 46, targetRect.height * 0.54);

    capabilityTour.style.setProperty("--capability-tour-bubble-x", `${Math.round(bubbleX)}px`);
    capabilityTour.style.setProperty("--capability-tour-bubble-y", `${Math.round(bubbleY)}px`);
    capabilityTour.style.setProperty("--capability-tour-cursor-x", `${Math.round(cursorX)}px`);
    capabilityTour.style.setProperty("--capability-tour-cursor-y", `${Math.round(cursorY)}px`);
  };

  const clearCapabilityTourTimers = () => {
    if (capabilityTourShowTimer) {
      window.clearTimeout(capabilityTourShowTimer);
      capabilityTourShowTimer = null;
    }

    if (capabilityTourHideTimer) {
      window.clearTimeout(capabilityTourHideTimer);
      capabilityTourHideTimer = null;
    }

    if (capabilityTourResetTimer) {
      window.clearTimeout(capabilityTourResetTimer);
      capabilityTourResetTimer = null;
    }
  };

  const showCapabilityTour = () => {
    if (
      !capabilityTour ||
      !capabilityTourWrap ||
      !capabilityTourTargets.length ||
      !capabilityTourIsInView ||
      capabilityTourIsVisible ||
      capabilityTourHasShownForCurrentEntry
    ) {
      return;
    }

    clearCapabilityTourTimers();
    capabilityTour.hidden = false;
    capabilityTour.setAttribute("aria-hidden", "false");
    capabilityTourWrap.classList.add("is-tour-active");
    positionCapabilityTour();
    capabilityTourIsVisible = true;

    window.requestAnimationFrame(() => {
      capabilityTour.classList.add("is-visible");
    });

    capabilityTourHideTimer = window.setTimeout(() => {
      dismissCapabilityTour();
    }, 3800);
  };

  const dismissCapabilityTour = () => {
    if (!capabilityTour) {
      return;
    }

    clearCapabilityTourTimers();

    capabilityTour.classList.remove("is-visible");
    capabilityTourIsVisible = false;

    if (capabilityTourIsInView) {
      capabilityTourHasShownForCurrentEntry = true;
    }

    if (capabilityTourWrap) {
      capabilityTourWrap.classList.remove("is-tour-active");
    }

    capabilityTourResetTimer = window.setTimeout(() => {
      capabilityTour.hidden = true;
      capabilityTour.setAttribute("aria-hidden", "true");
    }, 220);
  };

  if (capabilityTourWrap && capabilityTour && capabilityTourPrimaryTarget) {
    window.addEventListener("resize", positionCapabilityTour, { passive: true });
  }

  const formatPricingAmount = (value) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return value;
    }

    const fractionDigits = Number.isInteger(numericValue) ? 0 : 2;
    return numericValue.toLocaleString("en-CA", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2
    });
  };

  const pricingTierContent = {
    "team-6": {
      eyebrow: "Growing team pricing",
      title: "6+ users pricing",
      lead: "Best for growing teams that want to roll out Cashly across multiple brokers and support staff.",
      extraDiscountRate: 0.05
    },
    "team-20": {
      eyebrow: "Established team pricing",
      title: "20+ users pricing",
      lead: "Ideal for established brokerages that want one shared operating system across the team.",
      extraDiscountRate: 0.1
    },
    "team-50": {
      eyebrow: "Scale pricing",
      title: "50+ users pricing",
      lead: "Built for larger organizations standardizing workflow, calling, AI tools, and training at scale.",
      extraDiscountRate: 0.2
    },
    "team-100": {
      eyebrow: "Enterprise pricing",
      title: "100+ users pricing",
      lead: "For enterprise-scale rollouts, speak with our team for implementation support and pricing alignment.",
      extraDiscountRate: 0.3
    }
  };

  const getPricingTierAmounts = (extraDiscountRate = 0) => {
    const monthlyPrice = 199;
    const monthlyTierPrice = monthlyPrice * (1 - extraDiscountRate);
    const annualListPrice = monthlyPrice * 12;
    const annualBaseBilled = annualListPrice * 0.8;
    const annualTierBilled = annualBaseBilled * (1 - extraDiscountRate);

    return {
      monthlyPrice,
      monthlyTierPrice,
      annualListPrice,
      annualTierBilled,
      annualEffectiveMonthly: annualTierBilled / 12,
      annualSavings: annualListPrice - annualTierBilled
    };
  };

  pricingCalculators.forEach((calculator) => {
    const defaultPeriod = calculator.dataset.defaultPeriod === "monthly" ? "monthly" : "yearly";
    const monthlyPrice = 199;
    const yearlyEffectivePrice = 159.2;
    const yearlyBilled = 1910.4;
    const yearlySavings = 477.6;
    const amountElement = calculator.querySelector("[data-pricing-amount]");
    const unitElement = calculator.querySelector("[data-pricing-unit]");
    const subtextElement = calculator.querySelector("[data-pricing-subtext]");
    const badgeElement = calculator.querySelector("[data-pricing-badge]");
    const savingsElement = calculator.querySelector("[data-pricing-savings]");
    const buttons = Array.from(calculator.querySelectorAll("[data-pricing-period]"));

    const renderPricingPeriod = (period) => {
      const isYearly = period === "yearly";

      buttons.forEach((button) => {
        button.classList.toggle("is-active", button.dataset.pricingPeriod === period);
      });

      if (amountElement) {
        amountElement.textContent = formatPricingAmount(isYearly ? yearlyEffectivePrice : monthlyPrice);
      }

      if (unitElement) {
        unitElement.textContent = "/month";
      }

      if (subtextElement) {
        subtextElement.textContent = isYearly
          ? `Billed annually at CAD$${formatPricingAmount(yearlyBilled)} per user each year.`
          : "Per user, billed monthly with full feature access.";
      }

      if (badgeElement) {
        badgeElement.textContent = isYearly ? "Best value" : "Monthly billing";
      }

      if (savingsElement) {
        savingsElement.textContent = isYearly
          ? `CAD$${formatPricingAmount(yearlySavings)} saved per user`
          : `Save CAD$${formatPricingAmount(yearlySavings)} with annual billing`;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        renderPricingPeriod(button.dataset.pricingPeriod === "monthly" ? "monthly" : "yearly");
      });
    });

    renderPricingPeriod(defaultPeriod);
  });

  const toggleModal = (modal, isOpen) => {
    if (!modal) {
      return;
    }

    modal.classList.toggle("is-open", isOpen);
    modal.setAttribute("aria-hidden", String(!isOpen));

    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  const setActivePricingTierTrigger = (trigger) => {
    if (activePricingTierTrigger) {
      activePricingTierTrigger.classList.remove("pricing-scale__row--active");
    }

    activePricingTierTrigger = trigger || null;

    if (activePricingTierTrigger) {
      activePricingTierTrigger.classList.add("pricing-scale__row--active");
    }
  };

  const applyPricingTierModalContent = (tierKey) => {
    const content = pricingTierContent[tierKey] || pricingTierContent["team-6"];
    const amounts = getPricingTierAmounts(content.extraDiscountRate);
    const extraDiscountPercent = Math.round(content.extraDiscountRate * 100);

    if (pricingTierModalEyebrow) {
      pricingTierModalEyebrow.textContent = content.eyebrow;
    }

    if (pricingTierModalTitle) {
      pricingTierModalTitle.textContent = content.title;
    }

    if (pricingTierModalLead) {
      pricingTierModalLead.textContent = content.lead;
    }

    if (pricingTierModalMonthly) {
      pricingTierModalMonthly.textContent = `CAD$${formatPricingAmount(amounts.monthlyTierPrice)} / user / month`;
    }

    if (pricingTierModalMonthlyNote) {
      pricingTierModalMonthlyNote.textContent = `Month-to-month billing with ${extraDiscountPercent}% team savings already applied.`;
    }

    if (pricingTierModalYearly) {
      pricingTierModalYearly.textContent = `CAD$${formatPricingAmount(amounts.annualEffectiveMonthly)} / user / month`;
    }

    if (pricingTierModalYearlyNote) {
      pricingTierModalYearlyNote.textContent = `Billed annually at CAD$${formatPricingAmount(amounts.annualTierBilled)} per user with the 20% yearly discount plus ${extraDiscountPercent}% team savings.`;
    }

    if (pricingTierModalDiscount) {
      pricingTierModalDiscount.textContent = `20% yearly + ${extraDiscountPercent}% team savings`;
    }

    if (pricingTierModalAnnualAmount) {
      pricingTierModalAnnualAmount.textContent = `CAD$${formatPricingAmount(amounts.annualTierBilled)} / user / year`;
    }

    if (pricingTierModalSavings) {
      pricingTierModalSavings.textContent = `CAD$${formatPricingAmount(amounts.annualSavings)} saved per user yearly`;
    }
  };

  const openPricingTierModal = (tierKey, trigger = null) => {
    if (!pricingTierModal) {
      return;
    }

    setActivePricingTierTrigger(trigger);
    applyPricingTierModalContent(tierKey);
    toggleModal(pricingTierModal, true);

    window.setTimeout(() => {
      if (pricingTierModalCloseButton) {
        pricingTierModalCloseButton.focus();
      }
    }, 120);
  };

  const closePricingTierModal = ({ restoreFocus = true } = {}) => {
    if (!pricingTierModal) {
      return;
    }

    const triggerToFocus = restoreFocus ? activePricingTierTrigger : null;

    toggleModal(pricingTierModal, false);
    setActivePricingTierTrigger(null);

    if (triggerToFocus && typeof triggerToFocus.focus === "function") {
      triggerToFocus.focus();
    }
  };

  const applyFeatureInterestModalContent = (featureKey) => {
    const content = featureInterestModalContent[featureKey] || featureInterestModalContent.dealsense;

    if (featureInterestModalEyebrow) {
      featureInterestModalEyebrow.textContent = content.eyebrow;
    }

    if (featureInterestModalHeading) {
      featureInterestModalHeading.textContent = content.heading;
    }

    if (featureInterestModalLead) {
      featureInterestModalLead.textContent = content.lead;
    }

    if (featureInterestModalIcon) {
      featureInterestModalIcon.innerHTML = `<i class="${content.iconClass}" aria-hidden="true"></i>`;
    }

    if (featureInterestModalCardTitle) {
      featureInterestModalCardTitle.textContent = content.cardTitle;
    }

    if (featureInterestModalCardCopy) {
      featureInterestModalCardCopy.textContent = content.cardCopy;
    }

    if (featureInterestModalQuote) {
      featureInterestModalQuote.textContent = content.quote;
    }

  };

  let activeBrokerCopilotScenarioKey = "follow_up";
  let brokerCopilotTimers = [];
  const brokerCopilotScenarios = {
    call_summary: {
      prompt: "Summarize today's calls and what needs attention before the day ends.",
      lead: "Here's a concise call summary for today:",
      body: "27 total calls, 9 live conversations, 6 follow-ups due before 4 PM, and 3 high-intent borrowers waiting on document review.",
      footer: "I can turn this into a handoff note, a broker standup summary, or task list next."
    },
    follow_up: {
      prompt: "Draft a short follow-up text for leads that have gone cold.",
      lead: "Here's a concise follow-up text template for cold leads:",
      body: "\"Hi {{contact.first_name}}, just checking in to see if you still need help with your mortgage or line of credit. Feel free to reach out anytime. I'm here to assist you. - {{user.first_name}}\"",
      footer: "Let me know if you want it personalized or adjusted."
    },
    deal_snapshot: {
      prompt: "Create a quick snapshot for the Wilson refinance deal before broker review.",
      lead: "Here's a quick deal snapshot you can share with the broker:",
      body: "Refinance file is in review, income docs are complete, property details are verified, and lender shortlist is ready pending one final liability clarification.",
      footer: "I can also format this as a borrower update or internal Slack summary."
    },
    lender_blockers: {
      prompt: "Highlight lender blockers on files that are close to submission.",
      lead: "Current lender blockers are easy to summarize:",
      body: "Two files need updated employment letters, one deal is missing signed disclosure pages, and one lender path is paused because the product fit changed after new debt was added.",
      footer: "If you want, I can group these by lender, stage, or assignee."
    },
    urgent_tasks: {
      prompt: "List urgent tasks for brokers across active opportunities.",
      lead: "Here are the priority tasks to action first:",
      body: "Return three same-day borrower callbacks, review two lender-match recommendations, approve one submission package, and clear one Ops question on a pending accepted borrower file.",
      footer: "I can convert this into a broker-by-broker checklist in one click."
    }
  };

  const clearBrokerCopilotTimers = () => {
    brokerCopilotTimers.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    brokerCopilotTimers = [];
  };

  const syncBrokerCopilotScroll = () => {
    if (!brokerCopilotChat) {
      return;
    }

    brokerCopilotChat.scrollTop = brokerCopilotChat.scrollHeight;
  };

  const setBrokerCopilotChipState = (scenarioKey) => {
    brokerCopilotPromptButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.brokerPrompt === scenarioKey);
    });
  };

  const getBrokerCopilotScenarioKeyFromPrompt = (promptText) => {
    const normalizedPrompt = promptText.trim().toLowerCase();

    if (normalizedPrompt.includes("call")) {
      return "call_summary";
    }

    if (normalizedPrompt.includes("follow") || normalizedPrompt.includes("cold") || normalizedPrompt.includes("text")) {
      return "follow_up";
    }

    if (normalizedPrompt.includes("blocker") || normalizedPrompt.includes("lender")) {
      return "lender_blockers";
    }

    if (normalizedPrompt.includes("task") || normalizedPrompt.includes("urgent") || normalizedPrompt.includes("priority")) {
      return "urgent_tasks";
    }

    if (normalizedPrompt.includes("snapshot") || normalizedPrompt.includes("deal") || normalizedPrompt.includes("summary")) {
      return "deal_snapshot";
    }

    return "follow_up";
  };

  const renderBrokerCopilotScenario = (scenarioKey, customPromptText) => {
    const resolvedScenarioKey = Object.prototype.hasOwnProperty.call(brokerCopilotScenarios, scenarioKey)
      ? scenarioKey
      : "follow_up";
    const scenario = brokerCopilotScenarios[resolvedScenarioKey];

    activeBrokerCopilotScenarioKey = resolvedScenarioKey;
    setBrokerCopilotChipState(resolvedScenarioKey);
    clearBrokerCopilotTimers();

    if (brokerCopilotUserText) {
      brokerCopilotUserText.textContent = customPromptText || scenario.prompt;
    }

    if (brokerCopilotAssistantLead) {
      brokerCopilotAssistantLead.textContent = scenario.lead;
    }

    if (brokerCopilotAssistantBody) {
      brokerCopilotAssistantBody.textContent = scenario.body;
    }

    if (brokerCopilotAssistantFooter) {
      brokerCopilotAssistantFooter.textContent = scenario.footer;
    }

    if (brokerCopilotUserMessage) {
      brokerCopilotUserMessage.classList.remove("is-visible");
    }

    if (brokerCopilotAssistantMessage) {
      brokerCopilotAssistantMessage.classList.remove("is-visible");
    }

    if (brokerCopilotTyping) {
      brokerCopilotTyping.classList.remove("is-visible");
    }

    syncBrokerCopilotScroll();

    if (prefersReducedMotion.matches) {
      if (brokerCopilotUserMessage) {
        brokerCopilotUserMessage.classList.add("is-visible");
      }

      if (brokerCopilotAssistantMessage) {
        brokerCopilotAssistantMessage.classList.add("is-visible");
      }

      syncBrokerCopilotScroll();
      return;
    }

    brokerCopilotTimers.push(window.setTimeout(() => {
      if (brokerCopilotUserMessage) {
        brokerCopilotUserMessage.classList.add("is-visible");
      }
      syncBrokerCopilotScroll();
    }, 80));

    brokerCopilotTimers.push(window.setTimeout(() => {
      if (brokerCopilotTyping) {
        brokerCopilotTyping.classList.add("is-visible");
      }
      syncBrokerCopilotScroll();
    }, 320));

    brokerCopilotTimers.push(window.setTimeout(() => {
      if (brokerCopilotTyping) {
        brokerCopilotTyping.classList.remove("is-visible");
      }

      if (brokerCopilotAssistantMessage) {
        brokerCopilotAssistantMessage.classList.add("is-visible");
      }

      syncBrokerCopilotScroll();
    }, 1180));
  };

  const openBrokerCopilotModal = (scenarioKey = "follow_up", customPromptText = "") => {
    closeFeatureInterestModal();
    closeCampaignCallingModal();
    toggleModal(opportunityPipelineModal, false);
    toggleModal(brokerCopilotModal, true);
    window.requestAnimationFrame(() => {
      renderBrokerCopilotScenario(scenarioKey, customPromptText);
    });

    if (brokerCopilotInput) {
      window.setTimeout(() => {
        brokerCopilotInput.focus();
      }, prefersReducedMotion.matches ? 0 : 220);
    }
  };

  const closeBrokerCopilotModal = () => {
    clearBrokerCopilotTimers();
    toggleModal(brokerCopilotModal, false);
  };

  const openFeatureInterestModal = (featureKey = "dealsense") => {
    closeBrokerCopilotModal();
    closeCampaignCallingModal();
    toggleModal(opportunityPipelineModal, false);
    applyFeatureInterestModalContent(featureKey);
    toggleModal(featureInterestModal, true);
  };

  function closeFeatureInterestModal() {
    toggleModal(featureInterestModal, false);
  }

  if (pricingTierModal && pricingTierTriggers.length > 0) {
    pricingTierTriggers.forEach((trigger) => {
      const tierKey = trigger.dataset.pricingTierOpen || "team-6";

      trigger.addEventListener("click", () => {
        openPricingTierModal(tierKey, trigger);
      });

      trigger.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        openPricingTierModal(tierKey, trigger);
      });
    });

    pricingTierCloseTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        closePricingTierModal();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && pricingTierModal.classList.contains("is-open")) {
        closePricingTierModal();
      }
    });
  }

  let campaignCallingIntervalId = null;
  let campaignCallingCompletionTimeoutId = null;
  let campaignCallingIndex = -1;
  let campaignCallingIsRunning = false;
  let campaignCallingIsFinished = false;

  const totalCampaignCallingRows = campaignCallingRows.length;

  const clearCampaignCallingTimers = () => {
    if (campaignCallingIntervalId) {
      window.clearInterval(campaignCallingIntervalId);
      campaignCallingIntervalId = null;
    }

    if (campaignCallingCompletionTimeoutId) {
      window.clearTimeout(campaignCallingCompletionTimeoutId);
      campaignCallingCompletionTimeoutId = null;
    }
  };

  const setCampaignCallingStartButtonLabel = (label) => {
    if (campaignCallingStartButtonLabel) {
      campaignCallingStartButtonLabel.textContent = label;
    }
  };

  const setCampaignCallingStatusAppearance = (label, state = "") => {
    if (!campaignCallingStatus) {
      return;
    }

    campaignCallingStatus.textContent = label;
    campaignCallingStatus.classList.toggle("is-live", state === "live");
    campaignCallingStatus.classList.toggle("is-complete", state === "complete");
  };

  const setCampaignCallingOutcomeBadge = (badge, outcome) => {
    if (!badge) {
      return;
    }

    badge.textContent = outcome;
    badge.classList.remove(
      "campaign-outcome--queued",
      "campaign-outcome--connected",
      "campaign-outcome--follow-up",
      "campaign-outcome--voicemail"
    );

    if (outcome === "Connected") {
      badge.classList.add("campaign-outcome--connected");
      return;
    }

    if (outcome === "Follow-up") {
      badge.classList.add("campaign-outcome--follow-up");
      return;
    }

    if (outcome === "Voicemail") {
      badge.classList.add("campaign-outcome--voicemail");
      return;
    }

    badge.classList.add("campaign-outcome--queued");
  };

  const updateCampaignCallingSummary = () => {
    const processedRows = campaignCallingRows.filter((row) => row.classList.contains("is-complete"));
    const connectedCount = processedRows.filter((row) => row.dataset.campaignOutcome === "Connected").length;
    const followUpCount = processedRows.filter((row) => row.dataset.campaignOutcome !== "Connected").length;
    const processedCount = processedRows.length;
    const remainingCount = Math.max(totalCampaignCallingRows - processedCount, 0);
    const progressPercent = totalCampaignCallingRows > 0
      ? (processedCount / totalCampaignCallingRows) * 100
      : 0;

    if (campaignCallingConnectedCount) {
      campaignCallingConnectedCount.textContent = String(connectedCount);
    }

    if (campaignCallingFollowUpCount) {
      campaignCallingFollowUpCount.textContent = String(followUpCount);
    }

    if (campaignCallingRemainingCount) {
      campaignCallingRemainingCount.textContent = String(remainingCount);
    }

    if (campaignCallingProgressText) {
      campaignCallingProgressText.textContent = `${processedCount} / ${totalCampaignCallingRows}`;
    }

    if (campaignCallingProgressBar) {
      campaignCallingProgressBar.style.width = `${progressPercent}%`;
    }
  };

  const resetCampaignCallingDemo = () => {
    clearCampaignCallingTimers();
    campaignCallingIndex = -1;
    campaignCallingIsRunning = false;
    campaignCallingIsFinished = false;

    if (campaignCallingStartButton) {
      campaignCallingStartButton.disabled = false;
    }

    setCampaignCallingStartButtonLabel("Start");
    setCampaignCallingStatusAppearance("Ready");

    if (campaignCallingCurrentLead) {
      campaignCallingCurrentLead.textContent = "No active contact";
    }

    if (campaignCallingCurrentMeta) {
      campaignCallingCurrentMeta.textContent = "Click start to walk through the outreach queue with fake lead data.";
    }

    if (campaignCallingDialerMode) {
      campaignCallingDialerMode.textContent = "Idle";
    }

    if (campaignCallingDialerDisplay) {
      campaignCallingDialerDisplay.textContent = "Enter digits";
      campaignCallingDialerDisplay.classList.remove("is-live");
    }

    campaignCallingRows.forEach((row) => {
      row.classList.remove("is-active", "is-complete");

      const lastActivity = row.querySelector("[data-campaign-last-activity]");
      const callCount = row.querySelector("[data-campaign-call-count]");
      const statusBadge = row.querySelector("[data-campaign-status-label]");

      if (lastActivity) {
        lastActivity.textContent = "Queued";
      }

      if (callCount) {
        callCount.textContent = "0";
      }

      setCampaignCallingOutcomeBadge(statusBadge, "Queued");
    });

    updateCampaignCallingSummary();
  };

  const finishCampaignCallingDemo = () => {
    clearCampaignCallingTimers();
    campaignCallingIsRunning = false;
    campaignCallingIsFinished = true;

    campaignCallingRows.forEach((row) => {
      row.classList.remove("is-active");
    });

    setCampaignCallingStatusAppearance("Completed", "complete");

    if (campaignCallingCurrentLead) {
      campaignCallingCurrentLead.textContent = "Campaign complete";
    }

    if (campaignCallingCurrentMeta) {
      campaignCallingCurrentMeta.textContent = `${totalCampaignCallingRows} demo leads processed across the outreach queue.`;
    }

    if (campaignCallingDialerMode) {
      campaignCallingDialerMode.textContent = "Done";
    }

    if (campaignCallingDialerDisplay) {
      campaignCallingDialerDisplay.textContent = "Campaign complete";
      campaignCallingDialerDisplay.classList.remove("is-live");
    }

    if (campaignCallingStartButton) {
      campaignCallingStartButton.disabled = false;
    }

    setCampaignCallingStartButtonLabel("Restart Demo");
  };

  const processNextCampaignCallingLead = () => {
    const nextIndex = campaignCallingIndex + 1;

    if (nextIndex >= totalCampaignCallingRows) {
      finishCampaignCallingDemo();
      return;
    }

    campaignCallingIndex = nextIndex;
    campaignCallingRows.forEach((row) => {
      row.classList.remove("is-active");
    });

    const activeRow = campaignCallingRows[campaignCallingIndex];

    if (!activeRow) {
      finishCampaignCallingDemo();
      return;
    }

    const leadName = activeRow.querySelector(".campaign-row__cell--lead strong")?.textContent || `Lead ${campaignCallingIndex + 1}`;
    const leadPhone = activeRow.dataset.campaignPhone || "";
    const leadOutcome = activeRow.dataset.campaignOutcome || "Connected";
    const leadNote = activeRow.dataset.campaignNote || "";
    const lastActivity = activeRow.querySelector("[data-campaign-last-activity]");
    const callCount = activeRow.querySelector("[data-campaign-call-count]");
    const statusBadge = activeRow.querySelector("[data-campaign-status-label]");

    activeRow.classList.add("is-active", "is-complete");

    if (campaignCallingCurrentLead) {
      campaignCallingCurrentLead.textContent = leadName;
    }

    if (campaignCallingCurrentMeta) {
      campaignCallingCurrentMeta.textContent = `${leadPhone} • ${leadNote}`;
    }

    if (campaignCallingDialerMode) {
      campaignCallingDialerMode.textContent = "Live";
    }

    if (campaignCallingDialerDisplay) {
      campaignCallingDialerDisplay.textContent = leadPhone;
      campaignCallingDialerDisplay.classList.add("is-live");
    }

    if (lastActivity) {
      lastActivity.textContent = "Just now";
    }

    if (callCount) {
      callCount.textContent = "1";
    }

    setCampaignCallingOutcomeBadge(statusBadge, leadOutcome);
    setCampaignCallingStatusAppearance("Running", "live");
    updateCampaignCallingSummary();

    activeRow.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "nearest",
      inline: "nearest"
    });

    if (campaignCallingIndex === totalCampaignCallingRows - 1) {
      clearCampaignCallingTimers();
      campaignCallingCompletionTimeoutId = window.setTimeout(() => {
        finishCampaignCallingDemo();
      }, prefersReducedMotion.matches ? 80 : 720);
    }
  };

  const startCampaignCallingDemo = () => {
    if (campaignCallingIsRunning || totalCampaignCallingRows === 0) {
      return;
    }

    if (campaignCallingIsFinished) {
      resetCampaignCallingDemo();
    }

    campaignCallingIsRunning = true;
    setCampaignCallingStatusAppearance("Running", "live");

    if (campaignCallingStartButton) {
      campaignCallingStartButton.disabled = true;
    }

    setCampaignCallingStartButtonLabel("Running...");
    processNextCampaignCallingLead();

    if (totalCampaignCallingRows > 1) {
      campaignCallingIntervalId = window.setInterval(() => {
        processNextCampaignCallingLead();
      }, prefersReducedMotion.matches ? 260 : 980);
    }
  };

  const openCampaignCallingModal = () => {
    closeBrokerCopilotModal();
    closeFeatureInterestModal();
    toggleModal(opportunityPipelineModal, false);
    resetCampaignCallingDemo();
    toggleModal(campaignCallingModal, true);

    if (campaignCallingStartButton) {
      window.setTimeout(() => {
        campaignCallingStartButton.focus();
      }, prefersReducedMotion.matches ? 0 : 180);
    }
  };

  function closeCampaignCallingModal() {
    resetCampaignCallingDemo();
    toggleModal(campaignCallingModal, false);
  }

  let activeDraggedPipelineCard = null;
  let pipelineDragInitialized = false;
  const pipelineDropPlaceholder = document.createElement("div");
  pipelineDropPlaceholder.className = "pipeline-deal-card pipeline-deal-card--placeholder";

  const formatPipelineCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `$${Math.round(value / 1000)}K`;
    }

    return `$${value}`;
  };

  const updatePipelineColumnSummaries = () => {
    opportunityPipelineCardLists.forEach((list) => {
      const column = list.closest(".pipeline-column");

      if (!column) {
        return;
      }

      const deals = Array.from(
        list.querySelectorAll(".pipeline-deal-card:not(.pipeline-deal-card--placeholder)")
      );
      const countElement = column.querySelector(".pipeline-column__header p");
      const totalElement = column.querySelector(".pipeline-column__header > span");
      const totalValue = deals.reduce((sum, card) => {
        const cardValue = Number.parseInt(card.dataset.pipelineValue || "0", 10);
        return sum + (Number.isFinite(cardValue) ? cardValue : 0);
      }, 0);

      if (countElement) {
        countElement.textContent = `${deals.length} ${deals.length === 1 ? "deal" : "deals"}`;
      }

      if (totalElement) {
        totalElement.textContent = formatPipelineCurrency(totalValue);
      }
    });
  };

  const getPipelineInsertionTarget = (list, clientY) => {
    const cards = Array.from(
      list.querySelectorAll(".pipeline-deal-card:not(.is-dragging):not(.pipeline-deal-card--placeholder)")
    );

    return cards.reduce((closest, card) => {
      const box = card.getBoundingClientRect();
      const offset = clientY - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }

      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  };

  const clearPipelineDropTargets = () => {
    opportunityPipelineCardLists.forEach((list) => {
      list.classList.remove("is-drop-target");
    });
  };

  const removePipelinePlaceholder = () => {
    if (pipelineDropPlaceholder.parentNode) {
      pipelineDropPlaceholder.parentNode.removeChild(pipelineDropPlaceholder);
    }
  };

  const bindPipelineCardDragEvents = (card) => {
    card.draggable = true;
    card.setAttribute("aria-grabbed", "false");

    card.addEventListener("dragstart", (event) => {
      activeDraggedPipelineCard = card;
      card.classList.add("is-dragging");
      card.setAttribute("aria-grabbed", "true");

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", card.querySelector("strong")?.textContent || "deal");
      }

      window.setTimeout(() => {
        const parentList = card.parentNode;

        if (parentList && !pipelineDropPlaceholder.parentNode) {
          parentList.insertBefore(pipelineDropPlaceholder, card.nextSibling);
        }
      }, 0);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
      card.setAttribute("aria-grabbed", "false");
      clearPipelineDropTargets();
      removePipelinePlaceholder();
      activeDraggedPipelineCard = null;
      updatePipelineColumnSummaries();
    });
  };

  const initializeOpportunityPipelineDragAndDrop = () => {
    if (pipelineDragInitialized || opportunityPipelineCardLists.length === 0) {
      updatePipelineColumnSummaries();
      return;
    }

    opportunityPipelineCardLists.forEach((list) => {
      list.querySelectorAll(".pipeline-deal-card").forEach(bindPipelineCardDragEvents);

      list.addEventListener("dragover", (event) => {
        if (!activeDraggedPipelineCard) {
          return;
        }

        event.preventDefault();
        list.classList.add("is-drop-target");

        const targetCard = getPipelineInsertionTarget(list, event.clientY);

        if (targetCard) {
          list.insertBefore(pipelineDropPlaceholder, targetCard);
        } else {
          list.appendChild(pipelineDropPlaceholder);
        }
      });

      list.addEventListener("dragenter", (event) => {
        if (!activeDraggedPipelineCard) {
          return;
        }

        event.preventDefault();
        list.classList.add("is-drop-target");
      });

      list.addEventListener("dragleave", (event) => {
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }

        list.classList.remove("is-drop-target");
      });

      list.addEventListener("drop", (event) => {
        if (!activeDraggedPipelineCard) {
          return;
        }

        event.preventDefault();

        if (pipelineDropPlaceholder.parentNode === list) {
          list.insertBefore(activeDraggedPipelineCard, pipelineDropPlaceholder);
        } else {
          list.appendChild(activeDraggedPipelineCard);
        }

        clearPipelineDropTargets();
        removePipelinePlaceholder();
        updatePipelineColumnSummaries();
      });
    });

    pipelineDragInitialized = true;
    updatePipelineColumnSummaries();
  };

  const openOpportunityPipelineModal = () => {
    closeBrokerCopilotModal();
    closeCampaignCallingModal();
    closeFeatureInterestModal();
    initializeOpportunityPipelineDragAndDrop();
    toggleModal(opportunityPipelineModal, true);
  };

  const closeOpportunityPipelineModal = () => {
    toggleModal(opportunityPipelineModal, false);
  };

  if (capabilityTour && capabilityTourWrap && capabilityTourTargets.length) {
    if ("IntersectionObserver" in window) {
      capabilityTourObserver = new IntersectionObserver((entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (!isVisible) {
          capabilityTourIsInView = false;
          capabilityTourHasShownForCurrentEntry = false;
          clearCapabilityTourTimers();

          if (capabilityTourIsVisible) {
            capabilityTour.classList.remove("is-visible");
            capabilityTour.hidden = true;
            capabilityTour.setAttribute("aria-hidden", "true");
            capabilityTourIsVisible = false;
          }

          if (capabilityTourWrap) {
            capabilityTourWrap.classList.remove("is-tour-active");
          }

          return;
        }

        capabilityTourIsInView = true;
        positionCapabilityTour();

        if (!capabilityTourHasShownForCurrentEntry && !capabilityTourIsVisible && !capabilityTourShowTimer) {
          capabilityTourShowTimer = window.setTimeout(showCapabilityTour, 650);
        }
      }, {
        threshold: 0.35
      });

      capabilityTourObserver.observe(capabilityTourWrap);
    } else {
      capabilityTourIsInView = true;
      capabilityTourShowTimer = window.setTimeout(showCapabilityTour, 1200);
    }
  }

  integrationCardTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      applyIntegrationModalContent(trigger.dataset.integrationOpen || "scarlett");
      toggleModal(scarlettModal, true);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applyIntegrationModalContent(trigger.dataset.integrationOpen || "scarlett");
        toggleModal(scarlettModal, true);
      }
    });
  });

  scarlettConfigureButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      applyIntegrationModalContent(activeIntegrationKey);
      toggleModal(scarlettModal, false);
      toggleModal(scarlettSuccessModal, true);
    });
  });

  brokerCopilotTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      dismissCapabilityTour();
      openBrokerCopilotModal("follow_up");
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissCapabilityTour();
        openBrokerCopilotModal("follow_up");
      }
    });
  });

  brokerCopilotCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeBrokerCopilotModal();
    });
  });

  opportunityPipelineTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      dismissCapabilityTour();
      openOpportunityPipelineModal();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissCapabilityTour();
        openOpportunityPipelineModal();
      }
    });
  });

  opportunityPipelineCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeOpportunityPipelineModal();
    });
  });

  campaignCallingTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      dismissCapabilityTour();
      openCampaignCallingModal();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissCapabilityTour();
        openCampaignCallingModal();
      }
    });
  });

  campaignCallingCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeCampaignCallingModal();
    });
  });

  featureInterestTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      dismissCapabilityTour();
      openFeatureInterestModal(trigger.dataset.featureInterestOpen || "dealsense");
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissCapabilityTour();
        openFeatureInterestModal(trigger.dataset.featureInterestOpen || "dealsense");
      }
    });
  });

  featureInterestCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      closeFeatureInterestModal();
    });
  });

  if (campaignCallingStartButton) {
    campaignCallingStartButton.addEventListener("click", () => {
      startCampaignCallingDemo();
    });
  }

  brokerCopilotPromptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const scenarioKey = button.dataset.brokerPrompt || activeBrokerCopilotScenarioKey || "follow_up";
      renderBrokerCopilotScenario(scenarioKey);
    });
  });

  if (brokerCopilotComposer) {
    brokerCopilotComposer.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!brokerCopilotInput) {
        return;
      }

      const promptText = brokerCopilotInput.value.trim();

      if (!promptText) {
        brokerCopilotInput.focus();
        return;
      }

      renderBrokerCopilotScenario(getBrokerCopilotScenarioKeyFromPrompt(promptText), promptText);
      brokerCopilotInput.value = "";
    });
  }

  scarlettModalCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      toggleModal(scarlettModal, false);
    });
  });

  scarlettSuccessCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      toggleModal(scarlettSuccessModal, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeBrokerCopilotModal();
      closeOpportunityPipelineModal();
      closeCampaignCallingModal();
      closeFeatureInterestModal();
      toggleModal(scarlettModal, false);
      toggleModal(scarlettSuccessModal, false);
    }
  });

  const calculatorValueNextButton = document.getElementById("calculatorValueNextButton");
  const calculatorAmountRange = document.getElementById("calculator-amount-range");
  const calculatorOwnPropertyOptions = Array.from(document.querySelectorAll("input[name=\"own_property\"]"));
  const calculatorPropertyTypeOptions = Array.from(document.querySelectorAll("input[name=\"property_type\"]"));
  const calculatorStepPanels = calculatorForm ? Array.from(calculatorForm.querySelectorAll(".calculator-quiz-step")) : [];
  const calculatorStepBackButtons = calculatorForm ? Array.from(calculatorForm.querySelectorAll(".calculator-step-back")) : [];
  const calculatorInputs = {
    propertyValue: document.getElementById("calculator-property"),
    amountNeeded: document.getElementById("calculator-down-payment"),
    province: document.getElementById("calculator-lead-province")
  };
  const calculatorUi = {
    stepCounter: document.getElementById("calculatorStepCounter"),
    stepLabel: document.getElementById("calculatorStepLabel"),
    progressBar: document.getElementById("calculatorProgressBar"),
    sidebarStep: document.getElementById("calculatorSidebarStep"),
    sidebarTitle: document.getElementById("calculatorSidebarTitle"),
    sidebarCopy: document.getElementById("calculatorSidebarCopy"),
    propertyValueTitle: document.getElementById("calculatorPropertyValueTitle"),
    propertyValueDescription: document.getElementById("calculatorPropertyValueDescription"),
    propertyValueLabel: document.getElementById("calculatorPropertyValueLabel"),
    amountTitle: document.getElementById("calculatorAmountTitle"),
    amountDescription: document.getElementById("calculatorAmountDescription"),
    amountLabel: document.getElementById("calculatorAmountLabel"),
    previewOwnProperty: document.getElementById("calculator-preview-own-property"),
    previewPropertyType: document.getElementById("calculator-preview-property-type"),
    previewPropertyValueLabel: document.getElementById("calculatorPreviewPropertyValueLabel"),
    previewAmountLabel: document.getElementById("calculatorPreviewAmountLabel"),
    previewPropertyValue: document.getElementById("calculator-preview-property-value"),
    previewAmountNeeded: document.getElementById("calculator-preview-amount-needed"),
    resultCaption: document.getElementById("calculator-result-caption")
  };
  const calculatorOutputs = {
    monthly: document.getElementById("calculator-monthly"),
    loan: document.getElementById("calculator-loan"),
    interest: document.getElementById("calculator-interest"),
    years: document.getElementById("calculator-summary-years"),
    ltv: document.getElementById("calculator-ltv")
  };

  if (
    calculatorForm &&
    calculatorLeadForm &&
    calculatorValueNextButton &&
    calculatorAmountRange &&
    calculatorInputs.propertyValue &&
    calculatorInputs.amountNeeded &&
    calculatorInputs.province &&
    calculatorOwnPropertyOptions.length > 0 &&
    calculatorPropertyTypeOptions.length > 0 &&
    calculatorStepPanels.length > 0 &&
    calculatorUi.stepCounter &&
    calculatorUi.stepLabel &&
    calculatorUi.progressBar &&
    calculatorUi.sidebarStep &&
    calculatorUi.sidebarTitle &&
    calculatorUi.sidebarCopy &&
    calculatorUi.propertyValueTitle &&
    calculatorUi.propertyValueDescription &&
    calculatorUi.propertyValueLabel &&
    calculatorUi.amountTitle &&
    calculatorUi.amountDescription &&
    calculatorUi.amountLabel &&
    calculatorUi.previewOwnProperty &&
    calculatorUi.previewPropertyType &&
    calculatorUi.previewPropertyValueLabel &&
    calculatorUi.previewAmountLabel &&
    calculatorUi.previewPropertyValue &&
    calculatorUi.previewAmountNeeded &&
    calculatorUi.resultCaption &&
    calculatorOutputs.monthly &&
    calculatorOutputs.loan &&
    calculatorOutputs.interest &&
    calculatorOutputs.years &&
    calculatorOutputs.ltv
  ) {
    const DEFAULT_INTEREST_RATE = 8.99;
    const DEFAULT_AMORTIZATION_YEARS = 25;
    const currencyFormatter = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    });
    const percentageFormatter = new Intl.NumberFormat("en-CA", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    const dateFormatter = new Intl.DateTimeFormat("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
    const quizStepConfig = {
      "own-property": {
        counter: "One / Five",
        label: "Own Property",
        progress: 20,
        sidebarStep: "Step One of Five",
        sidebarTitle: "Tell us whether you own the property.",
        sidebarCopy: "A quick yes or no helps us understand whether this is an existing property or a purchase you are planning for."
      },
      "property-type": {
        counter: "Two / Five",
        label: "Property Type",
        progress: 40,
        sidebarStep: "Step Two of Five",
        sidebarTitle: "Choose the property type.",
        sidebarCopy: "Select the option that best matches the property so we can guide you to the right private mortgage conversation."
      },
      "property-value": {
        counter: "Three / Five",
        label: "Property Value",
        progress: 60,
        sidebarStep: "Step Three of Five",
        sidebarTitle: "Tell us the home value.",
        sidebarCopy: "If you have not found a property yet, use the approximate amount you are targeting."
      },
      "amount-needed": {
        counter: "Four / Five",
        label: "Amount Needed",
        progress: 80,
        sidebarStep: "Step Four of Five",
        sidebarTitle: "Choose how much you need.",
        sidebarCopy: "Use the slider or enter a number directly to estimate how much you want to borrow."
      }
    };
    let calculatorSubmittedQuestionnaire = null;
    let calculatorCurrentStep = "own-property";

    const getNumberInputValue = (input) => {
      const parsedValue = Number.parseFloat(input.value);
      return Number.isFinite(parsedValue) ? Math.max(parsedValue, 0) : 0;
    };

    const getSelectedOwnPropertyOption = () => {
      return calculatorOwnPropertyOptions.find((option) => option.checked) || null;
    };

    const getSelectedPropertyTypeOption = () => {
      return calculatorPropertyTypeOptions.find((option) => option.checked) || null;
    };

    const formatCurrencyValue = (value) => {
      return value > 0 ? currencyFormatter.format(value) : "Not provided";
    };

    const getOwnPropertyMode = () => {
      const ownProperty = getSelectedOwnPropertyOption();
      return ownProperty && ownProperty.value === "No" ? "purchase" : "owned";
    };

    const getFlowCopy = () => {
      if (getOwnPropertyMode() === "purchase") {
        return {
          propertyValueTitle: "What is the expected purchase price?",
          propertyValueDescription: "If you have not found a property yet, simply enter the approximate amount you’re looking for.",
          propertyValueLabel: "Expected Purchase Price",
          amountTitle: "How much down payment do you have?",
          amountDescription: "Move the slider or enter the approximate down payment amount you have available.",
          amountLabel: "Down Payment",
          previewPropertyValueLabel: "Expected purchase price",
          previewAmountLabel: "Down payment",
          resultCaption: "Based on the expected purchase price and down payment entered, using a sample rate over a standard amortization period.",
          propertyValueStepTitle: "Tell us the expected purchase price.",
          propertyValueStepCopy: "If you have not found a property yet, use the approximate purchase price you are targeting.",
          amountStepTitle: "Tell us the down payment.",
          amountStepCopy: "Use the slider or enter the down payment amount you have available for the purchase."
        };
      }

      return {
        propertyValueTitle: "How much is the property worth?",
        propertyValueDescription: "Enter the approximate value of the property.",
        propertyValueLabel: "Property Value",
        amountTitle: "How much money do you need?",
        amountDescription: "Move the slider or enter the approximate amount you want to borrow.",
        amountLabel: "Amount Needed",
        previewPropertyValueLabel: "Property value",
        previewAmountLabel: "Amount needed",
        resultCaption: "Based on the property value and amount entered, using a sample rate over a standard amortization period.",
        propertyValueStepTitle: "Tell us the property value.",
        propertyValueStepCopy: "Enter the approximate value of the property you already own.",
        amountStepTitle: "Choose how much you need.",
        amountStepCopy: "Use the slider or enter a number directly to estimate how much you want to borrow."
      };
    };

    const applyFlowCopy = () => {
      const flowCopy = getFlowCopy();

      calculatorUi.propertyValueTitle.textContent = flowCopy.propertyValueTitle;
      calculatorUi.propertyValueDescription.textContent = flowCopy.propertyValueDescription;
      calculatorUi.propertyValueLabel.textContent = flowCopy.propertyValueLabel;
      calculatorUi.amountTitle.textContent = flowCopy.amountTitle;
      calculatorUi.amountDescription.textContent = flowCopy.amountDescription;
      calculatorUi.amountLabel.textContent = flowCopy.amountLabel;
      calculatorUi.previewPropertyValueLabel.textContent = flowCopy.previewPropertyValueLabel;
      calculatorUi.previewAmountLabel.textContent = flowCopy.previewAmountLabel;
      calculatorUi.resultCaption.textContent = flowCopy.resultCaption;
    };

    const buildCalculatorQuestionnairePayload = () => {
      const ownProperty = getSelectedOwnPropertyOption();
      const propertyType = getSelectedPropertyTypeOption();

      return {
        own_property: ownProperty ? ownProperty.value : "",
        own_property_label: ownProperty ? ownProperty.dataset.label || ownProperty.value : "",
        property_type: propertyType ? propertyType.value : "",
        property_type_label: propertyType ? propertyType.dataset.label || propertyType.value : "",
        property_value: getNumberInputValue(calculatorInputs.propertyValue),
        amount_needed: getNumberInputValue(calculatorInputs.amountNeeded),
        province: calculatorInputs.province.value.trim()
      };
    };

    const calculateMortgageEstimate = (questionnaire) => {
      const propertyValue = Math.max(questionnaire.property_value || 0, 0);
      const loanAmount = questionnaire.own_property === "No"
        ? Math.max(propertyValue - Math.max(questionnaire.amount_needed || 0, 0), 0)
        : Math.max(questionnaire.amount_needed || 0, 0);
      const totalMonths = DEFAULT_AMORTIZATION_YEARS * 12;
      const monthlyRate = DEFAULT_INTEREST_RATE / 100 / 12;
      let monthlyPayment = 0;

      if (loanAmount > 0) {
        if (monthlyRate > 0) {
          const growthFactor = Math.pow(1 + monthlyRate, totalMonths);
          monthlyPayment = loanAmount * ((monthlyRate * growthFactor) / (growthFactor - 1));
        } else {
          monthlyPayment = loanAmount / totalMonths;
        }
      }

      return {
        monthlyPayment,
        loanAmount,
        totalInterest: Math.max(monthlyPayment * totalMonths - loanAmount, 0),
        years: DEFAULT_AMORTIZATION_YEARS,
        loanToValue: propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0
      };
    };

    const updateCalculatorResultDate = () => {
      if (!calculatorResultDate) {
        return;
      }

      calculatorResultDate.textContent = dateFormatter.format(new Date());
    };

    const updateCalculatorPreview = () => {
      const questionnaire = calculatorSubmittedQuestionnaire || buildCalculatorQuestionnairePayload();
      applyFlowCopy();

      calculatorUi.previewOwnProperty.textContent = questionnaire.own_property_label || "Not provided";
      calculatorUi.previewPropertyType.textContent = questionnaire.property_type_label || "Not provided";
      calculatorUi.previewPropertyValue.textContent = formatCurrencyValue(questionnaire.property_value);
      calculatorUi.previewAmountNeeded.textContent = formatCurrencyValue(questionnaire.amount_needed);
    };

    const updateCalculatorOutputs = () => {
      const questionnaire = calculatorSubmittedQuestionnaire || buildCalculatorQuestionnairePayload();
      const estimate = calculateMortgageEstimate(questionnaire);

      calculatorOutputs.monthly.textContent = "Available after review";
      calculatorOutputs.loan.textContent = "Shared during review";
      calculatorOutputs.interest.textContent = "Shared during review";
      calculatorOutputs.years.textContent = "Standard amortization";
      calculatorOutputs.ltv.textContent = "Calculated after review";
    };

    const buildCalculatorLeadMessage = () => {
      const questionnaire = buildCalculatorQuestionnairePayload();
      const estimate = calculateMortgageEstimate(questionnaire);
      const flowCopy = getFlowCopy();

      return [
        "Private mortgage rates request",
        `Own property: ${questionnaire.own_property_label || "Not provided"}`,
        `Property type: ${questionnaire.property_type_label || "Not provided"}`,
        `${flowCopy.previewPropertyValueLabel}: ${formatCurrencyValue(questionnaire.property_value)}`,
        `${flowCopy.previewAmountLabel}: ${formatCurrencyValue(questionnaire.amount_needed)}`,
        `Province: ${questionnaire.province || "Not provided"}`,
        `Estimated monthly payment: ${currencyFormatter.format(estimate.monthlyPayment)}`,
        `Estimated loan amount: ${currencyFormatter.format(estimate.loanAmount)}`,
        `Estimated total interest: ${currencyFormatter.format(estimate.totalInterest)}`,
        `Estimated loan-to-value: ${percentageFormatter.format(estimate.loanToValue)}%`
      ].join("\n");
    };

    const setStatusMessage = (element, type, text) => {
      if (!element) {
        return;
      }

      element.className = "callback-message";

      if (type === "success") {
        element.classList.add("is-success");
      }

      if (type === "error") {
        element.classList.add("is-error");
      }

      element.textContent = text;
    };

    const updateAmountRangeBounds = () => {
      const propertyValue = Math.max(getNumberInputValue(calculatorInputs.propertyValue), 0);
      const amountNeeded = Math.max(getNumberInputValue(calculatorInputs.amountNeeded), 0);
      const computedMax = Math.max(propertyValue, amountNeeded, 500000);

      calculatorAmountRange.max = String(Math.ceil(computedMax / 5000) * 5000);

      if (amountNeeded > 0) {
        calculatorAmountRange.value = String(Math.min(amountNeeded, Number.parseFloat(calculatorAmountRange.max)));
        return;
      }

      calculatorAmountRange.value = "0";
    };

    const syncAmountNeededFromRange = () => {
      calculatorInputs.amountNeeded.value = calculatorAmountRange.value;
      updateCalculatorPreview();
    };

    const syncAmountRangeFromInput = () => {
      updateAmountRangeBounds();

      const amountNeeded = getNumberInputValue(calculatorInputs.amountNeeded);
      if (amountNeeded <= 0) {
        return;
      }

      calculatorAmountRange.value = String(Math.min(amountNeeded, Number.parseFloat(calculatorAmountRange.max)));
      updateCalculatorPreview();
    };

    const showCalculatorQuizStep = (stepName) => {
      calculatorCurrentStep = stepName;

      calculatorStepPanels.forEach((panel) => {
        const isActive = panel.dataset.step === stepName;
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      });

      const config = quizStepConfig[stepName];
      const flowCopy = getFlowCopy();
      if (config) {
        calculatorUi.stepCounter.textContent = config.counter;
        calculatorUi.stepLabel.textContent = config.label;
        calculatorUi.progressBar.style.width = `${config.progress}%`;
        calculatorUi.sidebarStep.textContent = config.sidebarStep;
        calculatorUi.sidebarTitle.textContent = stepName === "property-value"
          ? flowCopy.propertyValueStepTitle
          : stepName === "amount-needed"
            ? flowCopy.amountStepTitle
            : config.sidebarTitle;
        calculatorUi.sidebarCopy.textContent = stepName === "property-value"
          ? flowCopy.propertyValueStepCopy
          : stepName === "amount-needed"
            ? flowCopy.amountStepCopy
            : config.sidebarCopy;
      }

      if (stepName === "property-value") {
        calculatorInputs.propertyValue.focus();
        calculatorInputs.propertyValue.select();
      } else if (stepName === "amount-needed") {
        calculatorInputs.amountNeeded.focus();
        calculatorInputs.amountNeeded.select();
      }
    };

    const openCalculatorResultModal = () => {
      updateCalculatorOutputs();
      updateCalculatorPreview();
      updateCalculatorResultDate();

      if (window.jQuery && calculatorResultModal) {
        window.jQuery(calculatorResultModal).modal("show");
      }
    };

    const openCalculatorModalFromHash = () => {
      if (!window.jQuery || !calculatorModal || window.location.hash !== calculatorModalHash) {
        return;
      }

      window.setTimeout(() => {
        window.jQuery(calculatorModal).modal("show");
      }, 0);
    };

    const clearCalculatorModalHash = () => {
      if (window.location.hash !== calculatorModalHash || !window.history.replaceState) {
        return;
      }

      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    };

    const openCalculatorLeadStep = () => {
      if (!window.jQuery || !calculatorModal || !calculatorLeadModal) {
        return;
      }

      calculatorReopenAfterLeadModal = false;
      calculatorOpenResultAfterLeadModal = false;
      calculatorTransitioningToLeadModal = true;
      window.jQuery(calculatorModal).modal("hide");
    };

    const closeCalculatorLeadStep = () => {
      if (window.jQuery && calculatorLeadModal) {
        calculatorOpenResultAfterLeadModal = false;
        calculatorReopenAfterLeadModal = true;
        window.jQuery(calculatorLeadModal).modal("hide");
      }
    };

    const resetCalculatorLeadTurnstile = () => {
      calculatorLeadTurnstileToken = "";

      if (window.turnstile && calculatorLeadTurnstileWidgetId !== null) {
        window.turnstile.reset(calculatorLeadTurnstileWidgetId);
        calculatorLeadTurnstileReady = true;
        return;
      }

      calculatorLeadTurnstileReady = false;
    };

    const resetCalculatorQuestionnaire = () => {
      calculatorForm.reset();
      calculatorCurrentStep = "own-property";
      updateAmountRangeBounds();
      syncAmountRangeFromInput();
      applyFlowCopy();
      updateCalculatorPreview();
      updateCalculatorOutputs();
      updateCalculatorResultDate();
      showCalculatorQuizStep("own-property");
    };

    const resetCalculatorLeadCapture = () => {
      calculatorLeadForm.reset();
      setStatusMessage(calculatorLeadMessage, "", "");
      resetCalculatorLeadTurnstile();
    };

    const resetCalculatorLeadFlow = () => {
      if (calculatorLeadLockedState) {
        calculatorLeadLockedState.hidden = false;
      }

      calculatorSubmittedQuestionnaire = null;
      calculatorTransitioningToLeadModal = false;
      calculatorReopenAfterLeadModal = false;
      calculatorOpenResultAfterLeadModal = false;
      resetCalculatorLeadCapture();
      resetCalculatorQuestionnaire();
    };

    const warmCalculatorLeadTurnstile = () => {
      if (
        !calculatorLeadForm ||
        !calculatorLeadTurnstileContainer ||
        calculatorLeadTurnstileWidgetId !== null ||
        calculatorLeadTurnstileRenderPromise
      ) {
        return;
      }

      renderCalculatorLeadTurnstile();
    };

    const waitForCalculatorLeadTurnstile = async () => {
      if (calculatorLeadTurnstileWidgetId !== null) {
        return;
      }

      await renderCalculatorLeadTurnstile();
    };

    const renderCalculatorLeadTurnstile = async () => {
      if (!calculatorLeadTurnstileContainer) {
        return;
      }

      const callbackConfig = getCallbackFormConfig();

      if (!callbackConfig || calculatorLeadTurnstileWidgetId !== null) {
        return;
      }

      if (calculatorLeadTurnstileRenderPromise) {
        await calculatorLeadTurnstileRenderPromise;
        return;
      }

      calculatorLeadTurnstileReady = false;

      calculatorLeadTurnstileRenderPromise = (async () => {
        try {
          const turnstile = await waitForTurnstileApi();

          if (calculatorLeadTurnstileWidgetId !== null) {
            return;
          }

          calculatorLeadTurnstileWidgetId = turnstile.render(calculatorLeadTurnstileContainer, {
            sitekey: callbackConfig.turnstileSiteKey,
            theme: "light",
            appearance: "always",
            callback(token) {
              calculatorLeadTurnstileToken = token;
              calculatorLeadTurnstileReady = true;
            },
            "expired-callback"() {
              calculatorLeadTurnstileToken = "";
            },
            "timeout-callback"() {
              calculatorLeadTurnstileToken = "";
            },
            "error-callback"(errorCode) {
              calculatorLeadTurnstileToken = "";
              calculatorLeadTurnstileReady = false;
              console.error("Calculator Turnstile error:", errorCode);
              setStatusMessage(
                calculatorLeadMessage,
                "error",
                `The security check could not load. Refresh the page and try again.${errorCode ? ` Error code: ${errorCode}.` : ""}`
              );
              return true;
            }
          });

          calculatorLeadTurnstileReady = true;
        } catch (error) {
          calculatorLeadTurnstileReady = false;
          setStatusMessage(calculatorLeadMessage, "error", "The security check could not load. Refresh the page and try again.");
        } finally {
          calculatorLeadTurnstileRenderPromise = null;
        }
      })();

      await calculatorLeadTurnstileRenderPromise;
    };

    calculatorOwnPropertyOptions.forEach((option) => {
      option.addEventListener("change", () => {
        applyFlowCopy();
        updateCalculatorPreview();
        showCalculatorQuizStep("property-type");
      });
    });

    calculatorPropertyTypeOptions.forEach((option) => {
      option.addEventListener("change", () => {
        updateCalculatorPreview();
        showCalculatorQuizStep("property-value");
      });
    });

    calculatorStepBackButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetStep = button.dataset.targetStep;
        if (!targetStep) {
          return;
        }

        showCalculatorQuizStep(targetStep);
      });
    });

    calculatorInputs.propertyValue.addEventListener("input", () => {
      updateAmountRangeBounds();
      updateCalculatorPreview();
    });
    calculatorInputs.propertyValue.addEventListener("change", () => {
      updateAmountRangeBounds();
      updateCalculatorPreview();
    });
    calculatorInputs.amountNeeded.addEventListener("input", syncAmountRangeFromInput);
    calculatorInputs.amountNeeded.addEventListener("change", syncAmountRangeFromInput);
    calculatorAmountRange.addEventListener("input", syncAmountNeededFromRange);

    updateAmountRangeBounds();
    applyFlowCopy();
    updateCalculatorPreview();
    updateCalculatorOutputs();
    updateCalculatorResultDate();
    showCalculatorQuizStep("own-property");

    calculatorValueNextButton.addEventListener("click", () => {
      if (!calculatorInputs.propertyValue.reportValidity()) {
        return;
      }

      showCalculatorQuizStep("amount-needed");
    });

    if (calculatorNextButton) {
      calculatorNextButton.addEventListener("click", () => {
        if (!calculatorInputs.amountNeeded.reportValidity()) {
          return;
        }

        openCalculatorLeadStep();
      });
    }

    if (calculatorBackButton) {
      calculatorBackButton.addEventListener("click", () => {
        closeCalculatorLeadStep();
      });
    }

    if (calculatorLeadForm && calculatorLeadMessage && calculatorLeadSubmitButton) {
      const calculatorLeadInteractionFields = calculatorLeadForm.querySelectorAll("input:not([type=\"hidden\"]), textarea, select");

      calculatorLeadInteractionFields.forEach((field) => {
        field.addEventListener("focus", warmCalculatorLeadTurnstile, { once: true });
        field.addEventListener("input", warmCalculatorLeadTurnstile, { once: true });
      });

      calculatorLeadSubmitButton.addEventListener("click", warmCalculatorLeadTurnstile, { passive: true });

      calculatorLeadForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(calculatorLeadForm);
        const questionnaire = buildCalculatorQuestionnairePayload();
        const estimate = calculateMortgageEstimate(questionnaire);
        const downPayment = questionnaire.own_property === "No"
          ? Math.max(questionnaire.amount_needed, 0)
          : Math.max(questionnaire.property_value - questionnaire.amount_needed, 0);
        const payload = {
          first_name: getTrimmedFormValue(formData, "first_name"),
          last_name: getTrimmedFormValue(formData, "last_name"),
          email: getTrimmedFormValue(formData, "email"),
          phone: getTrimmedFormValue(formData, "phone"),
          province: getTrimmedFormValue(formData, "province"),
          message: buildCalculatorLeadMessage(),
          questionnaire: {
            ...questionnaire,
            province: getTrimmedFormValue(formData, "province")
          },
          estimate: {
            property_value: questionnaire.property_value,
            down_payment: downPayment,
            interest_rate: DEFAULT_INTEREST_RATE,
            amortization_years: DEFAULT_AMORTIZATION_YEARS,
            loan_amount: estimate.loanAmount,
            monthly_payment: estimate.monthlyPayment,
            total_interest: estimate.totalInterest,
            loan_to_value: estimate.loanToValue
          },
          company_name: getTrimmedFormValue(formData, "company_name"),
          source_page: `${window.location.pathname}#get-your-rates`,
          turnstile_token: calculatorLeadTurnstileToken
        };

        if (!payload.first_name || !payload.last_name || !payload.email || !payload.phone || !payload.province) {
          setStatusMessage(calculatorLeadMessage, "error", "Please fill in the required fields before submitting.");
          return;
        }

        if (!getCallbackFormConfig()) {
          setStatusMessage(
            calculatorLeadMessage,
            "error",
            "Rates form is not configured yet. Add the Edge Function endpoint and Turnstile site key in js/cashly-config.js."
          );
          return;
        }

        if (calculatorLeadTurnstileWidgetId === null) {
          await waitForCalculatorLeadTurnstile();
        }

        payload.turnstile_token = calculatorLeadTurnstileToken;

        if (!calculatorLeadTurnstileReady) {
          setStatusMessage(calculatorLeadMessage, "error", "The security check is still loading. Please wait a moment and try again.");
          return;
        }

        if (!payload.turnstile_token) {
          setStatusMessage(calculatorLeadMessage, "error", "Please complete the security check before submitting.");
          return;
        }

        calculatorLeadSubmitButton.disabled = true;
        calculatorLeadSubmitButton.textContent = "Submitting";
        setStatusMessage(calculatorLeadMessage, "", "");

        try {
          calculatorSubmittedQuestionnaire = payload.questionnaire;
          await submitCallbackToEdgeFunction(payload);
          resetCalculatorLeadCapture();

          if (window.jQuery && calculatorLeadModal) {
            calculatorReopenAfterLeadModal = false;
            calculatorOpenResultAfterLeadModal = true;
            window.jQuery(calculatorLeadModal).modal("hide");
          }
        } catch (error) {
          resetCalculatorLeadTurnstile();
          setStatusMessage(calculatorLeadMessage, "error", error.message || "Network error. Please try again in a moment.");
        } finally {
          calculatorLeadSubmitButton.disabled = false;
          calculatorLeadSubmitButton.textContent = defaultCalculatorLeadButtonText;
        }
      });
    }

    if (window.jQuery && calculatorModal && calculatorInputs.propertyValue) {
      openCalculatorModalFromHash();

      window.jQuery(calculatorModal).on("shown.bs.modal", () => {
        showCalculatorQuizStep(calculatorCurrentStep);
      });

      window.jQuery(calculatorModal).on("hidden.bs.modal", () => {
        clearCalculatorModalHash();

        if (calculatorTransitioningToLeadModal && calculatorLeadModal) {
          calculatorTransitioningToLeadModal = false;
          window.jQuery(calculatorLeadModal).modal("show");
          return;
        }

        resetCalculatorLeadFlow();
      });
    }

    if (window.jQuery && calculatorLeadModal) {
      window.jQuery(calculatorLeadModal).on("shown.bs.modal", () => {
        if (calculatorLeadFirstName) {
          calculatorLeadFirstName.focus();
        }
      });

      window.jQuery(calculatorLeadModal).on("hidden.bs.modal", () => {
        resetCalculatorLeadCapture();

        if (calculatorOpenResultAfterLeadModal) {
          calculatorOpenResultAfterLeadModal = false;
          openCalculatorResultModal();
          return;
        }

        if (calculatorReopenAfterLeadModal && calculatorModal) {
          calculatorReopenAfterLeadModal = false;
          window.jQuery(calculatorModal).modal("show");
          return;
        }

        resetCalculatorLeadFlow();
      });
    }

    if (window.jQuery && calculatorResultModal) {
      window.jQuery(calculatorResultModal).on("shown.bs.modal", () => {
        updateCalculatorPreview();
        updateCalculatorOutputs();
        updateCalculatorResultDate();
      });

      window.jQuery(calculatorResultModal).on("hidden.bs.modal", () => {
        resetCalculatorLeadFlow();
      });
    }
  }

  const setStatusMessage = (element, type, text) => {
    if (!element) {
      return;
    }

    element.className = "callback-message";

    if (type === "success") {
      element.classList.add("is-success");
    }

    if (type === "error") {
      element.classList.add("is-error");
    }

    element.textContent = text;
  };

  const getTrimmedFormValue = (formData, fieldName) => {
    return (formData.get(fieldName) || "").toString().trim();
  };

  const turnstileApiSrc = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  let turnstileApiPromise = null;

  const getCallbackFormConfig = () => {
    const config = window.CASHLY_CONFIG && window.CASHLY_CONFIG.callbackForm;

    if (!config || !config.endpoint || !config.turnstileSiteKey) {
      return null;
    }

    return {
      endpoint: config.endpoint,
      turnstileSiteKey: config.turnstileSiteKey
    };
  };

  const waitForTurnstileApi = (timeoutMs = 10000) => {
    if (window.turnstile && typeof window.turnstile.render === "function") {
      return Promise.resolve(window.turnstile);
    }

    if (turnstileApiPromise) {
      return turnstileApiPromise;
    }

    turnstileApiPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${turnstileApiSrc}"]`);
      const script = existingScript || document.createElement("script");
      const startedAt = Date.now();

      const cleanup = () => {
        window.clearInterval(intervalId);
        script.removeEventListener("error", handleScriptError);
      };

      const rejectWithError = (error) => {
        cleanup();
        turnstileApiPromise = null;
        reject(error);
      };

      const handleScriptError = () => {
        rejectWithError(new Error("Turnstile failed to load."));
      };

      const intervalId = window.setInterval(() => {
        if (window.turnstile && typeof window.turnstile.render === "function") {
          cleanup();
          resolve(window.turnstile);
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          rejectWithError(new Error("Turnstile failed to load."));
        }
      }, 100);

      script.addEventListener("error", handleScriptError);

      if (!existingScript) {
        script.src = turnstileApiSrc;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    });

    return turnstileApiPromise;
  };

  const submitCallbackToEdgeFunction = async (payload) => {
    const callbackConfig = getCallbackFormConfig();

    if (!callbackConfig) {
      throw new Error("Callback form is not configured.");
    }

    const response = await fetch(callbackConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let responsePayload = null;

    try {
      responsePayload = await response.json();
    } catch (error) {
      responsePayload = null;
    }

    if (!response.ok || !responsePayload || responsePayload.success !== true) {
      const errorMessage = responsePayload && responsePayload.message
        ? responsePayload.message
        : "Something went wrong while saving your request.";

      throw new Error(errorMessage);
    }

    return responsePayload;
  };

  const initializeCallbackForm = ({ form, messageElement, submitButton, turnstileContainer }) => {
    if (!form || !messageElement || !submitButton) {
      return;
    }

    const defaultButtonText = submitButton.textContent.trim() || "Submit";
    const submitMode = form.dataset.submitMode || "edge-function";
    let turnstileWidgetId = null;
    let turnstileToken = "";
    let turnstileReady = false;
    let turnstileRenderPromise = null;

    const setMessage = (type, text) => {
      setStatusMessage(messageElement, type, text);
    };

    const resetTurnstile = () => {
      turnstileToken = "";

      if (window.turnstile && turnstileWidgetId !== null) {
        window.turnstile.reset(turnstileWidgetId);
      }
    };

    const renderTurnstile = async () => {
      if (!turnstileContainer) {
        return;
      }

      const callbackConfig = getCallbackFormConfig();

      if (!callbackConfig || turnstileWidgetId !== null) {
        return;
      }

      if (turnstileRenderPromise) {
        await turnstileRenderPromise;
        return;
      }

      turnstileReady = false;

      turnstileRenderPromise = (async () => {
        try {
          const turnstile = await waitForTurnstileApi();

          if (turnstileWidgetId !== null) {
            return;
          }

          turnstileWidgetId = turnstile.render(turnstileContainer, {
            sitekey: callbackConfig.turnstileSiteKey,
            theme: "light",
            appearance: "always",
            callback(token) {
              turnstileToken = token;
              turnstileReady = true;
            },
            "expired-callback"() {
              turnstileToken = "";
            },
            "timeout-callback"() {
              turnstileToken = "";
            },
            "error-callback"(errorCode) {
              turnstileToken = "";
              turnstileReady = false;
              console.error("Turnstile error:", errorCode);
              setMessage(
                "error",
                `The security check could not load. Refresh the page and try again.${errorCode ? ` Error code: ${errorCode}.` : ""}`
              );
              return true;
            }
          });

          turnstileReady = true;
        } catch (error) {
          turnstileReady = false;
          setMessage("error", "The security check could not load. Refresh the page and try again.");
        } finally {
          turnstileRenderPromise = null;
        }
      })();

      await turnstileRenderPromise;
    };

    const warmTurnstile = () => {
      if (!turnstileContainer || turnstileWidgetId !== null || turnstileRenderPromise) {
        return;
      }

      renderTurnstile();
    };

    const waitForTurnstile = async () => {
      if (turnstileWidgetId !== null || !turnstileContainer) {
        return;
      }

      await renderTurnstile();
    };

    const interactionFields = form.querySelectorAll("input:not([type=\"hidden\"]), textarea, select");

    interactionFields.forEach((field) => {
      field.addEventListener("focus", warmTurnstile, { once: true });
      field.addEventListener("input", warmTurnstile, { once: true });
    });

    submitButton.addEventListener("click", warmTurnstile, { passive: true });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        first_name: getTrimmedFormValue(formData, "first_name"),
        last_name: getTrimmedFormValue(formData, "last_name"),
        email: getTrimmedFormValue(formData, "email"),
        phone: getTrimmedFormValue(formData, "phone"),
        message: getTrimmedFormValue(formData, "message"),
        company_name: getTrimmedFormValue(formData, "company_name"),
        source_page: window.location.pathname,
        turnstile_token: turnstileToken
      };

      if (!payload.first_name || !payload.last_name || !payload.email || !payload.phone || !payload.message) {
        setMessage("error", "Please fill in the required fields before submitting.");
        return;
      }

      if (submitMode !== "edge-function") {
        setMessage("error", "This callback form is not configured with a supported submit mode.");
        return;
      }

      if (!getCallbackFormConfig()) {
        setMessage(
          "error",
          "Callback form is not configured yet. Add the Edge Function endpoint and Turnstile site key in js/cashly-config.js."
        );
        return;
      }

      if (turnstileWidgetId === null && turnstileContainer) {
        await waitForTurnstile();
      }

      payload.turnstile_token = turnstileToken;

      if (turnstileContainer && !turnstileReady) {
        setMessage("error", "The security check is still loading. Please wait a moment and try again.");
        return;
      }

      if (turnstileContainer && !payload.turnstile_token) {
        setMessage("error", "Please complete the security check before submitting.");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Sending";
      setMessage("", "");

      try {
        await submitCallbackToEdgeFunction(payload);
        form.reset();
        resetTurnstile();
        setMessage(
          "success",
          "Thanks for reaching out to us. One of our agents will get back to you very soon."
        );
      } catch (error) {
        resetTurnstile();
        setMessage("error", error.message || "Network error. Please try again in a moment.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = defaultButtonText;
      }
    });
  };

  callbackFormConfigs.forEach(initializeCallbackForm);

  const leadChatWidget = document.getElementById("leadChatWidget");
  const leadChatLauncher = document.getElementById("leadChatLauncher");
  const leadChatPanel = document.getElementById("leadChatPanel");
  const leadChatClose = document.getElementById("leadChatClose");
  const leadChatMessages = document.getElementById("leadChatMessages");
  const leadChatHandoff = document.getElementById("leadChatHandoff");
  const leadChatHandoffCopy = document.getElementById("leadChatHandoffCopy");
  const leadChatTurnstileContainer = document.getElementById("leadChatTurnstile");
  const leadChatForm = document.getElementById("leadChatForm");
  const leadChatInput = document.getElementById("leadChatInput");
  let leadChatInitialized = false;
  let leadChatMode = "idle";
  let leadChatTurnstileWidgetId = null;
  let leadChatTurnstileToken = "";
  let leadChatTurnstileReady = false;
  let leadChatTurnstileRenderPromise = null;
  let leadChatSubmitting = false;
  let leadChatCloseTimerId = 0;
  const leadChatBookingUrl = googleCalendarBookingUrl;
  const leadChatLead = {
    helpRequest: "",
    creditScore: "",
    amountNeeded: "",
    creditAndAmount: "",
    productType: "",
    propertyLocation: "",
    propertyLocationConfirmed: false,
    postalCode: "",
    timeline: "",
    rawName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  };

  if (
    leadChatWidget &&
    leadChatLauncher &&
    leadChatPanel &&
    leadChatClose &&
    leadChatMessages &&
    leadChatHandoff &&
    leadChatHandoffCopy &&
    leadChatTurnstileContainer &&
    leadChatForm &&
    leadChatInput
  ) {
    const scrollLeadChatToBottom = () => {
      window.requestAnimationFrame(() => {
        leadChatMessages.scrollTop = leadChatMessages.scrollHeight;
      });
    };

    const setLeadChatPlaceholder = (value) => {
      leadChatInput.placeholder = value;
    };

    const setLeadChatHandoffCopy = (text) => {
      if (!leadChatHandoffCopy) {
        return;
      }

      leadChatHandoffCopy.textContent = text;
    };

    const hideLeadChatHandoff = () => {
      leadChatHandoff.hidden = true;
      setLeadChatHandoffCopy("One quick security check and I will send this to Cashly.");
    };

    const showLeadChatHandoff = (text) => {
      if (text) {
        setLeadChatHandoffCopy(text);
      }

      leadChatHandoff.hidden = false;
      scrollLeadChatToBottom();
    };

    const resetLeadChatTurnstile = () => {
      leadChatTurnstileToken = "";

      if (window.turnstile && leadChatTurnstileWidgetId !== null) {
        window.turnstile.reset(leadChatTurnstileWidgetId);
      }
    };

    const splitLeadChatName = (value) => {
      const trimmedValue = value.trim().replace(/\s+/g, " ");
      const nameParts = trimmedValue.split(" ").filter(Boolean);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "Lead";

      return {
        rawName: trimmedValue,
        firstName,
        lastName
      };
    };

    const getLeadChatFirstName = () => {
      return leadChatLead.firstName || "there";
    };

    const extractLeadChatEmail = (value) => {
      const match = value.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
      return match ? match[0].toLowerCase() : "";
    };

    const normalizeLeadChatPhone = (value) => {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return "";
      }

      const match = trimmedValue.match(/(\+?[\d\s().-]{7,})/);
      const candidate = match ? match[1].trim() : trimmedValue;
      const hasLeadingPlus = candidate.startsWith("+");
      const digitsOnly = candidate.replace(/\D/g, "");

      if (digitsOnly.length < 10) {
        return "";
      }

      return hasLeadingPlus ? `+${digitsOnly}` : digitsOnly;
    };

    const extractLeadChatCreditScore = (value) => {
      const explicitMatch = value.match(
        /credit(?:\s+score)?(?:\s+is|\s*[:=-])?\s*(?:less than|under|below|around|about|approx(?:imately)?|near)?\s*(\d{3})/i
      );

      if (explicitMatch) {
        return explicitMatch[1];
      }

      const scoreMatch = value.match(/\bscore(?:\s+is|\s*[:=-])?\s*(\d{3})\b/i);
      return scoreMatch ? scoreMatch[1] : "";
    };

    const extractLeadChatAmountNeeded = (value) => {
      const amountContextMatch = value.match(
        /(?:need|borrow|looking for|amount|require|required)\s+(\$?\s?\d[\d,]*(?:\.\d+)?\s*(?:k|m)?)/i
      );

      if (amountContextMatch) {
        const contextualAmount = amountContextMatch[1].replace(/\s+/g, " ").trim();
        return /\d/.test(contextualAmount) ? contextualAmount : "";
      }

      const currencyMatch = value.match(/(\$\s?\d[\d,]*(?:\.\d+)?\s*(?:k|m)?)/i);

      if (currencyMatch) {
        const currencyAmount = currencyMatch[1].replace(/\s+/g, " ").trim();
        return /\d/.test(currencyAmount) ? currencyAmount : "";
      }

      if (!/[km]\b/i.test(value)) {
        return "";
      }

      const amountMatch = value.match(/(\d[\d,]*(?:\.\d+)?\s*(?:k|m))/i);

      if (!amountMatch) {
        return "";
      }

      const amount = amountMatch[1].replace(/\s+/g, " ").trim();
      return /\d/.test(amount) ? amount : "";
    };

    const extractStandaloneLeadChatScore = (value) => {
      const trimmedValue = value.trim();
      const scoreMatch = trimmedValue.match(/^(\d{3})$/);

      if (!scoreMatch) {
        return "";
      }

      const score = Number.parseInt(scoreMatch[1], 10);
      return score >= 300 && score <= 900 ? scoreMatch[1] : "";
    };

    const extractContextualLeadChatScore = (value) => {
      const contextualPatterns = [
        /\b(?:i have|i'm at|im at|mine is|it is|it's|its|around|about|roughly|approx(?:imately)?)\s+(\d{3})\b/i,
        /\b(\d{3})\b(?=.*\bcredit\b)/i
      ];

      for (const pattern of contextualPatterns) {
        const match = value.match(pattern);

        if (!match) {
          continue;
        }

        const score = Number.parseInt(match[1], 10);

        if (score >= 300 && score <= 900) {
          return match[1];
        }
      }

      return "";
    };

    const detectLeadChatProductType = (value) => {
      const normalizedValue = value.toLowerCase();

      if (normalizedValue.includes("line of credit") || normalizedValue.includes("heloc") || /\bloc\b/.test(normalizedValue)) {
        return "line of credit";
      }

      if (normalizedValue.includes("construction")) {
        return "construction";
      }

      if (normalizedValue.includes("refinance") || normalizedValue.includes("refinancing") || normalizedValue.includes("refi")) {
        return "refinance";
      }

      if (normalizedValue.includes("private mortgage") || normalizedValue.includes("mortgage")) {
        return "private mortgage";
      }

      return "";
    };

    const getLeadChatProductTypePrompt = () => {
      return "Are you looking for refinance, construction, line of credit, or private mortgage?";
    };

    const detectLeadChatTimeline = (value) => {
      const normalizedValue = value.toLowerCase();

      if (
        normalizedValue.includes("urgent") ||
        normalizedValue.includes("asap") ||
        normalizedValue.includes("immediately") ||
        normalizedValue.includes("right away") ||
        normalizedValue.includes("today") ||
        normalizedValue.includes("tomorrow")
      ) {
        return value.trim();
      }

      const timelineMatch = value.match(/\b(?:within\s+)?\d+\s*(?:day|days|week|weeks|month|months)\b/i);
      return timelineMatch ? timelineMatch[0].trim() : "";
    };

    const extractLeadChatPostalCode = (value) => {
      const postalMatch = value.match(/\b([A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d)\b/);

      if (!postalMatch) {
        return "";
      }

      return postalMatch[1].toUpperCase().replace(/\s+/g, "").replace(
        /^([A-Z]\d[A-Z])(\d[A-Z]\d)$/,
        "$1 $2"
      );
    };

    const isValidLeadChatPropertyLocation = (value) => {
      const trimmedValue = value.trim().replace(/\s+/g, " ");
      const letterCount = (trimmedValue.match(/[A-Za-z]/g) || []).length;

      if (trimmedValue.length < 3 || letterCount < 3) {
        return false;
      }

      return /[A-Za-z]/.test(trimmedValue);
    };

    const requiresLeadChatPropertyDetails = () => {
      return leadChatLead.productType === "construction" || leadChatLead.productType === "refinance";
    };

    const syncLeadChatCreditAndAmount = () => {
      const parts = [];

      if (leadChatLead.creditScore) {
        parts.push(`credit score: ${leadChatLead.creditScore}`);
      }

      if (leadChatLead.amountNeeded) {
        parts.push(`amount needed: ${leadChatLead.amountNeeded}`);
      }

      leadChatLead.creditAndAmount = parts.join(", ");
    };

    const absorbLeadChatDetails = (value) => {
      if (!leadChatLead.creditScore) {
        leadChatLead.creditScore = extractLeadChatCreditScore(value);
      }

      if (!leadChatLead.amountNeeded) {
        leadChatLead.amountNeeded = extractLeadChatAmountNeeded(value);
      }

      if (!leadChatLead.productType) {
        leadChatLead.productType = detectLeadChatProductType(value);
      }

      if (!leadChatLead.timeline) {
        leadChatLead.timeline = detectLeadChatTimeline(value);
      }

      if (!leadChatLead.postalCode) {
        leadChatLead.postalCode = extractLeadChatPostalCode(value);
      }

      syncLeadChatCreditAndAmount();
    };

    const getNextLeadChatPrompt = () => {
      if (!leadChatLead.creditScore && !leadChatLead.amountNeeded) {
        return {
          mode: "awaiting-credit-amount",
          message: "Can I know your credit score?"
        };
      }

      if (!leadChatLead.creditScore) {
        return {
          mode: "awaiting-credit-amount",
          message: "Thanks. Can I know your credit score?"
        };
      }

      if (!leadChatLead.amountNeeded) {
        return {
          mode: "awaiting-credit-amount",
          message: "Thanks. How much money do you need?"
        };
      }

      if (!leadChatLead.productType) {
        return {
          mode: "awaiting-product-type",
          message: getLeadChatProductTypePrompt()
        };
      }

      if (requiresLeadChatPropertyDetails() && !leadChatLead.propertyLocation) {
        return {
          mode: "awaiting-property-location",
          message: "Where is your property located?"
        };
      }

      if (requiresLeadChatPropertyDetails() && leadChatLead.propertyLocation && !leadChatLead.propertyLocationConfirmed) {
        return {
          mode: "awaiting-property-confirmation",
          message: "Is this the property?"
        };
      }

      if (requiresLeadChatPropertyDetails() && !leadChatLead.postalCode) {
        return {
          mode: "awaiting-postal-code",
          message: "What is the postal code for the property?"
        };
      }

      if (!leadChatLead.timeline) {
        return {
          mode: "awaiting-timeline",
          message: "How soon do you need the money?"
        };
      }

      return {
        mode: "awaiting-name",
        message: "Please enter your full name."
      };
    };

    const resetLeadChatLead = () => {
      leadChatMode = "idle";
      leadChatLead.helpRequest = "";
      leadChatLead.creditScore = "";
      leadChatLead.amountNeeded = "";
      leadChatLead.creditAndAmount = "";
      leadChatLead.productType = "";
      leadChatLead.propertyLocation = "";
      leadChatLead.propertyLocationConfirmed = false;
      leadChatLead.postalCode = "";
      leadChatLead.timeline = "";
      leadChatLead.rawName = "";
      leadChatLead.firstName = "";
      leadChatLead.lastName = "";
      leadChatLead.email = "";
      leadChatLead.phone = "";
      leadChatSubmitting = false;
      resetLeadChatTurnstile();
      hideLeadChatHandoff();
      setLeadChatPlaceholder("Message Cashly");
    };

    const appendLeadChatMessage = (role, text, actions = []) => {
      const message = document.createElement("div");
      message.className = `lead-chat__message lead-chat__message--${role}`;

      const bubble = document.createElement("div");
      bubble.className = "lead-chat__bubble";
      bubble.textContent = text;
      message.appendChild(bubble);

      if (actions.length > 0) {
        const actionsRow = document.createElement("div");
        actionsRow.className = "lead-chat__actions";

        actions.forEach((item) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "lead-chat__action";
          button.dataset.chatAction = item.action;
          button.dataset.chatLabel = item.label;
          button.textContent = item.label;
          actionsRow.appendChild(button);
        });

        bubble.appendChild(actionsRow);
      }

      leadChatMessages.appendChild(message);
      scrollLeadChatToBottom();
    };

    const getLeadChatMapEmbedUrl = (location) => {
      const query = encodeURIComponent(location.trim());
      return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
    };

    const getLeadChatMapLinkUrl = (location) => {
      const query = encodeURIComponent(location.trim());
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    };

    const appendLeadChatPropertyConfirmation = (location) => {
      const message = document.createElement("div");
      message.className = "lead-chat__message lead-chat__message--bot";

      const bubble = document.createElement("div");
      bubble.className = "lead-chat__bubble";

      const intro = document.createElement("p");
      intro.className = "lead-chat__map-intro";
      intro.textContent = "I found this property. Is this the right one?";
      bubble.appendChild(intro);

      const mapCard = document.createElement("div");
      mapCard.className = "lead-chat__map-card";

      const mapFrame = document.createElement("iframe");
      mapFrame.className = "lead-chat__map-frame";
      mapFrame.src = getLeadChatMapEmbedUrl(location);
      mapFrame.title = `Property map preview for ${location}`;
      mapFrame.loading = "lazy";
      mapFrame.referrerPolicy = "no-referrer-when-downgrade";
      mapCard.appendChild(mapFrame);

      const mapMeta = document.createElement("div");
      mapMeta.className = "lead-chat__map-meta";

      const mapAddress = document.createElement("strong");
      mapAddress.textContent = location;
      mapMeta.appendChild(mapAddress);

      const mapLink = document.createElement("a");
      mapLink.className = "lead-chat__map-link";
      mapLink.href = getLeadChatMapLinkUrl(location);
      mapLink.target = "_blank";
      mapLink.rel = "noopener noreferrer";
      mapLink.textContent = "Open in Google Maps";
      mapMeta.appendChild(mapLink);

      mapCard.appendChild(mapMeta);
      bubble.appendChild(mapCard);

      const actionsRow = document.createElement("div");
      actionsRow.className = "lead-chat__actions";

      [
        { label: "Yes", action: "confirm-property-location" },
        { label: "No", action: "reject-property-location" }
      ].forEach((item) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lead-chat__action";
        button.dataset.chatAction = item.action;
        button.dataset.chatLabel = item.label;
        button.textContent = item.label;
        actionsRow.appendChild(button);
      });

      bubble.appendChild(actionsRow);
      message.appendChild(bubble);
      leadChatMessages.appendChild(message);
      scrollLeadChatToBottom();
    };

    const promptLeadChatPropertyConfirmation = () => {
      leadChatMode = "awaiting-property-confirmation";
      appendLeadChatPropertyConfirmation(leadChatLead.propertyLocation);
      setLeadChatPlaceholder("Type yes or no");
    };

    const handleLeadChatPropertyConfirmation = () => {
      leadChatLead.propertyLocationConfirmed = true;
      const nextStep = getNextLeadChatPrompt();
      leadChatMode = nextStep.mode;
      appendLeadChatMessage("bot", nextStep.message);
      setLeadChatPlaceholder("");
    };

    const handleLeadChatPropertyRejection = () => {
      leadChatLead.propertyLocation = "";
      leadChatLead.propertyLocationConfirmed = false;
      leadChatMode = "awaiting-property-location";
      appendLeadChatMessage("bot", "Please enter the full property address so I can check it again.");
      setLeadChatPlaceholder("Enter the property address");
    };

    const isAffirmativeLeadChatAnswer = (value) => /^(yes|yep|yeah|correct|right|that'?s right|this one)$/i.test(value.trim());
    const isNegativeLeadChatAnswer = (value) => /^(no|nope|wrong|not this|not correct|different)$/i.test(value.trim());
    const normalizeLeadChatAmountNeeded = (value) => {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        return "";
      }

      const match = trimmedValue.match(/\$?\s*(\d[\d,]*(?:\.\d+)?)\s*([km])?/i);

      if (!match) {
        return trimmedValue;
      }

      const numericValue = Number.parseFloat(match[1].replace(/,/g, ""));

      if (!Number.isFinite(numericValue)) {
        return trimmedValue;
      }

      const suffix = (match[2] || "").toLowerCase();
      let expandedValue = numericValue;

      if (suffix === "k") {
        expandedValue *= 1000;
      } else if (suffix === "m") {
        expandedValue *= 1000000;
      }

      return expandedValue.toLocaleString("en-CA", {
        maximumFractionDigits: 0
      });
    };

    const normalizeLeadChatTimeline = (value) => {
      const trimmedValue = value.trim().replace(/\s+/g, " ");

      if (!trimmedValue) {
        return "";
      }

      if (/(urgent|asap|immediately|right away|today|tomorrow)/i.test(trimmedValue)) {
        return "ASAP";
      }

      const match = trimmedValue.match(/(?:within\s+)?(\d+)\s*(day|days|week|weeks|month|months)\b/i);

      if (!match) {
        return trimmedValue;
      }

      const quantity = match[1];
      const normalizedUnit = match[2].toLowerCase().replace(/s$/, "");
      const pluralizedUnit = quantity === "1" ? normalizedUnit : `${normalizedUnit}s`;

      return `${quantity} ${pluralizedUnit}`;
    };

    const getLeadChatPropertyAddress = () => {
      return [leadChatLead.propertyLocation, leadChatLead.postalCode].filter(Boolean).join(", ");
    };

    const cleanLeadChatPayload = (payload) => {
      return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => {
          if (typeof value === "string") {
            return value.trim() !== "";
          }

          return value !== null && value !== undefined;
        })
      );
    };

    const renderLeadChatTurnstile = async () => {
      const callbackConfig = getCallbackFormConfig();

      if (!callbackConfig || leadChatTurnstileWidgetId !== null) {
        return;
      }

      if (leadChatTurnstileRenderPromise) {
        await leadChatTurnstileRenderPromise;
        return;
      }

      leadChatTurnstileReady = false;
      leadChatTurnstileRenderPromise = (async () => {
        try {
          const turnstile = await waitForTurnstileApi();

          if (leadChatTurnstileWidgetId !== null) {
            return;
          }

          leadChatTurnstileWidgetId = turnstile.render(leadChatTurnstileContainer, {
            sitekey: callbackConfig.turnstileSiteKey,
            theme: "light",
            appearance: "always",
            callback(token) {
              leadChatTurnstileToken = token;
              leadChatTurnstileReady = true;

              if (leadChatMode === "awaiting-security" && !leadChatSubmitting) {
                submitLeadChatLead();
              }
            },
            "expired-callback"() {
              leadChatTurnstileToken = "";
            },
            "timeout-callback"() {
              leadChatTurnstileToken = "";
            },
            "error-callback"(errorCode) {
              leadChatTurnstileToken = "";
              leadChatTurnstileReady = false;
              console.error("Lead chat Turnstile error:", errorCode);
              setLeadChatHandoffCopy("The security check could not load. Refresh the page and try again.");
              return true;
            }
          });

          leadChatTurnstileReady = true;
        } catch (error) {
          leadChatTurnstileReady = false;
          setLeadChatHandoffCopy("The security check could not load. Refresh the page and try again.");
        } finally {
          leadChatTurnstileRenderPromise = null;
        }
      })();

      await leadChatTurnstileRenderPromise;
    };

    const submitLeadChatLead = async () => {
      if (leadChatSubmitting || leadChatMode !== "awaiting-security") {
        return;
      }

      if (
        !leadChatLead.helpRequest ||
        !leadChatLead.creditAndAmount ||
        !leadChatLead.productType ||
        !leadChatLead.timeline ||
        !leadChatLead.firstName ||
        !leadChatLead.lastName ||
        !leadChatLead.email ||
        !leadChatLead.phone
      ) {
        return;
      }

      if (!leadChatTurnstileReady) {
        setLeadChatHandoffCopy("The security check is still loading. Please wait a moment.");
        return;
      }

      if (!leadChatTurnstileToken) {
        setLeadChatHandoffCopy("Please complete the security check and I will send this to Cashly.");
        return;
      }

      leadChatSubmitting = true;
      setLeadChatHandoffCopy("Sending your message to Cashly now.");

      try {
        const leadChatPayload = cleanLeadChatPayload({
          fullname: leadChatLead.rawName || `${leadChatLead.firstName} ${leadChatLead.lastName}`.trim(),
          address: "",
          phone: leadChatLead.phone,
          email: leadChatLead.email,
          credit_score: leadChatLead.creditScore,
          amount_needed: normalizeLeadChatAmountNeeded(leadChatLead.amountNeeded),
          purchase_type: leadChatLead.productType,
          property_address: getLeadChatPropertyAddress(),
          timeline: normalizeLeadChatTimeline(leadChatLead.timeline),
          message: leadChatLead.helpRequest
        });

        await submitCallbackToEdgeFunction({
          first_name: leadChatLead.firstName,
          last_name: leadChatLead.lastName,
          email: leadChatLead.email,
          phone: leadChatLead.phone,
          message: JSON.stringify(leadChatPayload, null, 2),
          company_name: "",
          source_page: `${window.location.pathname}#lead-chat`,
          turnstile_token: leadChatTurnstileToken
        });

        appendLeadChatMessage(
          "bot",
          `Thanks ${getLeadChatFirstName()}. One of our agents will get back to you very soon.`
        );
        resetLeadChatLead();
        leadChatMode = "submitted";
        appendLeadChatMessage(
          "bot",
          "Do you want to book appointment now? I think you are in urgent.",
          [
            { label: "Book Appointment", action: "book-appointment" }
          ]
        );
      } catch (error) {
        resetLeadChatTurnstile();
        leadChatSubmitting = false;
        setLeadChatHandoffCopy("Please complete the security check again so I can resend this.");
        appendLeadChatMessage(
          "bot",
          error.message || "Something went wrong while sending your message. Please try again."
        );
      }
    };

    const seedLeadChat = () => {
      if (leadChatInitialized) {
        return;
      }

      appendLeadChatMessage("bot", "Hi, tell me how I can help you today.");
      leadChatInitialized = true;
      setLeadChatPlaceholder("Message Cashly");
    };

    const openLeadChat = () => {
      seedLeadChat();
      window.clearTimeout(leadChatCloseTimerId);
      leadChatPanel.hidden = false;
      leadChatPanel.setAttribute("aria-hidden", "false");
      leadChatPanel.classList.remove("is-closing");
      leadChatLauncher.setAttribute("aria-expanded", "true");
      document.body.classList.add("chat-open");

      window.requestAnimationFrame(() => {
        leadChatPanel.classList.add("is-open");
      });

      window.setTimeout(() => {
        leadChatInput.focus();
      }, 80);
    };

    const closeLeadChat = () => {
      leadChatPanel.classList.remove("is-open");
      leadChatPanel.classList.add("is-closing");
      leadChatLauncher.setAttribute("aria-expanded", "false");
      leadChatPanel.setAttribute("aria-hidden", "true");
      document.body.classList.remove("chat-open");
      leadChatCloseTimerId = window.setTimeout(() => {
        leadChatPanel.hidden = true;
        leadChatPanel.classList.remove("is-closing");
      }, 280);
    };

    const finishLeadChatContactCapture = async () => {
      leadChatMode = "awaiting-security";
      showLeadChatHandoff("One quick security check and I will send this to Cashly.");
      appendLeadChatMessage(
        "bot",
        `Perfect ${getLeadChatFirstName()}. Complete the security check below and I will send this through.`
      );
      setLeadChatPlaceholder("Security check required");
      await renderLeadChatTurnstile();

      if (leadChatTurnstileToken) {
        submitLeadChatLead();
      }
    };

    leadChatLauncher.addEventListener("click", () => {
      if (leadChatPanel.hidden) {
        openLeadChat();
      } else {
        closeLeadChat();
      }
    });

    leadChatClose.addEventListener("click", closeLeadChat);

    leadChatMessages.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-chat-action]");

      if (!actionButton) {
        return;
      }

      const action = actionButton.dataset.chatAction || "";

      if (action === "book-appointment") {
        window.open(leadChatBookingUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (action === "confirm-property-location") {
        handleLeadChatPropertyConfirmation();
        return;
      }

      if (action === "reject-property-location") {
        handleLeadChatPropertyRejection();
      }
    });

    leadChatForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const answer = leadChatInput.value.trim();

      if (!answer) {
        leadChatInput.focus();
        return;
      }

      appendLeadChatMessage("user", answer);
      leadChatInput.value = "";

      if (leadChatMode === "submitted") {
        appendLeadChatMessage(
          "bot",
          "Do you want to book appointment now? I think you are in urgent.",
          [
            { label: "Book Appointment", action: "book-appointment" }
          ]
        );
        setLeadChatPlaceholder("Message Cashly");
        return;
      }

      if (leadChatMode === "idle") {
        leadChatLead.helpRequest = answer;
        absorbLeadChatDetails(answer);
        const nextStep = getNextLeadChatPrompt();
        leadChatMode = nextStep.mode;
        appendLeadChatMessage("bot", nextStep.message);
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-credit-amount") {
        if (!leadChatLead.creditScore) {
          const standaloneScore = extractStandaloneLeadChatScore(answer) || extractContextualLeadChatScore(answer);

          if (standaloneScore) {
            leadChatLead.creditScore = standaloneScore;
            syncLeadChatCreditAndAmount();
          }
        }

        absorbLeadChatDetails(answer);

        if (!leadChatLead.creditScore && !leadChatLead.amountNeeded) {
          appendLeadChatMessage("bot", "Please share your credit score.");
          return;
        }

        if (!leadChatLead.creditScore) {
          appendLeadChatMessage("bot", "Thanks. I still need your credit score.");
          return;
        }

        if (!leadChatLead.amountNeeded) {
          appendLeadChatMessage("bot", "Thanks. I still need to know how much money you need.");
          return;
        }

        const nextStep = getNextLeadChatPrompt();
        leadChatMode = nextStep.mode;
        appendLeadChatMessage("bot", nextStep.message);
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-product-type") {
        const detectedProductType = detectLeadChatProductType(answer);

        if (!detectedProductType) {
          appendLeadChatMessage(
            "bot",
            `${getLeadChatProductTypePrompt()} Please choose one of those options.`
          );
          return;
        }

        leadChatLead.productType = detectedProductType;
        absorbLeadChatDetails(answer);
        const nextStep = getNextLeadChatPrompt();
        leadChatMode = nextStep.mode;
        appendLeadChatMessage("bot", nextStep.message);
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-property-location") {
        if (!isValidLeadChatPropertyLocation(answer)) {
          appendLeadChatMessage("bot", "Please enter a valid property location, like a city or full address.");
          return;
        }

        leadChatLead.propertyLocation = answer.trim().replace(/\s+/g, " ");
        leadChatLead.propertyLocationConfirmed = false;
        absorbLeadChatDetails(answer);
        promptLeadChatPropertyConfirmation();
        return;
      }

      if (leadChatMode === "awaiting-property-confirmation") {
        if (isAffirmativeLeadChatAnswer(answer)) {
          handleLeadChatPropertyConfirmation();
          return;
        }

        if (isNegativeLeadChatAnswer(answer)) {
          handleLeadChatPropertyRejection();
          return;
        }

        appendLeadChatMessage("bot", "Please answer yes or no so I can confirm the property.");
        return;
      }

      if (leadChatMode === "awaiting-postal-code") {
        const extractedPostalCode = extractLeadChatPostalCode(answer);

        if (!extractedPostalCode) {
          appendLeadChatMessage("bot", "Please enter a valid postal code for the property.");
          return;
        }

        leadChatLead.postalCode = extractedPostalCode;
        const nextStep = getNextLeadChatPrompt();
        leadChatMode = nextStep.mode;
        appendLeadChatMessage("bot", nextStep.message);
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-timeline") {
        leadChatLead.timeline = detectLeadChatTimeline(answer) || answer.trim();
        const nextStep = getNextLeadChatPrompt();
        leadChatMode = nextStep.mode;
        appendLeadChatMessage("bot", nextStep.message);
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-name") {
        const parsedName = splitLeadChatName(answer);

        if (!parsedName.firstName) {
          appendLeadChatMessage("bot", "Please enter your name so I can pass this to Cashly.");
          return;
        }

        leadChatLead.rawName = parsedName.rawName;
        leadChatLead.firstName = parsedName.firstName;
        leadChatLead.lastName = parsedName.lastName;
        leadChatMode = "awaiting-email";
        appendLeadChatMessage("bot", `Alright ${parsedName.firstName}, please enter your email address.`);
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-email") {
        const extractedEmail = extractLeadChatEmail(answer);

        if (!extractedEmail) {
          appendLeadChatMessage("bot", "Please enter a valid email address.");
          return;
        }

        leadChatLead.email = extractedEmail;
        leadChatMode = "awaiting-phone";
        appendLeadChatMessage("bot", "Great, now please enter your phone number.");
        setLeadChatPlaceholder("");
        return;
      }

      if (leadChatMode === "awaiting-phone") {
        const extractedPhone = normalizeLeadChatPhone(answer);

        if (!extractedPhone) {
          appendLeadChatMessage("bot", "Please enter a valid phone number.");
          return;
        }

        leadChatLead.phone = extractedPhone;
        await finishLeadChatContactCapture();
        return;
      }

      if (leadChatMode === "awaiting-security") {
        appendLeadChatMessage("bot", "Complete the security check below and I will send this to Cashly.");
        return;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !leadChatPanel.hidden) {
        closeLeadChat();
      }
    });
  }

  const scrollButton = document.querySelector(".scroll-top-to");

  if (scrollButton) {
    const updateScrollButton = () => {
      if (window.scrollY > 200) {
        scrollButton.classList.add("active");
      } else {
        scrollButton.classList.remove("active");
      }
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    };

    window.addEventListener("scroll", updateScrollButton, { passive: true });
    scrollButton.addEventListener("click", scrollToTop);
    scrollButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        scrollToTop();
      }
    });

    updateScrollButton();
  }
});
