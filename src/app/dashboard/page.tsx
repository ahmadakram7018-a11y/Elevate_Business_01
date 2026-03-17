'use client';

import React, { useState, useEffect } from 'react';
import { emailApi } from '@/lib/api';
import { 
  RefreshCcw, 
  AlertCircle, 
  Star, 
  Inbox, 
  MailWarning,
  Loader2,
  Calendar,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

interface Stats {
  today: number;
  urgent: number;
  important: number;
  normal: number;
  spam: number;
  replied: number;
  non_replied: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchMode, setFetchMode] = useState<'top10' | 'today'>('top10');

  const fetchStats = async () => {
    try {
      const response = await emailApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchEmails = async () => {
    setFetching(true);
    try {
      await emailApi.fetch(fetchMode);
      await fetchStats();
    } catch (error) {
      console.error("Failed to fetch emails", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const primaryCards = [
    { label: "Today's Emails", value: stats?.today || 0, icon: Calendar, color: "bg-primary/5 text-primary border-primary/10 shadow-primary/5" },
    { label: "Replied", value: stats?.replied || 0, icon: CheckCircle2, color: "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 shadow-emerald-500/5" },
    { label: "Non-Replied", value: stats?.non_replied || 0, icon: MessageSquare, color: "bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/10 shadow-rose-500/5" },
  ];

  const categoryCards = [
    { label: "Urgent", value: stats?.urgent || 0, icon: AlertCircle, color: "bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/10" },
    { label: "Important", value: stats?.important || 0, icon: Star, color: "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10" },
    { label: "Normal", value: stats?.normal || 0, icon: Inbox, color: "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10" },
    { label: "Spam Blocked", value: stats?.spam || 0, icon: MailWarning, color: "bg-slate-500/5 text-muted-foreground border-slate-500/10" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Intelligence and performance at a glance.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-1.5 rounded-2xl border border-border pro-shadow w-fit">
          <div className="flex gap-1 bg-muted p-1 rounded-xl">
            <button 
              onClick={() => setFetchMode('top10')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${fetchMode === 'top10' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Recent 10
            </button>
            <button 
              onClick={() => setFetchMode('today')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${fetchMode === 'today' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Today's
            </button>
          </div>
          <button
            onClick={handleFetchEmails}
            disabled={fetching}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Sync Inbox
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-1">Key Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {primaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`p-8 rounded-3xl border bg-card pro-shadow-lg group hover:border-primary/20 transition-all duration-300`}>
                  <div className={`p-3 w-fit rounded-2xl border ${card.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-4xl font-black text-foreground">{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-1">Intelligence categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`p-6 rounded-3xl border bg-card pro-shadow hover:border-primary/10 transition-all duration-300`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl border ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-0.5">{card.label}</p>
                      <p className="text-xl font-extrabold text-foreground">{card.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"></div>
        <div className="relative z-10 text-center space-y-4 max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary text-primary-foreground rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <RefreshCcw className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-foreground">Deep Scan Inbox</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            Trigger our AI engine to re-scan your unread messages and generate optimized responses.
          </p>
          <button 
            onClick={handleFetchEmails}
            className="mt-6 px-10 py-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all font-bold shadow-xl shadow-primary/25 inline-block active:scale-95"
          >
            Launch Engine
          </button>
        </div>
      </div>
    </div>
  );
}
