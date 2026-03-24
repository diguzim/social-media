import { useEffect, useRef, useState, useTransition } from 'react';
import { getProfile, getUserProfile } from '../../../../services/auth';
import type { UserProfile } from '../../../../services/auth';
import type { HomeStateContract } from '../../home-state.contract';

export function useHomeStatePresenter(): HomeStateContract {
  const initialCachedUserRef = useRef<UserProfile | null>(getUserProfile());
  const [user, setUser] = useState<UserProfile | null>(initialCachedUserRef.current);
  const [profileError, setProfileError] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(initialCachedUserRef.current === null);
  const [isProfileRefreshing, setIsProfileRefreshing] = useState(
    initialCachedUserRef.current !== null
  );
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [, startFeedRefreshTransition] = useTransition();

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (!isActive) {
          return;
        }

        setUser(profile);
      } catch (err) {
        if (!isActive) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setProfileError(message);

        if (!initialCachedUserRef.current) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setIsProfileLoading(false);
          setIsProfileRefreshing(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const refreshFeed = () => {
    startFeedRefreshTransition(() => {
      setFeedRefreshKey((prev) => prev + 1);
    });
  };

  return {
    state: {
      user,
      profileError,
      isProfileLoading,
      isProfileRefreshing,
      feedRefreshKey,
    },
    actions: {
      refreshFeed,
    },
  };
}
