import { HomeCreatePostSection } from '../components/home/HomeCreatePostSection';
import { HomeFeedSection } from '../components/home/HomeFeedSection';
import { useHomeStateContract } from '../state-contracts/home';

export function Home() {
  const { state, actions } = useHomeStateContract();

  return (
    <div data-testid="home-page" className="page-container max-w-5xl">
      <div>
        <HomeCreatePostSection onPostCreated={actions.refreshFeed} />
      </div>

      <div className="mt-7">
        <HomeFeedSection refreshKey={state.feedRefreshKey} />
      </div>
    </div>
  );
}
