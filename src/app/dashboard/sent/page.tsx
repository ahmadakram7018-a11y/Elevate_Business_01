'use client';

import React, { useState, useEffect } from 'react';
import { emailApi } from '@/lib/api';
import { 
  Loader2,
  CheckCircle2,
  Send,
  ChevronLeft,
  Calendar,
  User,
  Mail,
  Inbox
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
  timestamp: string;
  received_at?: string;
  sent_at?: string;
}

export default function SentHistoryPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      // Fetch only emails with status 'sent'
      const response = await emailApi.getHistory(undefined, 'sent');
      setEmails(response.data);
    } catch (error) {
      console.error("Failed to fetch sent emails", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-slate-500 font-medium">Loading sent history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition-all">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
          <Send className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sent History</h1>
          <p className="text-muted-foreground text-sm">Review all emails handled by AI</p>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">No sent emails yet</h2>
          <p className="text-muted-foreground">Emails you send via AI will appear here.</p>
          <Link 
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-all"
          >
            Go to Inbox
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {emails.map((email) => (
            <div key={email.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      <User className="w-3 h-3" />
                      {email.sender}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{email.subject}</h3>
                    <div className="flex flex-col gap-1">
                      {email.received_at && (
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                          <Inbox className="w-3 h-3" />
                          Received: {formatDate(email.received_at)}
                        </div>
                      )}
                      {email.sent_at && (
                        <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-tight">
                          <CheckCircle2 className="w-3 h-3" />
                          Sent: {formatDate(email.sent_at)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      SENT
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${
                      email.classification === 'urgent' ? 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300' :
                      email.classification === 'important' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' :
                      'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {email.classification}
                    </div>
                  </div>
                </div>
                <div className="bg-card/80 p-4 rounded-xl border border-border/60 backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Original Summary</p>
                  <p className="text-muted-foreground text-sm italic">{email.summary}</p>
                </div>
              </div>

              <div className="p-6 bg-card">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Sent Response
                    </label>
                  </div>
                  <div className="w-full p-5 bg-muted border border-border rounded-2xl text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {email.generated_reply}
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
