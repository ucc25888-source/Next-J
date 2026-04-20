export interface Property {
  id: string; // 內部使用 ID
  client_id: string; // 客戶代碼
  listing_type: 'C' | 'B'; // 案件類型 (C: 屋主案件, B: 買方案件)
  listing_id: string; // 案件編號(自動)
  area_code: string; // 區域代碼(HC/JA...)
  subarea: string; // 小區域/地段
  address_note: string; // 地址備註(不含門牌)
  property_type: string; // 物件類型
  price_wan: number; // 開價(萬)
  build_ping: number; // 建坪
  land_ping: number; // 地坪
  rooms: string; // 房 (例: 0, 1, 2, ..., 6+)
  halls: string; // 廳 (例: 0, 1, 2, ...)
  baths: string; // 衛 (例: 0, 1, 2, ...)
  balconies: string; // 陽台 (例: 0, 1, 2, ...)
  parking: string; // 車位
  status_now: string; // 目前狀態
  status_push: string; // 推推狀況(開發用)
  main_point: string; // 主賣點(單選)
  second_point: string; // 次賣點(單選/可空)
  target_buyer: string; // 目標客群
  must_say_3: string; // 必講3點(條列)
  notes_private: string; // 關鍵情報/備註(私密)
  img1_url: string; // 照片1連結
  img2_url: string; // 照片2連結
  img3_url: string; // 照片3連結
  img4_url: string; // 照片4連結
  updated_at: string; // 最後更新時間
  last_generated_at?: string; // 最後產文時間
  last_fingerprint?: string; // 最後產文指紋
  createdAt: string; // 系統建立時間
}

export interface Area {
  area_code: string; // 區域代碼
  area_name: string; // 區域名稱
  active: boolean; // 啟用
}

export interface Subarea {
  area_code: string; // 區域代碼
  subarea: string; // 小區域/地段
  active: boolean; // 啟用
  admin_district: string; // 行政區
  strategy: string; // 策略
}

export interface Client {
  client_id: string; // 客戶代碼
  display_name: string; // 顯示名稱
  login_token: string; // 登入Token
  plan_name: string; // 方案
  monthly_quota: number; // 月額度(次)
  month_key: string; // 計費月份(YYYYMM)
  used_this_month: number; // 本月已用(次)
  status: string; // 狀態(active/suspended)
  created_at: string; // 建立時間
}

export interface Copy {
  client_id: string; // 客戶代碼
  listing_id: string; // 案件編號
  generated_at: string; // 生成時間
  direction: string; // 方向(A/B/C)
  channel: string; // 建議渠道(FB個人/粉專/LINE@)
  title: string; // 貼文主題
  copy: string; // 正文
  hashtags: string; // Hashtags
  cta: string; // CTA
  fingerprint: string; // 指紋
  used: boolean; // 已發(BOOL)
  copy_id: string; // 文案ID
}

export interface Counter {
  key: string; // 計數器Key
  value: number; // 流水號
  updated_at: string; // 更新時間
}

export interface OptionItem {
  value: string; // 選項名稱 (例如: 低於實價登錄 | Below market)
}

export type PostType = '物件開箱' | '降價急售' | '知識教學' | '人設生活' | '成交喜報' | '開發徵件';
export type HookType = '專業焦慮鉤' | '知識佈道鉤' | '利益誘惑鉤' | '情感溫度鉤' | '無';
