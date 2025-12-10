// Google Analytics 4 Event Tracking Utility
// GA4 Measurement ID: G-WKNSVC2L82

/**
 * Send event to Google Analytics 4
 * @param {string} eventName - The name of the event
 * @param {object} params - Event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// ============ CONVERSION EVENTS ============

/**
 * Track when user signs up
 */
export function trackSignUp(method = 'email') {
  trackEvent('sign_up', { method });
}

/**
 * Track when user starts checkout
 */
export function trackBeginCheckout(plan, billingPeriod, value) {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: value,
    items: [{
      item_name: plan,
      item_category: billingPeriod,
      price: value,
      quantity: 1
    }]
  });
}

/**
 * Track successful purchase
 */
export function trackPurchase(transactionId, plan, billingPeriod, value) {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value: value,
    items: [{
      item_name: plan,
      item_category: billingPeriod,
      price: value,
      quantity: 1
    }]
  });
}

/**
 * Track app download
 */
export function trackDownload(platform, fileType) {
  trackEvent('file_download', {
    file_name: `SACVPN_${platform}`,
    file_extension: fileType,
    link_text: `Download for ${platform}`
  });
}

// ============ ENGAGEMENT EVENTS ============

/**
 * Track pricing page view
 */
export function trackViewPricing() {
  trackEvent('view_item_list', {
    item_list_name: 'Pricing Plans'
  });
}

/**
 * Track plan selection
 */
export function trackPlanSelected(planName, price, billingPeriod) {
  trackEvent('select_item', {
    item_list_name: 'Pricing Plans',
    items: [{
      item_name: planName,
      item_category: billingPeriod,
      price: price
    }]
  });
}

/**
 * Track billing period change
 */
export function trackBillingPeriodChange(period) {
  trackEvent('billing_period_change', {
    billing_period: period
  });
}

/**
 * Track platform selection on download page
 */
export function trackPlatformSelected(platform) {
  trackEvent('platform_selected', {
    platform: platform
  });
}

/**
 * Track FAQ expansion
 */
export function trackFaqExpanded(questionText) {
  trackEvent('faq_expanded', {
    question: questionText.substring(0, 100) // Truncate for GA
  });
}

/**
 * Track blog post read
 */
export function trackBlogRead(postTitle, postSlug, category) {
  trackEvent('blog_read', {
    article_title: postTitle,
    article_slug: postSlug,
    article_category: category
  });
}

/**
 * Track contact form submission
 */
export function trackContactFormSubmit(subject) {
  trackEvent('generate_lead', {
    lead_source: 'contact_form',
    subject: subject
  });
}

/**
 * Track CTA button clicks
 */
export function trackCtaClick(ctaName, location) {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: location
  });
}

/**
 * Track login
 */
export function trackLogin(method = 'email') {
  trackEvent('login', { method });
}

/**
 * Track logout
 */
export function trackLogout() {
  trackEvent('logout');
}
