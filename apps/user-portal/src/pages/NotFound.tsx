import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div data-testid="not-found-page" className="auth-container text-center">
      <h1 data-testid="not-found-title" className="text-6xl font-bold text-primary-600">
        404
      </h1>
      <h2 className="section-title mt-2">Page not found</h2>
      <p className="mt-3 text-slate-600">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link data-testid="not-found-home-link" to="/" className="btn-primary mt-6 inline-block">
        Go to home
      </Link>
    </div>
  );
}
