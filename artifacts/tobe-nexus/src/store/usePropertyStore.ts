import { create } from 'zustand';
import { Property } from '../types';

interface PropertyState {
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updated_at'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertyById: (id: string) => Property | undefined;
}

export const usePropertyStore = create<PropertyState>()((set, get) => ({
  properties: [],

  setProperties: (properties) => set({ properties }),

  addProperty: async (property) => {
    const tempId = crypto.randomUUID();
    const now = new Date().toISOString();
    const optimistic: Property = {
      ...property,
      id: tempId,
      createdAt: now,
      updated_at: now,
    };
    set((state) => ({ properties: [optimistic, ...state.properties] }));

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...property, id: tempId }),
      });
      if (res.ok) {
        const { property: saved } = await res.json();
        set((state) => ({
          properties: state.properties.map((p) => (p.id === tempId ? saved : p)),
        }));
      }
    } catch {
      // Keep optimistic update; will sync on next page load
    }
  },

  updateProperty: async (id, updatedFields) => {
    const now = new Date().toISOString();
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...updatedFields, updated_at: now } : p
      ),
    }));

    try {
      await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch {
      // Optimistic update kept; will resync on refresh
    }
  },

  deleteProperty: async (id) => {
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));

    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
    } catch {
      // Already removed from UI; DB will sync eventually
    }
  },

  getPropertyById: (id) => get().properties.find((p) => p.id === id),
}));
