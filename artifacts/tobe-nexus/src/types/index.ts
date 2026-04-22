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
  reserve_price_wan: number;
  build_ping: number;
  land_ping: number;
  rooms: string;
  halls: string;
  baths: string;
  balconies: string;
  parking: string;
  floor_num: string;
  total_floors: string;
  common_area_ratio: number;
  face_width: string;
  road_width: string;
  depth_m: string;
  agri_zone_type: string;
  ownership_status: string;
  commission_type: string;
  contract_start_date: string;
  contract_end_date: string;
  status_now: string;
  status_push: string;
  alert_level: string;
  negotiation_progress: string;
  main_point: string;
  second_point: string;
  target_buyer: string;
  must_say_3: string;
  notes_private: string;
  fb_post_count: number;
  img1_url: string;
  img2_url: string;
  img3_url: string;
  img4_url: string;
  garden_area?: string;
  owner_follow_up_date?: string | null;
  owner_follow_up_notes?: string;
  ai_note?: string;
  colisting_company?: string;
  colisting_contact?: string;
  colisting_last_check?: string | null;
  colisting_notes?: string;
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
  has_line_service: boolean;
  line_notify_token?: string;
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

export type DailyFocusType = 'buyer' | 'showing' | 'property' | 'colisting';

export type PostType =
  | '無'
  | '物件開箱'
  | '降價急售'
  | '知識教學'
  | '人設生活'
  | '成交喜報'
  | '資產配置'
  | '土地潛力'
  | '成家圓夢'
  | '商辦店面';

export type HookType =
  | '專業焦慮鉤'
  | '知識佈道鉤'
  | '利益誘惑鉤'
  | '情感溫度鉤'
  | '無';

export interface Buyer {
  id: string;
  client_id: string;
  buyer_no: string;
  name: string;
  phone: string;
  email: string;
  line_id: string;
  source: string;
  budget_min: number;
  budget_max: number;
  pref_property_type: string;
  pref_area: string;
  pref_rooms: string;
  pref_min_ping: number;
  status: string;
  notes: string;
  last_contact_at: string | null;
  next_follow_up_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Showing {
  id: string;
  client_id: string;
  buyer_id: string | null;
  property_id: string | null;
  showing_date: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_source: string;
  reaction: string;
  offer_wan: number;
  follow_up: string;
  follow_up_date: string | null;
  follow_up_done: boolean;
  notes: string;
  created_at: string;
}

export interface DailyFocusItem {
  id: string;
  type: 'buyer' | 'showing' | 'property' | 'colisting';
  source_id: string;
  title: string;
  subtitle: string;
  date: string;
  is_overdue: boolean;
  done: boolean;
}
