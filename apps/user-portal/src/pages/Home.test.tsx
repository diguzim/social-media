import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticatedLayout } from '../components/AuthenticatedLayout';
import { Home } from './Home';
import { getProfile, getUserProfile, requestEmailVerification } from '../services/auth';

vi.mock('../services/auth', () => ({
  getProfile: vi.fn(),
  getUserProfile: vi.fn(),
  requestEmailVerification: vi.fn(),
}));

vi.mock('../components/home/HomeCreatePostSection', () => ({
  HomeCreatePostSection: () => <div data-testid="home-create-post-section">Create post island</div>,
}));

vi.mock('../components/home/HomeFeedSection', () => ({
  HomeFeedSection: () => <div data-testid="home-feed-section">Feed island</div>,
}));

const mockedGetProfile = vi.mocked(getProfile);
const mockedGetUserProfile = vi.mocked(getUserProfile);
const mockedRequestEmailVerification = vi.mocked(requestEmailVerification);

const cachedUser = {
  id: 'user-1',
  name: 'Cached User',
  username: 'cached-user',
  email: 'cached@example.com',
  emailVerifiedAt: '2026-03-16T10:00:00.000Z',
};

function renderHomeRoute() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedRequestEmailVerification.mockResolvedValue({ message: 'sent' });
  });

  it('keeps the shell visible while the profile island refreshes from cached data', () => {
    mockedGetUserProfile.mockReturnValue(cachedUser);
    mockedGetProfile.mockReturnValue(new Promise(() => undefined));

    renderHomeRoute();

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('home-profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('home-profile-refreshing-status')).toHaveTextContent(
      'Refreshing your profile...'
    );
    expect(screen.getByTestId('home-create-post-section')).toBeInTheDocument();
    expect(screen.getByTestId('home-feed-section')).toBeInTheDocument();
  });

  it('keeps cached profile content visible when background refresh fails', async () => {
    mockedGetUserProfile.mockReturnValue(cachedUser);
    mockedGetProfile.mockRejectedValueOnce(new Error('Failed to fetch profile'));

    renderHomeRoute();

    expect(await screen.findByTestId('home-profile-refresh-error')).toHaveTextContent(
      'Showing cached profile. Failed to fetch profile'
    );
    expect(screen.getByTestId('home-profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('home-user-email')).toHaveTextContent('cached@example.com');
  });
});
