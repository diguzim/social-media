import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const EMAIL_SERVICE = 'EMAIL_SERVICE';

export const emailClientProvider = {
  provide: EMAIL_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.EMAIL_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.EMAIL_SERVICE_PORT || '4006', 10),
      },
    }),
};
