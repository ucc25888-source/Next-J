import { create } from 'zustand';
import { Area, Subarea, Client, Copy, Counter, OptionItem } from '../types';

interface SystemState {
  currentClient: Client | null;
  areas: Area[];
  subareas: Subarea[];
  copies: Copy[];
  counters: Counter[];
  mainPoints: OptionItem[];
  landPoints: OptionItem[];
  targetBuyers: OptionItem[];
  propertyTypes: OptionItem[];
  parkingOptions: OptionItem[];
  statusNowOptions: OptionItem[];
  statusPushOptions: OptionItem[];
  roomOptions: OptionItem[];
  hallOptions: OptionItem[];
  bathOptions: OptionItem[];
  balconyOptions: OptionItem[];
  setCurrentClient: (client: Client | null) => void;
  addCopy: (copy: Copy) => void;
  markCopyAsUsed: (copy_id: string) => void;
  incrementUsage: () => void;
  getNextListingId: (clientId: string, type: 'C' | 'B', areaCode?: string) => string;
}

const mockAreas: Area[] = [
  { area_code: 'HC', area_name: '花蓮市 | HC', active: true },
  { area_code: 'JA', area_name: '吉安 | JA', active: true },
  { area_code: 'XC', area_name: '新城 | XC', active: true },
  { area_code: 'SL', area_name: '秀林 | SL', active: true },
  { area_code: 'SF', area_name: '壽豐 | SF', active: true },
  { area_code: 'FL', area_name: '鳳林 | FL', active: true },
  { area_code: 'KF', area_name: '光復 | KF', active: true },
  { area_code: 'RS', area_name: '瑞穗 | RS', active: true },
  { area_code: 'YL', area_name: '玉里 | YL', active: true },
  { area_code: 'FR', area_name: '富里 | FR', active: true },
  { area_code: 'OT', area_name: '其他 | OT', active: true },
];

const mockSubareas: Subarea[] = [
  { area_code: 'HC', subarea: '市中心', active: true, admin_district: '花蓮市', strategy: '賣地段、賣繁華' },
  { area_code: 'HC', subarea: '站前', active: true, admin_district: '花蓮市', strategy: '賣交通、賣收租' },
  { area_code: 'HC', subarea: '美崙', active: true, admin_district: '花蓮市', strategy: '賣文教、賣氣質' },
  { area_code: 'HC', subarea: '北濱', active: true, admin_district: '花蓮市', strategy: '賣海景、賣觀光' },
  { area_code: 'JA', subarea: '北昌', active: true, admin_district: '吉安鄉', strategy: '賣機能、賣便利' },
  { area_code: 'JA', subarea: '太昌', active: true, admin_district: '吉安鄉', strategy: '賣機能、賣便利' },
  { area_code: 'JA', subarea: '慶豐', active: true, admin_district: '吉安鄉', strategy: '賣潛力、賣別墅' },
  { area_code: 'JA', subarea: '南埔', active: true, admin_district: '吉安鄉', strategy: '賣門戶、賣熱鬧' },
  { area_code: 'JA', subarea: '南海 / 南濱', active: true, admin_district: '吉安鄉', strategy: '賣空間、賣休閒' },
  { area_code: 'JA', subarea: '吉安車站', active: true, admin_district: '吉安鄉', strategy: '賣純住、賣安靜' },
  { area_code: 'XC', subarea: '北埔', active: true, admin_district: '新城鄉', strategy: '賣超值、賣機能' },
  { area_code: 'XC', subarea: '新城', active: true, admin_district: '新城鄉', strategy: '賣門戶、賣增值' },
  { area_code: 'SL', subarea: '秀林', active: true, admin_district: '秀林鄉', strategy: '賣山景、賣空靈' },
  { area_code: 'SF', subarea: '壽豐', active: true, admin_district: '壽豐鄉', strategy: '賣慢活、賣東華' },
  { area_code: 'FL', subarea: '鳳林', active: true, admin_district: '鳳林鎮', strategy: '賣慢城、賣長壽' },
  { area_code: 'KF', subarea: '光復', active: true, admin_district: '光復鄉', strategy: '賣糖廠、賣生態' },
  { area_code: 'RS', subarea: '瑞穗', active: true, admin_district: '瑞穗鄉', strategy: '賣溫泉、賣度假' },
  { area_code: 'YL', subarea: '玉里', active: true, admin_district: '玉里鎮', strategy: '賣南區、賣樞紐' },
  { area_code: 'FR', subarea: '富里', active: true, admin_district: '富里鄉', strategy: '賣米鄉、賣景觀' },
  { area_code: 'OT', subarea: '其他', active: true, admin_district: '其他', strategy: '賣特殊、賣緣分' },
];

const mockClient: Client = {
  client_id: 'A0001',
  display_name: '福哥',
  login_token: 'A0001_token',
  plan_name: 'basic',
  monthly_quota: 300,
  month_key: '202604',
  used_this_month: 0,
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
};

export const useSystemStore = create<SystemState>()((set, get) => ({
  currentClient: mockClient,
  areas: mockAreas,
  subareas: mockSubareas,
  copies: [],
  counters: [{ key: 'LISTING_HC', value: 1, updated_at: '2026-01-01T00:00:00.000Z' }],
  landPoints: [
    { value: '地形方正漂亮' },
    { value: '大面寬好規劃' },
    { value: '臨大馬路好進出' },
    { value: '特定農業區' },
    { value: '建商開發首選' },
    { value: '可蓋夢想家' },
    { value: '投資重劃核心' },
    { value: '合法資材室' },
    { value: '產權單純乾淨' },
    { value: '變更潛力大' },
    { value: '稀有大坪數' },
    { value: '可當農場民宿' },
    { value: '適合資產配置' },
    { value: '節稅規劃首選' },
    { value: '水源路徑清晰' },
    { value: '地形平坦好用' },
  ],
  mainPoints: [
    { value: '低於實價登錄 | Below market' },
    { value: '低總價好入手 | Affordable' },
    { value: '高投報收租 | High rental yield' },
    { value: '可隔套/好出租 | Easy to rent' },
    { value: '學區首選 | School district' },
    { value: '近市區機能 | City convenience' },
    { value: '交通便利/近車站 | Transit access' },
    { value: '景觀採光佳 | View & sunlight' },
    { value: '格局方正 | Great layout' },
    { value: '有車位 | Parking' },
    { value: '屋況佳/免整理 | Move-in ready' },
    { value: '新屋/新裝潢 | New / renovated' },
    { value: '稀有釋出 | Rare listing' },
    { value: '急售可談 | Motivated seller' },
    { value: '店住/金店面 | Shop + home' },
    { value: '角間/面寬 | Corner / wide frontage' },
    { value: '重劃/開發潛力 | Development potential' },
    { value: '近公園/生活圈 | Near park' },
    { value: '近海/山景 | Sea/Mountain view' },
    { value: '電梯大樓管理佳 | Elevator & management' },
    { value: '屋齡新 | Low age' },
    { value: '低公設比 | Low shared area' },
    { value: '一層一戶 | One unit per floor' },
    { value: '邊間三面採光 | 3-side light' },
    { value: '可當民宿/工作室 | B&B / studio' },
  ],
  targetBuyers: [
    { value: '首購 | First-time buyer' },
    { value: '小家庭 | Small family' },
    { value: '換屋族 | Upgrader' },
    { value: '投資收租 | Investor' },
    { value: '退休養生 | Retirement' },
    { value: '店面自營 | Business owner' },
    { value: '民宿圓夢 | B&B dreamer' },
    { value: '學區家長 | Parents' },
    { value: '外地置產 | Out-of-town buyer' },
    { value: '自住+保值 | Live + value' },
  ],
  propertyTypes: [
    { value: '電梯大樓 / 華廈' },
    { value: '步梯公寓' },
    { value: '透天厝 (住宅)' },
    { value: '透天厝 (店住)' },
    { value: '別墅 / 莊園' },
    { value: '純店面 / 商用辦公' },
    { value: '土地 / 農地' },
    { value: '建地 / 工業地' },
  ],
  parkingOptions: [
    { value: '無車位' },
    { value: '有車位' },
    { value: '可租車位' },
    { value: '可另購車位' },
  ],
  statusNowOptions: [
    { value: '新進案' },
    { value: '銷售中' },
    { value: '議價中' },
    { value: '洽談中' },
    { value: '已成交' },
    { value: '暫停' },
    { value: '評估排除' },
  ],
  statusPushOptions: [
    { value: '待場勘拍照' },
    { value: '文案排版中' },
    { value: '全網熱銷中' },
    { value: '追蹤議價回報' },
    { value: '開發/續約洽談' },
    { value: '同業狀況確認' },
    { value: '結案撤稿' },
    { value: '戰略放棄' },
  ],
  roomOptions: [{ value: '0' }, { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }, { value: '6+' }],
  hallOptions: [{ value: '0' }, { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }, { value: '6' }],
  bathOptions: [{ value: '0' }, { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }, { value: '6' }],
  balconyOptions: [{ value: '0' }, { value: '1' }, { value: '2' }, { value: '3' }, { value: '4' }, { value: '5' }, { value: '6' }],
  setCurrentClient: (client) => set({ currentClient: client }),
  addCopy: (copy) => set((state) => ({ copies: [copy, ...state.copies] })),
  incrementUsage: () =>
    set((state) => {
      if (!state.currentClient) return state;
      return {
        currentClient: {
          ...state.currentClient,
          used_this_month: state.currentClient.used_this_month + 1,
        },
      };
    }),
  markCopyAsUsed: (copy_id) =>
    set((state) => ({
      copies: state.copies.map((c) =>
        c.copy_id === copy_id ? { ...c, used: true } : c
      ),
    })),
  getNextListingId: (clientId, type, areaCode) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    let key = '';
    let prefix = '';
    if (type === 'C') {
      if (!areaCode) return '';
      key = `LISTING_${clientId}_${areaCode}`;
      prefix = `C${areaCode}`;
    } else {
      key = `BUYER_${clientId}_${dateStr}`;
      prefix = `B${dateStr}-`;
    }
    const { counters } = get();
    const counter = counters.find((c) => c.key === key);
    const nextValue = counter ? counter.value + 1 : 1;
    set((state) => {
      const newCounters = state.counters.filter((c) => c.key !== key);
      newCounters.push({ key, value: nextValue, updated_at: new Date().toISOString() });
      return { counters: newCounters };
    });
    if (type === 'C') return `${prefix}${String(nextValue).padStart(4, '0')}`;
    return `${prefix}${String(nextValue).padStart(2, '0')}`;
  },
}));
