"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/usePropertyStore';
import { useSystemStore } from '@/store/useSystemStore';
import { getAreaDisplay } from '@/utils/areaDisplay';
import { Copy } from '@/types';
import {
  ArrowLeft, Copy as CopyIcon, Sparkles, CheckCircle2,
  Download, RefreshCw, ThumbsUp, MessageCircle, Share2, Globe,
} from 'lucide-react';

type TagMode = 'residential' | 'apartment' | 'shop' | 'land';

const TAG_LIBRARY: Record<TagMode, string[]> = {
  residential: [
    '低於實價登錄', '近市區機能', '景觀採光佳', '格局方正漂亮',
    '近車站通勤', '有車位好停車', '屋況佳免整理', '低總價好入手',
    '新屋/新裝潢', '學區首選', '邊間三面採光', '一層一戶',
    '近公園/生活圈', '稀有釋出', '可隔套好出租', '高投報收租',
    '稀有急售', '重劃開發潛力', '前後院好利用', '獨棟自由規劃',
  ],
  apartment: [
    '低公設比', '電梯大樓管理', '一層一戶', '管理室保全',
    '景觀採光佳', '格局方正漂亮', '低於實價登錄', '屋況佳免整理',
    '低總價好入手', '學區首選', '近市區機能', '近公園/生活圈',
    '近車站通勤', '高樓層視野好', '有車位好停車', '新屋/新裝潢',
    '稀有釋出', '可隔套好出租', '高投報收租', '社區環境整潔',
  ],
  shop: [
    '黃金路段人流旺', '一樓黃金店面', '大面寬好招牌', '角間三面曝光',
    '主幹道臨路', '近觀光商圈', '近市場批發區', '附設停車位',
    '現租金收益中', '高投報穩收租', '租客可承接', '適合餐飲手搖',
    '適合零售服務業', '純商業分區', '店住合一自營', '附裝潢設備轉讓',
    '格局方正好規劃', '屋況佳即可開業', '低總價好入手', '低於實價登錄',
    '空間利用率高', '整棟釋出稀有', '稀有釋出', '急售可談',
  ],
  land: [
    '地形方正漂亮', '大面寬好規劃', '臨大馬路好進出', '特定農業區',
    '建商開發首選', '可蓋夢想家', '投資重劃核心', '合法資材室',
    '產權單純乾淨', '變更潛力大', '稀有大坪數', '可當農場民宿',
    '適合資產配置', '節稅規劃首選', '水源路徑清晰', '地形平坦好用',
  ],
};

const TAG_MODE_LABELS: { value: TagMode; label: string }[] = [
  { value: 'residential', label: '別墅/透天' },
  { value: 'apartment', label: '電梯/公寓' },
  { value: 'shop', label: '店面/商辦' },
  { value: 'land', label: '土地' },
];

const APARTMENT_PROPERTY_TYPES = ['公寓', '電梯', '大樓', '華廈'];

const buildCTA = (location: string) =>
`💬 想了解更多細節或${location}行情？
點擊下方連結，語音諮詢福哥：
👉 https://bit.ly/4sJhSzs

👤 杜美珍 & 周福良 (福哥)
📞 專線：0925-997779
證號：(91) 登字第 010851 號`;

export default function CopywritingPage({ id }: { id: string }) {
  const router = useRouter();
  const { getPropertyById } = usePropertyStore();
  const { currentClient, addCopy, incrementUsage } = useSystemStore();

  const property = getPropertyById(id);

  const defaultLayout = property
    ? `${property.rooms}房${property.halls}廳${property.baths}衛`
    : '';

  const [locationOverride, setLocationOverride] = useState(property?.subarea ?? '');
  const [highlightsText, setHighlightsText] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const used = currentClient?.used_this_month ?? 0;
  const quota = currentClient?.monthly_quota ?? 30;
  const isOverQuota = used >= quota;
  const usagePct = Math.min((used / quota) * 100, 100);

  const LAND_PROPERTY_TYPES = ['土地 / 農地', '建地 / 工業地'];
  const SHOP_PROPERTY_TYPES = ['透天厝 (店住)', '純店面 / 商用辦公'];
  const isLandProperty = LAND_PROPERTY_TYPES.includes(property?.property_type ?? '');
  const isShopProperty = SHOP_PROPERTY_TYPES.includes(property?.property_type ?? '');

  const stripEnglish = (text: string) => text.split('|')[0].trim();

  const normalizeHighlights = (raw: string): string => {
    const lines = raw
      .split(/[\n　]/)
      .flatMap(l => l.split(/\s{2,}/))
      .map(l => l.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    return lines.filter(l => {
      const key = stripEnglish(l).slice(0, 4);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join('\n');
  };

  const isApartmentProperty = APARTMENT_PROPERTY_TYPES.some(k => (property?.property_type ?? '').includes(k));
  const defaultTagMode: TagMode = isLandProperty ? 'land' : isShopProperty ? 'shop' : isApartmentProperty ? 'apartment' : 'residential';
  const [tagMode, setTagMode] = useState<TagMode>(defaultTagMode);
  const activeTags = TAG_LIBRARY[tagMode];
  const selectedTagSet = new Set(
    highlightsText.split('\n').map((l) => l.trim()).filter(Boolean)
  );
  const toggleTag = (tag: string) => {
    const lines = highlightsText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.includes(tag)) {
      setHighlightsText(lines.filter((l) => l !== tag).join('\n'));
    } else {
      setHighlightsText([...lines, tag].join('\n'));
    }
  };

  useEffect(() => {
    if (!property) {
      router.push('/properties');
    } else {
      setLocationOverride(property.subarea);
      setHighlightsText(normalizeHighlights(property.must_say_3 ?? ''));
    }
  }, []);

  const handleGenerate = async () => {
    if (!property || !currentClient || isOverQuota) return;

    setIsGenerating(true);
    setSaved(false);
    setContent('');

    try {
      const resp = await fetch('/api/generate-fb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: locationOverride || property.subarea,
          price: property.price_wan,
          ping: property.build_ping,
          landPing: property.land_ping,
          isLandProperty,
          isShopProperty,
          layout: defaultLayout,
          propertyType: property.property_type || '',
          parking: property.parking || '',
          highlights: highlightsText || property.must_say_3 || '',
          mainPoint: property.main_point || '',
          secondPoint: property.second_point || '',
          aiNote: property.ai_note || '',
          property_id: property.id,
        }),
      });

      if (!resp.ok || !resp.body) {
        setContent('⚠️ AI 生成失敗，請稍後再試。');
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setContent(fullText);
      }

      const HASHTAGS = `#珍選好福邸 #花蓮房產顧問福哥 #TOBENexus`;

      // 後處理：校正 AI 亂改的固定文字，並補回缺失的空行
      const corrected = fullText
        .replace(/珍選好福邸｜三十年.{0,6}把關！/g, '珍選好福邸｜三十年經驗把關！')
        .replace(/[✨🌟⭐]*\s*(?:[^\n]*真心話|顧問福哥[^\n]*話|福哥[^\n]*真心話)[：:：]?/g, '顧問福哥真心話：')
        .replace(/([^\n])(顧問福哥真心話：)/g, '$1\n\n$2')
        .replace(/\n{3,}/g, '\n\n');

      const area = locationOverride || property.subarea;
      const finalContent = `${corrected.trim()}\n\n${buildCTA(area)}\n\n${HASHTAGS}`;
      setContent(finalContent);

      const copyRecord: Copy = {
        copy_id: crypto.randomUUID(),
        client_id: currentClient.client_id,
        listing_id: property.listing_id || property.id,
        generated_at: new Date().toISOString(),
        direction: 'FB自動',
        channel: 'FB個人/粉專',
        title: `${property.subarea} ${property.property_type}`,
        copy: finalContent,
        hashtags: '#AI成交戰略系統 #TOBENexus #珍選好福邸',
        cta: '預約賞屋',
        fingerprint: crypto.randomUUID().slice(0, 8),
        used: false,
      };
      addCopy(copyRecord);
      incrementUsage();
      setSaved(true);
    } catch (err) {
      console.error(err);
      setContent('⚠️ 網路錯誤，請稍後再試。');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImages = () => {
    if (!property) return;
    [property.img1_url, property.img2_url, property.img3_url, property.img4_url]
      .filter(Boolean)
      .forEach((imgUrl, i) => {
        const a = document.createElement('a');
        a.href = imgUrl!;
        a.download = `${property.subarea}_${property.property_type}_照片${i + 1}.jpg`;
        a.click();
      });
  };

  if (!property) return null;

  const selectCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-colors cursor-pointer';
  const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 transition-colors';
  const labelCls = 'block text-[13px] font-semibold text-slate-600 mb-2';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full text-glacier-500 hover:bg-titanium-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-glacier-200">FB 文案生成</h1>
          <p className="text-xs text-glacier-500 mt-0.5">
            為「{property.subarea} {property.property_type}」生成珍選好福邸戰略文案
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">

          {/* Location override */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-500">物件地點設定</h2>
            </div>
            <div className="p-4">
              <label className={labelCls}>地點名稱（可覆寫）</label>
              <input
                className={inputCls}
                value={locationOverride}
                onChange={(e) => setLocationOverride(e.target.value)}
                placeholder={property.subarea}
              />
            </div>
          </div>

          {/* Highlights panel */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-500">精華亮點</h2>
            </div>
            <div className="p-4 space-y-5">
              {/* Property quick info */}
              <div translate="no" className="flex flex-wrap gap-2">
                <span translate="no" className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
                  💰 {property.price_wan?.toLocaleString()} 萬
                </span>
                <span translate="no" className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
                  📏 {getAreaDisplay(property.property_type, property.build_ping, property.land_ping)}
                </span>
                {!isLandProperty && (
                  <span translate="no" className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
                    🏠 {defaultLayout}
                  </span>
                )}
              </div>

              {/* Main & Second selling point — AI 情緒主軸 */}
              {(property.main_point || property.second_point) && (
                <div>
                  <p className={labelCls}>AI 情緒主軸（物件設定）</p>
                  <div className="flex flex-col gap-2">
                    {property.main_point && (
                      <span translate="no" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border bg-amber-50 border-amber-400 text-amber-800">
                        <span className="text-amber-500 shrink-0">⭐ 主賣點</span>
                        <span className="text-amber-900">{stripEnglish(property.main_point)}</span>
                      </span>
                    )}
                    {property.second_point && (
                      <span translate="no" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border bg-blue-50 border-blue-400 text-blue-800">
                        <span className="text-blue-500 shrink-0">✦ 次賣點</span>
                        <span className="text-blue-900">{stripEnglish(property.second_point)}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* must_say_3 — displayed as chips, not a textarea */}
              <div>
                <p className={labelCls}>
                  精華亮點（AI 融入文案）
                  <span className="ml-1.5 font-normal text-slate-400">
                    — 已選 {selectedTagSet.size} 點，可從標籤池換選
                  </span>
                </p>
                {selectedTagSet.size > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {[...selectedTagSet].map((h) => (
                      <span
                        key={h}
                        translate="no"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border bg-amber-100 border-amber-500 text-amber-800"
                      >
                        <span className="text-amber-600">✓</span>
                        {stripEnglish(h)}
                        <button
                          type="button"
                          onClick={() => toggleTag(h)}
                          className="ml-1 text-amber-500 hover:text-amber-700 transition-colors font-bold text-base leading-none"
                          title="移除"
                        >×</button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic py-2">尚未選取精華亮點，點擊下方標籤加入</p>
                )}
              </div>

              {/* Tag pool - manually switchable */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-slate-600">
                    賣點標籤池
                    <span className="ml-1.5 font-normal text-slate-400 text-xs">— 點擊替換或新增</span>
                  </p>
                  <div className="flex gap-1.5">
                    {TAG_MODE_LABELS.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setTagMode(m.value)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          tagMode === m.value
                            ? 'bg-amber-100 border-amber-500 text-amber-800'
                            : 'bg-slate-100 border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeTags.map((tag) => {
                    const isSelected = selectedTagSet.has(tag);
                    const prefix = tag.slice(0, 4);
                    const isSimilarToSelected = !isSelected && [...selectedTagSet].some(s => stripEnglish(s).startsWith(prefix));
                    if (isSimilarToSelected) return null;
                    return (
                      <button
                        key={tag}
                        type="button"
                        translate="no"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 text-amber-800 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {isSelected && <span className="mr-1">✓</span>}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Quota + Generate */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[10px] text-glacier-500">
              <span>本月文案用量</span>
              <span className={isOverQuota ? 'text-red-500 font-bold' : 'text-aurora-400 font-medium'}>
                {used} / {quota} 次
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOverQuota ? 'bg-red-500' : usagePct >= 80 ? 'bg-aurora-400' : 'bg-aurora-500'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="flex items-center gap-1.5 text-[10px] text-glacier-600">
                {saved && <><CheckCircle2 className="w-3 h-3 text-aurora-500" /> 已儲存至文案紀錄</>}
              </span>
              {isOverQuota ? (
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 border border-red-200 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" /> 本月配額已用盡
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm"
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> 生成中...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> 一鍵生成 FB 文案</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Edit panel */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-glacier-400 uppercase tracking-[0.12em]">3. 文案微調</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadImages}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-glacier-400 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
                >
                  <Download className="w-3 h-3" /> 下載照片
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-white border border-slate-200 rounded-lg hover:border-aurora-500/40 hover:text-aurora-500 transition-all text-glacier-400"
                >
                  <CopyIcon className="w-3 h-3" />
                  {copied ? '已複製！' : '一鍵複製'}
                </button>
              </div>
            </div>
            <div className="p-5">
              <textarea
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-glacier-200 font-mono leading-relaxed resize-none focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors"
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isGenerating ? '🤖 AI 正在生成文案...' : '點擊「一鍵生成 FB 文案」產出戰略文案'}
              />
            </div>
          </div>
        </div>

        {/* Facebook Preview */}
        <div>
          <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-4 px-1">
            Facebook 預覽效果
          </p>
          <div className="max-w-sm mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/30 sticky top-6">
            <div className="flex items-center gap-3 p-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">花蓮房產顧問 · 福哥</p>
                <div className="flex items-center text-xs text-slate-400 gap-1 mt-0.5">
                  <span>剛剛</span>
                  <span>·</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {content || (isGenerating ? '🤖 生成中...' : '文案將顯示於此')}
            </div>
            <div className="w-full aspect-[4/3] bg-slate-100">
              <img
                src={property.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'}
                alt="Property"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-around text-slate-500 text-sm">
              {[
                { icon: ThumbsUp, label: '讚' },
                { icon: MessageCircle, label: '留言' },
                { icon: Share2, label: '分享' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} className="flex items-center gap-1.5 py-1 px-3 rounded-md hover:bg-slate-50 font-medium text-xs transition-colors">
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
