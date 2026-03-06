import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const POSTS_SERVICE = 'POSTS_SERVICE';

export const postsClientProvider = {
  provide: POSTS_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.POSTS_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.POSTS_SERVICE_PORT || '4002', 10),
      },
    }),
};
