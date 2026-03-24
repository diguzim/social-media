import { HomeCreatePostSection } from '../components/home/HomeCreatePostSection';
import { HomeFeedSection } from '../components/home/HomeFeedSection';
import { HomeProfileSummary } from '../components/home/HomeProfileSummary';
import { useHomeStateContract } from '../state-contracts/home';

export function Home() {
  const { state, actions } = useHomeStateContract();

  return (
    <div data-testid="home-page" className="page-container max-w-5xl">
      <HomeProfileSummary
        user={state.user}
        isLoading={state.isProfileLoading}
        isRefreshing={state.isProfileRefreshing}
        error={state.profileError}
      />

      <div className="mt-7">
        <HomeCreatePostSection onPostCreated={actions.refreshFeed} />
      </div>

      <div className="mt-7">
        <HomeFeedSection refreshKey={state.feedRefreshKey} />
      </div>
    </div>
  );
}
