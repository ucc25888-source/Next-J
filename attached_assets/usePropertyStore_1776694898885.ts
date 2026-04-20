import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property } from '../types';

interface PropertyState {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updated_at'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getPropertyById: (id: string) => Property | undefined;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: [
        {
          id: '1',
          client_id: 'A0001',
          listing_type: 'C',
          listing_id: 'CHC0001',
          area_code: 'HC',
          subarea: '信義計畫區',
          address_note: '松智路(近101)',
          property_type: '電梯大樓',
          price_wan: 8500,
          build_ping: 85.5,
          land_ping: 10.2,
          rooms: '4',
          halls: '2',
          baths: '3',
          balconies: '2',
          parking: '坡道平面(雙車位)',
          status_now: '銷售中',
          status_push: '強推',
          main_point: '高樓層景觀',
          second_point: '三面採光',
          target_buyer: '頂級換屋族',
          must_say_3: '1. 步行至捷運3分鐘\n2. 明星學區\n3. 24小時飯店式管理',
          notes_private: '屋主誠意出售，底價可談',
          img1_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
          img2_url: '',
          img3_url: '',
          img4_url: '',
          updated_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
      ],
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
            p.id === id ? { ...p, ...updatedFields, updated_at: new Date().toISOString() } : p
          ),
        })),
      deleteProperty: (id) =>
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
        })),
      getPropertyById: (id) => get().properties.find((p) => p.id === id),
    }),
    {
      name: 'property-storage-v2', // 更新 storage name 避免舊資料格式衝突
    }
  )
);
