const STORAGE_KEY = 'app_onboarding_data';

export const mockEntities = {
  Onboarding: {
    async create(data) {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const newItem = { id: Date.now().toString(), ...data, createdAt: new Date() };
      items.push(newItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      return newItem;
    },
    async list() {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },
    
  }
};