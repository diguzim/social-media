import { Module } from '@nestjs/common';
import { emailClientProvider } from './email.client';

@Module({
  providers: [emailClientProvider],
  exports: [emailClientProvider],
})
export class EmailModule {}
