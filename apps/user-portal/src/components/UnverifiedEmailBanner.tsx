import { useState } from 'react';
import { requestEmailVerification } from '../services/auth';

interface UnverifiedEmailBannerProps {
  onVerified?: () => void;
}

export function UnverifiedEmailBanner({ onVerified: _onVerified }: UnverifiedEmailBannerProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setSending(true);
    setError('');
    try {
      await requestEmailVerification();
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      data-testid="unverified-email-banner"
      className="w-full bg-yellow-50 border-b border-yellow-300 px-4 py-3 text-sm text-yellow-800 flex items-center justify-between gap-4"
    >
      <span>⚠️ Please verify your email address to access all features.</span>

      <div className="flex items-center gap-3 shrink-0">
        {sent ? (
          <span data-testid="unverified-email-banner-sent" className="text-green-700 font-medium">
            Email sent! Check your inbox.
          </span>
        ) : (
          <button
            data-testid="unverified-email-banner-resend-button"
            onClick={handleResend}
            disabled={sending}
            className="underline font-medium hover:text-yellow-900 disabled:opacity-50 cursor-pointer"
          >
            {sending ? 'Sending…' : 'Resend verification email'}
          </button>
        )}

        {error && (
          <span data-testid="unverified-email-banner-error" className="text-red-600">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
