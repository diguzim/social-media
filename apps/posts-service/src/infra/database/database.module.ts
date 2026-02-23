import { Module } from "@nestjs/common";
import { PostRepository } from "src/core/domain/post/post.repository";
import { InMemoryPostRepository } from "./in-memory/repositories/in-memory-post.repository";

@Module({
  providers: [
    {
      provide: PostRepository,
      useClass: InMemoryPostRepository,
    },
  ],
  exports: [PostRepository],
})
export class DatabaseModule {}
