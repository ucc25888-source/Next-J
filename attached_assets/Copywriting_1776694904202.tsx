import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/usePropertyStore';
import { useSystemStore } from '../store/useSystemStore';
import { Card, Button, Textarea, Select } from '../components/ui';
import { ArrowLeft, Copy as CopyIcon, Sparkles, ThumbsUp, MessageCircle, Share2, Globe, CheckCircle2, Download } from 'lucide-react';
import { PostType, HookType, Copy } from '../types';
import { generateCopywriting } from '../utils/ai';
import { downloadBase64Image } from '../utils/image';

export default function Copywriting() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById } = usePropertyStore();
  const { currentClient, addCopy } = useSystemStore();

  const [postType, setPostType] = useState<PostType>('物件開箱');
  const [hookType, setHookType] = useState<HookType>('情感溫度鉤');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentCopyId, setCurrentCopyId] = useState<string | null>(null);

  const property = id ? getPropertyById(id) : undefined;

  useEffect(() => {
    if (!property) {
      navigate('/properties');
    } else {
      handleGenerate(postType, hookType);
    }
  }, [property, navigate]);

  const handleGenerate = (pType: PostType, hType: HookType) => {
    if (!property || !currentClient) return;
    setIsGenerating(true);
    setPostType(pType);
    setHookType(hType);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const generatedContent = generateCopywriting(property, pType, hType);
      setContent(generatedContent);
      
      // Save copy record
      const newCopyId = crypto.randomUUID();
      setCurrentCopyId(newCopyId);
      
      const copyRecord: Copy = {
        copy_id: newCopyId,
        client_id: currentClient.client_id,
        listing_id: property.listing_id || property.id,
        generated_at: new Date().toISOString(),
        direction: `${pType}-${hType}`,
        channel: 'FB個人/粉專',
        title: `${property.subarea} ${property.property_type}`,
        copy: generatedContent,
        hashtags: `#${property.subarea.slice(0, 3)}買屋`, // 簡化處理
        cta: '預約賞屋', // 簡化處理
        fingerprint: crypto.randomUUID().slice(0, 8),
        used: false,
      };
      
      addCopy(copyRecord);
      setIsGenerating(false);
    }, 600);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownloadImages = () => {
    if (!property) return;
    const images = [property.img1_url, property.img2_url, property.img3_url, property.img4_url].filter(Boolean);
    
    images.forEach((imgUrl, index) => {
      // 若是 Base64 或一般網址，透過 downloadBase64Image 下載
      // 注意：一般外部網址可能會有 CORS 問題，但由於我們現在是 Base64，所以可以直接下載
      downloadBase64Image(imgUrl as string, `${property.subarea}_${property.property_type}_照片${index + 1}.jpg`);
    });
  };

  if (!property) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI 文案生成</h1>
          <p className="text-sm text-slate-500 mt-1">為「{property.subarea} {property.property_type}」生成高轉換率的 FB 貼文</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">1. 選擇發文策略</h2>
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <Select
                label="貼文類型"
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
                options={[
                  { value: '物件開箱', label: '物件開箱 | 買方最愛看' },
                  { value: '降價急售', label: '降價急售 | 利潤空間大' },
                  { value: '知識教學', label: '知識教學 | 建立專業感' },
                  { value: '人設生活', label: '人設生活 | 顧問的日常' },
                  { value: '成交喜報', label: '成交喜報 | 建立信任度' },
                  { value: '開發徵件', label: '開發徵件 | 找尋好屋主' },
                ]}
              />
              <Select
                label="HOOK 類型 (開場白)"
                value={hookType}
                onChange={(e) => setHookType(e.target.value as HookType)}
                options={[
                  { value: '無', label: '無 (不使用開場白)' },
                  { value: '專業焦慮鉤', label: '專業焦慮鉤 | 製造稀缺' },
                  { value: '知識佈道鉤', label: '知識佈道鉤 | 建立權威' },
                  { value: '利益誘惑鉤', label: '利益誘惑鉤 | 吸引預算' },
                  { value: '情感溫度鉤', label: '情感溫度鉤 | 建立人設' },
                ]}
              />
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                已自動儲存至文案紀錄
              </span>
              <Button
                onClick={() => handleGenerate(postType, hookType)}
                className="gap-2"
                disabled={isGenerating}
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? '生成中...' : '生成策略文案'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">2. 文案微調</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadImages}
                  className="gap-2 h-8 px-3 text-xs"
                  title="將物件照片下載到您的電腦"
                >
                  <Download className="h-3 w-3" />
                  下載照片
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="gap-2 h-8 px-3 text-xs"
                >
                  <CopyIcon className="h-3 w-3" />
                  {copied ? '已複製！' : '一鍵複製'}
                </Button>
              </div>
            </div>
            <Textarea
              className="font-mono text-sm min-h-[300px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Card>
        </div>

        {/* Facebook Post Preview */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 px-2">Facebook 預覽效果</h2>
          <Card className="max-w-md mx-auto overflow-hidden bg-white shadow-md border-slate-200">
            {/* FB Header */}
            <div className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150" alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">專業房仲專家</h4>
                <div className="flex items-center text-xs text-slate-500 gap-1 mt-0.5">
                  <span>剛剛</span>
                  <span>·</span>
                  <Globe className="h-3 w-3" />
                </div>
              </div>
            </div>

            {/* FB Content */}
            <div className="px-4 pb-3 text-sm text-slate-800 whitespace-pre-wrap">
              {content || '生成中...'}
            </div>

            {/* FB Image */}
            <div className="w-full aspect-[4/3] bg-slate-100">
              <img src={property.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'} alt="Property" className="w-full h-full object-cover" />
            </div>

            {/* FB Actions */}
            <div className="p-4 border-t border-slate-100 flex justify-between text-slate-500 text-sm">
              <button className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-3 rounded-md transition-colors font-medium">
                <ThumbsUp className="h-5 w-5" />
                讚
              </button>
              <button className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-3 rounded-md transition-colors font-medium">
                <MessageCircle className="h-5 w-5" />
                留言
              </button>
              <button className="flex items-center gap-2 hover:bg-slate-50 py-1.5 px-3 rounded-md transition-colors font-medium">
                <Share2 className="h-5 w-5" />
                分享
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
