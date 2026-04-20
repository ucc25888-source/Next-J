import { usePropertyStore } from '../store/usePropertyStore';
import { Card } from '../components/ui';
import { Building2, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const properties = usePropertyStore((state) => state.properties);

  const totalProperties = properties.length;
  const totalValue = properties.reduce((acc, curr) => acc + (curr.price_wan || 0), 0);

  const getTitle = (p: any) => `${p.listing_id ? `[${p.listing_id}] ` : ''}${p.subarea} ${p.property_type}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">總覽儀表板</h1>
        <Link
          to="/properties/new"
          className="inline-flex items-center justify-center space-x-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          <span>新增物件</span>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-blue-500">
          <div className="rounded-full bg-blue-100 p-3">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">總管理物件</p>
            <p className="text-2xl font-bold text-slate-900">{totalProperties} <span className="text-base font-normal text-slate-500">件</span></p>
          </div>
        </Card>
        
        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-amber-500">
          <div className="rounded-full bg-amber-100 p-3">
            <TrendingUp className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">總銷售金額 (萬)</p>
            <p className="text-2xl font-bold text-slate-900">{totalValue.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center space-x-4 border-l-4 border-l-green-500">
          <div className="rounded-full bg-green-100 p-3">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">本月新增</p>
            <p className="text-2xl font-bold text-slate-900">
              {properties.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length} <span className="text-base font-normal text-slate-500">件</span>
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">最新物件</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.slice(0, 4).map((property) => (
            <Card key={property.id} className="flex flex-col">
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={property.img1_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200'}
                  alt={getTitle(property)}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    {property.rooms}房{property.halls}廳{property.baths}衛
                  </span>
                  <h3 className="font-bold text-slate-900 line-clamp-1" title={getTitle(property)}>
                    {getTitle(property)}
                  </h3>
                </div>
                <p className="text-xl font-bold text-amber-600 mb-4">{property.price_wan?.toLocaleString()} 萬</p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                  <Link
                    to={`/properties/${property.id}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    詳細
                  </Link>
                  <Link
                    to={`/generate/${property.id}`}
                    className="flex-1 inline-flex justify-center items-center px-3 py-1.5 bg-blue-50 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    生文案
                  </Link>
                </div>
              </div>
            </Card>
          ))}
          {properties.length === 0 && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">尚無物件</h3>
              <p className="mt-1 text-sm text-slate-500">開始新增您的第一個房屋物件吧。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
