'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2, Send, Trash2, Sparkles, Paperclip, Type, Loader2 } from 'lucide-react';
import { emailApi } from '@/lib/api';

export interface ComposeState {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  isMinimized: boolean;
  isFullscreen: boolean;
  showCC: boolean;
  showBCC: boolean;
}

interface ComposeWindowProps {
  compose: ComposeState;
  onClose: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ComposeState>) => void;
  onMinimize: (id: string) => void;
  index: number;
}

export default function ComposeWindow({ compose, onClose, onUpdate, onMinimize, index }: ComposeWindowProps) {
  const [isSending, setIsSending] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [showAIAssist, setShowAIAssist] = useState(false);

  const handleSend = async () => {
    if (!compose.to) {
      alert("Please specify at least one recipient.");
      return;
    }
    setIsSending(true);
    try {
      await emailApi.sendNewEmail({
        to: compose.to,
        subject: compose.subject,
        body: compose.body
      });
      onClose(compose.id);
    } catch (error) {
      console.error("Failed to send email", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleImprove = async (instruction: string) => {
    setIsImproving(true);
    try {
      const response = await emailApi.improveEmail(compose.body, instruction);
      onUpdate(compose.id, { body: response.data.improvedBody });
      setShowAIAssist(false);
    } catch (error) {
      console.error("Failed to improve email", error);
    } finally {
      setIsImproving(false);
    }
  };

  if (compose.isMinimized) {
    return (
      <div 
        className="fixed bottom-0 bg-card border border-border shadow-2xl rounded-t-xl w-64 h-12 flex items-center justify-between px-4 cursor-pointer z-50 transition-all hover:bg-muted"
        style={{ right: `${80 + index * 270}px` }}
        onClick={() => onMinimize(compose.id)}
      >
        <span className="text-sm font-bold truncate">{compose.subject || 'New Message'}</span>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onClose(compose.id); }} className="p-1 hover:bg-foreground/10 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed bottom-0 bg-card border border-border shadow-2xl rounded-t-2xl flex flex-col z-50 transition-all duration-300 ${
        compose.isFullscreen ? 'inset-4 w-auto h-auto rounded-2xl' : 'w-[550px] h-[520px]'
      }`}
      style={compose.isFullscreen ? {} : { right: `${80 + index * 570}px` }}
    >
      {/* Header */}
      <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between rounded-t-2xl">
        <span className="text-sm font-bold text-foreground">{compose.subject || 'New Message'}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => onMinimize(compose.id)} className="p-1.5 hover:bg-foreground/10 rounded-lg transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={() => onUpdate(compose.id, { isFullscreen: !compose.isFullscreen })} className="p-1.5 hover:bg-foreground/10 rounded-lg transition-colors">
            {compose.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => onClose(compose.id)} className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground w-8">To</span>
          <input 
            type="text" 
            value={compose.to}
            onChange={(e) => onUpdate(compose.id, { to: e.target.value })}
            className="flex-1 bg-transparent outline-none text-sm text-foreground py-1"
          />
          <div className="flex gap-2">
            {!compose.showCC && <button onClick={() => onUpdate(compose.id, { showCC: true })} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">Cc</button>}
            {!compose.showBCC && <button onClick={() => onUpdate(compose.id, { showBCC: true })} className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors">Bcc</button>}
          </div>
        </div>

        {compose.showCC && (
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground w-8">Cc</span>
            <input 
              type="text" 
              value={compose.cc}
              onChange={(e) => onUpdate(compose.id, { cc: e.target.value })}
              className="flex-1 bg-transparent outline-none text-sm text-foreground py-1"
            />
          </div>
        )}

        {compose.showBCC && (
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground w-8">Bcc</span>
            <input 
              type="text" 
              value={compose.bcc}
              onChange={(e) => onUpdate(compose.id, { bcc: e.target.value })}
              className="flex-1 bg-transparent outline-none text-sm text-foreground py-1"
            />
          </div>
        )}

        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Subject"
            value={compose.subject}
            onChange={(e) => onUpdate(compose.id, { subject: e.target.value })}
            className="flex-1 bg-transparent outline-none text-sm font-bold text-foreground py-1 placeholder:text-muted-foreground/50"
          />
        </div>

        <div className="flex-1 relative flex flex-col">
          <textarea 
            value={compose.body}
            onChange={(e) => onUpdate(compose.id, { body: e.target.value })}
            className="flex-1 p-4 bg-transparent outline-none text-sm text-foreground resize-none leading-relaxed"
            placeholder="Write your message here..."
          />

          {showAIAssist && (
            <div className="absolute bottom-4 left-4 right-4 bg-card border border-primary/20 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  AI Assist
                </div>
                <button onClick={() => setShowAIAssist(false)} className="p-1 hover:bg-muted rounded-md text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Improve Tone', instruction: 'improve tone and make it professional' },
                  { label: 'Make Shorter', instruction: 'make this much shorter' },
                  { label: 'Make Formal', instruction: 'rewrite this to be very formal' },
                  { label: 'Fix Grammar', instruction: 'fix grammar and spelling' }
                ].map((act) => (
                  <button
                    key={act.label}
                    onClick={() => handleImprove(act.instruction)}
                    disabled={isImproving}
                    className="flex items-center justify-center p-2 text-[10px] font-bold border border-border rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50"
                  >
                    {isImproving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                    {act.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </button>
          <button 
            onClick={() => setShowAIAssist(!showAIAssist)}
            className="p-2.5 hover:bg-primary/10 text-primary rounded-xl transition-all"
            title="AI Assist"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-muted text-muted-foreground rounded-xl transition-all" title="Attach Files">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-muted text-muted-foreground rounded-xl transition-all" title="Formatting">
            <Type className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => onClose(compose.id)} className="p-2.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-all">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
