import { Injectable } from "@nestjs/common";
import { Post } from "src/core/domain/post/post.entity";
import {
  PostRepository,
  CreatePostData,
  UpdatePostData,
  DeletePostData,
  FindPostsOptions,
  FindPostsResult,
} from "src/core/domain/post/post.repository";

@Injectable()
export class InMemoryPostRepository implements PostRepository {
  private posts: Post[] = this.seedPosts();

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(createPostData: CreatePostData): Promise<Post> {
    const post = new Post({
      id: (this.posts.length + 1).toString(),
      title: createPostData.title,
      content: createPostData.content,
      authorId: createPostData.authorId,
      createdAt: new Date(),
    });

    this.posts.push(post);

    return post;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<Post | null> {
    const post = this.posts.find((item) => item.id === id);
    return post ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async update(updatePostData: UpdatePostData): Promise<Post> {
    const index = this.posts.findIndex(
      (item) => item.id === updatePostData.postId,
    );
    if (index === -1) {
      throw new Error("Post not found");
    }

    const current = this.posts[index];
    if (!current) {
      throw new Error("Post not found");
    }
    const updated = new Post({
      id: current.id,
      title: updatePostData.title ?? current.title,
      content: updatePostData.content ?? current.content,
      authorId: current.authorId,
      createdAt: current.createdAt,
    });

    this.posts[index] = updated;

    return updated;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async delete(deletePostData: DeletePostData): Promise<void> {
    const index = this.posts.findIndex(
      (item) => item.id === deletePostData.postId,
    );
    if (index === -1) {
      throw new Error("Post not found");
    }

    this.posts.splice(index, 1);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findMany(options: FindPostsOptions): Promise<FindPostsResult> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const authorId = options.authorId;
    const sortOrder = options.sortOrder ?? "desc";

    // Filter posts by authorId if provided
    let filtered = this.posts;
    if (authorId) {
      filtered = filtered.filter((post) => post.authorId === authorId);
    }

    // Sort by createdAt (newest first by default)
    const sorted = [...filtered].sort((a, b) => {
      if (sortOrder === "desc") {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Calculate pagination
    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    // Get paginated data
    const data = sorted.slice(start, end);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private seedPosts(): Post[] {
    const seedData = [
      // Alice's posts (5)
      {
        id: "1",
        title: "Getting Started with TypeScript",
        content:
          "TypeScript is a powerful tool for building large-scale JavaScript applications with type safety.",
        authorId: "1",
        createdAt: new Date("2025-01-10T08:00:00"),
      },
      {
        id: "2",
        title: "Understanding Async/Await",
        content:
          "Async/await makes asynchronous code much more readable and easier to reason about.",
        authorId: "1",
        createdAt: new Date("2025-01-11T09:30:00"),
      },
      {
        id: "3",
        title: "NestJS Best Practices",
        content:
          "Learn how to structure your NestJS applications for scalability and maintainability.",
        authorId: "1",
        createdAt: new Date("2025-01-12T14:15:00"),
      },
      {
        id: "4",
        title: "Docker for Developers",
        content:
          "Docker containers help ensure consistency between development and production environments.",
        authorId: "1",
        createdAt: new Date("2025-01-13T10:45:00"),
      },
      {
        id: "5",
        title: "Microservices Architecture",
        content:
          "Breaking down applications into microservices provides flexibility and independent scaling.",
        authorId: "1",
        createdAt: new Date("2025-01-14T11:20:00"),
      },
      // Bob's posts (5)
      {
        id: "6",
        title: "The Art of Clean Code",
        content:
          "Writing clean code is not just about making it work, but making it understandable.",
        authorId: "2",
        createdAt: new Date("2025-01-15T09:00:00"),
      },
      {
        id: "7",
        title: "Database Design Principles",
        content:
          "Proper database design is crucial for application performance and data integrity.",
        authorId: "2",
        createdAt: new Date("2025-01-16T13:30:00"),
      },
      {
        id: "8",
        title: "API Design Patterns",
        content:
          "Good API design makes it easy for clients to integrate and reduces your support burden.",
        authorId: "2",
        createdAt: new Date("2025-01-17T15:45:00"),
      },
      {
        id: "9",
        title: "Testing Strategies",
        content:
          "Comprehensive testing catches bugs early and gives you confidence in your code.",
        authorId: "2",
        createdAt: new Date("2025-01-18T10:15:00"),
      },
      {
        id: "10",
        title: "Monitoring and Logging",
        content:
          "Effective monitoring helps you understand what's happening in production.",
        authorId: "2",
        createdAt: new Date("2025-01-19T16:00:00"),
      },
      // Charlie's posts (4)
      {
        id: "11",
        title: "React Hooks Deep Dive",
        content:
          "Hooks allow you to use state and other React features in functional components.",
        authorId: "3",
        createdAt: new Date("2025-01-20T08:30:00"),
      },
      {
        id: "12",
        title: "State Management with Redux",
        content:
          "Redux provides a predictable way to manage application state.",
        authorId: "3",
        createdAt: new Date("2025-01-21T12:00:00"),
      },
      {
        id: "13",
        title: "CSS-in-JS Solutions",
        content:
          "CSS-in-JS libraries help manage styles in modern JavaScript applications.",
        authorId: "3",
        createdAt: new Date("2025-01-22T14:20:00"),
      },
      {
        id: "14",
        title: "Performance Optimization",
        content:
          "Optimizing frontend performance improves user experience and SEO rankings.",
        authorId: "3",
        createdAt: new Date("2025-01-23T11:10:00"),
      },
      // Diana's posts (4)
      {
        id: "15",
        title: "Cloud Deployment Best Practices",
        content:
          "Learn how to deploy applications safely and reliably to cloud platforms.",
        authorId: "4",
        createdAt: new Date("2025-01-24T09:45:00"),
      },
      {
        id: "16",
        title: "Kubernetes for Beginners",
        content: "Kubernetes orchestrates containerized applications at scale.",
        authorId: "4",
        createdAt: new Date("2025-01-25T13:15:00"),
      },
      {
        id: "17",
        title: "CI/CD Pipeline Setup",
        content:
          "Automated pipelines reduce manual work and improve code quality.",
        authorId: "4",
        createdAt: new Date("2025-01-26T10:30:00"),
      },
      {
        id: "18",
        title: "Infrastructure as Code",
        content:
          "Managing infrastructure through code provides reproducibility and version control.",
        authorId: "4",
        createdAt: new Date("2025-01-27T15:50:00"),
      },
      // Eve's posts (4)
      {
        id: "19",
        title: "Security Best Practices",
        content:
          "Security should be built in from the start, not added as an afterthought.",
        authorId: "5",
        createdAt: new Date("2025-01-28T08:00:00"),
      },
      {
        id: "20",
        title: "Authentication and Authorization",
        content:
          "Proper authentication and authorization protect your applications and user data.",
        authorId: "5",
        createdAt: new Date("2025-01-29T11:45:00"),
      },
      {
        id: "21",
        title: "API Security",
        content:
          "APIs are common attack vectors; secure them with proper validation and authentication.",
        authorId: "5",
        createdAt: new Date("2025-01-30T14:30:00"),
      },
      {
        id: "22",
        title: "Data Privacy Compliance",
        content:
          "Understanding GDPR and other regulations is essential for modern applications.",
        authorId: "5",
        createdAt: new Date("2025-01-31T10:00:00"),
      },
    ];

    return seedData.map(
      (data) =>
        new Post({
          id: data.id,
          title: data.title,
          content: data.content,
          authorId: data.authorId,
          createdAt: data.createdAt,
        }),
    );
  }
}
