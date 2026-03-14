import { Module } from '@nestjs/common';
import { postsClientProvider } from './posts.client';
import { authClientProvider } from '../auth/auth.client';
import { FeedService } from './feed.service';

@Module({
  providers: [postsClientProvider, authClientProvider, FeedService],
  exports: [postsClientProvider, authClientProvider, FeedService],
})
export class PostsModule {}
