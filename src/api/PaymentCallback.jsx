// src/api/base44Client.js
// Mock - safe placeholder so imports don't break

export const base44 = {
  auth: {
    me: async () => ({ id: 'demo', email: 'demo@hireresq.com', subscription: 'paid' }),
  },
  track: () => console.log('[mock] Tracking event'),
  // add any other methods your Pricing page might call
};