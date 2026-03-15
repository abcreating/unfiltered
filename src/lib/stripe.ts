import Stripe from "stripe";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });
}

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = getStripeClient();
  }
  return _stripe;
}

// Lazy getter for backwards compat
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop];
  },
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID || "";
