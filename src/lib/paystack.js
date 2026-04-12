// src/lib/paystack.js

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

if (!PAYSTACK_PUBLIC_KEY) {
  throw new Error("Paystack key is missing in environment variables");
}

console.log("🚀 PAYSTACK KEY:", PAYSTACK_PUBLIC_KEY);

export const PAYSTACK_CONFIG = {
  publicKey: PAYSTACK_PUBLIC_KEY,
  currency: "ZAR",
  channels: ["card", "bank_transfer", "qr"],
  metadata: {
    source: "HireResQ",
  },
};

export const initializePaystack = (email, amount, metadata = {}) => {
  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email,
      amount: amount * 100,
      currency: PAYSTACK_CONFIG.currency,
      channels: PAYSTACK_CONFIG.channels,
      metadata: {
        ...PAYSTACK_CONFIG.metadata,
        ...metadata,
      },
      callback: resolve,
      onClose: () => reject(new Error("Payment window closed")),
    });

    handler.openIframe();
  });
};