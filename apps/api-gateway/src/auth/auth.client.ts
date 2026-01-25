import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const AUTH_SERVICE = 'AUTH_SERVICE';

export const authClientProvider = {
  provide: AUTH_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 4001,
      },
    }),
};