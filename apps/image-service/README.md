# Image Service

NestJS TCP microservice responsible for image storage concerns, currently handling profile avatars, post images, and user photos/albums.

## Purpose

- Receive profile avatar and post image upload RPC requests from API Gateway
- Receive user photos/albums RPC requests from API Gateway
- Validate and normalize image uploads
- Resize avatars to `200x200`
- Persist files using a storage provider abstraction (local first, S3 later)
- Serve image metadata back to API Gateway

## Architecture

```
API Gateway (HTTP + multipart)
  ↓ TCP RPC
Image Service (Port 4004)
  ├─→ UploadProfileImageUseCase (validate + resize)
  ├─→ UploadPostImageUseCase (validate + persist original bytes)
  ├─→ User photos/albums use-cases (CRUD + list grouped/unsorted)
  ├─→ ImageStorageProvider (local filesystem implementation)
  └─→ In-memory repositories (profile/post image metadata + albums/photos metadata)
```

## Commands

- `IMAGE_COMMANDS.uploadProfileImage`
  - Input: `{ userId, fileBase64, mimeType, originalName, fileSize }`
  - Output: `{ imageId, userId, mimeType, uploadedAt }`

- `IMAGE_COMMANDS.getProfileImage`
  - Input: `{ userId }`
  - Output: `{ imageId, userId, fileBase64, contentLength, mimeType, uploadedAt }`

- `IMAGE_COMMANDS.uploadPostImage`
  - Input: `{ postId, userId, fileBase64, mimeType, originalName, fileSize }`
  - Output: `{ imageId, postId, mimeType, orderIndex, uploadedAt }`

- `IMAGE_COMMANDS.getPostImage`
  - Input: `{ postId, imageId }`
  - Output: `{ imageId, postId, fileBase64, contentLength, mimeType, orderIndex, uploadedAt }`

- `IMAGE_COMMANDS.deletePostImage`
  - Input: `{ postId, imageId, userId }`
  - Output: `{ success }`

- `IMAGE_COMMANDS.reorderPostImages`
  - Input: `{ postId, userId, imageOrder[] }`
  - Output: `{ success }`

- `IMAGE_COMMANDS.createUserAlbum`
  - Input: `{ ownerUserId, name, description? }`
  - Output: `{ album }`

- `IMAGE_COMMANDS.updateUserAlbum`
  - Input: `{ ownerUserId, albumId, name?, description? }`
  - Output: `{ album }`

- `IMAGE_COMMANDS.deleteUserAlbum`
  - Input: `{ ownerUserId, albumId }`
  - Output: `{ success }`

- `IMAGE_COMMANDS.listUserPhotos`
  - Input: `{ ownerUserId }`
  - Output: `{ albums: [{ ...album, photos[] }], unsortedPhotos[] }`

- `IMAGE_COMMANDS.uploadUserPhoto`
  - Input: `{ ownerUserId, albumId?, description?, fileBase64, mimeType, originalName, fileSize }`
  - Output: `{ photo }`

- `IMAGE_COMMANDS.updateUserPhoto`
  - Input: `{ ownerUserId, photoId, albumId?, description? }`
  - Output: `{ photo }`

- `IMAGE_COMMANDS.deleteUserPhoto`
  - Input: `{ ownerUserId, photoId }`
  - Output: `{ success }`

- `IMAGE_COMMANDS.getUserPhoto`
  - Input: `{ ownerUserId, photoId }`
  - Output: `{ photoId, ownerUserId, fileBase64, contentLength, mimeType, uploadedAt }`

## Validation Rules

- Allowed MIME types: `image/jpeg`, `image/png`
- Max file size: `2MB`
- Image is resized to `200x200` (`fit: cover`)

### Post images

- Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`
- Max file size: `10MB` per image
- Max images per post: `10`
- Bytes are stored without resize/transcoding for now

## Configuration

Environment variables (see `.env.example`):

```env
PORT=4004
IMAGE_STORAGE_DIR=/tmp/social-media-images
LOGS_TO_LOKI=true
LOKI_HOST=http://localhost
LOKI_PORT=3100
```

## Running

From app folder:

```sh
pnpm dev
```

From root:

```sh
pnpm --filter image-service dev
```

## Notes

- Metadata is currently in-memory and resets on restart.
- In-memory seeding includes baseline albums/photos for quick manual verification:
  - Alice (`userId=1`) has: unsorted photo, album with photo, and an empty album
  - Bob (`userId=2`) has a seeded album with one photo
- Storage provider is abstracted so local filesystem can be swapped for S3-compatible storage later.
- Retrieval over RPC returns image bytes/metadata, so API Gateway does not depend on filesystem paths from this service.
