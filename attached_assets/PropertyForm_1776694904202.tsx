import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePropertyStore } from '../store/usePropertyStore';
import { useSystemStore } from '../store/useSystemStore';
import { Card, Button, Input, Textarea, Select, CheckboxGroup, ImageUpload } from '../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { compressImage } from '../utils/image';

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addProperty, updateProperty, getPropertyById } = usePropertyStore();
  const { 
    areas, subareas, mainPoints, targetBuyers, propertyTypes, 
    parkingOptions, statusNowOptions, statusPushOptions,
    roomOptions, hallOptions, bathOptions, balconyOptions,
    getNextListingId, currentClient
  } = useSystemStore();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
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
    rooms: '',
    halls: '',
    baths: '',
    balconies: '',
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
  });

  useEffect(() => {
    if (isEditMode && id) {
      const property = getPropertyById(id);
      if (property) {
        setFormData({
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
          rooms: property.rooms || '',
          halls: property.halls || '',
          baths: property.baths || '',
          balconies: property.balconies || '',
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
        navigate('/properties');
      }
    }
  }, [id, isEditMode, getPropertyById, navigate]);

  const availableSubareas = useMemo(() => {
    return subareas.filter(s => s.area_code === formData.area_code && s.active);
  }, [formData.area_code, subareas]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'area_code') {
        newData.subarea = ''; // 重置小區域
      }
      return newData;
    });
  };

  const handleImageUpload = async (file: File, index: 1 | 2 | 3 | 4) => {
    try {
      // 壓縮圖片：最大寬度 1200px，品質 0.8
      const base64Url = await compressImage(file, 1200, 0.8);
      setFormData((prev) => ({ ...prev, [`img${index}_url`]: base64Url }));
    } catch (error) {
      console.error('圖片壓縮失敗:', error);
      alert('圖片上傳失敗，請稍後再試');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalListingId = formData.listing_id;
    const clientIdToUse = formData.client_id || currentClient?.client_id || 'A0001';

    if (!isEditMode && !finalListingId) {
      finalListingId = getNextListingId(clientIdToUse, formData.listing_type, formData.area_code);
    }
    
    const payload = {
      client_id: clientIdToUse,
      listing_type: formData.listing_type,
      listing_id: finalListingId,
      area_code: formData.area_code,
      subarea: formData.subarea,
      address_note: formData.address_note,
      property_type: formData.property_type,
      price_wan: Number(formData.price_wan) || 0,
      build_ping: Number(formData.build_ping) || 0,
      land_ping: Number(formData.land_ping) || 0,
      rooms: formData.rooms,
      halls: formData.halls,
      baths: formData.baths,
      balconies: formData.balconies,
      parking: formData.parking,
      status_now: formData.status_now,
      status_push: formData.status_push,
      main_point: formData.main_point,
      second_point: formData.second_point,
      target_buyer: formData.target_buyer,
      must_say_3: formData.must_say_3.join('\n'), // 將陣列轉為換行字串儲存
      notes_private: formData.notes_private,
      img1_url: formData.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
      img2_url: formData.img2_url,
      img3_url: formData.img3_url,
      img4_url: formData.img4_url,
    };

    if (isEditMode && id) {
      updateProperty(id, payload);
    } else {
      addProperty(payload);
    }
    navigate('/properties');
  };

  const optionToSelectFormat = (opts: { value: string }[]) => 
    opts.map(o => ({ value: o.value, label: o.value }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {isEditMode ? '編輯物件' : '新增物件'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 基本系統與區域資訊 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">基本資訊 (系統/區域)</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Select 
              label="案件類型" 
              name="listing_type" 
              required 
              value={formData.listing_type} 
              onChange={handleChange}
              options={[
                { value: 'C', label: '屋主案件 (賣方)' },
                { value: 'B', label: '買方案件 (買方)' }
              ]}
              disabled={isEditMode}
            />
            <Input label="案件編號(自動)" name="listing_id" value={formData.listing_id} onChange={handleChange} disabled={!isEditMode} placeholder="儲存時自動生成" />
            
            <Select 
              label="區域代碼" 
              name="area_code" 
              required 
              value={formData.area_code} 
              onChange={handleChange}
              options={areas.filter(a => a.active).map(a => ({ value: a.area_code, label: a.area_name }))}
            />
            
            <Select 
              label="小區域/地段" 
              name="subarea" 
              required 
              value={formData.subarea} 
              onChange={handleChange}
              disabled={!formData.area_code}
              options={availableSubareas.map(s => ({ value: s.subarea, label: s.subarea }))}
            />

            <div className="md:col-span-2">
              <Input label="地址備註(不含門牌)" name="address_note" value={formData.address_note} onChange={handleChange} placeholder="例: 松智路(近101)" />
            </div>
            
            <Select 
              label="目前狀態" 
              name="status_now" 
              value={formData.status_now} 
              onChange={handleChange}
              options={optionToSelectFormat(statusNowOptions)}
            />
            <Select 
              label="推推狀況" 
              name="status_push" 
              value={formData.status_push} 
              onChange={handleChange}
              options={optionToSelectFormat(statusPushOptions)}
            />
          </div>
        </Card>

        {/* 房屋規格 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">房屋規格與價格</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Select 
              label="物件類型" 
              name="property_type" 
              required 
              value={formData.property_type} 
              onChange={handleChange}
              options={optionToSelectFormat(propertyTypes)}
            />
            <Input label="開價(萬)" name="price_wan" type="number" required min="0" value={formData.price_wan} onChange={handleChange} placeholder="例: 8500" />
            <Input label="建坪" name="build_ping" type="number" required min="0" step="0.01" value={formData.build_ping} onChange={handleChange} placeholder="例: 85.5" />
            <Input label="地坪" name="land_ping" type="number" min="0" step="0.01" value={formData.land_ping} onChange={handleChange} placeholder="例: 10.2" />
            
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Select 
                label="房" 
                name="rooms" 
                required 
                value={formData.rooms} 
                onChange={handleChange}
                options={optionToSelectFormat(roomOptions)}
              />
              <Select 
                label="廳" 
                name="halls" 
                required 
                value={formData.halls} 
                onChange={handleChange}
                options={optionToSelectFormat(hallOptions)}
              />
              <Select 
                label="衛" 
                name="baths" 
                required 
                value={formData.baths} 
                onChange={handleChange}
                options={optionToSelectFormat(bathOptions)}
              />
              <Select 
                label="陽台" 
                name="balconies" 
                required 
                value={formData.balconies} 
                onChange={handleChange}
                options={optionToSelectFormat(balconyOptions)}
              />
            </div>

            <Select 
              label="車位" 
              name="parking" 
              value={formData.parking} 
              onChange={handleChange}
              options={optionToSelectFormat(parkingOptions)}
            />
          </div>
        </Card>

        {/* 賣點與客群 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">賣點與客群分析</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Select 
              label="主賣點(單選)" 
              name="main_point" 
              value={formData.main_point} 
              onChange={handleChange}
              options={optionToSelectFormat(mainPoints)}
            />
            <Select 
              label="次賣點(單選/可空)" 
              name="second_point" 
              value={formData.second_point} 
              onChange={handleChange}
              options={optionToSelectFormat(mainPoints)}
            />
            <Select 
              label="目標客群" 
              name="target_buyer" 
              value={formData.target_buyer} 
              onChange={handleChange}
              options={optionToSelectFormat(targetBuyers)}
            />
          </div>
        </Card>

        {/* 備註與必講 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">關鍵情報與必講內容</h2>
          <div className="grid gap-6">
            <CheckboxGroup
              label="必講3點 (最多選3項)"
              options={optionToSelectFormat(mainPoints)}
              selectedValues={formData.must_say_3}
              maxSelect={3}
              onChange={(values) => {
                setFormData(prev => ({ ...prev, must_say_3: values }));
              }}
            />
            <Textarea label="關鍵情報/備註(私密)" name="notes_private" rows={3} value={formData.notes_private} onChange={handleChange} placeholder="例: 屋主誠意出售，底價可談..." />
          </div>
        </Card>

        {/* 圖片 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">照片上傳 (自動壓縮)</h2>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-4">
            <ImageUpload 
              label="照片 1 (主要)" 
              value={formData.img1_url} 
              onChange={(f) => handleImageUpload(f, 1)} 
              onRemove={() => setFormData(p => ({ ...p, img1_url: '' }))}
            />
            <ImageUpload 
              label="照片 2" 
              value={formData.img2_url} 
              onChange={(f) => handleImageUpload(f, 2)} 
              onRemove={() => setFormData(p => ({ ...p, img2_url: '' }))}
            />
            <ImageUpload 
              label="照片 3" 
              value={formData.img3_url} 
              onChange={(f) => handleImageUpload(f, 3)} 
              onRemove={() => setFormData(p => ({ ...p, img3_url: '' }))}
            />
            <ImageUpload 
              label="照片 4" 
              value={formData.img4_url} 
              onChange={(f) => handleImageUpload(f, 4)} 
              onRemove={() => setFormData(p => ({ ...p, img4_url: '' }))}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/properties')}
          >
            取消
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {isEditMode ? '儲存修改' : '新增物件'}
          </Button>
        </div>
      </form>
    </div>
  );
}
