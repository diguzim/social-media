import { ClientProxyFactory, Transport } from '@nestjs/microservices';

export const IMAGE_SERVICE = 'IMAGE_SERVICE';

export const imageClientProvider = {
  provide: IMAGE_SERVICE,
  useFactory: () =>
    ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: process.env.IMAGE_SERVICE_HOST || 'localhost',
        port: parseInt(process.env.IMAGE_SERVICE_PORT || '4004', 10),
      },
    }),
};
