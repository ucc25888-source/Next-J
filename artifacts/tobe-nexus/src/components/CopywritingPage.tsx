"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/usePropertyStore';
import { useSystemStore } from '@/store/useSystemStore';
import { randomHumanSlogan } from '@/data/humanSlogans';
import { PostType, HookType, Copy } from '@/types';
import {
  ArrowLeft, Copy as CopyIcon, Sparkles, CheckCircle2,
  Download, RefreshCw, ThumbsUp, MessageCircle, Share2, Globe,
} from 'lucide-react';

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: '物件開箱', label: '物件開箱' },
  { value: '降價急售', label: '降價急售' },
  { value: '知識教學', label: '知識教學' },
  { value: '人設生活', label: '人設生活' },
  { value: '成交喜報', label: '成交喜報' },
  { value: '開發徵件', label: '開發徵件' },
];

const HOOK_TYPES: { value: HookType; label: string }[] = [
  { value: '情感溫度鉤', label: '情感溫度鉤' },
  { value: '專業焦慮鉤', label: '專業焦慮鉤' },
  { value: '知識佈道鉤', label: '知識佈道鉤' },
  { value: '利益誘惑鉤', label: '利益誘惑鉤' },
  { value: '無', label: '無（不使用開場白）' },
];

const FIXED_FOOTER = `👇 好案不等人，點擊預約看屋：
📞 撥打專線：0925-997779
💬 直通LINE專線：https://bit.ly/4sJhSzs
👤 杜美珍 & 周福良 (福哥)`;

export default function CopywritingPage({ id }: { id: string }) {
  const router = useRouter();
  const { getPropertyById } = usePropertyStore();
  const { currentClient, addCopy, incrementUsage } = useSystemStore();

  const property = getPropertyById(id);

  const defaultLayout = property
    ? `${property.rooms}房${property.halls}廳${property.baths}衛`
    : '';

  const [postType, setPostType] = useState<PostType>('物件開箱');
  const [hookType, setHookType] = useState<HookType>('情感溫度鉤');
  const [locationOverride, setLocationOverride] = useState(property?.subarea ?? '');
  const [highlightsText, setHighlightsText] = useState(property?.must_say_3 ?? '');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const used = currentClient?.used_this_month ?? 0;
  const quota = currentClient?.monthly_quota ?? 30;
  const isOverQuota = used >= quota;
  const usagePct = Math.min((used / quota) * 100, 100);

  useEffect(() => {
    if (!property) {
      router.push('/properties');
    } else {
      setLocationOverride(property.subarea);
      setHighlightsText(property.must_say_3 ?? '');
      handleGenerate('物件開箱', '情感溫度鉤');
    }
  }, []);

  const handleGenerate = async (pType: PostType, hType: HookType) => {
    if (!property || !currentClient || isOverQuota) return;

    setIsGenerating(true);
    setPostType(pType);
    setHookType(hType);
    setSaved(false);
    setContent('');

    const slogan = randomHumanSlogan();

    try {
      const resp = await fetch('/api/generate-fb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType: pType,
          location: locationOverride || property.subarea,
          price: property.price_wan,
          ping: property.build_ping,
          layout: defaultLayout,
          hookType: hType,
          highlights: highlightsText || property.must_say_3 || '',
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

      const finalContent = `${fullText}\n\n—————————————————\n${slogan}\n\n${FIXED_FOOTER}`;
      setContent(finalContent);

      const copyRecord: Copy = {
        copy_id: crypto.randomUUID(),
        client_id: currentClient.client_id,
        listing_id: property.listing_id || property.id,
        generated_at: new Date().toISOString(),
        direction: `${pType}-${hType}`,
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

  const selectCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-glacier-200 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors cursor-pointer';
  const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-glacier-200 placeholder-glacier-500 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors';
  const labelCls = 'block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-1.5';

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

          {/* Strategy panel */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-[10px] font-bold text-glacier-400 uppercase tracking-[0.12em]">1. 發文策略</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>貼文類型</label>
                  <select
                    className={selectCls}
                    value={postType}
                    onChange={(e) => setPostType(e.target.value as PostType)}
                  >
                    {POST_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>HOOK 開場白</label>
                  <select
                    className={selectCls}
                    value={hookType}
                    onChange={(e) => setHookType(e.target.value as HookType)}
                  >
                    {HOOK_TYPES.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>地點名稱（可覆寫）</label>
                <input
                  className={inputCls}
                  value={locationOverride}
                  onChange={(e) => setLocationOverride(e.target.value)}
                  placeholder={property.subarea}
                />
              </div>
            </div>
          </div>

          {/* Highlights panel */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <h2 className="text-[10px] font-bold text-glacier-400 uppercase tracking-[0.12em]">2. 精華亮點</h2>
            </div>
            <div className="p-5 space-y-3">
              {/* Property quick info */}
              <div className="flex flex-wrap gap-2 text-[11px] text-glacier-500">
                <span className="px-2 py-1 bg-titanium-800 rounded-md border border-glacier-200/[0.07]">
                  💰 {property.price_wan?.toLocaleString()} 萬
                </span>
                <span className="px-2 py-1 bg-titanium-800 rounded-md border border-glacier-200/[0.07]">
                  📏 {property.build_ping} 坪
                </span>
                <span className="px-2 py-1 bg-titanium-800 rounded-md border border-glacier-200/[0.07]">
                  🏠 {defaultLayout}
                </span>
              </div>
              <div>
                <label className={labelCls}>精華亮點（AI 會融入文案）</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={4}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="例：近火車站步行3分鐘&#10;採光極佳視野無遮&#10;管理完善電梯大樓"
                />
              </div>
            </div>
          </div>

          {/* Quota + Generate */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-[10px] text-glacier-500">
              <span>本月文案用量</span>
              <span className={isOverQuota ? 'text-red-500 font-bold' : 'text-glacier-400'}>
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
                  onClick={() => handleGenerate(postType, hookType)}
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
