'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { emailApi } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      emailApi.exchangeGmailToken(code)
        .then((response) => {
          const { access_token, refresh_token } = response.data;
          
          // Store the tokens for our app
          if (access_token) localStorage.setItem('access_token', access_token);
          if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
          
          setStatus('success');
          // Redirect to dashboard since the user is now logged in
          setTimeout(() => router.push('/dashboard'), 2000);
        })
        .catch((err) => {
          console.error('Exchange error:', err);
          setStatus('error');
          setError(err.response?.data?.detail || 'Failed to link Gmail account');
        });
    } else {
      setStatus('error');
      setError('No authorization code found in URL');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-card border border-border p-8 rounded-3xl text-center space-y-6 shadow-2xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-black text-foreground">Linking Account...</h1>
            <p className="text-muted-foreground">Exchanging authorization code for secure tokens.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Account Linked!</h1>
            <p className="text-muted-foreground">Your Gmail is now connected. Redirecting you to selection...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-destructive/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-destructive/20 text-destructive">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-foreground">Connection Failed</h1>
            <p className="text-destructive font-medium">{error}</p>
            <button 
              onClick={() => router.push('/auth/gmail/select')}
              className="mt-4 px-6 py-2 bg-foreground text-background rounded-xl font-bold"
            >
              Back to Selection
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GmailCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
