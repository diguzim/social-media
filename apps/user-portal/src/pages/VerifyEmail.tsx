import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Section, Stack } from '@repo/ui';
import { confirmEmailVerification } from '../services/auth';

type VerificationState = 'pending' | 'success' | 'already_verified' | 'error';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState('error');
      setErrorMessage('No verification token found in the URL.');
      return;
    }

    confirmEmailVerification(token)
      .then((result) => {
        setState(result.status === 'already_verified' ? 'already_verified' : 'success');
      })
      .catch((err: unknown) => {
        setState('error');
        setErrorMessage(err instanceof Error ? err.message : 'Verification failed.');
      });
  }, [searchParams]);

  return (
    <Container maxWidth="md" dataTestId="verify-email-page">
      <Section hasBorder background="primary" className="text-center shadow-card" padding="p-6">
        <Stack gap="gap-4" align="center">
          {state === 'pending' && <p data-testid="verify-email-pending">Verifying your email…</p>}

          {state === 'success' && (
            <>
              <h1
                data-testid="verify-email-success-title"
                className="text-2xl font-bold text-slate-900"
              >
                Email verified!
              </h1>
              <p className="text-slate-600">
                Your email has been confirmed. You can now use all features.
              </p>
              <Link
                data-testid="verify-email-go-home-link"
                to="/"
                className="btn-primary inline-block"
              >
                Go to home
              </Link>
            </>
          )}

          {state === 'already_verified' && (
            <>
              <h1
                data-testid="verify-email-already-title"
                className="text-2xl font-bold text-slate-900"
              >
                Already verified
              </h1>
              <p className="text-slate-600">Your email address has already been confirmed.</p>
              <Link
                data-testid="verify-email-go-home-link"
                to="/"
                className="btn-primary inline-block"
              >
                Go to home
              </Link>
            </>
          )}

          {state === 'error' && (
            <>
              <h1
                data-testid="verify-email-error-title"
                className="text-2xl font-bold text-red-600"
              >
                Verification failed
              </h1>
              <p data-testid="verify-email-error-message" className="status-error">
                {errorMessage}
              </p>
              <p className="text-sm text-slate-600">
                The link may have expired.{' '}
                <Link to="/" className="link-primary">
                  Go home
                </Link>{' '}
                and request a new one.
              </p>
            </>
          )}
        </Stack>
      </Section>
    </Container>
  );
}
