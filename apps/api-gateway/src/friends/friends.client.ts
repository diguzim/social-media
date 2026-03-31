import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const FRIENDSHIP_SERVICE = 'FRIENDSHIP_SERVICE';

export const friendshipClientProvider = {
  provide: FRIENDSHIP_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.FRIENDSHIP_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.FRIENDSHIP_SERVICE_PORT || '4005', 10),
      },
    }),
};
