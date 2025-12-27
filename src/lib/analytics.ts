export type AnalyticEvent =
  | "view_pricing"
  | "click_checkout_one_time"
  | "click_checkout_subscription"
  | "checkout_success"
  | "generate_letter"
  | "export_pdf"
  | "export_docx"
  | "export_txt"
  | "send_email"
  | "paywall_shown";

type Payload = Record<string, any>;

const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;

export function track(event: AnalyticEvent, props?: Payload) {
  if (typeof window === "undefined") return;
  if (provider === "console" || !provider) {
    console.info(`[analytics] ${event}`, props || {});
    return;
  }
  const plausible = (window as any).plausible;
  if (provider === "plausible" && typeof plausible === "function") {
    plausible(event, { props });
    return;
  }
  // Fallback to simple beacon
  try {
    navigator.sendBeacon?.("/api/analytics", JSON.stringify({ event, props }));
  } catch (e) {
    console.debug("Analytics skipped", e);
  }
}
