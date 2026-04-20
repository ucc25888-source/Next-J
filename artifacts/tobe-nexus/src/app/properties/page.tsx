import PageHeader from "@/components/PageHeader";
import {
  Plus,
  Search,
  SlidersHorizontal,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  MoreHorizontal,
  Upload,
} from "lucide-react";

const mockProperties = [
  {
    id: "P-001",
    title: "信義區精品三房",
    address: "台北市信義區信義路五段",
    price: "3,280",
    type: "住宅",
    rooms: "3房2廳2衛",
    area: 42.5,
    status: "上架中",
  },
  {
    id: "P-002",
    title: "大安區電梯二加一房",
    address: "台北市大安區復興南路一段",
    price: "2,150",
    type: "住宅",
    rooms: "2+1房1廳1衛",
    area: 31.2,
    status: "洽談中",
  },
  {
    id: "P-003",
    title: "中山區全新店面",
    address: "台北市中山區南京東路二段",
    price: "5,800",
    type: "商業",
    rooms: "1廳1衛",
    area: 68.0,
    status: "待處理",
  },
  {
    id: "P-004",
    title: "內湖科技園區辦公室",
    address: "台北市內湖區瑞光路",
    price: "4,100",
    type: "辦公",
    rooms: "開放格局",
    area: 55.8,
    status: "上架中",
  },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  上架中: {
    label: "上架中",
    cls: "bg-aurora-500/10 text-aurora-400 border-aurora-500/25",
  },
  洽談中: {
    label: "洽談中",
    cls: "bg-warning/10 text-warning border-warning/25",
  },
  待處理: {
    label: "待處理",
    cls: "bg-glacier-500/10 text-glacier-400 border-glacier-500/20",
  },
  已成交: {
    label: "已成交",
    cls: "bg-titanium-700/50 text-glacier-300 border-titanium-600/40",
  },
};

export default function PropertiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title="物件管理"
        badge="Properties"
        subtitle="管理所有房產物件資訊與銷售狀態"
        actions={
          <>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-glacier-300 bg-titanium-900 border border-glacier-200/[0.1] rounded-lg hover:border-glacier-200/20 hover:text-glacier-200 transition-all">
              <Upload className="w-3.5 h-3.5" />
              匯入資料
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-titanium-950 bg-aurora-500 rounded-lg hover:bg-aurora-400 transition-all glow-aurora-sm">
              <Plus className="w-3.5 h-3.5" />
              新增物件
            </button>
          </>
        }
      />

      <main className="flex-1 p-8 space-y-5">
        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-glacier-500" />
            <input
              type="text"
              placeholder="搜尋物件地址、名稱或編號..."
              className="w-full pl-10 pr-4 py-2.5 bg-titanium-900 border border-glacier-200/[0.08] rounded-lg text-sm text-glacier-200 placeholder-glacier-600 focus:outline-none focus:border-aurora-500/40 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-titanium-900 border border-glacier-200/[0.08] text-xs font-semibold text-glacier-400 rounded-lg hover:border-glacier-200/15 hover:text-glacier-300 transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            篩選
          </button>
        </div>

        {/* Count */}
        <p className="text-xs text-glacier-500">
          共 {mockProperties.length} 筆物件（範例資料）
        </p>

        {/* Table */}
        <div className="bg-titanium-900 border border-glacier-200/[0.07] rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-6 py-3 bg-titanium-950/40 border-b border-glacier-200/[0.06]">
            {["物件資訊", "規格", "售價", "狀態", ""].map((h) => (
              <span
                key={h}
                className="text-[10px] font-bold text-glacier-500 uppercase tracking-[0.12em]"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {mockProperties.map((p, idx) => {
            const sc = statusConfig[p.status] ?? statusConfig["待處理"];
            return (
              <div
                key={p.id}
                className={`grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-titanium-800/30 transition-colors cursor-pointer ${
                  idx < mockProperties.length - 1
                    ? "border-b border-glacier-200/[0.04]"
                    : ""
                }`}
              >
                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-glacier-600">
                      {p.id}
                    </span>
                    <span className="text-[13px] font-semibold text-glacier-200">
                      {p.title}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-titanium-700 text-glacier-500 border border-glacier-200/[0.08] font-medium">
                      {p.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-glacier-600" />
                    <span className="text-[11px] text-glacier-500">
                      {p.address}
                    </span>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-glacier-400">
                    <BedDouble className="w-3.5 h-3.5 text-glacier-600" />
                    {p.rooms}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-glacier-400">
                    <Maximize2 className="w-3.5 h-3.5 text-glacier-600" />
                    {p.area}坪
                  </span>
                </div>

                {/* Price */}
                <div className="text-right">
                  <span className="text-base font-bold text-glacier-200">
                    {p.price}
                  </span>
                  <span className="text-xs text-glacier-500 ml-1">萬</span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${sc.cls}`}
                  >
                    {sc.label}
                  </span>
                </div>

                {/* Actions */}
                <button className="p-1.5 rounded-lg text-glacier-600 hover:text-glacier-300 hover:bg-titanium-700/50 transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-glacier-600">
          以上為示範資料 — 上傳您的物件資料後將自動整合至此列表
        </p>
      </main>
    </div>
  );
}
