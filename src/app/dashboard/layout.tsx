'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useCompose } from '@/context/ComposeContext';
import { useRouter, usePathname } from 'next/navigation';
import { emailApi } from '@/lib/api';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Star, 
  Inbox, 
  LogOut,
  Mail,
  Send,
  Moon,
  Sun,
  ChevronDown,
  Settings,
  Plus,
  Edit3
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { 
    user, 
    logout, 
    loading, 
    gmailAccounts, 
    activeGmailAccount, 
    selectGmailAccount, 
    fetchGmailAccounts 
  } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openCompose } = useCompose();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountDropdown, setShowAccountDropdown] = React.useState(false);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleAddAccount = async () => {
    try {
      const response = await emailApi.getGmailAuthUrl();
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to get auth URL", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-indigo-200 dark:bg-indigo-900 rounded-full"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Urgent', href: '/dashboard/urgent', icon: AlertCircle, color: 'text-red-500' },
    { name: 'Important', href: '/dashboard/important', icon: Star, color: 'text-amber-500' },
    { name: 'Normal', href: '/dashboard/normal', icon: Inbox, color: 'text-blue-500' },
    { name: 'Sent', href: '/dashboard/sent', icon: Send, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col z-20 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Mail className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground tracking-tight">Elevate Business</span>
        </div>

        <div className="px-4 mb-4">
          <button 
            onClick={() => openCompose()}
            className="w-full flex items-center gap-3 px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
          >
            <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Compose
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/20' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.color || ''} transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2 bg-muted/10">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded-xl transition-all"
          >
            <div className="p-1.5 bg-background border border-border rounded-lg shadow-sm">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-primary/20">
              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user.full_name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-3 px-4 py-2 bg-muted/50 border border-border rounded-xl hover:bg-muted transition-all active:scale-[0.98]"
              >
                <div className="bg-primary/10 w-6 h-6 rounded-md flex items-center justify-center text-primary text-[10px] font-black border border-primary/20">
                  {activeGmailAccount?.email.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="text-sm font-bold text-foreground truncate max-w-[180px]">
                  {activeGmailAccount?.email || 'No Account Selected'}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showAccountDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showAccountDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    {gmailAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          selectGmailAccount(acc.id);
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          acc.is_active 
                          ? 'bg-primary/5 border border-primary/20 text-primary' 
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            acc.is_active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {acc.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold truncate">{acc.email}</span>
                        </div>
                        {acc.is_active && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>}
                      </button>
                    ))}
                    <div className="pt-2 mt-1 border-t border-border">
                      <button
                        onClick={() => {
                          handleAddAccount();
                          setShowAccountDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-xs font-bold text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                        Link New Account
                      </button>
                      <button
                        onClick={() => {
                          router.push('/auth/gmail/select');
                          setShowAccountDropdown(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all rounded-xl"
                      >
                        <Settings className="w-4 h-4" />
                        Manage Accounts
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Additional topbar icons can go here */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/5 relative">
          <div className="p-8 max-w-6xl mx-auto">
            {!activeGmailAccount && pathname !== '/dashboard' && (
              <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between">
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">No active Gmail account. Some features may not work.</p>
                <button 
                  onClick={() => router.push('/auth/gmail/select')}
                  className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold"
                >
                  Fix Now
                </button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
