import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const AUTH_SERVICE = 'AUTH_SERVICE';

export const authClientProvider = {
  provide: AUTH_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.AUTH_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.AUTH_SERVICE_PORT || '4001', 10),
      },
    }),
};
