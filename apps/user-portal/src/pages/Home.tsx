import { Container, Stack } from '@repo/ui';
import { HomeCreatePostSection } from '../components/home/HomeCreatePostSection';
import { HomeFeedSection } from '../components/home/HomeFeedSection';
import { useHomeStateContract } from '../state-contracts/home';

export function Home() {
  const { state, actions } = useHomeStateContract();

  return (
    <Container maxWidth="5xl" dataTestId="home-page">
      <Stack gap="gap-8">
        <HomeCreatePostSection onPostCreated={actions.refreshFeed} />
        <HomeFeedSection refreshKey={state.feedRefreshKey} />
      </Stack>
    </Container>
  );
}
