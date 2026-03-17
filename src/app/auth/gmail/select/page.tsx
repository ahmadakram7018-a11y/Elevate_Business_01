'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { emailApi } from '@/lib/api';
import { Mail, Plus, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

export default function GmailSelectPage() {
  const { user, gmailAccounts, activeGmailAccount, selectGmailAccount, loading: authLoading, fetchGmailAccounts } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleAddAccount = async () => {
    setLoading(true);
    try {
      const response = await emailApi.getGmailAuthUrl();
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to get auth URL", error);
      setLoading(false);
    }
  };

  const handleSelect = async (id: number) => {
    setLoading(true);
    await selectGmailAccount(id);
    router.push('/dashboard');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Connect Gmail</h1>
          <p className="text-muted-foreground font-medium">Link your business accounts to Elevate Business AI</p>
        </div>

        <div className="space-y-3">
          {gmailAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => handleSelect(acc.id)}
              disabled={loading}
              className={`w-full group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                acc.is_active 
                ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' 
                : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  acc.is_active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {acc.email.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{acc.email}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    {acc.is_active ? 'Active Account' : 'Click to select'}
                  </p>
                </div>
              </div>
              {acc.is_active ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          ))}

          <button
            onClick={handleAddAccount}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <>
                <div className="bg-muted group-hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">Link New Gmail Account</span>
              </>
            )}
          </button>
        </div>

        {activeGmailAccount && (
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-foreground text-background font-black rounded-2xl hover:opacity-90 transition-all shadow-xl active:scale-[0.98]"
          >
            Continue to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
