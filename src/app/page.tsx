'use client';

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ChatInterface />
      </main>
    </div>
  );
}
