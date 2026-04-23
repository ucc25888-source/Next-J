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
    const tempId = `temp-${crypto.randomUUID()}`;
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
        body: JSON.stringify(property),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        // Revert optimistic update
        set((state) => ({ properties: state.properties.filter((p) => p.id !== tempId) }));
        throw new Error(errBody?.error ?? `儲存失敗（${res.status}），請重試`);
      }

      const { property: saved } = await res.json();
      set((state) => ({
        properties: state.properties.map((p) => (p.id === tempId ? saved : p)),
      }));
    } catch (err) {
      // If it's already our thrown error, re-throw; otherwise it's a network error
      if (err instanceof Error && (err.message.includes('儲存失敗') || err.message.includes('Failed to fetch'))) {
        // Revert optimistic if still present
        set((state) => ({ properties: state.properties.filter((p) => p.id !== tempId) }));
        throw new Error(err.message.includes('Failed to fetch') ? '網路錯誤，請確認網路後重試' : err.message);
      }
      throw err;
    }
  },

  updateProperty: async (id, updatedFields) => {
    const original = get().properties.find((p) => p.id === id);
    const now = new Date().toISOString();
    set((state) => ({
      properties: state.properties.map((p) =>
        p.id === id ? { ...p, ...updatedFields, updated_at: now } : p
      ),
    }));

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) {
        // Revert
        if (original) {
          set((state) => ({
            properties: state.properties.map((p) => (p.id === id ? original : p)),
          }));
        }
        throw new Error(`更新失敗（${res.status}），請重試`);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('更新失敗')) throw err;
      if (original) {
        set((state) => ({
          properties: state.properties.map((p) => (p.id === id ? original : p)),
        }));
      }
      throw new Error('網路錯誤，請確認網路後重試');
    }
  },

  deleteProperty: async (id) => {
    const original = get().properties.find((p) => p.id === id);
    set((state) => ({
      properties: state.properties.filter((p) => p.id !== id),
    }));

    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok && original) {
        set((state) => ({ properties: [original, ...state.properties] }));
      }
    } catch {
      if (original) {
        set((state) => ({ properties: [original, ...state.properties] }));
      }
    }
  },

  getPropertyById: (id) => get().properties.find((p) => p.id === id),
}));
