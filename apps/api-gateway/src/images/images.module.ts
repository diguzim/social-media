import { Module } from '@nestjs/common';
import { imageClientProvider } from './image.client';

@Module({
  providers: [imageClientProvider],
  exports: [imageClientProvider],
})
export class ImagesModule {}
