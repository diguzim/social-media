import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfile } from '../../../../services/auth';
import type { UserProfileStateContract } from '../../user-profile-state.contract';

export function useUserProfileStatePresenter(): UserProfileStateContract {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfileStateContract['state']['profile']>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setError('Invalid user profile route');
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await getPublicProfile(userId);
      setProfile(response);
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const refresh = useCallback(async () => {
    await fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    state: {
      profile,
      error,
      isLoading,
    },
    actions: {
      refresh,
    },
  };
}
