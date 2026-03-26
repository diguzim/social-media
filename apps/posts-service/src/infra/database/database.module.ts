import { Module } from "@nestjs/common";
import { CommentRepository } from "src/core/domain/comment/comment.repository";
import { PostRepository } from "src/core/domain/post/post.repository";
import { ReactionRepository } from "src/core/domain/reaction/reaction.repository";
import { InMemoryCommentRepository } from "./in-memory/repositories/in-memory-comment.repository";
import { InMemoryPostRepository } from "./in-memory/repositories/in-memory-post.repository";
import { InMemoryReactionRepository } from "./in-memory/repositories/in-memory-reaction.repository";

@Module({
  providers: [
    {
      provide: PostRepository,
      useClass: InMemoryPostRepository,
    },
    {
      provide: CommentRepository,
      useClass: InMemoryCommentRepository,
    },
    {
      provide: ReactionRepository,
      useClass: InMemoryReactionRepository,
    },
  ],
  exports: [PostRepository, CommentRepository, ReactionRepository],
})
export class DatabaseModule {}
