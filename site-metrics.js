(function () {
  "use strict";

  const MEASUREMENT_ID = "G-CSVVQ7F9EZ";
  const CONSENT_KEY = "ndubiz-analytics-consent";

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
    window.gtag("consent", "update", { analytics_storage: "granted" });
    const script = document.createElement("script");
    script.async = true;
    script.dataset.ndubizGa4 = "true";
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", MEASUREMENT_ID, { send_page_view: true });
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
    const href = link.href || "";
    const rel = (link.getAttribute("rel") || "").toLowerCase();
    return link.hasAttribute("data-affiliate") || rel.includes("sponsored") ||
      /amazon\.(com|de)|amzn\.to|tag=gearhub-20|tag=aigearhub2103-21|ref=jouwifmu/i.test(href);
  }

  document.addEventListener("click", function (event) {
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || !isAffiliateLink(link) || typeof window.gtag !== "function") return;
    window.gtag("event", "affiliate_click", {
      product_name: (link.dataset.product || link.textContent || "Affiliate product").replace(/\s+/g, " ").trim().slice(0, 120),
      link_url: link.href,
      link_domain: new URL(link.href, location.href).hostname,
      page_path: location.pathname,
      transport_type: "beacon"
    });
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    let choice = null;
    try { choice = localStorage.getItem(CONSENT_KEY); } catch (_) {}
    if (choice === "accept") startAnalytics();
    else if (choice !== "decline") showConsentChoice();
  });
})();
