/* Ndubiz Market Tech - outbound affiliate and cross-site click reporting.
   Records clicks only; it does not confirm purchases or commissions. */
(function () {
  "use strict";

  const ENDPOINT = "https://formspree.io/f/xvkopppg";
  const SITE_NAME = "Ndubiz Market Tech";
  const NDUBIZ_HOSTS = new Set([
    "ndubizmarketcomstart.com",
    "www.ndubizmarketcomstart.com",
    "ndubizmarketechcomstart.com",
    "www.ndubizmarketechcomstart.com",
    "ndubiz.github.io"
  ]);
  let lastClickKey = "";
  let lastClickAt = 0;

  function affiliateLinkFromEvent(event) {
    const link = event.target && event.target.closest
      ? event.target.closest("a[href]")
      : null;
    if (!link) return null;

    let target;
    try {
      target = new URL(link.href, window.location.href);
    } catch (_) {
      return null;
    }

    const rel = (link.getAttribute("rel") || "").toLowerCase().split(/\s+/);
    const isMarkedAffiliate = rel.includes("sponsored") || link.dataset.affiliate === "true";
    const isCrossSite = NDUBIZ_HOSTS.has(target.hostname) && target.origin !== window.location.origin;
    const isOutbound = target.protocol.startsWith("http") && target.origin !== window.location.origin;
    if (!isOutbound || (!isMarkedAffiliate && !isCrossSite)) return null;
    return { link, target, eventType: isMarkedAffiliate ? "affiliate_click" : "cross_site_click" };
  }

  function sourceName() {
    const params = new URLSearchParams(window.location.search);
    const taggedSource = (params.get("utm_source") || "").trim().slice(0, 80);
    if (taggedSource) return taggedSource;
    if (!document.referrer) return "direct";
    try {
      return new URL(document.referrer).hostname.replace(/^www\./, "").slice(0, 120);
    } catch (_) {
      return "referral";
    }
  }

  function reportClick(link, target, eventType) {
    const product = (link.dataset.product || link.textContent || "Affiliate product")
      .replace(/\s+/g, " ").trim().slice(0, 120);
    const now = Date.now();
    const key = window.location.pathname + "|" + target.href + "|" + product;
    if (key === lastClickKey && now - lastClickAt < 2500) return;
    lastClickKey = key;
    lastClickAt = now;

    const payload = {
      _subject: "Ndubiz " + (eventType === "affiliate_click" ? "affiliate" : "cross-site") + " click - " + product,
      event_type: eventType,
      website: SITE_NAME,
      product: product,
      destination: target.href,
      destination_host: target.hostname,
      page: window.location.origin + window.location.pathname,
      source: sourceName(),
      campaign: (new URLSearchParams(window.location.search).get("utm_campaign") || "")
        .trim().slice(0, 100),
      time_utc: new Date().toISOString()
    };

    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin"
    }).catch(function () {
      // Tracking must never delay or block the visitor's destination.
    });
  }

  document.addEventListener("click", function (event) {
    const match = affiliateLinkFromEvent(event);
    if (match) reportClick(match.link, match.target, match.eventType);
  }, true);
})();
