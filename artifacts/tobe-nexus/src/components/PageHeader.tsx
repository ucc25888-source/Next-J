interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 md:py-5 border-b border-glacier-200/[0.08] bg-titanium-900/60 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        {badge && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-aurora-500/10 border border-aurora-500/20 text-[10px] font-bold text-aurora-500 tracking-wider uppercase shrink-0">
            {badge}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-[15px] md:text-[17px] font-bold text-glacier-200 tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-[11px] md:text-xs text-glacier-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 ml-2">{actions}</div>
      )}
    </header>
  );
}
