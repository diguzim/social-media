import type { EditableImage } from './types';

interface PostCardEditFormProps {
  postId: string;
  isPostSaving: boolean;
  title: string;
  content: string;
  images: EditableImage[];
  maxImages: number;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onImagesSelected: (files: FileList | null) => void;
  onSelectImage: (index: number) => void;
  onRemoveImage: (key: string) => void;
  onImageDragStart: (key: string) => void;
  onImageDrop: (key: string) => void;
}

export function PostCardEditForm({
  postId,
  isPostSaving,
  title,
  content,
  images,
  maxImages,
  onTitleChange,
  onContentChange,
  onImagesSelected,
  onSelectImage,
  onRemoveImage,
  onImageDragStart,
  onImageDrop,
}: PostCardEditFormProps) {
  return (
    <section data-testid={`post-edit-form-${postId}`} className="mb-3 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Title</label>
        <input
          data-testid={`post-edit-title-input-${postId}`}
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          disabled={isPostSaving}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-slate-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Content</label>
        <textarea
          data-testid={`post-edit-content-input-${postId}`}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          disabled={isPostSaving}
          rows={4}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-slate-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-700">Images</label>
        <input
          data-testid={`post-edit-images-input-${postId}`}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          disabled={isPostSaving}
          onChange={(event) => {
            onImagesSelected(event.target.files);
            event.currentTarget.value = '';
          }}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary-700"
        />
        <p className="mt-1 text-xs text-slate-500">
          Drag thumbnails to reorder • max {maxImages} images
        </p>

        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div
                key={image.key}
                draggable
                onDragStart={() => onImageDragStart(image.key)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => onImageDrop(image.key)}
                data-testid={`post-edit-image-item-${postId}-${index}`}
                className="group relative"
              >
                <button
                  type="button"
                  onClick={() => onSelectImage(index)}
                  className="overflow-hidden rounded border-2 border-slate-300 hover:border-primary-400"
                  aria-label={`Select image ${index + 1}`}
                >
                  <img
                    src={image.imageUrl}
                    alt="Editable post thumbnail"
                    className="h-14 w-14 object-cover"
                  />
                </button>
                <button
                  type="button"
                  data-testid={`post-edit-image-remove-${postId}-${index}`}
                  onClick={() => onRemoveImage(image.key)}
                  disabled={isPostSaving}
                  className="absolute -right-1 -top-1 rounded-full bg-danger-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                >
                  ×
                </button>
                {image.kind === 'new' && (
                  <span className="absolute bottom-0 left-0 rounded-tr bg-primary-700 px-1 text-[10px] text-white">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
