import { CreatePostFormView } from './create-post-form/CreatePostFormView';
import { useCreatePostFormController } from './create-post-form/useCreatePostFormController';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const { state, actions } = useCreatePostFormController({ onPostCreated });

  return (
    <CreatePostFormView
      title={state.title}
      content={state.content}
      images={state.images}
      maxImages={state.maxImages}
      isSubmitting={state.isSubmitting}
      error={state.error}
      success={state.success}
      onTitleChange={actions.setTitle}
      onContentChange={actions.setContent}
      onImagesChange={actions.handleImagesChange}
      onRemoveImage={actions.handleRemoveImage}
      onSubmit={actions.handleSubmit}
    />
  );
}
