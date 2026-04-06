import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { API } from '@repo/contracts';
import {
  Button,
  Container,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Modal,
  Section,
  Stack,
  useDropdownMenu,
} from '@repo/ui';
import { useUserProfileStateContract } from '../state-contracts/user-profile';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import {
  PROFILE_SECTION_TABS,
  ProfileSectionsTabs,
  normalizeProfileSection,
  type ProfileSectionKey,
} from '../components/profile/ProfileSectionsTabs';
import { getProfile, uploadProfileAvatar } from '../services/auth';
import { getUserPhotos } from '../services/photos';
import { AboutSection } from './UserProfile/components/AboutSection';
import { FriendsSection } from './UserProfile/components/FriendsSection';
import { PhotosSection } from './UserProfile/components/PhotosSection';
import { PersonalSection } from './UserProfile/components/PersonalSection';
import { TimelineSection } from './UserProfile/components/TimelineSection';

const DEFAULT_AVATAR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2260%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2260%22 y=%2266%22 text-anchor=%22middle%22 font-size=%2214%22 fill=%22%23334155%22%3EAvatar%3C/text%3E%3C/svg%3E';

interface OwnAvatarActionsMenuProps {
  isUploading: boolean;
  onSeeImage: () => void;
  onChangeImage: () => void;
}

function OwnAvatarActionsMenu({
  isUploading,
  onSeeImage,
  onChangeImage,
}: OwnAvatarActionsMenuProps) {
  const { close } = useDropdownMenu();

  return (
    <>
      <Button
        type="button"
        variant="link"
        fullWidth
        data-testid="user-profile-avatar-see-image-action"
        onClick={() => {
          close();
          onSeeImage();
        }}
        className="justify-start rounded-none border-b border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-100"
      >
        See image
      </Button>
      <Button
        type="button"
        variant="link"
        fullWidth
        data-testid="user-profile-avatar-change-image-action"
        onClick={() => {
          close();
          onChangeImage();
        }}
        isPending={isUploading}
        pendingText="Opening..."
        className="justify-start rounded-none px-4 py-3 text-slate-700 hover:bg-slate-100"
      >
        Change image
      </Button>
    </>
  );
}

export function UserProfile() {
  const { state, actions } = useUserProfileStateContract();
  const navigate = useNavigate();
  const location = useLocation();
  const { username, section } = useParams<{ username: string; section?: string }>();
  const activeSection = normalizeProfileSection(section);
  const {
    profile,
    error,
    isLoading,
    isOwnProfile,
    posts,
    isPostsLoading,
    isLoadingMorePosts,
    hasMorePosts,
    postsError,
    postsLoadMoreError,
    friends,
    isFriendsLoading,
    friendsError,
    canViewAcceptedFriends,
  } = state;

  const [photosData, setPhotosData] = useState<API.GetUserPhotosResponse>({
    albums: [],
    unsortedPhotos: [],
  });
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState('');
  const [isAvatarActionsOpen, setIsAvatarActionsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [avatarCacheBuster, setAvatarCacheBuster] = useState<number | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const sentinelRef = useInfiniteScrollObserver({
    enabled: hasMorePosts && !isPostsLoading && !isLoadingMorePosts,
    onIntersect: () => {
      void actions.loadNextPostsPage();
    },
  });

  useEffect(() => {
    if (!username) {
      return;
    }

    const photoRouteSegments = location.pathname.split('/').filter(Boolean).slice(3);

    if (section === 'albums') {
      navigate(`/users/${username}/photos/unsorted`, { replace: true });
      return;
    }

    if (activeSection === 'photos' && photoRouteSegments.length === 0) {
      navigate(`/users/${username}/photos/unsorted`, { replace: true });
    }
  }, [activeSection, location.pathname, navigate, section, username]);

  useEffect(() => {
    if (activeSection !== 'photos' || !profile?.username) {
      return;
    }

    let isCancelled = false;

    const loadPhotos = async () => {
      setIsPhotosLoading(true);
      setPhotosError('');

      try {
        const response = await getUserPhotos(profile.username);
        if (!isCancelled) {
          setPhotosData(response);
        }
      } catch (err) {
        if (!isCancelled) {
          setPhotosError(err instanceof Error ? err.message : 'Failed to load photos');
        }
      } finally {
        if (!isCancelled) {
          setIsPhotosLoading(false);
        }
      }
    };

    void loadPhotos();

    return () => {
      isCancelled = true;
    };
  }, [activeSection, profile?.username]);

  useEffect(() => {
    setUploadedAvatarUrl(null);
    setAvatarCacheBuster(null);
  }, [username]);

  useEffect(() => {
    return () => {
      if (uploadedAvatarUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedAvatarUrl);
      }
    };
  }, [uploadedAvatarUrl]);

  const avatarBaseUrl = uploadedAvatarUrl ?? profile?.avatarUrl;
  const resolvedAvatarUrl = avatarBaseUrl
    ? avatarBaseUrl.startsWith('blob:') || avatarBaseUrl.startsWith('data:')
      ? avatarBaseUrl
      : `${avatarBaseUrl}${avatarBaseUrl.includes('?') ? '&' : '?'}v=${avatarCacheBuster ?? 'base'}`
    : DEFAULT_AVATAR_DATA_URL;
  const profileName = profile?.name ?? 'User';

  const openAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
  };

  const openAvatarPicker = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileSelected = async (fileList: FileList | null) => {
    const selectedFile = fileList?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    setAvatarUploadError('');
    setIsAvatarUploading(true);
    const localPreviewUrl = URL.createObjectURL(selectedFile);

    try {
      const uploadResult = await uploadProfileAvatar(selectedFile);
      if (uploadResult.imageUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setUploadedAvatarUrl(uploadResult.imageUrl);
      } else {
        setUploadedAvatarUrl(localPreviewUrl);
      }
      setAvatarCacheBuster(Date.now());
      await getProfile();
      await actions.refresh();
      setIsAvatarActionsOpen(false);
    } catch (uploadError) {
      URL.revokeObjectURL(localPreviewUrl);
      setAvatarUploadError(
        uploadError instanceof Error ? uploadError.message : 'Failed to upload profile image'
      );
    } finally {
      setIsAvatarUploading(false);

      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };

  const handlePublicAvatarClick = () => {
    setAvatarUploadError('');
    openAvatarModal();
  };

  const avatarSlot = isOwnProfile ? (
    <DropdownMenu
      open={isAvatarActionsOpen}
      onOpenChange={(open) => {
        setAvatarUploadError('');
        setIsAvatarActionsOpen(open);
      }}
      className="inline-flex"
    >
      <DropdownMenuTrigger
        data-testid="user-profile-avatar-trigger"
        variant="ghost"
        className="h-auto w-auto rounded-full bg-transparent p-0 hover:bg-transparent"
      >
        <img
          data-testid="user-profile-avatar-image"
          src={resolvedAvatarUrl}
          alt={`${profileName} profile`}
          className="h-20 w-20 rounded-full border border-slate-200 object-cover sm:h-24 sm:w-24"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        dataTestId="user-profile-avatar-actions-menu"
        align="start"
        side="bottom"
        offset="sm"
      >
        <OwnAvatarActionsMenu
          isUploading={isAvatarUploading}
          onSeeImage={openAvatarModal}
          onChangeImage={openAvatarPicker}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      type="button"
      data-testid="user-profile-avatar-trigger"
      variant="ghost"
      className="h-auto w-auto rounded-full bg-transparent p-0 hover:bg-transparent"
      onClick={handlePublicAvatarClick}
    >
      <img
        data-testid="user-profile-avatar-image"
        src={resolvedAvatarUrl}
        alt={`${profileName} profile`}
        className="h-20 w-20 rounded-full border border-slate-200 object-cover sm:h-24 sm:w-24"
      />
    </Button>
  );

  const onSectionChange = (nextSection: ProfileSectionKey) => {
    if (!username) {
      return;
    }

    if (nextSection === 'timeline') {
      navigate(`/users/${username}`);
      return;
    }

    if (nextSection === 'photos') {
      navigate(`/users/${username}/photos/unsorted`);
      return;
    }

    navigate(`/users/${username}/${nextSection}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="3xl" dataTestId="user-profile-loading-state">
        <Section hasBorder background="primary" className="text-center" padding="p-6">
          <p data-testid="user-profile-loading-text">Loading user profile...</p>
        </Section>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="3xl" dataTestId="user-profile-error-state">
        <Section hasBorder background="danger" className="text-center" padding="p-6">
          <p data-testid="user-profile-error-message" className="status-error">
            {error || 'User profile not found'}
          </p>
        </Section>
      </Container>
    );
  }

  return (
    <Container maxWidth="5xl" dataTestId="user-profile-page">
      <Stack gap="gap-4">
        <ProfileHeaderCard
          cardTestId="user-profile-card"
          avatarTestId="user-profile-avatar-image"
          avatarSlot={avatarSlot}
          nameTestId="user-profile-name"
          usernameTestId="user-profile-username"
          verifiedBadgeTestId="user-profile-verified-badge"
          statsTestId="user-profile-stats"
          comingSoonTestId="user-profile-stats-coming-soon"
          name={profile.name}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          postsCount={posts.length}
          isVerified={Boolean(profile.emailVerifiedAt)}
        />

        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          data-testid="user-profile-avatar-file-input"
          className="hidden"
          onChange={(event) => {
            void handleAvatarFileSelected(event.target.files);
          }}
        />

        {avatarUploadError ? (
          <p data-testid="user-profile-avatar-upload-error" className="text-sm text-danger-600">
            {avatarUploadError}
          </p>
        ) : null}

        <Modal
          isOpen={isAvatarModalOpen}
          onClose={closeAvatarModal}
          ariaLabel={`${profileName} avatar preview`}
          dataTestId="user-profile-avatar-modal"
          closeButtonTestId="user-profile-avatar-modal-close-button"
          dialogClassName="max-w-xl"
        >
          <img
            data-testid="user-profile-avatar-modal-image"
            src={resolvedAvatarUrl}
            alt={`${profileName} avatar`}
            className="max-h-[70vh] w-full rounded-md object-contain"
          />
        </Modal>

        <ProfileSectionsTabs
          tabs={PROFILE_SECTION_TABS}
          activeSection={activeSection}
          onChange={onSectionChange}
          testIdPrefix="user-profile-sections"
        />

        {activeSection === 'timeline' ? (
          <TimelineSection
            posts={posts}
            isPostsLoading={isPostsLoading}
            postsError={postsError}
            postsLoadMoreError={postsLoadMoreError}
            isLoadingMorePosts={isLoadingMorePosts}
            hasMorePosts={hasMorePosts}
            sentinelRef={sentinelRef}
            onRefreshPosts={() => {
              void actions.refreshPosts();
            }}
          />
        ) : null}

        {activeSection === 'photos' ? (
          <PhotosSection
            profileUsername={profile.username}
            photosData={photosData}
            isPhotosLoading={isPhotosLoading}
            photosError={photosError}
          />
        ) : null}

        {activeSection === 'about' ? <AboutSection /> : null}

        {activeSection === 'friends' ? (
          <FriendsSection
            friends={friends}
            isFriendsLoading={isFriendsLoading}
            friendsError={friendsError}
            canViewAcceptedFriends={canViewAcceptedFriends}
          />
        ) : null}

        {activeSection === 'personal' ? <PersonalSection /> : null}
      </Stack>
    </Container>
  );
}
