import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, PenTool, Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { name: '總覽儀表板', path: '/', icon: Home },
    { name: '物件管理', path: '/properties', icon: Building2 },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-amber-400" />
            <span className="text-xl font-bold tracking-wider">房仲利器</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="h-6 w-6 text-slate-300 hover:text-white" />
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors',
                  isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
