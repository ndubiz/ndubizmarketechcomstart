(function () {
  "use strict";

  const MEASUREMENT_ID = "G-CSVVQ7F9EZ";
  const CONSENT_KEY = "ndubiz-analytics-consent";
  const campaign = new URLSearchParams(location.search);
  let testTraffic = campaign.get('utm_source') === 'codex_test';
  // Keep a labelled test journey labelled after following internal links.
  try {
    if (testTraffic) sessionStorage.setItem('ndubiz-analytics-test', '1');
    testTraffic = testTraffic || sessionStorage.getItem('ndubiz-analytics-test') === '1';
  } catch (_) {}
  let analyticsAllowed = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });

  function startAnalytics() {
    if (document.querySelector('script[data-ndubiz-ga4]')) return;
    analyticsAllowed = true;
    window.gtag("consent", "update", { analytics_storage: "granted" });
    const script = document.createElement("script");
    script.async = true;
    script.dataset.ndubizGa4 = "true";
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { send_page_view: true, ...(testTraffic ? {debug_mode:true, traffic_type:'internal'} : {}) });
  }

  function saveChoice(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (_) {}
  }

  function showConsentChoice() {
    const panel = document.createElement("aside");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Analytics preferences");
    panel.style.cssText = "position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:760px;margin:auto;padding:18px;border:1px solid #d8deea;border-radius:14px;background:#fff;color:#172033;box-shadow:0 12px 38px rgba(23,32,51,.2);font:15px/1.45 Arial,sans-serif";
    panel.innerHTML = '<strong style="display:block;font-size:17px;margin-bottom:6px">Help us improve Ndubiz</strong><span>With your permission, Google Analytics helps us understand which guides are useful. Analytics is optional and advertising storage stays disabled.</span><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button type="button" data-choice="accept" style="border:0;border-radius:9px;padding:10px 16px;background:#5636d8;color:#fff;font-weight:700;cursor:pointer">Accept analytics</button><button type="button" data-choice="decline" style="border:1px solid #bac3d3;border-radius:9px;padding:10px 16px;background:#fff;color:#172033;font-weight:700;cursor:pointer">Continue without analytics</button><a href="/privacy.html" style="align-self:center;color:#5636d8;font-weight:700">Privacy details</a></div>';
    panel.addEventListener("click", function (event) {
      const button = event.target.closest("button[data-choice]");
      if (!button) return;
      const choice = button.dataset.choice;
      saveChoice(choice);
      if (choice === "accept") startAnalytics();
      panel.remove();
    });
    document.body.appendChild(panel);
  }

  function isAffiliateLink(link) {
    const rel = (link.getAttribute("rel") || "").toLowerCase().split(/\s+/);
    if (link.hasAttribute("data-affiliate") || rel.includes("sponsored")) return true;
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return false; }
    const host = url.hostname.toLowerCase();
    const isAmazon = /(^|\.)amazon\.(com|de)$/.test(host);
    // Retailer reference links without an affiliate tag are ordinary outbound clicks.
    return (isAmazon && Boolean(url.searchParams.get("tag"))) ||
      host === "amzn.to" || host === "tidd.ly" ||
      host === "awin1.com" || host.endsWith(".awin1.com") ||
      ((host === "switch-bot.com" || host.endsWith(".switch-bot.com")) &&
        Boolean(url.searchParams.get("sca_ref"))) ||
      url.searchParams.get("ref") === "jouwifmu";
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || typeof window.gtag !== "function") return;
    let destination;
    try { destination = new URL(link.href, location.href); } catch (_) { return; }
    if (!/^https?:$/.test(destination.protocol)) return;
    const internal = destination.origin === location.origin;
    const reviewClick = internal && /-review(?:\.html)?$/.test(destination.pathname) && destination.pathname !== location.pathname;
    if (internal && !reviewClick) return;
    const eventName = reviewClick ? "review_click" : (isAffiliateLink(link) ? "affiliate_click" : "outbound_click");
    // Do not queue pre-consent clicks and send them later after acceptance.
    if (!analyticsAllowed) return;
    const card = link.closest('article, section, .card, [data-product]');
    const cardHeading = card && card.querySelector('h3, h2');
    const heading = document.querySelector('h1');
    const productName = link.dataset.product || (cardHeading && cardHeading.textContent) || (heading && heading.textContent) || link.textContent || 'External link';
    window.gtag("event", eventName, {
      product_name: productName.replace(/\s+/g, " ").trim().slice(0, 120),
      link_url: link.href,
      link_domain: new URL(link.href, location.href).hostname,
      page_path: location.pathname,
      ...(testTraffic ? {debug_mode:true, traffic_type:'internal'} : {}),
      ...(link.dataset.ctaPosition ? {cta_position:link.dataset.ctaPosition} : {}),
      campaign_source: link.dataset.campaignSource || campaign.get("utm_source") || undefined,
      campaign_medium: link.dataset.campaignMedium || campaign.get("utm_medium") || undefined,
      campaign_name: link.dataset.campaignName || campaign.get("utm_campaign") || undefined,
      campaign_content: campaign.get("utm_content") || undefined,
      transport_type: "beacon"
    });
  }, true);

  function initializeAnalytics() {
    let choice = null;
    try { choice = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    if (choice === "accept") startAnalytics();
    else if (choice !== "decline") showConsentChoice();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeAnalytics, { once: true });
  else initializeAnalytics();
})();

