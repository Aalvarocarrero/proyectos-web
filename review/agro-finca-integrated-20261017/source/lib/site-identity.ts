/** Keep the live origin until DNS, TLS and account callbacks have been verified. */
export const SITE_ORIGIN = typeof __PUBLIC_SITE_ORIGIN__ === "undefined" ? "https://venezuelaagro.aalvarocarrero.chatgpt.site" : __PUBLIC_SITE_ORIGIN__;
export const FUTURE_ORIGIN = "https://venezuelaagro.com";
export const PLATFORM_NAME = "VenezuelaAgro";
export const PLATFORM_ENDORSEMENT = "Hecho por Parcela Los Morochos";
export const DOMAIN_STATUS = "domain-unverified"; // A build setting is not evidence of DNS/TLS verification.
