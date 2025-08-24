// Tailwind configuration
tailwind.config = {
  theme: {
    extend: {
      backgroundImage: {
        'gradient-conic':
          'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
      },
    },
  },
};

// FAQ Navigation functionality
function setActiveFAQNav(event) {
  event.preventDefault();
  
  // Remove active class from all nav items
  document.querySelectorAll('.faq-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to clicked item
  event.currentTarget.classList.add('active');
  
  // Scroll to target in the content area
  const targetId = event.currentTarget.getAttribute('href');
  const targetElement = document.querySelector(targetId);
  const contentContainer = document.querySelector('.faq-content-scrollbar');
  
  if (targetElement && contentContainer) {
    const containerTop = contentContainer.scrollTop;
    const targetTop = targetElement.offsetTop - contentContainer.offsetTop;
    
    contentContainer.scrollTo({
      top: targetTop - 20,
      behavior: 'smooth'
    });
  }
}

// Highlight active section on content scroll
function updateActiveFAQNav() {
  const sections = document.querySelectorAll('.faq-question-section');
  const navItems = document.querySelectorAll('.faq-nav-item');
  const contentContainer = document.querySelector('.faq-content-scrollbar');
  
  if (!contentContainer) return;
  
  let current = '';
  const scrollTop = contentContainer.scrollTop;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - contentContainer.offsetTop;
    if (scrollTop >= sectionTop - 100) {
      current = section.getAttribute('id');
    }
  });
  
  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${current}`) {
      item.classList.add('active');
    }
  });
}

// Mobile FAQ accordion functionality
function toggleMobileFAQ(button) {
  const content = button.nextElementSibling;
  const arrow = button.querySelector('svg');
  const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';
  
  // Close all other FAQ items
  document.querySelectorAll('.mobile-faq-content').forEach(item => {
    if (item !== content) {
      item.style.maxHeight = '0px';
      item.previousElementSibling.querySelector('svg').style.transform = 'rotate(0deg)';
    }
  });
  
  // Toggle current item
  if (isOpen) {
    content.style.maxHeight = '0px';
    arrow.style.transform = 'rotate(0deg)';
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    arrow.style.transform = 'rotate(180deg)';
  }
}

// Original accordion functionality (kept for mobile fallback)
document.addEventListener('DOMContentLoaded', function () {
  const accordionToggles = document.querySelectorAll(
    '[data-accordion-toggle]'
  );

  // Open the first accordion item by default
  const firstContent = document.querySelector('[data-accordion-content]');
  const firstToggle = document.querySelector('[data-accordion-toggle]');
  if (firstContent && firstToggle) {
    firstContent.style.display = 'block';
    firstToggle.querySelector('svg').classList.add('rotate-180');
  }

  accordionToggles.forEach((toggle) => {
    toggle.addEventListener('click', function () {
      const content = this.closest('.border-b').querySelector(
        '[data-accordion-content]'
      );
      const icon = this.querySelector('svg');

      // Close all accordions
      document
        .querySelectorAll('[data-accordion-content]')
        .forEach((item) => {
          if (item !== content) {
            item.style.display = 'none';
          }
        });

      document
        .querySelectorAll('[data-accordion-toggle] svg')
        .forEach((svg) => {
          if (svg !== icon) {
            svg.classList.remove('rotate-180');
          }
        });

      // Toggle current accordion
      if (
        content.style.display === 'none' ||
        content.style.display === ''
      ) {
        content.style.display = 'block';
        icon.classList.add('rotate-180');
      } else {
        content.style.display = 'none';
        icon.classList.remove('rotate-180');
      }
    });
  });
  
  // Set initial active FAQ nav state and add scroll listener
  const firstFAQNavItem = document.querySelector('.faq-nav-item');
  if (firstFAQNavItem) {
    firstFAQNavItem.classList.add('active');
  }
  
  // Add scroll listener to FAQ content area
  const faqContentContainer = document.querySelector('.faq-content-scrollbar');
  if (faqContentContainer) {
    faqContentContainer.addEventListener('scroll', updateActiveFAQNav);
  }
});

// Initialize Stripe.js with your publishable key
const stripe = Stripe(
  'pk_live_51QyFM2A9aibyk7ocyoijP7A9gPKC0oDS0HlySiSEuCOaS4sndnS1HZn9fyKPkf48ERT7FPaoxOWwvesYKKSy7N5J003rxyTc2b'
);

// Display a small indicator of the current mode
const stripeMode = document.createElement('div');
stripeMode.style.position = 'fixed';
stripeMode.style.bottom = '5px';
stripeMode.style.right = '5px';
stripeMode.style.padding = '3px 8px';
stripeMode.style.fontSize = '12px';
stripeMode.style.borderRadius = '3px';
stripeMode.style.zIndex = '9999';

// Determine if we're in live mode based on the API key
const isLiveMode = true; // We're now in live mode

if (isLiveMode) {
  stripeMode.textContent = 'LIVE MODE';
  stripeMode.style.backgroundColor = '#4CAF50';
  stripeMode.style.color = 'white';
} else {
  stripeMode.textContent = 'TEST MODE';
  stripeMode.style.backgroundColor = '#FFC107';
  stripeMode.style.color = 'black';
}

document.addEventListener('DOMContentLoaded', function () {
  // document.body.appendChild(stripeMode); // This line adds the element
  console.log('Stripe mode:', isLiveMode ? 'LIVE' : 'TEST');
});

// Function to handle checkout process
// Make handleCheckout a window property for global access
window.handleCheckout = async function (event) {
  console.log(
    'Checkout triggered',
    event ? event.currentTarget : 'no event'
  );

  // Prevent default action if this is a link
  if (event && event.preventDefault) {
    event.preventDefault();
  }

  try {
    // Extract click ID from URL if present
    function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null
        ? ''
        : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Get click ID from URL
    const clickId = getUrlParameter('cid');
    console.log('Click ID from URL:', clickId);

    // For local testing
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('192.168')
    ) {
      console.log('Local development environment detected');
      alert(
        'In der lokalen Entwicklungsumgebung ist die Checkout-Funktion nicht vollständig verfügbar. Bei Bereitstellung auf Netlify wird diese Funktion aktiviert.'
      );
      return;
    }

    // On production, use relative URL to avoid certificate issues
    const endpointUrl = '/api/create-checkout';
    console.log('Using endpoint:', endpointUrl);

    // Get price ID from the button if available
    let priceId = 'price_1RmZQcA9aibyk7oc7HnUPblY'; // Default price ID - Updated to new 259€ offer
    if (
      event &&
      event.currentTarget &&
      event.currentTarget.dataset.priceId
    ) {
      priceId = event.currentTarget.dataset.priceId;
    }
    console.log('Using price ID for checkout:', priceId);

    // Call your backend to create a Checkout Session
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: priceId,
        clickId: clickId, // Pass the click ID to the checkout endpoint
      }),
    });

    const session = await response.json();

    // Show error if there was a problem
    if (session.error) {
      console.error('Session error:', session.error);
      alert(
        'Es gab ein Problem mit dem Checkout. Bitte versuchen Sie es später noch einmal.'
      );
      return;
    }

    // Redirect to Stripe Checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error('Redirect error:', result.error);
      alert(result.error.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert(
      'Es gab ein Problem mit der Weiterleitung zum Checkout. Bitte versuchen Sie es später noch einmal.'
    );
  }
};

// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Hide swipe indicator after first interaction with pricing cards
document.addEventListener('DOMContentLoaded', function () {
  const pricingCardsContainer = document.querySelector(
    '.pricing-cards-container'
  );
  const swipeIndicator = document.querySelector('.swipe-indicator');

  if (pricingCardsContainer && swipeIndicator) {
    // Hide indicator after user scrolls
    pricingCardsContainer.addEventListener(
      'scroll',
      function () {
        if (swipeIndicator) {
          swipeIndicator.style.opacity = '0';
          setTimeout(() => {
            swipeIndicator.style.display = 'none';
          }, 300);
        }
      },
      { passive: true, once: true }
    );

    // Also hide after touch events
    pricingCardsContainer.addEventListener(
      'touchmove',
      function () {
        if (swipeIndicator) {
          swipeIndicator.style.opacity = '0';
          setTimeout(() => {
            swipeIndicator.style.display = 'none';
          }, 300);
        }
      },
      { passive: true, once: true }
    );
  }
});

// Word animation - Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  const words = document.querySelectorAll('.animated-word');
  let currentWordIndex = 0;

  function showNextWord() {
    // Hide current word
    words.forEach((word) => {
      word.classList.remove('active');
    });

    // Show next word
    words[currentWordIndex].classList.add('active');

    // Increment index
    currentWordIndex = (currentWordIndex + 1) % words.length;
  }

  // Only run if words exist
  if (words.length > 0) {
    // Show first word immediately
    showNextWord();

    // Set interval for word cycling
    setInterval(showNextWord, 2000);
  }
});

// Add event listeners for Stripe checkout buttons
document.addEventListener('DOMContentLoaded', function () {
  // Add a separate initialization for the pricing indicators that runs after page load
  window.addEventListener('load', function () {
    setupPricingIndicators();
  });

  // Function to setup pricing indicators separately from other functionality
  function setupPricingIndicators() {
    // Get DOM elements
    const container = document.querySelector('.pricing-cards-container');
    const indicators = document.querySelectorAll('.pricing-indicator');

    if (container && indicators.length > 0 && window.innerWidth <= 768) {
      console.log('Setting up pricing indicators:', indicators.length);

      // Direct DOM manipulation for scrolling behavior
      container.style.scrollSnapType = 'x mandatory';
      container.style.overflow = 'auto';
      container.style.display = 'flex';
      container.style.scrollBehavior = 'smooth';

      // Function to update indicators based on visible card
      function updateActiveIndicator() {
        const scrollPosition = container.scrollLeft;
        const containerWidth = container.clientWidth;

        // Get the first visible card
        const cards = container.querySelectorAll(':scope > div');
        let activeIndex = 0;

        if (cards.length > 0) {
          // Simple calculation - whichever card is most in view
          const cardWidth = cards[0].offsetWidth;
          activeIndex = Math.round(scrollPosition / cardWidth);

          // Clamp to valid range
          activeIndex = Math.max(
            0,
            Math.min(activeIndex, indicators.length - 1)
          );

          console.log(
            'Active card:',
            activeIndex + 1,
            'of',
            indicators.length
          );
        }

        // Update the indicators
        indicators.forEach((dot, index) => {
          if (index === activeIndex) {
            dot.classList.add('active');
            dot.style.backgroundColor = '#004691';
          } else {
            dot.classList.remove('active');
            dot.style.backgroundColor = '#e2e8f0';
          }
        });
      }

      // Attach scroll event listener (most basic version)
      container.addEventListener(
        'scroll',
        function () {
          updateActiveIndicator();
        },
        { passive: true }
      );

      // Add click handlers to indicators
      indicators.forEach((dot, index) => {
        dot.addEventListener('click', function () {
          const cards = container.querySelectorAll(':scope > div');
          if (cards.length > index) {
            // Calculate position to scroll to
            const cardWidth = cards[0].offsetWidth;
            container.scrollTo({
              left: index * cardWidth,
              behavior: 'smooth',
            });

            // Update indicators manually
            indicators.forEach((d, i) => {
              if (i === index) {
                d.classList.add('active');
                d.style.backgroundColor = '#004691';
              } else {
                d.classList.remove('active');
                d.style.backgroundColor = '#e2e8f0';
              }
            });
          }
        });
      });

      // Initialize - make sure the first card is in view and first indicator is active
      setTimeout(() => {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        updateActiveIndicator();
      }, 100);
    }
  }

  // Original pricing cards swiper function
  function initPricingCardsSwiper() {
    const pricingCardsContainer = document.querySelector(
      '.pricing-cards-container'
    );
    const pricingIndicators =
      document.querySelectorAll('.pricing-indicator');
    const pricingCards = pricingCardsContainer
      ? pricingCardsContainer.querySelectorAll('> div')
      : [];

    if (
      pricingCardsContainer &&
      window.innerWidth <= 768 &&
      pricingCards.length > 0
    ) {
      // Force grid to flex for mobile - remove any grid classes that might interfere
      pricingCardsContainer.classList.remove('grid');
      pricingCardsContainer.classList.remove('grid-cols-1');

      // Apply styles directly to ensure horizontal layout
      pricingCardsContainer.style.display = 'flex';
      pricingCardsContainer.style.flexDirection = 'row';
      pricingCardsContainer.style.flexWrap = 'nowrap';
      pricingCardsContainer.style.overflowX = 'auto';
      pricingCardsContainer.style.scrollBehavior = 'smooth';
      pricingCardsContainer.style.scrollSnapType = 'x mandatory';

      // Apply styles to card elements and add data attributes
      pricingCards.forEach((card, idx) => {
        card.style.flex = '0 0 300px';
        card.style.minWidth = '300px';
        card.style.width = '300px';
        card.style.marginRight = '16px';
        card.style.scrollSnapAlign = 'center';
        card.setAttribute('data-card-index', idx); // Add index for better tracking
      });

      // Make indicator dots more visible and clickable
      pricingIndicators.forEach((dot, idx) => {
        dot.style.cursor = 'pointer';
        dot.title = `View pricing option ${idx + 1}`; // Add tooltip
      });

      // Ensure first card is fully visible on load and first indicator is active
      setTimeout(() => {
        pricingCardsContainer.scrollLeft = 0;

        // Set first indicator as active
        pricingIndicators.forEach((ind) =>
          ind.classList.remove('active')
        );
        pricingIndicators[0].classList.add('active');
      }, 100);

      // Calculate card width including margins
      const getCardWidth = () => {
        const card = pricingCards[0];
        const style = window.getComputedStyle(card);
        const width = card.offsetWidth;
        const marginRight = parseInt(style.marginRight || '0', 10);
        return width + marginRight;
      };

      // Better method to determine visible card using element position
      const getCurrentCardIndex = () => {
        // Get current scroll position and container width
        const scrollLeft = pricingCardsContainer.scrollLeft;
        const containerWidth = pricingCardsContainer.clientWidth;

        // Calculate which card is most visible in the viewport
        // This is more reliable than using rounded division
        const visibleCenter = scrollLeft + containerWidth / 2;
        const cardWidth = getCardWidth();
        const currentIndex = Math.min(
          Math.floor(visibleCenter / cardWidth),
          pricingCards.length - 1
        );

        // For more accuracy, verify with the actual DOM elements
        return Math.max(0, currentIndex);
      };

      // Enhanced indicator update with direct style manipulation for better visibility
      const updateIndicators = () => {
        const cardIndex = getCurrentCardIndex();

        // Apply visual changes directly to indicators
        pricingIndicators.forEach((indicator, index) => {
          if (index === cardIndex) {
            // Active indicator: blue and larger
            indicator.classList.add('active');
            indicator.style.backgroundColor = '#004691';
            indicator.style.width = '14px';
            indicator.style.height = '14px';
          } else {
            // Inactive indicators: gray and smaller
            indicator.classList.remove('active');
            indicator.style.backgroundColor = '#e2e8f0';
            indicator.style.width = '12px';
            indicator.style.height = '12px';
          }
        });

        // Log indicator changes for debugging
        console.log(
          'Indicator updated: showing card',
          cardIndex + 1,
          'of',
          pricingCards.length
        );
      };

      // Remove any existing event listeners to prevent duplicates
      const oldContainer = document.querySelector(
        '.pricing-cards-container'
      );
      if (oldContainer) {
        const newContainer = oldContainer.cloneNode(true);
        if (oldContainer.parentNode) {
          oldContainer.parentNode.replaceChild(
            newContainer,
            oldContainer
          );
        }
      }

      // Create a more reliable scroll handler that forces indicator updates
      const handleScroll = function () {
        // Update the indicators immediately during scrolling
        requestAnimationFrame(updateIndicators);
      };

      // Create a handler for when scrolling stops to snap to nearest card
      const handleScrollEnd = function () {
        const cardIndex = getCurrentCardIndex();
        const cardWidth = getCardWidth();
        const targetPosition = cardIndex * cardWidth;

        // Snap to nearest card if not already aligned
        if (
          Math.abs(pricingCardsContainer.scrollLeft - targetPosition) > 5
        ) {
          pricingCardsContainer.scrollTo({
            left: targetPosition,
            behavior: 'smooth',
          });
        }

        // Force indicator update
        pricingIndicators.forEach((indicator, index) => {
          if (index === cardIndex) {
            indicator.classList.add('active');
            indicator.style.backgroundColor = '#004691';
            indicator.style.width = '14px';
            indicator.style.height = '14px';
          } else {
            indicator.classList.remove('active');
            indicator.style.backgroundColor = '#e2e8f0';
            indicator.style.width = '12px';
            indicator.style.height = '12px';
          }
        });

        console.log('Snap to card:', cardIndex + 1);
      };

      // Attach scroll event with debounce for scroll end detection
      let scrollTimer;
      pricingCardsContainer.addEventListener(
        'scroll',
        function () {
          // Update indicators during scroll
          handleScroll();

          // Detect when scrolling stops
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(handleScrollEnd, 100);
        },
        { passive: true }
      );

      // Add touch events for mobile users
      pricingCardsContainer.addEventListener('touchmove', handleScroll, {
        passive: true,
      });
      pricingCardsContainer.addEventListener(
        'touchend',
        function () {
          setTimeout(handleScrollEnd, 50);
        },
        { passive: true }
      );

      // Enhanced click handlers for indicators with immediate feedback
      pricingIndicators.forEach((indicator, index) => {
        // Make indicators more visible
        indicator.style.cursor = 'pointer';

        // Add click event with immediate visual feedback and forced scrolling
        indicator.addEventListener('click', function () {
          // Clear any existing timers
          clearTimeout(scrollTimer);

          // Update all indicators immediately
          pricingIndicators.forEach((ind, i) => {
            if (i === index) {
              // Active indicator
              ind.classList.add('active');
              ind.style.backgroundColor = '#004691';
              ind.style.width = '14px';
              ind.style.height = '14px';
              // Add pulse animation
              ind.style.transform = 'scale(1.3)';
              ind.style.boxShadow = '0 0 0 2px rgba(0, 70, 145, 0.3)';
            } else {
              // Inactive indicators
              ind.classList.remove('active');
              ind.style.backgroundColor = '#e2e8f0';
              ind.style.width = '12px';
              ind.style.height = '12px';
              ind.style.transform = '';
              ind.style.boxShadow = '';
            }
          });

          // Calculate target position and force scroll
          const cardWidth = getCardWidth();
          pricingCardsContainer.scrollTo({
            left: index * cardWidth,
            behavior: 'smooth',
          });

          // Reset animation after delay
          setTimeout(() => {
            indicator.style.transform = 'scale(1)';
            indicator.style.boxShadow = '';
          }, 400);

          console.log('Clicked indicator for card:', index + 1);
        });
      });

      // Initial update
      updateIndicators();

      // Debug info
      console.log('Pricing cards swiper initialized:', {
        cards: pricingCards.length,
        cardWidth: getCardWidth(),
        containerWidth: pricingCardsContainer.offsetWidth,
      });
    }
  }

  // Initialize the original swiper function (but let our new indicator function handle the indicators)
  // This prevents any conflict between the two implementations
  initPricingCardsSwiper();

  // Handle resizing and orientation changes
  ['resize', 'orientationchange'].forEach((eventType) => {
    window.addEventListener(eventType, function () {
      // Use timeout to debounce
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(function () {
        // Reinitialize both systems
        initPricingCardsSwiper();
        setupPricingIndicators();
      }, 250);
    });
  });

  // Get all buy buttons
  const buyButtons = document.querySelectorAll('.checkout-button');
  console.log('Found checkout buttons:', buyButtons.length);

  // Add checkout handler to all buy buttons
  buyButtons.forEach((button) => {
    if (button) {
      // Remove existing event listeners
      button.replaceWith(button.cloneNode(true));

      // Get the fresh button reference
      const freshButton = document.querySelector(
        `a[href="${button.getAttribute('href')}"]`
      );

      // Add fresh event listener to the global handleCheckout function
      freshButton.addEventListener('click', window.handleCheckout);

      // Add an onclick attribute as a fallback method
      freshButton.setAttribute(
        'onclick',
        'window.handleCheckout(event); return false;'
      );

      console.log('Added checkout handler to button:', freshButton);
    }
  });

  // Update all links to blutdruck-test-merged.html to preserve the clickId parameter
  const clickId = getUrlParameter('cid');
  if (clickId) {
    console.log('Found click ID in URL, updating links:', clickId);

    // Target both relative and absolute links to the test page
    const linkSelectors = [
      'a[href*="blutdruck-test-merged.html"]',
      'a[href*="blutdruck-test-merged"]',
      'a[href*="/blutdruck-test"]',
      'a[href*="blutdruck-test"]',
      'a[href*="/blutdruck-analyse"]',
      'a[href*="blutdruck-analyse"]',
    ];

    // Combine all selectors and find links
    const links = document.querySelectorAll(linkSelectors.join(','));
    console.log('Found links to update:', links.length);

    links.forEach((link) => {
      try {
        // Parse the current URL
        const url = new URL(link.href, window.location.origin);
        // Add or update the cid parameter
        url.searchParams.set('cid', clickId);
        // Update the link's href
        link.href = url.href;
        console.log('Updated link:', link.href);

        // Also add a click event listener as a backup
        link.addEventListener('click', function (e) {
          if (!this.href.includes('cid=')) {
            e.preventDefault();
            window.location.href =
              this.href +
              (this.href.includes('?') ? '&' : '?') +
              'cid=' +
              clickId;
          }
        });
      } catch (error) {
        console.error('Error updating link:', error, link);
      }
    });
  }

  // Bento Grid interactions
  const bentoCards = document.querySelectorAll('.bento-card');

  bentoCards.forEach((card) => {
    // Add click handler to entire card
    card.addEventListener('click', function () {
      // Get the CTA text element
      const cta = this.querySelector('.bento-cta');
      if (cta) {
        // Show the user we registered their click
        const originalText = cta.textContent;
        cta.textContent = 'Coming soon...';
        cta.style.opacity = '1';
        cta.style.transform = 'translateX(0)';

        // Reset after a delay
        setTimeout(() => {
          cta.textContent = originalText;
          if (!card.matches(':hover')) {
            cta.style.opacity = '0';
            cta.style.transform = 'translateX(-10px)';
          }
        }, 2000);
      }
    });

    // Add mouse move effect for subtle parallax
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element

      // Calculate rotation based on mouse position (subtle effect)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 30;
      const rotateY = (centerX - x) / 30;

      // Apply the transform
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });

    // Reset transform on mouse leave
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      setTimeout(() => {
        card.style.transform = 'translateY(0)';
      }, 100);
    });
  });

  // FAQ Accordion functionality
  const accordionItems = document.querySelectorAll('.accordion-item');
  console.log('Found accordion items:', accordionItems.length);

  function initializeAccordion() {
    // Close all accordion items first
    accordionItems.forEach((item) => {
      const content = item.querySelector('.accordion-content');
      if (content) {
        content.style.maxHeight = '0px';
        item.classList.remove('active');
      }
    });

    // Then open the first one
    if (accordionItems.length > 0) {
      const firstItem = accordionItems[0];
      firstItem.classList.add('active');
      const firstContent = firstItem.querySelector('.accordion-content');
      if (firstContent) {
        firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
      }
    }
  }

  // Initialize on page load
  initializeAccordion();

  // Add click handlers to all triggers
  accordionItems.forEach((item) => {
    const trigger = item.querySelector('.accordion-trigger');
    const content = item.querySelector('.accordion-content');

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Accordion trigger clicked');

        const isActive = item.classList.contains('active');

        // First close all items
        accordionItems.forEach((otherItem) => {
          otherItem.classList.remove('active');
          const otherContent =
            otherItem.querySelector('.accordion-content');
          if (otherContent) {
            otherContent.style.maxHeight = '0px';
          }
        });

        // If the clicked item wasn't already active, open it
        if (!isActive) {
          item.classList.add('active');
          if (content) {
            content.style.maxHeight = content.scrollHeight + 'px';
            console.log(
              'Opened accordion item, height:',
              content.scrollHeight
            );
          }
        }
      });
    }
  });

  // Add event listener for contact button
  const contactBtn = document.querySelector('.faq-contact-btn');
  if (contactBtn) {
    contactBtn.addEventListener('click', function () {
      alert(
        'Please contact us at support@bpersystem.com or call 1-800-BPER-SYS for assistance.'
      );
    });
  }
});

// Globale Variable, um den Timer zu speichern

// Intersection Observer für die Lampenkomponente
document.addEventListener('DOMContentLoaded', function () {
  const lampInner = document.querySelector('.lamp-inner');
  const lampGlowOrb = document.querySelector('.lamp-glow-orb');
  const lampLine = document.querySelector('.lamp-line');
  const lampHeading = document.querySelector('.lamp-heading');
  const lampGlowRight = document.querySelector('.lamp-glow-right');
  const lampGlowLeft = document.querySelector('.lamp-glow-left');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Starte die Animationen in einer bestimmten Reihenfolge
          if (lampGlowRight) lampGlowRight.classList.add('animate');
          if (lampGlowLeft) lampGlowLeft.classList.add('animate');

          // Verzögere die anderen Animationen
          setTimeout(() => {
            if (lampGlowOrb) lampGlowOrb.classList.add('animate');
          }, 100);

          setTimeout(() => {
            if (lampLine) lampLine.classList.add('animate');
          }, 300);

          setTimeout(() => {
            if (lampHeading) lampHeading.classList.add('animate');
          }, 600);

          // Beobachtung beenden, nachdem die Animationen gestartet wurden
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null, // Viewport als Referenz
      threshold: 0.25, // Animation startet, wenn 25% des Elements sichtbar sind
    }
  );

  // Starte die Beobachtung
  if (lampInner) {
    observer.observe(lampInner);
  }

  // Word-Animation starten, aber nur falls sie noch nicht läuft
});

