import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title?: string | React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

import { useRouter } from 'next/navigation';

export function PageHeader({ title, breadcrumbs, backHref, onBack, actions }: PageHeaderProps) {
  const router = useRouter();

  let effectiveBackHref = backHref;
  let effectiveOnBack = onBack;

  if (!effectiveBackHref && !effectiveOnBack && breadcrumbs && breadcrumbs.length > 1) {
    const prevCrumb = breadcrumbs[breadcrumbs.length - 2];
    if (prevCrumb.href) {
      effectiveBackHref = prevCrumb.href;
    } else if (prevCrumb.onClick) {
      effectiveOnBack = prevCrumb.onClick;
    } else {
      effectiveOnBack = () => router.back();
    }
  }

  return (
    <header className="h-16 bg-[var(--bg-surface)] border-b border-[var(--border-default)] w-full shrink-0 z-[60] sticky top-0 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {(effectiveBackHref || effectiveOnBack) && (
          effectiveBackHref ? (
            <Link href={effectiveBackHref} className="p-1.5 -ml-1.5 rounded-lg text-[var(--text-subtle)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-strong)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <button onClick={effectiveOnBack} className="p-1.5 -ml-1.5 rounded-lg text-[var(--text-subtle)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-strong)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )
        )}
        
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center space-x-1 sm:space-x-2 text-sm">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={idx} className="flex items-center">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="text-[var(--text-subtle)] hover:text-[var(--text-strong)] transition-colors font-medium">
                      {crumb.label}
                    </Link>
                  ) : crumb.onClick && !isLast ? (
                    <button onClick={crumb.onClick} className="text-[var(--text-subtle)] hover:text-[var(--text-strong)] transition-colors font-medium">
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-[var(--text-strong)] font-semibold">{crumb.label}</span>
                  )}
                  {!isLast && <ChevronRight className="w-4 h-4 mx-1 sm:mx-1.5 text-[var(--text-disabled)]" />}
                </div>
              );
            })}
          </nav>
        ) : (
          <h1 className="text-lg font-bold text-[var(--text-strong)] tracking-tight">{title}</h1>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}
