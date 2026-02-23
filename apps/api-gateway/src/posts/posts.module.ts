import { Module } from '@nestjs/common';
import { postsClientProvider } from './posts.client';

@Module({
  providers: [postsClientProvider],
  exports: [postsClientProvider],
})
export class PostsModule {}
