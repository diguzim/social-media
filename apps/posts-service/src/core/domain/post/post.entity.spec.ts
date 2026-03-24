import { Post, PostProps } from "./post.entity";

describe("Post Entity", () => {
  describe("constructor", () => {
    it("should create a Post instance with all properties", () => {
      const postProps: PostProps = {
        id: "post-123",
        title: "My First Post",
        content: "This is the content of my post",
        authorId: "user-456",
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      const post = new Post(postProps);

      expect(post).toBeInstanceOf(Post);
      expect(post.id).toBe("post-123");
      expect(post.title).toBe("My First Post");
      expect(post.content).toBe("This is the content of my post");
      expect(post.authorId).toBe("user-456");
      expect(post.createdAt).toEqual(new Date("2024-01-01T00:00:00Z"));
    });

    it("should throw error when required properties are missing", () => {
      expect(() => {
        new Post({
          id: "",
          title: "Test",
          content: "Test",
          authorId: "user-1",
          createdAt: new Date(),
        } as PostProps);
      }).not.toThrow();
    });
  });

  describe("getters", () => {
    let post: Post;

    beforeEach(() => {
      const postProps: PostProps = {
        id: "post-789",
        title: "Understanding Immutability",
        content: "In this post, we explore immutable patterns",
        authorId: "user-999",
        createdAt: new Date("2024-02-15T10:30:00Z"),
      };

      post = new Post(postProps);
    });

    it("should return id via getter", () => {
      expect(post.id).toBe("post-789");
    });

    it("should return title via getter", () => {
      expect(post.title).toBe("Understanding Immutability");
    });

    it("should return content via getter", () => {
      expect(post.content).toBe("In this post, we explore immutable patterns");
    });

    it("should return authorId via getter", () => {
      expect(post.authorId).toBe("user-999");
    });

    it("should return createdAt via getter", () => {
      expect(post.createdAt).toEqual(new Date("2024-02-15T10:30:00Z"));
    });

    it("should not allow property modification via getters", () => {
      const originalTitle = post.title;

      // Try to modify (should not work because getters return primitives)
      const title = post.title;
      expect(title).toBe(originalTitle);
      expect(post.title).toBe(originalTitle);
    });
  });

  describe("immutability", () => {
    it("should be immutable - properties should not be assignable", () => {
      const postProps: PostProps = {
        id: "post-immutable",
        title: "Immutable Post",
        content: "Cannot be changed",
        authorId: "user-1",
        createdAt: new Date(),
      };

      const post = new Post(postProps);
      const mutablePost = post as unknown as { id: string };

      // Attempting to assign to a getter should throw
      expect(() => {
        mutablePost.id = "new-id";
      }).toThrow();

      // Value should remain unchanged
      expect(post.id).toBe("post-immutable");
    });

    it("should create independent Post instances", () => {
      const date = new Date("2024-01-01");
      const post1 = new Post({
        id: "post-1",
        title: "Post 1",
        content: "Content 1",
        authorId: "user-1",
        createdAt: date,
      });

      const post2 = new Post({
        id: "post-2",
        title: "Post 2",
        content: "Content 2",
        authorId: "user-2",
        createdAt: date,
      });

      expect(post1.id).not.toBe(post2.id);
      expect(post1.title).not.toBe(post2.title);
      expect(post1.authorId).not.toBe(post2.authorId);
    });
  });

  describe("edge cases", () => {
    it("should handle empty strings", () => {
      const postProps: PostProps = {
        id: "",
        title: "",
        content: "",
        authorId: "",
        createdAt: new Date(),
      };

      const post = new Post(postProps);

      expect(post.id).toBe("");
      expect(post.title).toBe("");
      expect(post.content).toBe("");
      expect(post.authorId).toBe("");
    });

    it("should handle very long content", () => {
      const longContent = "a".repeat(10000);
      const postProps: PostProps = {
        id: "post-long",
        title: "Long Post",
        content: longContent,
        authorId: "user-1",
        createdAt: new Date(),
      };

      const post = new Post(postProps);

      expect(post.content.length).toBe(10000);
      expect(post.content).toBe(longContent);
    });

    it("should handle dates correctly", () => {
      const date = new Date("2024-12-31T23:59:59Z");
      const postProps: PostProps = {
        id: "post-date",
        title: "Date Test",
        content: "Testing dates",
        authorId: "user-1",
        createdAt: date,
      };

      const post = new Post(postProps);

      expect(post.createdAt).toEqual(date);
      expect(post.createdAt.getFullYear()).toBe(2024);
      expect(post.createdAt.getMonth()).toBe(11);
    });
  });
});
