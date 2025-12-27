import { cookies } from "next/headers";
import crypto from "crypto";

export type EntitlementState = {
  isSubscriber: boolean;
  expiresAt: number;
  remainingOneTimeCredits: number;
};

export type Entitlements = EntitlementState & {
  canGenerate: boolean;
  canExportPdf: boolean;
  canExportDocx: boolean;
  canExportTxt: boolean;
  canEmail: boolean;
};

const COOKIE_NAME = "hoa_entitlements";
const FALLBACK_SECRET = "hoa-letter-secret";
const SECRET = (process.env.ENTITLEMENTS_SECRET || process.env.STRIPE_WEBHOOK_SECRET || FALLBACK_SECRET).slice(0, 64);
const DAY_MS = 24 * 60 * 60 * 1000;

function signToken(payload: EntitlementState) {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function encodeEntitlementState(payload: EntitlementState) {
  return signToken(payload);
}

function verifyToken(token?: string | null): EntitlementState | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload?.expiresAt !== "number") return null;
    if (Date.now() > payload.expiresAt) return null;
    return {
      isSubscriber: Boolean(payload.isSubscriber),
      expiresAt: payload.expiresAt,
      remainingOneTimeCredits: Math.max(0, Number(payload.remainingOneTimeCredits || 0)),
    };
  } catch {
    return null;
  }
}

export function grantEntitlements(mode: "subscription" | "one-time"): { token: string; state: EntitlementState } {
  const state: EntitlementState = {
    isSubscriber: mode === "subscription",
    expiresAt: Date.now() + (mode === "subscription" ? 30 * DAY_MS : DAY_MS),
    remainingOneTimeCredits: mode === "subscription" ? 0 : 1,
  };
  return { token: signToken(state), state };
}

function defaults(): Entitlements {
  return {
    isSubscriber: false,
    expiresAt: 0,
    remainingOneTimeCredits: 0,
    canGenerate: true,
    canExportPdf: false,
    canExportDocx: false,
    canExportTxt: false,
    canEmail: false,
  };
}

function mapStateToEntitlements(state: EntitlementState | null): Entitlements {
  const base = defaults();
  if (!state) return base;
  const paywallEnabled = process.env.PAYWALL_ENFORCED !== "false";
  const canUsePaid = !paywallEnabled || state.isSubscriber || state.remainingOneTimeCredits > 0;
  return {
    ...base,
    ...state,
    canGenerate: true,
    canExportPdf: canUsePaid,
    canExportDocx: canUsePaid,
    canExportTxt: canUsePaid,
    canEmail: canUsePaid,
  };
}

export function getEntitlementsFromCookies(): Entitlements {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const state = verifyToken(token);
  return mapStateToEntitlements(state);
}

export function consumeCredit(state: EntitlementState): EntitlementState {
  if (state.isSubscriber) return state;
  return {
    ...state,
    remainingOneTimeCredits: Math.max(0, (state.remainingOneTimeCredits || 0) - 1),
  };
}

export function entitlementsCookieOptions(maxAgeMs: number) {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

export function serializeEntitlementCookie(token: string, expiresAt: number) {
  const opts = entitlementsCookieOptions(expiresAt - Date.now());
  return `${opts.name}=${token}; Path=${opts.path}; HttpOnly; SameSite=${opts.sameSite}; Secure; Max-Age=${opts.maxAge}`;
}

export function clearEntitlementsCookie() {
  const opts = entitlementsCookieOptions(0);
  return `${opts.name}=; Path=${opts.path}; HttpOnly; SameSite=${opts.sameSite}; Secure; Max-Age=0`;
}

export function ensureEntitled(capability: keyof Pick<Entitlements, "canExportDocx" | "canExportPdf" | "canExportTxt" | "canEmail">) {
  const entitlements = getEntitlementsFromCookies();
  const allowed = entitlements[capability];
  const state = verifyToken(cookies().get(COOKIE_NAME)?.value || "");
  return { allowed, entitlements, state };
}
