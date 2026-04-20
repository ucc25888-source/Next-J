import { usePropertyStore } from '../store/usePropertyStore';
import { Card, Button, Input } from '../components/ui';
import { Building2, Plus, PenTool, Trash2, Search, MapPin, Ruler } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function PropertyList() {
  const { properties, deleteProperty } = usePropertyStore();
  const [searchTerm, setSearchTerm] = useState('');

  const getTitle = (p: any) => `${p.listing_id ? `[${p.listing_id}] ` : ''}${p.subarea} ${p.property_type}`;

  const filteredProperties = properties.filter(
    (p) =>
      p.subarea.includes(searchTerm) ||
      p.listing_id.includes(searchTerm) ||
      p.property_type.includes(searchTerm) ||
      p.address_note.includes(searchTerm) ||
      `${p.rooms}房`.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除這個物件嗎？')) {
      deleteProperty(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">物件管理</h1>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="搜尋編號、地段或格局..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/properties/new">
            <Button className="shrink-0 space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">新增物件</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="group relative flex flex-col overflow-hidden transition-all hover:shadow-md">
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
              <img
                src={property.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'}
                alt={getTitle(property)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {property.status_now && (
                <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                  {property.status_now}
                </div>
              )}
            </div>
            
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-2">
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                  {property.rooms}房{property.halls}廳{property.baths}衛
                </span>
                <h3 className="mt-2 font-bold text-slate-900 line-clamp-1" title={getTitle(property)}>
                  {getTitle(property)}
                </h3>
              </div>
              
              <p className="text-2xl font-bold text-amber-500 mb-4">{property.price_wan?.toLocaleString()} 萬</p>
              
              <div className="space-y-2 text-sm text-slate-500 mb-4 flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="line-clamp-1" title={property.address_note}>{property.address_note || '無地址備註'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{property.build_ping} 坪 (建)</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <Link to={`/properties/${property.id}`}>
                  <Button variant="outline" className="w-full h-9 px-0 gap-1 text-xs">
                    <PenTool className="h-3 w-3" />
                    編輯
                  </Button>
                </Link>
                <Link to={`/generate/${property.id}`}>
                  <Button variant="primary" className="w-full h-9 px-0 gap-1 text-xs bg-blue-600 hover:bg-blue-700">
                    FB 文案
                  </Button>
                </Link>
                <Button 
                  variant="danger" 
                  className="col-span-2 w-full h-9 px-0 gap-1 text-xs bg-slate-100 text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(property.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  刪除物件
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredProperties.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">找不到物件</h3>
            <p className="mt-1 text-sm text-slate-500">嘗試不同的搜尋關鍵字，或新增一個物件。</p>
          </div>
        )}
      </div>
    </div>
  );
}
