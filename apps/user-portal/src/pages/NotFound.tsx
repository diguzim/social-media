import { Link } from 'react-router-dom';
import { Container, Section, Stack } from '../components/layout';

export function NotFound() {
  return (
    <Container maxWidth="md" dataTestId="not-found-page">
      <Section hasBorder background="primary" className="text-center shadow-card" padding="p-8">
        <Stack gap="gap-3" align="center">
          <h1 data-testid="not-found-title" className="text-6xl font-bold text-primary-600">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
          <p className="text-slate-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link data-testid="not-found-home-link" to="/" className="btn-primary mt-2 inline-block">
            Go to home
          </Link>
        </Stack>
      </Section>
    </Container>
  );
}
