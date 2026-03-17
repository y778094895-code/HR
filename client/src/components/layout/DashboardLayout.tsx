import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation, LinkProps } from 'react-router-dom';
import { useAuthStore } from '@/stores/business/auth.store';
import { useAlertStore } from '@/stores/business/alert.store';
import { useAlertWebSocket } from '@/hooks/useAlertWebSocket';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS, filterNavByRole } from './_nav';
import { cn } from '@/lib/utils';
import {
  Menu,
  LogOut,
  User as UserIcon,
  Settings,
  Search,
  PlusCircle,
  Bell,
  Globe,
  X,
  LayoutDashboard,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/ui/sidebar.store';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/overlays/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/overlays/dropdown-menu';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';

const ForwardedLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link {...props} ref={ref} />
));
ForwardedLink.displayName = 'ForwardedLink';

export default function DashboardLayout() {
  const { logout, user } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = useAlertStore((s) => s.unreadCount);

  // Initialize WebSocket for real-time alerts
  useAlertWebSocket();

  // Desktop sidebar collapse state (persisted)
  const isSidebarCollapsed = useSidebarStore((s) => s.isCollapsed);
  const toggleSidebarCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const setSidebarCollapsed = useSidebarStore((s) => s.setCollapsed);

  // Keep collapsed stable
  useEffect(() => {
    if (isSidebarCollapsed) setSidebarCollapsed(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Global Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    const stored = localStorage.getItem('sidebar:collapsed');
    if (stored !== null) {
      const next = stored === 'true';
      if (next !== isSidebarCollapsed) setSidebarCollapsed(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_v1');
    logout();
    navigate('/login', { replace: true });
  };

  const handleQuickCreateCase = () => {
    window.dispatchEvent(new Event('dashboard:create-case'));
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  // Sidebar section state
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(() => {
    const stored = localStorage.getItem('sidebar_active_section_v1');
    return stored ? stored : null;
  });

  React.useEffect(() => {
    const matchingParent = NAV_ITEMS.find(
      (item) =>
        item.path === location.pathname ||
        (item.children &&
          item.children.some(
            (child) =>
              child.path &&
              location.pathname.startsWith(child.path.split('?')[0])
          ))
    );
    if (matchingParent && activeSectionKey !== matchingParent.id) {
      setActiveSectionKey(matchingParent.id);
      localStorage.setItem('sidebar_active_section_v1', matchingParent.id);
    }
  }, [location.pathname]);

  const toggleSection = (id: string) => {
    setActiveSectionKey((prev) => {
      const newKey = prev === id ? null : id;
      if (newKey) localStorage.setItem('sidebar_active_section_v1', newKey);
      else localStorage.removeItem('sidebar_active_section_v1');
      return newKey;
    });
  };

  const filteredNavItems = filterNavByRole(NAV_ITEMS, user?.role);

  const NavContent = ({ collapsed }: { collapsed: boolean }) => {
    const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

    return (
      <div className="flex flex-col h-full bg-card/50 text-card-foreground">
        <div className={cn('p-6', collapsed && 'px-3 py-6')}>
          <div className={cn('flex items-center', collapsed ? 'justify-center mx-auto' : 'gap-3')}>
            {/* HR inside sidebar */}
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={(e) => {
                e.preventDefault();
                toggleSidebarCollapsed();
              }}
              className={cn(
                'bg-primary text-primary-foreground rounded-xl shadow-sm flex items-center justify-center',
                'transition-colors outline-none shrink-0 h-9 w-9',
                'hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                !collapsed && 'h-10 w-10 p-2'
              )}
            >
              <span className="font-bold text-lg leading-none tracking-tight">HR</span>
            </button>

            <Link
              to="/dashboard"
              className={cn('flex flex-col flex-1', collapsed && 'hidden')}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Dashboard Home"
            >
              <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                Smart System
              </h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Performance Edition
              </p>
            </Link>
          </div>
        </div>

        <nav className={cn(
          "flex-1 px-4 pb-6 space-y-1.5 overflow-y-auto overflow-x-hidden relative",
          hoveredItemId ? "overflow-visible" : "overflow-y-auto overflow-x-hidden",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        )}>
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHoveredLocal = collapsed && hoveredItemId === item.id;
            const isExpanded = activeSectionKey === item.id;
            const hasChildren = item.children && item.children.length > 0;

            // Fallback for dashboard icon if missing
            const IconFromNav = item.icon;
            const Icon = IconFromNav ?? (item.path === '/dashboard' ? LayoutDashboard : null);

            const labelText = t(item.labelKey);
            const tooltipSide = i18n.dir() === 'rtl' ? 'left' : 'right';

            // Normal wrapping for tooltip when genuinely collapsed and not hovered
            const wrapWithTooltip = (node: React.ReactNode) =>
              collapsed && !isHoveredLocal ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    {node as unknown as React.ReactElement}
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide} className="text-xs">
                    {labelText}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>{node}</>
              );

            const innerContent = (
              <>
                {hasChildren ? (
                  <div className="flex items-stretch justify-between w-full">
                    <Link
                      to={item.path || '#'}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (collapsed && !isHoveredLocal) setSidebarCollapsed(true);
                        if (isHoveredLocal) setHoveredItemId(null);
                      }}
                      className={cn(
                        'group flex flex-1 items-center gap-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg',
                        collapsed && !isHoveredLocal ? 'justify-center py-1' : 'px-2 py-1',
                        isActive || isExpanded ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center shrink-0 rounded-full transition-colors duration-200 h-9 w-9',
                          isActive || isExpanded
                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                            : 'text-muted-foreground group-hover:text-orange-500'
                        )}
                      >
                        {Icon ? <Icon className="h-5 w-5" /> : null}
                      </div>
                      <span className={cn('truncate', collapsed && !isHoveredLocal && 'sr-only')}>
                        {labelText}
                      </span>
                    </Link>
                    {(!collapsed || isHoveredLocal) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSection(item.id);
                        }}
                        aria-expanded={isExpanded}
                        aria-label="Toggle section"
                        className={cn(
                          'px-3 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors shrink-0 rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none',
                          isExpanded ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={cn(
                            'transition-transform duration-200 ease-in-out',
                            isExpanded ? '-rotate-180' : 'rotate-0'
                          )}
                        >
                          <polygon points="5 8 19 8 12 16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <ForwardedLink
                    to={item.path || '#'}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (collapsed && !isHoveredLocal) setSidebarCollapsed(true);
                      if (isHoveredLocal) setHoveredItemId(null);
                    }}
                    className={cn(
                      'group flex items-center gap-3 text-sm font-medium w-full outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200 rounded-lg',
                      collapsed && !isHoveredLocal ? 'justify-center py-1.5' : 'px-3 py-1.5',
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center shrink-0 rounded-full transition-colors duration-200 h-9 w-9',
                        isActive
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'text-muted-foreground group-hover:text-orange-500'
                      )}
                    >
                      {Icon ? <Icon className="h-5 w-5" /> : null}
                    </div>
                    <span className={cn('truncate', collapsed && !isHoveredLocal && 'sr-only')}>
                      {labelText}
                    </span>
                  </ForwardedLink>
                )}

                {hasChildren && (!collapsed || isHoveredLocal) && isExpanded && (
                  <div className="space-y-1 mt-1 pb-2 border-l-2 border-border/50 rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-0 ms-6 rtl:me-6 rtl:ms-0 pl-3 rtl:pr-3">
                    {item.children!.map((child) => {
                      const isChildActive =
                        location.pathname + location.search === child.path;
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.id}
                          to={child.path || '#'}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            if (isHoveredLocal) setHoveredItemId(null);
                          }}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors duration-200',
                            isChildActive
                              ? 'bg-primary/10 text-primary font-semibold relative after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-4 after:bg-primary after:rounded-r-full rtl:after:right-0 rtl:after:left-auto rtl:after:rounded-l-full rtl:after:rounded-r-none'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          {ChildIcon ? (
                            <ChildIcon
                              className={cn(
                                'h-4 w-4 shrink-0',
                                isChildActive ? 'text-primary' : 'opacity-70'
                              )}
                            />
                          ) : null}
                          <span className="truncate">{t(child.labelKey)}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            );

            return (
              <div
                key={item.id}
                className="relative space-y-1"
                onMouseEnter={() => { if (collapsed) setHoveredItemId(item.id); }}
                onMouseLeave={() => { if (collapsed) setHoveredItemId(null); }}
              >
                {/* Base element invisible if hovered so we don't duplicate click targets, but takes up layout space */}
                <div className={cn("transition-opacity duration-200 w-full", isHoveredLocal ? "opacity-0 pointer-events-none" : "opacity-100")}>
                  {wrapWithTooltip(innerContent)}
                </div>

                {/* The expanded hover absolute overlay */}
                {isHoveredLocal && (
                  <div className={cn(
                    "absolute top-0 w-[240px] z-[100] bg-card border border-border/50 shadow-xl rounded-lg p-1.5 -mx-1.5",
                    i18n.dir() === 'rtl' ? 'right-0' : 'left-0'
                  )}>
                    {innerContent}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className={cn('p-4 border-t border-border/50 text-center', collapsed && 'px-4 pb-6')}>
          <div className={cn('flex items-center px-2 py-1', collapsed ? 'justify-start' : 'justify-between')}>
            {!collapsed && (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mr-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Online</span>
              </div>
            )}
            <span className={cn('text-xs text-muted-foreground/70 font-mono', collapsed ? 'mx-0' : '')}>v1.0.0</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-card border-e border-border/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20',
          'transition-[width] duration-200 ease-in-out',
          isSidebarCollapsed ? 'w-16' : 'w-[280px]'
        )}
      >
        <NavContent collapsed={isSidebarCollapsed} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <header className="bg-background/80 backdrop-blur-md border-b border-border/60 z-10 sticky top-0 supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="فتح القائمة"
                    type="button"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side={i18n.dir() === 'rtl' ? 'right' : 'left'}
                  className="p-0 w-[280px] border-border/60"
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <NavContent collapsed={false} />
                </SheetContent>
              </Sheet>

              <Link to="/dashboard" className="flex items-center gap-2" aria-label="Dashboard Home">
                <h2 className="text-lg font-bold text-foreground lg:hidden tracking-tight">Smart HR</h2>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
              {searchOpen ? (
                <div className="relative w-full">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('common.searchPlaceholder', 'بحث عن موظف، حالة، أو قسم...')}
                    className="ps-9 pe-8 h-9 bg-muted/50 border-border/50 text-sm"
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchQuery('');
                        setSearchOpen(false);
                      }
                    }}
                  />
                  <button
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    aria-label="إغلاق البحث"
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 h-9 text-sm text-muted-foreground bg-muted/40 hover:bg-muted/60 rounded-lg border border-border/40 transition-colors w-full max-w-[280px]"
                  aria-label="فتح البحث"
                  type="button"
                >
                  <Search className="h-4 w-4 shrink-0" />
                  <span className="truncate">{t('common.searchPlaceholder', 'بحث...')}</span>
                  <kbd className="ms-auto hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                    ⌘K
                  </kbd>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex h-9 gap-1.5 text-xs font-semibold"
                onClick={handleQuickCreateCase}
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">حالة جديدة</span>
              </Button>

              <button
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                onClick={() => navigate('/dashboard/alerts')}
                aria-label={`التنبيهات${unreadCount > 0 ? ` (${unreadCount} غير مقروء)` : ''}`}
                type="button"
              >
                <Bell className="h-5 w-5 shrink-0" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold animate-in zoom-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors hidden sm:flex"
                onClick={toggleLanguage}
                aria-label={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                title={i18n.language === 'ar' ? 'EN' : 'AR'}
                type="button"
              >
                <Globe className="h-5 w-5 shrink-0" />
              </button>

              <Link
                to="/dashboard/settings"
                title={t('nav.settings', 'Settings')}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors hidden sm:flex"
              >
                <Settings className="h-5 w-5 shrink-0" />
              </Link>

              <div className="h-8 w-px bg-border/60 hidden sm:block mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-3 ps-1 pe-3 py-1 bg-accent/30 rounded-full border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
                      <UserIcon className="h-4 w-4 shrink-0" />
                    </div>
                    <div className="text-sm hidden sm:block pe-1">
                      <p className="font-semibold text-foreground leading-none">
                        {user?.fullName || 'Admin Name User'}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 capitalize font-medium">
                        {user?.role || 'Administrator'}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">{user?.email || ''}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(user?.id ? `/dashboard/employees/${user.id}` : '/dashboard/employees')} className="cursor-pointer text-sm gap-2">
                    <UserIcon className="h-4 w-4 shrink-0" />
                    الملف الشخصي
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="cursor-pointer text-sm gap-2">
                    <Settings className="h-4 w-4 shrink-0" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-sm gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 shrink-0" />
                    {t('common.logout', 'تسجيل الخروج')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/30 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}