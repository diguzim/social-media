import { Feed } from '../feed/Feed';

interface HomeFeedSectionProps {
  refreshKey: number;
}

export function HomeFeedSection({ refreshKey }: HomeFeedSectionProps) {
  return (
    <div data-testid="home-feed-section">
      <Feed refreshKey={refreshKey} />
    </div>
  );
}
