import { CreatePostForm } from '../post/CreatePostForm';

interface HomeCreatePostSectionProps {
  onPostCreated: () => void;
}

export function HomeCreatePostSection({ onPostCreated }: HomeCreatePostSectionProps) {
  return (
    <div data-testid="home-create-post-section">
      <CreatePostForm onPostCreated={onPostCreated} />
    </div>
  );
}
