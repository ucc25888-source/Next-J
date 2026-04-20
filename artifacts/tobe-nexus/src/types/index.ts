export interface Property {
  id: string;
  client_id: string;
  listing_type: 'C' | 'B';
  listing_id: string;
  area_code: string;
  subarea: string;
  address_note: string;
  property_type: string;
  price_wan: number;
  build_ping: number;
  land_ping: number;
  rooms: string;
  halls: string;
  baths: string;
  balconies: string;
  parking: string;
  status_now: string;
  status_push: string;
  main_point: string;
  second_point: string;
  target_buyer: string;
  must_say_3: string;
  notes_private: string;
  img1_url: string;
  img2_url: string;
  img3_url: string;
  img4_url: string;
  updated_at: string;
  last_generated_at?: string;
  last_fingerprint?: string;
  createdAt: string;
}

export interface Area {
  area_code: string;
  area_name: string;
  active: boolean;
}

export interface Subarea {
  area_code: string;
  subarea: string;
  active: boolean;
  admin_district: string;
  strategy: string;
}

export interface Client {
  client_id: string;
  display_name: string;
  login_token: string;
  plan_name: string;
  monthly_quota: number;
  month_key: string;
  used_this_month: number;
  status: string;
  created_at: string;
}

export interface Copy {
  client_id: string;
  listing_id: string;
  generated_at: string;
  direction: string;
  channel: string;
  title: string;
  copy: string;
  hashtags: string;
  cta: string;
  fingerprint: string;
  used: boolean;
  copy_id: string;
}

export interface Counter {
  key: string;
  value: number;
  updated_at: string;
}

export interface OptionItem {
  value: string;
}

export type PostType =
  | '物件開箱'
  | '降價急售'
  | '知識教學'
  | '人設生活'
  | '成交喜報'
  | '開發徵件';

export type HookType =
  | '專業焦慮鉤'
  | '知識佈道鉤'
  | '利益誘惑鉤'
  | '情感溫度鉤'
  | '無';
