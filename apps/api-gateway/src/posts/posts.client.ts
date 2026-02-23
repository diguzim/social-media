import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const POSTS_SERVICE = 'POSTS_SERVICE';

export const postsClientProvider = {
  provide: POSTS_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 4001,
      },
    }),
};
