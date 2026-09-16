'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/heatmaps', label: 'Heatmaps', icon: 'map' },
  { path: '/hospitals', label: 'Hospitals', icon: 'local_hospital' },
  { path: '/about', label: 'About', icon: 'shield' },
];

export default function BottomNav() {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe pointer-events-none">
      <div className="p-[8px] max-w-md mx-auto pointer-events-auto">
        <div className="liquid-glass rounded-full px-[12px] py-[4px] flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-all relative group ${
                  isActive
                    ? 'text-primary-container font-semibold'
                    : 'text-slate hover:text-ink'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform group-active:scale-90 ${
                    isActive ? 'filled' : ''
                  }`}
                  style={
                    isActive
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {item.icon}
                </span>
                <span className="text-[11px] leading-[14px] font-medium mt-0.5 font-[var(--font-inter)]">
                  {item.label}
                </span>
                <div
                  className={`w-1 h-1 rounded-full bg-primary-container mt-0.5 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
