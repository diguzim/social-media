import { Module } from '@nestjs/common';
import { friendshipClientProvider } from './friends.client';
import { authClientProvider } from '../auth/auth.client';
import { imageClientProvider } from '../images/image.client';

@Module({
  providers: [
    friendshipClientProvider,
    authClientProvider,
    imageClientProvider,
  ],
  exports: [friendshipClientProvider, authClientProvider, imageClientProvider],
})
export class FriendsModule {}
