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
  shopPoints: OptionItem[];
  villaPoints: OptionItem[];
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
  has_line_service: false,
};

export const useSystemStore = create<SystemState>()((set, get) => ({
  currentClient: null,
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
  shopPoints: [
    { value: '東大門夜市/觀光商圈核心' },
    { value: '商店街整排/人潮聚集' },
    { value: '觀光客動線必經' },
    { value: '自強夜市周邊商圈' },
    { value: '黃金路段/人流旺' },
    { value: '一樓黃金店面' },
    { value: '大面寬好招牌' },
    { value: '角間三面曝光' },
    { value: '主幹道臨路' },
    { value: '近重慶市場/生活圈' },
    { value: '近市八市場/生活圈' },
    { value: '近美崙市場/生活圈' },
    { value: '近黃昏市場/人潮旺' },
    { value: '近太昌市場/社區商圈' },
    { value: '近花蓮火車站/轉運站' },
    { value: '近學校/補習班聚集' },
    { value: '近醫院/長照機構' },
    { value: '近銀行/公家機關' },
    { value: '社區型穩定老客群' },
    { value: '附設停車位' },
    { value: '騎樓完整好停車' },
    { value: '現租金收益中' },
    { value: '高投報穩收租' },
    { value: '租客可承接' },
    { value: '空屋/即刻進駐' },
    { value: '適合餐飲/手搖店' },
    { value: '適合零售/服務業' },
    { value: '適合診所/醫美' },
    { value: '適合長照/日照服務' },
    { value: '適合補習班/教育' },
    { value: '適合倉儲/物流' },
    { value: '適合辦公室/工作室' },
    { value: '適合觀光伴手禮店' },
    { value: '純商業分區' },
    { value: '重劃區增值潛力' },
    { value: '店住合一/自住自營' },
    { value: '附裝潢/設備可承接' },
    { value: '格局方正易規劃' },
    { value: '挑高空間/彈性格局' },
    { value: '屋況佳/即可開業' },
    { value: '電梯設備齊全' },
    { value: '水電充足/三相電力' },
    { value: '低總價好入手' },
    { value: '低於實價登錄' },
    { value: '整棟釋出/稀有' },
    { value: '可分層出租' },
    { value: '稀有釋出' },
    { value: '急售可談' },
  ],
  villaPoints: [
    { value: '獨棟別墅/隱私極佳' },
    { value: '大院子/戶外空間充裕' },
    { value: '前後院/停四輛車' },
    { value: '稀有別墅等級' },
    { value: '地坪大/空間充裕' },
    { value: '獨立產權/地+建完整' },
    { value: '可增建/未來擴建' },
    { value: '可養寵物/種菜種花' },
    { value: '近山/景觀視野絕佳' },
    { value: '山景/溪景/田景' },
    { value: '環境清幽/空氣清新' },
    { value: '環境優美/綠化豐富' },
    { value: '鄰里優質寧靜' },
    { value: '鬧中取靜/市郊靜巷' },
    { value: '靜巷名邸' },
    { value: '公園第一排' },
    { value: '24H保全/社區管理嚴' },
    { value: '交通樞紐/出入便利' },
    { value: '巷弄安靜/無噪音' },
    { value: '遠離塵囂/靜謐居所' },
    { value: '社區整潔/住戶素質高' },
    { value: '純住宅社區/安全' },
    { value: '近市區/生活機能佳' },
    { value: '交通便利/近主幹道' },
    { value: '採光極佳/三面通風' },
    { value: '格局方正/空間感強' },
    { value: '裝潢精緻/立即入住' },
    { value: '有管理/社區保全' },
    { value: '游泳池/BBQ/休閒設施' },
    { value: '停車空間充足' },
    { value: '可民宿/短租經營' },
    { value: '低公設/純坪數使用' },
    { value: '節稅/資產配置首選' },
    { value: '長輩退休養生首選' },
    { value: '近醫院/長照日照設施' },
    { value: '無障礙格局/長輩友善' },
    { value: '子女就近照料方便' },
    { value: '低於實價登錄' },
    { value: '急售可談' },
    { value: '稀有釋出' },
    { value: '換屋族首選' },
    { value: '自住保值/長期持有' },
  ],
  mainPoints: [
    { value: '低於實價登錄' },
    { value: '低總價好入手' },
    { value: '高投報收租' },
    { value: '可隔套/好出租' },
    { value: '學區首選' },
    { value: '近市區機能' },
    { value: '近花蓮火車站' },
    { value: '交通便利/近主幹道' },
    { value: '景觀採光佳' },
    { value: '格局方正' },
    { value: '有車位' },
    { value: '屋況佳/免整理' },
    { value: '新屋/新裝潢' },
    { value: '店住/金店面' },
    { value: '角間/面寬' },
    { value: '重劃/開發潛力' },
    { value: '近公園/生活圈' },
    { value: '近海/山景' },
    { value: '電梯大樓管理佳' },
    { value: '屋齡新' },
    { value: '低公設比' },
    { value: '一層一戶' },
    { value: '邊間三面採光' },
    { value: '可當民宿/工作室' },
    { value: '近東大門商圈' },
    { value: '近重慶市場/生活機能讚' },
    { value: '近市八市場/日常便利' },
    { value: '近美崙市場/文教生活圈' },
    { value: '近黃昏市場/買菜超便利' },
    { value: '近太昌市場/社區機能佳' },
    { value: '近醫院/長照日照設施' },
    { value: '無障礙格局/長輩友善' },
    { value: '長輩退休養生適合' },
    { value: '子女照料方便' },
    { value: '鬧中取靜/市中心靜巷' },
    { value: '靜巷名邸' },
    { value: '公園第一排' },
    { value: '交通樞紐/四通八達' },
    { value: '社區首選/搶手地段' },
    { value: '24H保全/安心有保障' },
    { value: '學區旁/名校就在身邊' },
    { value: '社區安靜/純住宅區' },
    { value: '巷弄寧靜/不臨大路' },
    { value: '管理良好/住戶素質佳' },
    { value: '稀有釋出' },
    { value: '急售可談' },
  ],
  targetBuyers: [
    { value: '首購族/小資族' },
    { value: '小家庭' },
    { value: '換屋族' },
    { value: '投資收租' },
    { value: '退休養生/長輩自住' },
    { value: '長照規劃/子女代購' },
    { value: '資產傳承/節稅規劃' },
    { value: '店面自營/創業族' },
    { value: '觀光/民宿圓夢' },
    { value: '學區家長' },
    { value: '外地回花蓮置產' },
    { value: '台北/北部客置產' },
    { value: '自住+保值' },
    { value: '建商/開發商' },
    { value: '農業/田園生活族' },
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
