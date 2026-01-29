import { Module } from '@nestjs/common';
import { authClientProvider } from './auth.client';

@Module({
  providers: [authClientProvider],
  exports: [authClientProvider],
})
export class AuthModule {}
