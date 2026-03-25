'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { emailApi } from '@/lib/api';
import { 
  AlertCircle, 
  Star, 
  Inbox, 
  Loader2,
  CheckCircle2,
  Send,
  FileEdit,
  Save,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

interface Email {
  id: number;
  sender: string;
  subject: string;
  summary: string;
  generated_reply: string;
  status: string;
  classification: string;
  received_at?: string;
  sent_at?: string;
}

const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function CategoryPage() {
  const { category } = useParams() as { category: string };
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await emailApi.getHistory(category);
      setEmails(response.data);
    } catch (error) {
      console.error("Failed to fetch emails", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [category]);

  const handleReplyChange = (id: number, value: string) => {
    setEmails(emails.map(email => 
      email.id === id ? { ...email, generated_reply: value } : email
    ));
  };

  const handleAction = async (id: number, action: 'draft' | 'send') => {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    setActing(id);
    try {
      await emailApi.takeAction(id, action, email.generated_reply);
      // Update local state
      setEmails(emails.map(e => 
        e.id === id ? { ...e, status: action === 'draft' ? 'drafted' : 'sent' } : e
      ));
    } catch (error) {
      console.error(`Failed to ${action} email`, error);
    } finally {
      setActing(null);
    }
  };

  const handleSave = async (id: number) => {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    setActing(id);
    try {
      await emailApi.updateHistory(id, { generated_reply: email.generated_reply });
      alert("Saved successfully!");
    } catch (error) {
      console.error("Failed to save email", error);
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const categoryInfo = {
    urgent: { icon: AlertCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', label: 'Urgent' },
    important: { icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'Important' },
    normal: { icon: Inbox, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'Normal' },
  }[category] || { icon: Inbox, color: 'text-muted-foreground', bg: 'bg-muted', label: category };

  const Icon = categoryInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-all">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className={`p-2 rounded-lg ${categoryInfo.bg}`}>
          <Icon className={`w-6 h-6 ${categoryInfo.color}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">{categoryInfo.label} Emails</h1>
          <p className="text-muted-foreground text-sm">Manage and respond to your {category} messages</p>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">All caught up!</h2>
          <p className="text-muted-foreground">No {category} emails found in your history.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {emails.map((email) => (
            <div key={email.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-4 md:p-6 border-b border-border bg-muted/30">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider truncate max-w-[200px]">{email.sender}</p>
                      {email.received_at && (
                        <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">• {formatDateTime(email.received_at)}</span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground truncate">{email.subject}</h3>
                    {email.sent_at && (
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tight">
                        <CheckCircle2 className="w-3 h-3" />
                        Sent on {formatDateTime(email.sent_at)}
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap ${
                    email.status === 'sent' ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300' : 
                    email.status === 'drafted' ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300' : 
                    'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                  }`}>
                    {email.status.toUpperCase()}
                  </div>
                </div>
                <div className="bg-card p-3 md:p-4 rounded-xl border border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 md:mb-2">AI Summary</p>
                  <p className="text-foreground text-xs md:text-sm leading-relaxed">{email.summary}</p>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-2 block">AI Generated Reply</label>
                  <textarea
                    value={email.generated_reply || ''}
                    onChange={(e) => handleReplyChange(email.id, e.target.value)}
                    rows={window.innerWidth < 640 ? 4 : 5}
                    className="w-full p-3 md:p-4 bg-muted border border-border rounded-xl text-xs md:text-sm text-foreground focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="AI is generating a reply..."
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <button
                    onClick={() => handleSave(email.id)}
                    disabled={acting === email.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg text-xs md:text-sm font-semibold transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Edit
                  </button>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
                    <button
                      onClick={() => handleAction(email.id, 'draft')}
                      disabled={acting === email.id || email.status === 'sent'}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-card border border-border text-foreground hover:bg-muted rounded-lg text-xs md:text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {acting === email.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileEdit className="w-4 h-4" />}
                      Create Draft
                    </button>
                    <button
                      onClick={() => handleAction(email.id, 'send')}
                      disabled={acting === email.id || email.status === 'sent'}
                      className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs md:text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      {acting === email.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
