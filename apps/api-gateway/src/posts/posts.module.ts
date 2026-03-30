import { Module } from '@nestjs/common';
import { postsClientProvider } from './posts.client';
import { authClientProvider } from '../auth/auth.client';
import { imageClientProvider } from '../images/image.client';
import { FeedService } from './feed.service';

@Module({
  providers: [
    postsClientProvider,
    authClientProvider,
    imageClientProvider,
    FeedService,
  ],
  exports: [
    postsClientProvider,
    authClientProvider,
    imageClientProvider,
    FeedService,
  ],
})
export class PostsModule {}
