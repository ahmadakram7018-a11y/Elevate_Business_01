'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ComposeState } from '@/components/ComposeWindow';

interface ComposeContextType {
  openWindows: ComposeState[];
  openCompose: (initialData?: Partial<ComposeState>) => void;
  closeCompose: (id: string) => void;
  updateCompose: (id: string, updates: Partial<ComposeState>) => void;
  minimizeCompose: (id: string) => void;
}

const ComposeContext = createContext<ComposeContextType | undefined>(undefined);

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const [openWindows, setOpenWindows] = useState<ComposeState[]>([]);

  const openCompose = useCallback((initialData?: Partial<ComposeState>) => {
    if (openWindows.length >= 3) {
      alert("You can only have 3 compose windows open at once.");
      return;
    }

    const newWindow: ComposeState = {
      id: Math.random().toString(36).substr(2, 9),
      to: '',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      isMinimized: false,
      isFullscreen: false,
      showCC: false,
      showBCC: false,
      ...initialData
    };

    setOpenWindows(prev => [newWindow, ...prev]);
  }, [openWindows]);

  const closeCompose = useCallback((id: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const updateCompose = useCallback((id: string, updates: Partial<ComposeState>) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const minimizeCompose = useCallback((id: string) => {
    setOpenWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  }, []);

  return (
    <ComposeContext.Provider value={{ openWindows, openCompose, closeCompose, updateCompose, minimizeCompose }}>
      {children}
    </ComposeContext.Provider>
  );
}

export function useCompose() {
  const context = useContext(ComposeContext);
  if (context === undefined) {
    throw new Error('useCompose must be used within a ComposeProvider');
  }
  return context;
}
