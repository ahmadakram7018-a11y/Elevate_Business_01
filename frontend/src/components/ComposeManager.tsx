'use client';

import React from 'react';
import { useCompose } from '@/context/ComposeContext';
import ComposeWindow from './ComposeWindow';

export default function ComposeManager() {
  const { openWindows, closeCompose, updateCompose, minimizeCompose } = useCompose();

  return (
    <>
      {openWindows.map((window, index) => (
        <ComposeWindow
          key={window.id}
          compose={window}
          index={index}
          onClose={closeCompose}
          onUpdate={updateCompose}
          onMinimize={minimizeCompose}
        />
      ))}
    </>
  );
}
