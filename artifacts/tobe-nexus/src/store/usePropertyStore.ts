import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Property } from '../types';

const ssrSafeStorage = createJSONStorage(() => {
  if (typeof window === 'undefined') {
    return { getItem: () => null, setItem: () => {}, removeItem: () => {} } as Storage;
  }
  return localStorage;
});

interface PropertyState {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updated_at'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getPropertyById: (id: string) => Property | undefined;
}

const DEMO_PROPERTY: Property = {
  id: 'demo-1',
  client_id: 'A0001',
  listing_type: 'C',
  listing_id: 'CHC0001',
  area_code: 'HC',
  subarea: '美崙',
  address_note: '海岸路（近海景公園）',
  property_type: '電梯大樓',
  price_wan: 1280,
  build_ping: 38.5,
  land_ping: 5.2,
  rooms: '3',
  halls: '2',
  baths: '1',
  balconies: '1',
  parking: '無車位',
  status_now: '銷售中',
  status_push: '強推',
  main_point: '景觀採光佳 | View & sunlight',
  second_point: '學區首選 | School district',
  target_buyer: '首購 | First-time buyer',
  must_say_3: '1. 步行至海岸5分鐘\n2. 明星學區環境\n3. 頂樓採光無遮蔽',
  notes_private: '屋主誠意出售，底價可談',
  img1_url:
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  img2_url: '',
  img3_url: '',
  img4_url: '',
  updated_at: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: [DEMO_PROPERTY],
      addProperty: (property) =>
        set((state) => ({
          properties: [
            {
              ...property,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...state.properties,
          ],
        })),
      updateProperty: (id, updatedFields) =>
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id
              ? { ...p, ...updatedFields, updated_at: new Date().toISOString() }
              : p
          ),
        })),
      deleteProperty: (id) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
        })),
      getPropertyById: (id) => get().properties.find((p) => p.id === id),
    }),
    {
      name: 'tobe-nexus-properties-v1',
      storage: ssrSafeStorage,
    }
  )
);
