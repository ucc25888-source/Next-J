"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePropertyStore } from '@/store/usePropertyStore';
import { useSystemStore } from '@/store/useSystemStore';
import { generateCopywriting } from '@/utils/ai';
import { downloadBase64Image } from '@/utils/image';
import { PostType, HookType, Copy } from '@/types';
import {
  ArrowLeft, Copy as CopyIcon, Sparkles, CheckCircle2,
  Download, RefreshCw, ThumbsUp, MessageCircle, Share2, Globe, ChevronDown,
} from 'lucide-react';

const POST_TYPES: { value: PostType; label: string }[] = [
  { value: '物件開箱', label: '物件開箱 | 買方最愛看' },
  { value: '降價急售', label: '降價急售 | 利潤空間大' },
  { value: '知識教學', label: '知識教學 | 建立專業感' },
  { value: '人設生活', label: '人設生活 | 顧問的日常' },
  { value: '成交喜報', label: '成交喜報 | 建立信任度' },
  { value: '開發徵件', label: '開發徵件 | 找尋好屋主' },
];

const HOOK_TYPES: { value: HookType; label: string }[] = [
  { value: '無', label: '無（不使用開場白）' },
  { value: '專業焦慮鉤', label: '專業焦慮鉤 | 製造稀缺' },
  { value: '知識佈道鉤', label: '知識佈道鉤 | 建立權威' },
  { value: '利益誘惑鉤', label: '利益誘惑鉤 | 吸引預算' },
  { value: '情感溫度鉤', label: '情感溫度鉤 | 建立人設' },
];

export default function CopywritingPage({ id }: { id: string }) {
  const router = useRouter();
  const { getPropertyById } = usePropertyStore();
  const { currentClient, addCopy } = useSystemStore();

  const [postType, setPostType] = useState<PostType>('物件開箱');
  const [hookType, setHookType] = useState<HookType>('情感溫度鉤');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const property = getPropertyById(id);

  useEffect(() => {
    if (!property) {
      router.push('/properties');
    } else {
      handleGenerate(postType, hookType);
    }
  }, []);

  const handleGenerate = (pType: PostType, hType: HookType) => {
    if (!property || !currentClient) return;
    setIsGenerating(true);
    setPostType(pType);
    setHookType(hType);
    setSaved(false);

    setTimeout(() => {
      const generatedContent = generateCopywriting(property, pType, hType);
      setContent(generatedContent);

      const newCopyId = crypto.randomUUID();
      const copyRecord: Copy = {
        copy_id: newCopyId,
        client_id: currentClient.client_id,
        listing_id: property.listing_id || property.id,
        generated_at: new Date().toISOString(),
        direction: `${pType}-${hType}`,
        channel: 'FB個人/粉專',
        title: `${property.subarea} ${property.property_type}`,
        copy: generatedContent,
        hashtags: `#${property.subarea.slice(0, 3)}買屋`,
        cta: '預約賞屋',
        fingerprint: crypto.randomUUID().slice(0, 8),
        used: false,
      };
      addCopy(copyRecord);
      setIsGenerating(false);
      setSaved(true);
    }, 600);
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
      .forEach((imgUrl, index) => {
        downloadBase64Image(
          imgUrl!,
          `${property.subarea}_${property.property_type}_照片${index + 1}.jpg`
        );
      });
  };

  if (!property) return null;

  const selectCls = 'w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-glacier-200 focus:outline-none focus:border-aurora-500/60 focus:ring-1 focus:ring-aurora-500/20 transition-colors cursor-pointer pr-8';

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
          <h1 className="text-lg font-bold text-glacier-200">AI 文案生成</h1>
          <p className="text-xs text-glacier-500 mt-0.5">
            為「{property.subarea} {property.property_type}」生成高轉換率 FB 貼文
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-5">
          {/* Strategy panel */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">1. 選擇發文策略</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">貼文類型</label>
                  <div className="relative">
                    <select
                      className={selectCls}
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as PostType)}
                    >
                      {POST_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-2">HOOK 開場白</label>
                  <div className="relative">
                    <select
                      className={selectCls}
                      value={hookType}
                      onChange={(e) => setHookType(e.target.value as HookType)}
                    >
                      {HOOK_TYPES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-glacier-200/[0.06]">
                <span className="flex items-center gap-1.5 text-[10px] text-glacier-600">
                  {saved && <><CheckCircle2 className="w-3 h-3 text-aurora-500" /> 已儲存至文案紀錄</>}
                </span>
                <button
                  onClick={() => handleGenerate(postType, hookType)}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-aurora-sm"
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> 生成中...</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> 生成策略文案</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Edit panel */}
          <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-glacier-400 uppercase tracking-[0.12em]">2. 文案微調</h2>
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
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="正在生成文案..."
              />
            </div>
          </div>
        </div>

        {/* Facebook Preview */}
        <div>
          <p className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em] mb-4 px-1">
            Facebook 預覽效果
          </p>
          <div className="max-w-sm mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
            {/* FB Header */}
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

            {/* Content */}
            <div className="px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {content || '生成中...'}
            </div>

            {/* Image */}
            <div className="w-full aspect-[4/3] bg-slate-100">
              <img
                src={property.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'}
                alt="Property"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Actions */}
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
