# Image Service

NestJS TCP microservice responsible for image storage concerns, starting with profile avatars.

## Purpose

- Receive profile avatar upload RPC requests from API Gateway
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
  ├─→ ImageStorageProvider (local filesystem implementation)
  └─→ ImageRepository (in-memory metadata)
```

## Commands

- `IMAGE_COMMANDS.uploadProfileImage`
  - Input: `{ userId, fileBase64, mimeType, originalName, fileSize }`
  - Output: `{ imageId, userId, mimeType, uploadedAt }`

- `IMAGE_COMMANDS.getProfileImage`
  - Input: `{ userId }`
  - Output: `{ imageId, userId, fileBase64, contentLength, mimeType, uploadedAt }`

## Validation Rules

- Allowed MIME types: `image/jpeg`, `image/png`
- Max file size: `2MB`
- Image is resized to `200x200` (`fit: cover`)

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
- Storage provider is abstracted so local filesystem can be swapped for S3-compatible storage later.
- Retrieval over RPC returns image bytes/metadata, so API Gateway does not depend on filesystem paths from this service.
