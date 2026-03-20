import { useEffect, useRef, useState, useTransition } from 'react';
import { getProfile, getUserProfile } from '../services/auth';
import type { UserProfile } from '../services/auth';
import { HomeCreatePostSection } from '../components/home/HomeCreatePostSection';
import { HomeFeedSection } from '../components/home/HomeFeedSection';
import { HomeProfileSummary } from '../components/home/HomeProfileSummary';

export function Home() {
  const initialCachedUserRef = useRef<UserProfile | null>(getUserProfile());
  const [user, setUser] = useState<UserProfile | null>(initialCachedUserRef.current);
  const [profileError, setProfileError] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(initialCachedUserRef.current === null);
  const [isProfileRefreshing, setIsProfileRefreshing] = useState(
    initialCachedUserRef.current !== null
  );
  const [feedKey, setFeedKey] = useState(0);
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
        if (!isActive) {
          return;
        }

        setIsProfileLoading(false);
        setIsProfileRefreshing(false);
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const handlePostCreated = () => {
    startFeedRefreshTransition(() => {
      setFeedKey((prev) => prev + 1);
    });
  };

  return (
    <div data-testid="home-page" className="page-container max-w-5xl">
      <HomeProfileSummary
        user={user}
        isLoading={isProfileLoading}
        isRefreshing={isProfileRefreshing}
        error={profileError}
      />

      <div className="mt-7">
        <HomeCreatePostSection onPostCreated={handlePostCreated} />
      </div>

      <div className="mt-7">
        <HomeFeedSection refreshKey={feedKey} />
      </div>
    </div>
  );
}
