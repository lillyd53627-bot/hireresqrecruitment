// src/lib/mockBase44.js
// Mock Base44 SDK for local development & demo

const mockUser = {
  id: 'demo-user-123',
  email: 'demo@hireresq.com',
  name: 'Demo Recruiter',
  subscription: 'paid',
  role: 'admin',
};

const mockCompanies = [
  { id: '1', name: 'TechCorp SA', industry: 'Technology', location: 'Cape Town' },
  { id: '2', name: 'FinanceHub', industry: 'Finance', location: 'Johannesburg' },
  { id: '3', name: 'RetailMax', industry: 'Retail', location: 'Durban' },
];

export const base44 = {
  auth: {
    me: async () => mockUser,
    redirectToLogin: () => console.log('[mock] Redirecting to login...'),
  },
  entities: {
    Company: {
      list: async () => mockCompanies,
      create: async (data) => {
        console.log('[mock] Creating company:', data);
        return { id: Date.now().toString(), ...data };
      },
      update: async (id, data) => {
        console.log('[mock] Updating company:', id, data);
        return { id, ...data };
      },
      delete: async (id) => {
        console.log('[mock] Deleting company:', id);
        return true;
      },
    },
    Candidate: {
      list: async () => [
        { id: '1', name: 'Sarah Johnson', title: 'Senior Engineer', match_score: 95 },
        { id: '2', name: 'Michael Chen', title: 'Product Manager', match_score: 88 },
      ],
      update: async (id, data) => {
        console.log('[mock] Updating candidate notes:', id, data);
        return true;
      },
    },
    // Add more mocked entities as needed (Job, Invoice, etc.)
  },
  functions: {
    invoke: async (name, payload) => {
      console.log(`[mock function] ${name} called with:`, payload);
      // Simulate success response
      return { success: true, message: 'Mock success' };
    },
  },
};