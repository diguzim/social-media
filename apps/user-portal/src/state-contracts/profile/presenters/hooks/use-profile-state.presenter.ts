import { useCallback, useEffect, useState } from 'react';
import { getProfile, getUserProfile, uploadProfileAvatar } from '../../../../services/auth';
import type { ProfileStateContract } from '../../profile-state.contract';

export function useProfileStatePresenter(): ProfileStateContract {
  const [user, setUser] = useState<ProfileStateContract['state']['user']>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');

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

  const uploadAvatar = useCallback(
    async (file: File) => {
      setAvatarUploadError('');
      setIsAvatarUploading(true);

      try {
        await uploadProfileAvatar(file);
        await fetchProfile();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload profile image';
        setAvatarUploadError(message);
      } finally {
        setIsAvatarUploading(false);
      }
    },
    [fetchProfile]
  );

  return {
    state: {
      user,
      error,
      isLoading,
      isAvatarUploading,
      avatarUploadError,
    },
    actions: {
      refresh,
      uploadAvatar,
    },
  };
}
