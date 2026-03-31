import { Module, Provider } from "@nestjs/common";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";
import { InMemoryFriendRequestRepository } from "./in-memory/repositories/in-memory-friend-request.repository";

const inMemoryProviders: Provider[] = [
  {
    provide: FriendRequestRepository,
    useClass: InMemoryFriendRequestRepository,
  },
];

@Module({
  providers: [...inMemoryProviders],
  exports: [FriendRequestRepository],
})
export class DatabaseModule {}
