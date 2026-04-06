import { useState } from 'react';
import { Button } from '@repo/ui';
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
      _onVerified?.();
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
          <Button
            type="button"
            variant="link"
            size="sm"
            data-testid="unverified-email-banner-resend-button"
            onClick={handleResend}
            disabled={sending}
            className="cursor-pointer font-medium text-yellow-800 underline hover:text-yellow-900"
          >
            {sending ? 'Sending…' : 'Resend verification email'}
          </Button>
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
