"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/usePropertyStore';
import { useSystemStore } from '@/store/useSystemStore';
import { compressImage } from '@/utils/image';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';

interface PropertyFormProps {
  id?: string;
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2" translate="no">
        {label} {required && <span className="text-aurora-500 normal-case">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[10px] text-glacier-600">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
      <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
        <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]" translate="no">{title}</h2>
      </div>
      <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">{children}</div>
    </div>
  );
}

export default function PropertyForm({ id }: PropertyFormProps) {
  const router = useRouter();
  const { addProperty, updateProperty, getPropertyById } = usePropertyStore();
  const {
    areas, subareas, mainPoints, targetBuyers, propertyTypes,
    parkingOptions, statusNowOptions, statusPushOptions,
    getNextListingId, currentClient,
  } = useSystemStore();

  const isEditMode = Boolean(id);

  const blank = {
    client_id: currentClient?.client_id || 'A0001',
    listing_type: 'C' as 'C' | 'B',
    listing_id: '',
    area_code: '',
    subarea: '',
    address_note: '',
    property_type: '',
    price_wan: '',
    build_ping: '',
    land_ping: '',
    rooms: '3',
    halls: '2',
    baths: '1',
    balconies: '1',
    parking: '',
    status_now: '',
    status_push: '',
    main_point: '',
    second_point: '',
    target_buyer: '',
    must_say_3: [] as string[],
    notes_private: '',
    img1_url: '',
    img2_url: '',
    img3_url: '',
    img4_url: '',
  };

  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (isEditMode && id) {
      const property = getPropertyById(id);
      if (property) {
        setForm({
          client_id: property.client_id || currentClient?.client_id || 'A0001',
          listing_type: property.listing_type || 'C',
          listing_id: property.listing_id,
          area_code: property.area_code,
          subarea: property.subarea,
          address_note: property.address_note,
          property_type: property.property_type,
          price_wan: property.price_wan.toString(),
          build_ping: property.build_ping.toString(),
          land_ping: property.land_ping.toString(),
          rooms: property.rooms || '3',
          halls: property.halls || '2',
          baths: property.baths || '1',
          balconies: property.balconies || '1',
          parking: property.parking,
          status_now: property.status_now,
          status_push: property.status_push,
          main_point: property.main_point,
          second_point: property.second_point,
          target_buyer: property.target_buyer,
          must_say_3: property.must_say_3 ? property.must_say_3.split('\n').filter(Boolean) : [],
          notes_private: property.notes_private,
          img1_url: property.img1_url,
          img2_url: property.img2_url,
          img3_url: property.img3_url,
          img4_url: property.img4_url,
        });
      } else {
        router.push('/properties');
      }
    }
  }, [id, isEditMode]);

  const availableSubareas = useMemo(
    () => subareas.filter((s) => s.area_code === form.area_code && s.active),
    [form.area_code, subareas]
  );

  const set = (key: string, value: string) =>
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'area_code') next.subarea = '';
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
      build_ping: parseFloat(Number(form.build_ping).toFixed(1)) || 0,
      land_ping: parseFloat(Number(form.land_ping).toFixed(1)) || 0,
      rooms: form.rooms,
      halls: form.halls,
      baths: form.baths,
      balconies: form.balconies,
      parking: form.parking,
      status_now: form.status_now,
      status_push: form.status_push,
      main_point: form.main_point,
      second_point: form.second_point,
      target_buyer: form.target_buyer,
      must_say_3: form.must_say_3.join('\n'),
      notes_private: form.notes_private,
      img1_url: form.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
      img2_url: form.img2_url,
      img3_url: form.img3_url,
      img4_url: form.img4_url,
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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

      <form onSubmit={handleSubmit} className="space-y-6" translate="no">
        {/* System & Area */}
        <Section title="基本資訊（系統 / 區域）">
          <Field label="案件類型" required>
            <select
              className={selectCls}
              value={form.listing_type}
              onChange={(e) => set('listing_type', e.target.value)}
              disabled={isEditMode}
            >
              <option value="C">屋主案件（賣方）</option>
              <option value="B">買方案件</option>
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
          <Field label="區域" required>
            <select
              className={selectCls}
              value={form.area_code}
              onChange={(e) => set('area_code', e.target.value)}
              required
            >
              <option value="">請選擇區域</option>
              {areas.filter((a) => a.active).map((a) => (
                <option key={a.area_code} value={a.area_code} translate="no">{a.area_name}</option>
              ))}
            </select>
          </Field>
          <Field label="地段 / 小區域" required>
            <select
              className={selectCls}
              value={form.subarea}
              onChange={(e) => set('subarea', e.target.value)}
              required
              disabled={!form.area_code}
            >
              <option value="">請選擇地段</option>
              {availableSubareas.map((s) => (
                <option key={s.subarea} value={s.subarea} translate="no">{s.subarea}</option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="地址備註（不含門牌）">
              <input
                className={inputCls}
                value={form.address_note}
                onChange={(e) => set('address_note', e.target.value)}
                placeholder="例：松智路（近101）"
              />
            </Field>
          </div>
          <Field label="目前狀態">
            <select className={selectCls} value={form.status_now} onChange={(e) => set('status_now', e.target.value)}>
              <option value="">請選擇</option>
              {statusNowOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
            </select>
          </Field>
          <Field label="推推狀況">
            <select className={selectCls} value={form.status_push} onChange={(e) => set('status_push', e.target.value)}>
              <option value="">請選擇</option>
              {statusPushOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
            </select>
          </Field>
        </Section>

        {/* Property Specs */}
        <Section title="房屋規格與價格">
          <Field label="物件類型" required>
            <select className={selectCls} value={form.property_type} onChange={(e) => set('property_type', e.target.value)} required>
              <option value="">請選擇</option>
              {propertyTypes.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
            </select>
          </Field>
          <Field label="開價（萬）" required>
            <input className={inputCls} type="number" min="0" required value={form.price_wan} onChange={(e) => set('price_wan', e.target.value)} placeholder="例：1280" />
          </Field>
          <Field label="建坪" required>
            <input className={inputCls} type="text" inputMode="decimal" required value={form.build_ping} onChange={(e) => set('build_ping', e.target.value)} placeholder="例：38.5" />
          </Field>
          <Field label="地坪">
            <input className={inputCls} type="text" inputMode="decimal" value={form.land_ping} onChange={(e) => set('land_ping', e.target.value)} placeholder="例：5.2" />
          </Field>

          {/* Layout — dropdowns */}
          <div className="sm:col-span-2 md:col-span-3">
            <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-3" translate="no">格局</p>
            <div className="grid grid-cols-4 gap-3">
              {([
                { label: '房', key: 'rooms' },
                { label: '廳', key: 'halls' },
                { label: '衛', key: 'baths' },
                { label: '陽台', key: 'balconies' },
              ] as const).map(({ label, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-semibold text-slate-500 text-center" translate="no">{label}</p>
                  <select
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2.5 text-center text-base font-bold text-slate-800 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors cursor-pointer appearance-none"
                    value={(form as unknown as Record<string, string>)[key] || '0'}
                    onChange={(e) => set(key, e.target.value)}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={String(n)}>{n}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <Field label="車位">
            <select className={selectCls} value={form.parking} onChange={(e) => set('parking', e.target.value)}>
              <option value="">請選擇</option>
              {parkingOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
            </select>
          </Field>
        </Section>

        {/* Selling Points */}
        <Section title="賣點與客群分析">
          <Field label="主賣點">
            <select className={selectCls} value={form.main_point} onChange={(e) => set('main_point', e.target.value)}>
              <option value="">請選擇</option>
              {mainPoints.map((o) => <option key={o.value} value={o.value}>{o.value.split(' | ')[0]}</option>)}
            </select>
          </Field>
          <Field label="次賣點（可空）">
            <select className={selectCls} value={form.second_point} onChange={(e) => set('second_point', e.target.value)}>
              <option value="">無</option>
              {mainPoints.map((o) => <option key={o.value} value={o.value}>{o.value.split(' | ')[0]}</option>)}
            </select>
          </Field>
          <Field label="目標客群">
            <select className={selectCls} value={form.target_buyer} onChange={(e) => set('target_buyer', e.target.value)}>
              <option value="">請選擇</option>
              {targetBuyers.map((o) => <option key={o.value} value={o.value}>{o.value.split(' | ')[0]}</option>)}
            </select>
          </Field>

          {/* Must Say 3 - Checkbox */}
          <div className="md:col-span-3">
            <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-3">
              必講 3 點 <span className="text-glacier-600 normal-case tracking-normal font-normal">（最多選 3 項，已選 {form.must_say_3.length}/3）</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-1">
              {mainPoints.map((o) => {
                const selected = form.must_say_3.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleMustSay(o.value)}
                    disabled={!selected && form.must_say_3.length >= 3}
                    className={`text-left px-3 py-2 rounded-lg text-xs border transition-all ${
                      selected
                        ? 'bg-aurora-500/10 border-aurora-500/30 text-aurora-400'
                        : 'bg-titanium-800 border-glacier-200/[0.07] text-glacier-400 hover:border-glacier-200/15 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    {selected && <span className="text-aurora-500 mr-1">✓</span>}
                    {o.value.split(' | ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Private Notes */}
        <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
          <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">關鍵情報（私密備註）</h2>
          </div>
          <div className="p-6">
            <textarea
              rows={3}
              className={inputCls + ' resize-none'}
              value={form.notes_private}
              onChange={(e) => set('notes_private', e.target.value)}
              placeholder="屋主底價、特殊情況、注意事項...（不會公開）"
            />
          </div>
        </div>

        {/* Images */}
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

        {/* Submit */}
        <div className="flex items-center gap-3 justify-end pb-8">
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
      </form>
    </div>
  );
}
