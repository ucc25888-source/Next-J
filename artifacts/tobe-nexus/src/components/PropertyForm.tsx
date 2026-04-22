"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/usePropertyStore';
import { useSystemStore } from '@/store/useSystemStore';
import { compressImage } from '@/utils/image';
import { ArrowLeft, Save, ImagePlus, X, MapPin, FileText, TrendingUp, Phone, Handshake } from 'lucide-react';
import { NoTranslateSelect } from '@/components/NoTranslateSelect';

const GEOGRAPHIC_DATA: Record<string, string[]> = {
  '花蓮市 | HC': ['市中心商圈', '美崙行政區', '慈濟生活圈', '火車站前後站', '花商/生活圈', '花蓮港/海濱'],
  '吉安 | JA': ['勝安/宜昌商圈', '慶豐生活圈', '吉安車站周邊', '太昌/慈濟校區', '南埔/工業區'],
  '新城 | XC': ['北埔商圈', '家樂福/景美', '七星潭觀光區', '新城火車站'],
  '秀林 | SL': ['太魯閣門戶', '和平工業區', '崇德/山海景觀地'],
  '壽豐 | SF': ['東華大學/志學', '理想大地/觀光區', '鹽寮/海景第一排', '壽豐車站/農耕地'],
  '鳳林 | FL': ['慢城核心區', '兆豐農場周邊', '林榮/開發地'],
  '光復 | KF': ['糖廠觀光圈', '馬太鞍/濕地旁', '大農大富特區'],
  '瑞穗 | RS': ['溫泉觀光區', '瑞穗車站商圈', '舞鶴/茶園景點'],
  '玉里 | YL': ['玉里鎮中心', '赤科山入口', '高寮/縱谷景觀'],
  '富里 | FR': ['六十石山/觀光', '羅山商圈', '富里車站/農產區'],
  '其他 | OT': ['外縣市聯動', '跨區整合案件'],
};

const LAND_PROPERTY_TYPES = ['土地 / 農地', '建地 / 工業地'];
const TRANSPARENT_TYPES = ['透天厝 (住宅)', '透天厝 (店住)', '別墅 / 莊園'];
const VILLA_TYPE = '別墅 / 莊園';
const SHOP_PROPERTY_TYPES = ['透天厝 (店住)', '純店面 / 商用辦公'];

interface PropertyFormProps {
  id?: string;
}

function Field({ label, required, hint, children, className }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2" translate="no">
        {label} {required && <span className="text-aurora-500 normal-case">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[10px] text-glacier-600">{hint}</p>}
    </div>
  );
}

export default function PropertyForm({ id }: PropertyFormProps) {
  const router = useRouter();
  const { addProperty, updateProperty, getPropertyById } = usePropertyStore();
  const {
    mainPoints, landPoints, shopPoints, targetBuyers, propertyTypes,
    parkingOptions, statusNowOptions, statusPushOptions,
    getNextListingId, currentClient,
  } = useSystemStore();

  const isEditMode = Boolean(id);
  const [activeTab, setActiveTab] = useState(0);

  const blank = {
    client_id: currentClient?.client_id || 'A0001',
    listing_type: 'C' as 'C' | 'B',
    listing_id: '',
    region_key: '',
    area_code: '',
    subarea: '',
    address_note: '',
    property_type: '',
    price_wan: '',
    reserve_price_wan: '',
    build_ping: '',
    land_ping: '',
    floor_num: '',
    total_floors: '',
    common_area_ratio: '',
    garden_area: '',
    face_width: '',
    road_width: '',
    depth_m: '',
    agri_zone_type: '',
    ownership_status: '',
    rooms: '3',
    halls: '2',
    baths: '1',
    balconies: '1',
    parking: '',
    commission_type: '一般',
    contract_start_date: '',
    contract_end_date: '',
    main_point: '',
    second_point: '',
    target_buyer: '',
    must_say_3: [] as string[],
    notes_private: '',
    status_now: '',
    status_push: '',
    alert_level: 'green',
    negotiation_progress: '',
    ai_note: '',
    fb_post_count: 0,
    img1_url: '',
    img2_url: '',
    img3_url: '',
    img4_url: '',
    owner_follow_up_date: '',
    owner_follow_up_notes: '',
    colisting_company: '',
    colisting_contact: '',
  };

  const [form, setForm] = useState(blank);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);

  const isLandType = LAND_PROPERTY_TYPES.includes(form.property_type);
  const isTransparentType = TRANSPARENT_TYPES.includes(form.property_type);
  const isVilla = form.property_type === VILLA_TYPE;
  const isShopType = SHOP_PROPERTY_TYPES.includes(form.property_type);
  const activePoints = isLandType ? landPoints : isShopType ? shopPoints : mainPoints;

  const availableSubareas = useMemo(
    () => form.region_key ? (GEOGRAPHIC_DATA[form.region_key] ?? []) : [],
    [form.region_key]
  );

  const populateFormFromProperty = (property: import('@/types').Property) => {
    const rKey = Object.keys(GEOGRAPHIC_DATA).find(k => k.split(' | ')[1] === property.area_code) ?? '';
    setForm({
      client_id: property.client_id || currentClient?.client_id || 'A0001',
      listing_type: property.listing_type || 'C',
      listing_id: property.listing_id,
      region_key: rKey,
      area_code: property.area_code,
      subarea: property.subarea,
      address_note: property.address_note,
      property_type: property.property_type,
      price_wan: property.price_wan.toString(),
      reserve_price_wan: property.reserve_price_wan ? property.reserve_price_wan.toString() : '',
      build_ping: property.build_ping.toString(),
      land_ping: property.land_ping.toString(),
      floor_num: property.floor_num ?? '',
      total_floors: property.total_floors ?? '',
      common_area_ratio: property.common_area_ratio ? property.common_area_ratio.toString() : '',
      garden_area: property.garden_area ?? '',
      face_width: property.face_width ?? '',
      road_width: property.road_width ?? '',
      depth_m: property.depth_m ?? '',
      agri_zone_type: property.agri_zone_type ?? '',
      ownership_status: property.ownership_status ?? '',
      rooms: property.rooms || '3',
      halls: property.halls || '2',
      baths: property.baths || '1',
      balconies: property.balconies || '1',
      parking: property.parking,
      commission_type: property.commission_type ?? '一般',
      contract_start_date: property.contract_start_date
        ? new Date(property.contract_start_date).toISOString().split('T')[0]
        : '',
      contract_end_date: property.contract_end_date
        ? new Date(property.contract_end_date).toISOString().split('T')[0]
        : '',
      main_point: property.main_point,
      second_point: property.second_point,
      target_buyer: property.target_buyer,
      must_say_3: property.must_say_3 ? property.must_say_3.split('\n').filter(Boolean) : [],
      notes_private: property.notes_private,
      status_now: property.status_now,
      status_push: property.status_push,
      alert_level: property.alert_level ?? 'green',
      negotiation_progress: property.negotiation_progress ?? '',
      ai_note: property.ai_note ?? '',
      fb_post_count: property.fb_post_count ?? 0,
      img1_url: property.img1_url,
      img2_url: property.img2_url,
      img3_url: property.img3_url,
      img4_url: property.img4_url,
      owner_follow_up_date: property.owner_follow_up_date ?? '',
      owner_follow_up_notes: property.owner_follow_up_notes ?? '',
      colisting_company: property.colisting_company ?? '',
      colisting_contact: property.colisting_contact ?? '',
    });
  };

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fromStore = getPropertyById(id);
    if (fromStore) {
      populateFormFromProperty(fromStore);
      setIsLoadingProperty(false);
      return;
    }

    // Store not ready yet — fetch directly from API
    setIsLoadingProperty(true);
    fetch(`/api/properties/${id}`)
      .then(async (res) => {
        if (!res.ok) { router.push('/properties'); return; }
        const { property } = await res.json();
        if (property) {
          populateFormFromProperty(property);
        } else {
          router.push('/properties');
        }
      })
      .catch(() => router.push('/properties'))
      .finally(() => setIsLoadingProperty(false));
  }, [id, isEditMode]);

  const getPointCategory = (pt: string) => {
    if (LAND_PROPERTY_TYPES.includes(pt)) return 'land';
    if (SHOP_PROPERTY_TYPES.includes(pt)) return 'shop';
    return 'main';
  };

  const set = (key: string, value: string) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'region_key') {
        next.area_code = value ? value.split(' | ')[1] : '';
        next.subarea = '';
      }
      if (key === 'property_type' && getPointCategory(value) !== getPointCategory(prev.property_type)) {
        next.main_point = '';
        next.second_point = '';
        next.must_say_3 = [];
      }
      return next;
    });

  const handleImageUpload = async (file: File, index: 1 | 2 | 3 | 4) => {
    try {
      const base64Url = await compressImage(file, 1200, 0.85, 900);
      setForm((prev) => ({ ...prev, [`img${index}_url`]: base64Url }));
    } catch {
      alert('圖片上傳失敗，請稍後再試');
    }
  };

  const toggleMustSay = (val: string) => {
    setForm((prev) => {
      const already = prev.must_say_3.includes(val);
      if (already) return { ...prev, must_say_3: prev.must_say_3.filter((v) => v !== val) };
      if (prev.must_say_3.length >= 3) return prev;
      return { ...prev, must_say_3: [...prev.must_say_3, val] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalListingId = form.listing_id;
    const clientId = form.client_id || currentClient?.client_id || 'A0001';
    if (!isEditMode && !finalListingId) {
      finalListingId = getNextListingId(clientId, form.listing_type, form.area_code);
    }
    const payload = {
      client_id: clientId,
      listing_type: form.listing_type,
      listing_id: finalListingId,
      area_code: form.area_code,
      subarea: form.subarea,
      address_note: form.address_note,
      property_type: form.property_type,
      price_wan: Number(form.price_wan) || 0,
      reserve_price_wan: parseFloat(form.reserve_price_wan) || 0,
      build_ping: parseFloat(Number(form.build_ping).toFixed(1)) || 0,
      land_ping: parseFloat(Number(form.land_ping).toFixed(1)) || 0,
      floor_num: isTransparentType ? '' : form.floor_num,
      total_floors: form.total_floors,
      common_area_ratio: isTransparentType ? 0 : (parseFloat(form.common_area_ratio) || 0),
      garden_area: isVilla ? form.garden_area : '',
      face_width: form.face_width,
      road_width: form.road_width,
      depth_m: form.depth_m,
      agri_zone_type: form.agri_zone_type,
      ownership_status: form.ownership_status,
      rooms: form.rooms,
      halls: form.halls,
      baths: form.baths,
      balconies: form.balconies,
      parking: form.parking,
      commission_type: form.commission_type,
      contract_start_date: form.contract_start_date || '',
      contract_end_date: form.contract_end_date || '',
      main_point: form.main_point,
      second_point: form.second_point,
      target_buyer: form.target_buyer,
      must_say_3: form.must_say_3.join('\n'),
      notes_private: form.notes_private,
      status_now: form.status_now,
      status_push: form.status_push,
      alert_level: form.alert_level,
      negotiation_progress: form.negotiation_progress,
      ai_note: form.ai_note,
      fb_post_count: 0,
      img1_url: form.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
      img2_url: form.img2_url,
      img3_url: form.img3_url,
      img4_url: form.img4_url,
      owner_follow_up_date: form.owner_follow_up_date || '',
      owner_follow_up_notes: form.owner_follow_up_notes,
      colisting_company: form.colisting_company,
      colisting_contact: form.colisting_contact,
    };
    if (isEditMode && id) {
      updateProperty(id, payload);
    } else {
      addProperty(payload);
    }
    router.push('/properties');
  };

  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder:text-glacier-500 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors';
  const selectCls = `${inputCls} cursor-pointer`;

  const imageSlots = [1, 2, 3, 4] as const;
  const imgKeys = { 1: 'img1_url', 2: 'img2_url', 3: 'img3_url', 4: 'img4_url' } as const;

  const TABS = [
    { label: '基本資料', icon: MapPin },
    { label: '委託情報', icon: FileText },
    { label: '推進紀錄', icon: TrendingUp },
  ];

  const alertOptions = [
    { value: 'green', label: '🟢 綠燈 — 穩定銷售' },
    { value: 'yellow', label: '🟡 黃燈 — 快到期／需降價' },
    { value: 'red', label: '🔴 紅燈 — 屋主轉向／急需處理' },
  ];

  if (isLoadingProperty) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 border-2 border-aurora-500/30 border-t-aurora-500 rounded-full animate-spin" />
        <p className="text-sm text-glacier-500">載入案件資料中…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" translate="no">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-full text-glacier-500 hover:bg-titanium-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-glacier-200">
            {isEditMode ? '編輯案件' : '新增案件'}
          </h1>
          <p className="text-xs text-glacier-500 mt-0.5">
            {isEditMode ? '修改現有委託案件資料' : '登錄新的委託案件'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-titanium-900 border border-glacier-200/[0.07] rounded-xl p-1">
        {TABS.map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === i
                  ? 'bg-aurora-500 text-titanium-950 shadow-sm'
                  : 'text-glacier-400 hover:text-glacier-200 hover:bg-titanium-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ===== TAB 0: 基本資料 ===== */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Core Info */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">地點與物件資訊</h2>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="物件類型" required>
                  <NoTranslateSelect
                    value={form.property_type}
                    onChange={(v) => set('property_type', v)}
                    placeholder="請選擇"
                    options={propertyTypes.map((o) => ({ value: o.value, label: o.value }))}
                  />
                </Field>

                <Field label="區域" required>
                  <NoTranslateSelect
                    value={form.region_key}
                    onChange={(v) => set('region_key', v)}
                    placeholder="請選擇區域"
                    options={Object.keys(GEOGRAPHIC_DATA).map((key) => ({ value: key, label: key.split(' | ')[0] }))}
                  />
                </Field>

                <Field label="小區域" required>
                  <NoTranslateSelect
                    value={form.subarea}
                    onChange={(v) => set('subarea', v)}
                    placeholder={form.region_key ? '請選擇小區域' : '請先選區域'}
                    disabled={!form.region_key}
                    options={availableSubareas.map((s) => ({ value: s, label: s }))}
                  />
                </Field>

                <Field label="地址備註（不含門牌）" className="md:col-span-3">
                  <input
                    className={inputCls}
                    value={form.address_note}
                    onChange={(e) => set('address_note', e.target.value)}
                    placeholder="例：松智路（近101）、臨路 12 米"
                  />
                </Field>

                <Field label="開價（萬）" required>
                  <input className={inputCls} type="number" min="0" required value={form.price_wan} onChange={(e) => set('price_wan', e.target.value)} placeholder="例：1280" />
                </Field>

                <Field label="底價（萬）🔒" hint="不公開，僅內部參考">
                  <input className={inputCls} type="number" min="0" value={form.reserve_price_wan} onChange={(e) => set('reserve_price_wan', e.target.value)} placeholder="屋主底線" />
                </Field>

                <Field label="建坪">
                  <input className={inputCls} type="text" inputMode="decimal" value={form.build_ping} onChange={(e) => set('build_ping', e.target.value)} placeholder="例：38.5" />
                </Field>

                <Field label="地坪">
                  <input className={inputCls} type="text" inputMode="decimal" value={form.land_ping} onChange={(e) => set('land_ping', e.target.value)} placeholder="例：800" />
                </Field>
              </div>
            </div>

            {/* 住宅專屬 */}
            {!isLandType && (
              <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
                <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">住宅專屬欄位</h2>
                </div>
                <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {!isTransparentType && (
                    <Field label="所在樓層">
                      <input className={inputCls} value={form.floor_num} onChange={(e) => set('floor_num', e.target.value)} placeholder="例：3F" />
                    </Field>
                  )}
                  <Field label="總樓高">
                    <input className={inputCls} value={form.total_floors} onChange={(e) => set('total_floors', e.target.value)} placeholder="例：5樓" />
                  </Field>
                  {!isTransparentType && (
                    <Field label="公設比（%）">
                      <input className={inputCls} type="number" min="0" max="100" value={form.common_area_ratio} onChange={(e) => set('common_area_ratio', e.target.value)} placeholder="例：28" />
                    </Field>
                  )}
                  {isVilla && (
                    <Field label="花園∕空地">
                      <select
                        translate="no"
                        className={selectCls}
                        value={form.garden_area}
                        onChange={(e) => set('garden_area', e.target.value)}
                      >
                        <option translate="no" value="">未填寫</option>
                        <option translate="no" value="有">有</option>
                        <option translate="no" value="無">無</option>
                      </select>
                    </Field>
                  )}

                  <div className="md:col-span-3">
                    <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-3">格局</p>
                    <div className="grid grid-cols-4 gap-3">
                      {([
                        { label: '房', key: 'rooms' },
                        { label: '廳', key: 'halls' },
                        { label: '衛', key: 'baths' },
                        { label: '陽台', key: 'balconies' },
                      ] as const).map(({ label, key }) => (
                        <div key={key} className="flex flex-col gap-1.5">
                          <p className="text-[11px] font-semibold text-slate-500 text-center">{label}</p>
                          <select
                            translate="no"
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-center text-base font-bold text-slate-800 focus:outline-none focus:border-aurora-500/60 cursor-pointer appearance-none"
                            value={(form as unknown as Record<string, string>)[key] || '0'}
                            onChange={(e) => set(key, e.target.value)}
                          >
                            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                              <option translate="no" key={n} value={String(n)}>{n}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Field label="車位">
                    <NoTranslateSelect
                      value={form.parking}
                      onChange={(v) => set('parking', v)}
                      placeholder="請選擇"
                      options={parkingOptions.map((o) => ({ value: o.value, label: o.value }))}
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* 土地專屬 */}
            {isLandType && (
              <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
                <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">土地專屬欄位</h2>
                </div>
                <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <Field label="面寬（米）">
                    <input className={inputCls} value={form.face_width} onChange={(e) => set('face_width', e.target.value)} placeholder="例：18M" />
                  </Field>
                  <Field label="深度（米）">
                    <input className={inputCls} value={form.depth_m} onChange={(e) => set('depth_m', e.target.value)} placeholder="例：40M" />
                  </Field>
                  <Field label="臨路寬（米）">
                    <input className={inputCls} value={form.road_width} onChange={(e) => set('road_width', e.target.value)} placeholder="例：12M" />
                  </Field>
                  <Field label="農業分區">
                    <select translate="no" className={selectCls} value={form.agri_zone_type} onChange={(e) => set('agri_zone_type', e.target.value)}>
                      <option translate="no" value="">請選擇</option>
                      <option translate="no" value="特定農業區">特定農業區</option>
                      <option translate="no" value="一般農業區">一般農業區</option>
                      <option translate="no" value="山坡地保育區">山坡地保育區</option>
                      <option translate="no" value="風景區">風景區</option>
                      <option translate="no" value="一般商業區">一般商業區</option>
                      <option translate="no" value="住宅區">住宅區</option>
                      <option translate="no" value="工業區">工業區</option>
                      <option translate="no" value="非都市土地">非都市土地</option>
                      <option translate="no" value="原住民保留地">原住民保留地</option>
                    </select>
                  </Field>
                  <Field label="產權狀況" className="md:col-span-2">
                    <input className={inputCls} value={form.ownership_status} onChange={(e) => set('ownership_status', e.target.value)} placeholder="例：私有地，單一所有人，持分無糾紛" />
                  </Field>
                </div>
              </div>
            )}

            {/* AI Note */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">🤖 AI 參考備註（強項／優勢放大說明）</h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={4}
                  className={inputCls + ' resize-none w-full'}
                  value={form.ai_note}
                  onChange={(e) => set('ai_note', e.target.value)}
                  placeholder="詳細描述這個物件的強項或特殊優勢，AI 會把這段內容放進文案的中間段落，讓印象更深刻。例如：角間三面採光、正門面向主幹道人流量大、附近百貨商圈帶來穩定客群..."
                />
                <p className="mt-2 text-[11px] text-glacier-600">此欄僅供 AI 文案生成參考，不對外顯示</p>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">物件照片（最多 4 張）</h2>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageSlots.map((slot) => {
                  const imgUrl = form[imgKeys[slot]];
                  return (
                    <div key={slot} className="relative aspect-square">
                      {imgUrl ? (
                        <div className="relative w-full h-full">
                          <img src={imgUrl} alt={`照片${slot}`} className="w-full h-full object-cover rounded-xl border border-glacier-200/[0.08]" />
                          <button
                            type="button"
                            onClick={() => setForm((prev) => ({ ...prev, [imgKeys[slot]]: '' }))}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:text-danger transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center bg-titanium-800 border-2 border-dashed border-glacier-200/[0.1] rounded-xl cursor-pointer hover:border-aurora-500/30 transition-colors group">
                          <ImagePlus className="w-6 h-6 text-glacier-600 group-hover:text-aurora-500/60 transition-colors" />
                          <span className="text-[10px] text-glacier-600 mt-1.5">照片 {slot}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, slot);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 1: 委託情報 ===== */}
        {activeTab === 1 && (
          <div className="space-y-6">
            {/* Contract */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">合約資訊</h2>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="委託類型" className="sm:col-span-2 md:col-span-3">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: '一般', label: '一般委託', hint: '自己簽的物件' },
                      { key: '專任', label: '專任委託', hint: '自己簽的物件' },
                      { key: '同業聯賣', label: '同業聯賣', hint: '別家公司的案件' },
                    ].map(({ key, label, hint }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => set('commission_type', key)}
                        title={hint}
                        className={`flex-1 min-w-[100px] py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                          form.commission_type === key
                            ? key === '同業聯賣'
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-aurora-500 text-titanium-950 border-aurora-500'
                            : 'bg-white text-glacier-400 border-slate-200 hover:border-aurora-500/40'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </Field>

                {form.commission_type === '同業聯賣' && (
                  <>
                    <Field label="哪家公司">
                      <input
                        className={inputCls}
                        value={form.colisting_company}
                        onChange={(e) => set('colisting_company', e.target.value)}
                        placeholder="例：信義房屋、永慶房屋..."
                      />
                    </Field>
                    <Field label="窗口接洽（姓名＋電話）">
                      <input
                        className={inputCls}
                        value={form.colisting_contact}
                        onChange={(e) => set('colisting_contact', e.target.value)}
                        placeholder="例：王小明 0912-345-678"
                      />
                    </Field>
                    <div className="sm:col-span-2 md:col-span-3">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <span className="text-blue-500 text-base shrink-0">🤝</span>
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                          同業聯賣物件將每 <strong>21 天</strong>在每日提醒出現，提示你詢問窗口是否有異動，點「已詢問」即記錄今天日期，計時重新開始。
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Field label="簽約日期">
                  <input
                    className={inputCls}
                    type="date"
                    value={form.contract_start_date}
                    onChange={(e) => set('contract_start_date', e.target.value)}
                  />
                </Field>

                <Field label="委託到期日">
                  <input
                    className={inputCls}
                    type="date"
                    value={form.contract_end_date}
                    onChange={(e) => set('contract_end_date', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Selling Points */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">賣點與客群分析</h2>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="主賣點">
                  <NoTranslateSelect
                    value={form.main_point}
                    onChange={(v) => set('main_point', v)}
                    options={activePoints.map((o) => ({ value: o.value, label: o.value.split(' | ')[0] }))}
                    placeholder="請選擇"
                  />
                </Field>
                <Field label="次賣點（可空）">
                  <NoTranslateSelect
                    value={form.second_point}
                    onChange={(v) => set('second_point', v)}
                    options={[{ value: '', label: '無' }, ...activePoints.map((o) => ({ value: o.value, label: o.value.split(' | ')[0] }))]}
                    placeholder="無"
                  />
                </Field>
                <Field label="目標客群">
                  <NoTranslateSelect
                    value={form.target_buyer}
                    onChange={(v) => set('target_buyer', v)}
                    options={targetBuyers.map((o) => ({ value: o.value, label: o.value.split(' | ')[0] }))}
                    placeholder="請選擇"
                  />
                </Field>

                <div className="md:col-span-3">
                  <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-3">
                    必講 3 點 <span className="text-glacier-600 normal-case tracking-normal font-normal">（最多選 3 項，已選 {form.must_say_3.length}/3）</span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
                    {activePoints.map((o) => {
                      const selected = form.must_say_3.includes(o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => toggleMustSay(o.value)}
                          disabled={!selected && form.must_say_3.length >= 3}
                          className={`text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                            selected
                              ? 'bg-aurora-500/25 border-aurora-500 text-aurora-300 font-semibold'
                              : 'bg-titanium-800 border-glacier-200/[0.07] text-glacier-400 hover:border-glacier-200/15 disabled:opacity-40 disabled:cursor-not-allowed'
                          }`}
                        >
                          {selected && <span className="text-aurora-400 mr-1 font-bold">✓</span>}
                          {o.value.split(' | ')[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Key Intel */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">🔒 關鍵情報（原因、死穴）</h2>
              </div>
              <div className="p-6">
                <textarea
                  rows={5}
                  className={inputCls + ' resize-none'}
                  value={form.notes_private}
                  onChange={(e) => set('notes_private', e.target.value)}
                  placeholder="屋主為什麼要賣？在哪個價格會心動？特殊情況、注意事項...（不會公開，僅內部使用）"
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 2: 推進紀錄 ===== */}
        {activeTab === 2 && (
          <div className="space-y-6">
            {/* System ID */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">系統資訊</h2>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="案件類型">
                  <select
                    translate="no"
                    className={selectCls}
                    value={form.listing_type}
                    onChange={(e) => set('listing_type', e.target.value)}
                    disabled={isEditMode}
                  >
                    <option translate="no" value="C">屋主案件（賣方）</option>
                    <option translate="no" value="B">買方案件</option>
                  </select>
                </Field>
                <Field label="案件編號" hint={isEditMode ? '' : '儲存時自動生成'}>
                  <input
                    className={inputCls}
                    value={form.listing_id}
                    onChange={(e) => set('listing_id', e.target.value)}
                    disabled={!isEditMode}
                    placeholder="儲存時自動生成"
                  />
                </Field>
                {isEditMode && (
                  <Field label="FB 發文次數">
                    <div className="flex items-center gap-2 h-10 px-3 bg-titanium-800 border border-glacier-200/[0.08] rounded-lg">
                      <span className="text-xl font-black text-aurora-500">{form.fb_post_count}</span>
                      <span className="text-xs text-glacier-500">次（AI 生成）</span>
                    </div>
                  </Field>
                )}
              </div>
            </div>

            {/* Follow-up — title adapts to commission type */}
            {(() => {
              const isColisting = form.commission_type === '同業聯賣';
              const sectionTitle = isColisting ? '仲介窗口跟進紀錄' : '屋主跟進紀錄';
              const overdueTip = isColisting ? '⚠ 已逾期，請盡快聯繫窗口確認異動' : '⚠ 已逾期，請盡快聯繫屋主';
              const todayTip = isColisting ? '🤝 今天需要聯繫窗口' : '📞 今天需要跟進';
              const placeholder = isColisting
                ? '例：詢問窗口案件是否有異動、屋主底價、是否有其他出價...'
                : '例：屋主說下個月考慮降價，先約下週電話確認...';
              return (
                <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
                  <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    {isColisting
                      ? <Handshake className="w-3.5 h-3.5 text-blue-400" />
                      : <Phone className="w-3.5 h-3.5 text-glacier-400" />
                    }
                    <h2 className={`text-[11px] font-bold uppercase tracking-[0.12em] ${isColisting ? 'text-blue-500' : 'text-glacier-400'}`}>
                      {sectionTitle}
                    </h2>
                    {isColisting && (
                      <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 font-semibold">
                        同業聯賣
                      </span>
                    )}
                  </div>
                  <div className="p-6 grid gap-4 sm:grid-cols-2">
                    <Field label="下次跟進日期">
                      <input
                        className={inputCls}
                        type="date"
                        value={form.owner_follow_up_date}
                        onChange={(e) => set('owner_follow_up_date', e.target.value)}
                      />
                      {form.owner_follow_up_date && (() => {
                        const today = new Date().toISOString().slice(0, 10);
                        const isOverdue = form.owner_follow_up_date < today;
                        const isToday = form.owner_follow_up_date === today;
                        if (isOverdue) return (
                          <p className="mt-1.5 text-[10px] font-semibold text-red-500">{overdueTip}</p>
                        );
                        if (isToday) return (
                          <p className={`mt-1.5 text-[10px] font-semibold ${isColisting ? 'text-blue-500' : 'text-amber-500'}`}>{todayTip}</p>
                        );
                        return (
                          <p className="mt-1.5 text-[10px] text-glacier-500">已排程跟進</p>
                        );
                      })()}
                    </Field>
                    <Field label="跟進備註">
                      <textarea
                        rows={3}
                        className={inputCls + ' resize-none'}
                        value={form.owner_follow_up_notes}
                        onChange={(e) => set('owner_follow_up_notes', e.target.value)}
                        placeholder={placeholder}
                      />
                    </Field>
                  </div>
                </div>
              );
            })()}

            {/* Status & Alert */}
            <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">戰略燈號與推進狀態</h2>
              </div>
              <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="警示燈號">
                  <div className="flex flex-col gap-2">
                    {alertOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('alert_level', opt.value)}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          form.alert_level === opt.value
                            ? opt.value === 'green'
                              ? 'bg-green-500/10 border-green-500/40 text-green-400'
                              : opt.value === 'yellow'
                              ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                              : 'bg-red-500/10 border-red-500/40 text-red-400'
                            : 'bg-titanium-800 border-glacier-200/[0.08] text-glacier-400 hover:border-glacier-200/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="目前狀態">
                  <select translate="no" className={selectCls} value={form.status_now} onChange={(e) => set('status_now', e.target.value)}>
                    <option translate="no" value="">請選擇</option>
                    {statusNowOptions.map((o) => <option translate="no" key={o.value} value={o.value}>{o.value}</option>)}
                  </select>
                </Field>

                <Field label="推進狀況">
                  <select translate="no" className={selectCls} value={form.status_push} onChange={(e) => set('status_push', e.target.value)}>
                    <option translate="no" value="">請選擇</option>
                    {statusPushOptions.map((o) => <option translate="no" key={o.value} value={o.value}>{o.value}</option>)}
                  </select>
                </Field>

                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-glacier-400">議價／溝通備註</label>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const stamp = `【${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}】`;
                        set('negotiation_progress', stamp + '\n' + (form.negotiation_progress ? form.negotiation_progress + '\n' : ''));
                      }}
                      className="text-xs px-2.5 py-1 rounded-md bg-aurora-600/20 text-aurora-400 hover:bg-aurora-600/30 border border-aurora-500/30 transition-all"
                    >
                      📅 插入跟進時間
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    className={inputCls + ' resize-none'}
                    value={form.negotiation_progress}
                    onChange={(e) => set('negotiation_progress', e.target.value)}
                    placeholder="目前議到哪個價位？買方出多少？屋主反應？..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit — always visible */}
        <div className="flex items-center gap-3 justify-between pb-8">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`w-2 h-2 rounded-full transition-all ${activeTab === i ? 'bg-aurora-500' : 'bg-glacier-600'}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-glacier-400 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg hover:border-glacier-200/15 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm"
            >
              <Save className="w-4 h-4" />
              {isEditMode ? '儲存變更' : '新增物件'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
