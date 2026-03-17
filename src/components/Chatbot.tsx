'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles, Copy, Check, CornerDownRight } from 'lucide-react';
import { emailApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'bot';
  content: string;
  isReply?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I'm your AI Email Assistant. I can help you craft professional replies or generate new emails. What would you like to do?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState('formal');
  const { activeGmailAccount } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await emailApi.chatbotReply({
        userInstruction: input,
        tone: tone,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const botMsg = { 
        role: 'bot' as const, 
        content: response.data.reply,
        isReply: response.data.isOnTopic 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "Something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a temporary "Copied!" state here
  };

  if (!activeGmailAccount) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[520px] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-primary flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-black text-sm uppercase tracking-wider">Email Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg text-primary-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none shadow-md' 
                  : 'bg-muted text-foreground rounded-tl-none border border-border shadow-sm'
                }`}>
                  {msg.isReply ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary/60 dark:text-primary/40 mb-1">
                        <Sparkles className="w-3 h-3" />
                        AI Generated Content
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed italic border-l-2 border-primary/20 pl-3">
                        {msg.content}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => copyToClipboard(msg.content)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-lg text-[10px] font-bold hover:bg-muted transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold hover:opacity-90 transition-colors">
                          <CornerDownRight className="w-3 h-3" />
                          Use This
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-2xl rounded-tl-none border border-border animate-pulse">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-foreground/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)}
                className="text-[10px] font-bold uppercase bg-background border border-border rounded-lg px-2 py-1 outline-none"
              >
                <option value="formal">Formal</option>
                <option value="semi-formal">Semi-Formal</option>
                <option value="casual">Casual</option>
              </select>
              <span className="text-[10px] text-muted-foreground font-medium">Tone</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Reply to..."
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[9px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-bold">
              This assistant only helps generate emails.
            </p>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-95 group ${
          isOpen ? 'bg-background border border-border text-foreground rotate-90' : 'bg-primary text-primary-foreground hover:scale-105'
        }`}
      >
        {isOpen ? <X className="w-8 h-8" /> : (
          <div className="relative">
            <MessageSquare className="w-8 h-8" />
            <div className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-primary/10">AI</div>
          </div>
        )}
      </button>
    </div>
  );
}

// Add these imports at the top
import { Mail } from 'lucide-react';
