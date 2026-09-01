const PRIMARY_HOST = "ndubizmarketcomstart.com";
const LEGACY_HOSTS = new Set([
  "ndubizmarketechcomstart.com",
  "www.ndubizmarketechcomstart.com",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (LEGACY_HOSTS.has(url.hostname.toLowerCase())) {
      url.protocol = "https:";
      url.hostname = PRIMARY_HOST;
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
