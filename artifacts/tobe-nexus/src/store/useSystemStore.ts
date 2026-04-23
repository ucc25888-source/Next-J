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
  officePoints: OptionItem[];
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
    { value: '東大門觀光商圈核心' },
    { value: '商店街整排人潮旺' },
    { value: '觀光客動線必經' },
    { value: '自強夜市周邊商圈' },
    { value: '黃金路段人流旺' },
    { value: '一樓黃金店面' },
    { value: '大面寬好掛招牌' },
    { value: '角間三面曝光' },
    { value: '臨主幹道好進出' },
    { value: '近重慶市場' },
    { value: '近市八市場' },
    { value: '近美崙市場' },
    { value: '近黃昏市場' },
    { value: '近太昌市場' },
    { value: '近花蓮火車站' },
    { value: '近學校補習班聚集' },
    { value: '近醫院長照機構' },
    { value: '近銀行公家機關' },
    { value: '指名度高客源穩定' },
    { value: '旁有全聯超市' },
    { value: '社區穩定老客群' },
    { value: '附設停車位' },
    { value: '騎樓完整好停車' },
    { value: '現租金收益中' },
    { value: '高投報穩收租' },
    { value: '租客可承接' },
    { value: '空屋即刻進駐' },
    { value: '適合餐飲手搖店' },
    { value: '適合零售服務業' },
    { value: '適合診所醫美' },
    { value: '適合長照日照服務' },
    { value: '適合補習班教育' },
    { value: '適合倉儲物流' },
    { value: '適合辦公工作室' },
    { value: '適合觀光伴手禮店' },
    { value: '純商業分區' },
    { value: '重劃區增值潛力' },
    { value: '店住合一自住自營' },
    { value: '裝潢設備可承接' },
    { value: '格局方正好規劃' },
    { value: '挑高空間格局彈性' },
    { value: '屋況佳即可開業' },
    { value: '電梯設備齊全' },
    { value: '水電充足三相電力' },
    { value: '低總價好入手' },
    { value: '低於實價登錄' },
    { value: '整棟稀有釋出' },
    { value: '可分層出租' },
    { value: '稀有釋出' },
    { value: '急售可談' },
    { value: '大面寬' },
    { value: '招牌顯眼' },
    { value: '人潮聚集' },
    { value: '有天然瓦斯' },
    { value: '門口方便卸貨' },
  ],
  officePoints: [
    { value: '氣派大廳' },
    { value: '保全管理' },
    { value: '電梯快速' },
    { value: '好隔間採光佳' },
    { value: '員工通勤便利' },
    { value: '純商業分區' },
    { value: '附設停車位' },
    { value: '電梯設備齊全' },
    { value: '水電充足三相電力' },
    { value: '格局方正好規劃' },
    { value: '挑高空間格局彈性' },
    { value: '屋況佳即可進駐' },
    { value: '近銀行公家機關' },
    { value: '近花蓮火車站' },
    { value: '空屋即刻進駐' },
    { value: '可分層出租' },
    { value: '現租金收益中' },
    { value: '高投報穩收租' },
    { value: '適合辦公工作室' },
    { value: '重劃區增值潛力' },
    { value: '低總價好入手' },
    { value: '低於實價登錄' },
    { value: '稀有釋出' },
    { value: '急售可談' },
  ],
  villaPoints: [
    { value: '獨門獨院' },
    { value: '併排雙車' },
    { value: '大地坪' },
    { value: '合法農舍' },
    { value: '有電梯' },
    { value: '整層主臥' },
    { value: '大面寬' },
    { value: '全新未住' },
    { value: '看山看海' },
    { value: '私人庭院' },
    { value: '產權單純乾淨' },
    { value: '可增建未來擴建' },
    { value: '可民宿短租經營' },
    { value: '近市區生活機能佳' },
    { value: '近醫院長照日照設施' },
    { value: '長輩退休養生首選' },
    { value: '低於實價登錄' },
    { value: '稀有釋出' },
    { value: '急售可談' },
  ],
  mainPoints: [
    { value: '好停車' },
    { value: '自家車庫' },
    { value: '門口停車' },
    { value: '大面寬好停雙車' },
    { value: '一樓免爬樓梯' },
    { value: '出入方便非死巷' },
    { value: '走路到公車站' },
    { value: '近花蓮火車站' },
    { value: '交通樞紐' },
    { value: '走路買菜近' },
    { value: '走路到市場' },
    { value: '旁有全聯超市' },
    { value: '下樓便利店' },
    { value: '市區正核心' },
    { value: '後站商圈' },
    { value: '生活機能強' },
    { value: '近東大門商圈' },
    { value: '近重慶市場' },
    { value: '近市八市場' },
    { value: '近美崙市場' },
    { value: '近黃昏市場' },
    { value: '近太昌市場' },
    { value: '學區房' },
    { value: '學區首選' },
    { value: '近慈濟' },
    { value: '散步到公園' },
    { value: '下樓就公園' },
    { value: '公園第一排' },
    { value: '河堤散步道' },
    { value: '近運動場' },
    { value: '文教區' },
    { value: '高樓層視野開闊' },
    { value: '高樓層山景無遮擋' },
    { value: '高樓層海景第一排' },
    { value: '制高點俯瞰市區' },
    { value: '格局方正' },
    { value: '採光通風好' },
    { value: '邊間開窗明亮' },
    { value: '角間採光好' },
    { value: '邊間三面採光' },
    { value: '免整理即可入住' },
    { value: '頂樓已做防水' },
    { value: '管線已更新' },
    { value: '新屋新裝潢' },
    { value: '低公設比' },
    { value: '一層一戶' },
    { value: '屋齡新' },
    { value: '有車位' },
    { value: '電梯大樓管理佳' },
    { value: '垃圾代收' },
    { value: '管理嚴謹' },
    { value: '24H保全' },
    { value: '指名度高' },
    { value: '社區首選' },
    { value: '鬧中取靜' },
    { value: '巷內安靜' },
    { value: '純住宅安靜社區' },
    { value: '住戶素質佳' },
    { value: '近醫院長照設施' },
    { value: '無障礙長輩友善' },
    { value: '長輩退休養生首選' },
    { value: '近海山景' },
    { value: '重劃增值潛力' },
    { value: '店住金店面' },
    { value: '可隔套好出租' },
    { value: '高投報收租' },
    { value: '可當民宿工作室' },
    { value: '低總價好入手' },
    { value: '低於實價登錄' },
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
    { value: '店面' },
    { value: '商辦' },
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
