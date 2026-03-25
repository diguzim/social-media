import { useCallback, useEffect, useState } from 'react';
import { getProfile, getUserProfile } from '../../../../services/auth';
import type { ProfileStateContract } from '../../profile-state.contract';

export function useProfileStatePresenter(): ProfileStateContract {
  const [user, setUser] = useState<ProfileStateContract['state']['user']>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      const profile = await getProfile();
      setUser(profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      const cachedUser = getUserProfile();
      if (cachedUser) {
        setUser(cachedUser);
        setError('');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refresh = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return {
    state: {
      user,
      error,
      isLoading,
    },
    actions: {
      refresh,
    },
  };
}
