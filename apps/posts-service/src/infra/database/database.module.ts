import { Module } from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";
import { ReactionRepository } from "src/core/domain/reaction/reaction.repository";
import { InMemoryPostRepository } from "./in-memory/repositories/in-memory-post.repository";
import { InMemoryReactionRepository } from "./in-memory/repositories/in-memory-reaction.repository";

@Module({
  providers: [
    {
      provide: PostRepository,
      useClass: InMemoryPostRepository,
    },
    {
      provide: ReactionRepository,
      useClass: InMemoryReactionRepository,
    },
  ],
  exports: [PostRepository, ReactionRepository],
})
export class DatabaseModule {}
