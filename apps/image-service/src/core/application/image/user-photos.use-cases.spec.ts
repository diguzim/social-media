import { BadRequestException } from "@nestjs/common";
import { CreateUserAlbumUseCase } from "./create-user-album.use-case";
import { DeleteUserAlbumUseCase } from "./delete-user-album.use-case";
import { DeleteUserPhotoUseCase } from "./delete-user-photo.use-case";
import { ListUserPhotosUseCase } from "./list-user-photos.use-case";
import { UpdateUserPhotoUseCase } from "./update-user-photo.use-case";
import { UploadUserPhotoUseCase } from "./upload-user-photo.use-case";
import { InMemoryUserAlbumRepository } from "src/infra/database/in-memory/repositories/in-memory-user-album.repository";
import { InMemoryUserPhotoRepository } from "src/infra/database/in-memory/repositories/in-memory-user-photo.repository";
import type { ImageStorageProvider } from "src/infra/storage/image-storage.provider";

const base64Png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO5M4jYAAAAASUVORK5CYII=";

describe("User photos + albums use cases", () => {
  const albumRepository = new InMemoryUserAlbumRepository();
  const photoRepository = new InMemoryUserPhotoRepository();

  const imageStorageProvider: ImageStorageProvider = {
    saveProfileImage: jest.fn(),
    readProfileImage: jest.fn(),
    savePostImage: jest.fn(),
    readPostImage: jest.fn(),
    saveUserPhoto: jest.fn(async () => "/tmp/user-photo.png"),
    readUserPhoto: jest.fn(async () => Buffer.from(base64Png, "base64")),
    deleteFile: jest.fn(async () => undefined),
  };

  const createAlbumUseCase = new CreateUserAlbumUseCase(albumRepository);
  const uploadUserPhotoUseCase = new UploadUserPhotoUseCase(
    photoRepository,
    albumRepository,
    imageStorageProvider,
  );
  const listUserPhotosUseCase = new ListUserPhotosUseCase(
    albumRepository,
    photoRepository,
  );
  const updateUserPhotoUseCase = new UpdateUserPhotoUseCase(
    photoRepository,
    albumRepository,
  );
  const deleteAlbumUseCase = new DeleteUserAlbumUseCase(
    albumRepository,
    photoRepository,
    imageStorageProvider,
  );
  const deleteUserPhotoUseCase = new DeleteUserPhotoUseCase(
    photoRepository,
    imageStorageProvider,
  );

  it("includes seeded alice scenarios (unsorted + album with photos + empty album)", async () => {
    const result = await listUserPhotosUseCase.execute("1");

    expect(result.unsortedPhotos.length).toBeGreaterThan(0);

    const seededAlbumWithPhotos = result.albums.find(
      (album) => album.name === "Alice Travel (Seed)",
    );
    const seededEmptyAlbum = result.albums.find(
      (album) => album.name === "Alice Empty Album (Seed)",
    );

    expect(seededAlbumWithPhotos).toBeDefined();
    expect(seededAlbumWithPhotos?.photos.length).toBeGreaterThan(0);
    expect(seededEmptyAlbum).toBeDefined();
    expect(seededEmptyAlbum?.photos.length).toBe(0);
  });

  it("creates albums and uploads photos (album + unsorted)", async () => {
    const album = await createAlbumUseCase.execute({
      ownerUserId: "u1",
      name: "Travel",
      description: "Trips",
    });

    await uploadUserPhotoUseCase.execute({
      ownerUserId: "u1",
      albumId: album.id,
      description: "Beach",
      fileBase64: base64Png,
      mimeType: "image/png",
      originalName: "beach.png",
      fileSize: 120,
    });

    await uploadUserPhotoUseCase.execute({
      ownerUserId: "u1",
      fileBase64: base64Png,
      mimeType: "image/png",
      originalName: "random.png",
      fileSize: 120,
    });

    const result = await listUserPhotosUseCase.execute("u1");

    expect(result.albums.length).toBeGreaterThan(0);
    expect(result.albums[0]?.photos.length).toBe(1);
    expect(result.unsortedPhotos.length).toBe(1);
  });

  it("allows moving a photo from album to unsorted", async () => {
    const album = await createAlbumUseCase.execute({
      ownerUserId: "u2",
      name: "Family",
    });

    const photo = await uploadUserPhotoUseCase.execute({
      ownerUserId: "u2",
      albumId: album.id,
      fileBase64: base64Png,
      mimeType: "image/png",
      originalName: "family.png",
      fileSize: 120,
    });

    const updated = await updateUserPhotoUseCase.execute({
      ownerUserId: "u2",
      photoId: photo.id,
      albumId: null,
      description: "now unsorted",
    });

    expect(updated.albumId).toBeNull();
    expect(updated.description).toBe("now unsorted");
  });

  it("deletes album photos after album deletion", async () => {
    const album = await createAlbumUseCase.execute({
      ownerUserId: "u3",
      name: "Nature",
    });

    const photo = await uploadUserPhotoUseCase.execute({
      ownerUserId: "u3",
      albumId: album.id,
      fileBase64: base64Png,
      mimeType: "image/png",
      originalName: "tree.png",
      fileSize: 120,
    });

    await deleteAlbumUseCase.execute({ ownerUserId: "u3", albumId: album.id });

    const after = await photoRepository.findById(photo.id);
    expect(after).toBeNull();
    expect(imageStorageProvider.deleteFile).toHaveBeenCalled();
  });

  it("deletes photo metadata and storage file", async () => {
    const photo = await uploadUserPhotoUseCase.execute({
      ownerUserId: "u4",
      fileBase64: base64Png,
      mimeType: "image/png",
      originalName: "one.png",
      fileSize: 120,
    });

    await deleteUserPhotoUseCase.execute({
      ownerUserId: "u4",
      photoId: photo.id,
    });

    const found = await photoRepository.findById(photo.id);
    expect(found).toBeNull();
    expect(imageStorageProvider.deleteFile).toHaveBeenCalled();
  });

  it("validates album name and mime type", async () => {
    await expect(
      createAlbumUseCase.execute({ ownerUserId: "u5", name: "   " }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      uploadUserPhotoUseCase.execute({
        ownerUserId: "u5",
        fileBase64: base64Png,
        mimeType: "text/plain",
        originalName: "bad.txt",
        fileSize: 120,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
