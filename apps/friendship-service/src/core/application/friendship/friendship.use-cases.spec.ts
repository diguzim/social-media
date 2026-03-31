import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { SendFriendRequestUseCase } from "./send-friend-request.use-case";
import { AcceptFriendRequestUseCase } from "./accept-friend-request.use-case";
import { RejectFriendRequestUseCase } from "./reject-friend-request.use-case";
import { ListFriendsUseCase } from "./list-friends.use-case";
import { ListIncomingPendingUseCase } from "./list-incoming-pending.use-case";
import { ListOutgoingPendingUseCase } from "./list-outgoing-pending.use-case";
import { GetFriendshipStatusUseCase } from "./get-friendship-status.use-case";
import { InMemoryFriendRequestRepository } from "src/infra/database/in-memory/repositories/in-memory-friend-request.repository";

describe("Friendship use cases", () => {
  let repository: InMemoryFriendRequestRepository;
  let sendFriendRequestUseCase: SendFriendRequestUseCase;
  let acceptFriendRequestUseCase: AcceptFriendRequestUseCase;
  let rejectFriendRequestUseCase: RejectFriendRequestUseCase;
  let listFriendsUseCase: ListFriendsUseCase;
  let listIncomingPendingUseCase: ListIncomingPendingUseCase;
  let listOutgoingPendingUseCase: ListOutgoingPendingUseCase;
  let getFriendshipStatusUseCase: GetFriendshipStatusUseCase;

  beforeEach(() => {
    repository = new InMemoryFriendRequestRepository();
    sendFriendRequestUseCase = new SendFriendRequestUseCase(repository);
    acceptFriendRequestUseCase = new AcceptFriendRequestUseCase(repository);
    rejectFriendRequestUseCase = new RejectFriendRequestUseCase(repository);
    listFriendsUseCase = new ListFriendsUseCase(repository);
    listIncomingPendingUseCase = new ListIncomingPendingUseCase(repository);
    listOutgoingPendingUseCase = new ListOutgoingPendingUseCase(repository);
    getFriendshipStatusUseCase = new GetFriendshipStatusUseCase(repository);
  });

  it("seeds feed-like friendship data for alice", async () => {
    const aliceFriends = await listFriendsUseCase.execute({ userId: "1" });
    const aliceIncoming = await listIncomingPendingUseCase.execute({
      userId: "1",
    });

    expect(aliceFriends.friendUserIds).toEqual(expect.arrayContaining(["2"]));
    expect(aliceIncoming.data.length).toBeGreaterThan(0);
  });

  it("does not allow sending request to self", async () => {
    await expect(
      sendFriendRequestUseCase.execute({ requesterId: "1", targetUserId: "1" }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("blocks duplicate pending request", async () => {
    await expect(
      sendFriendRequestUseCase.execute({ requesterId: "1", targetUserId: "4" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("blocks request when users are already friends", async () => {
    await expect(
      sendFriendRequestUseCase.execute({ requesterId: "1", targetUserId: "2" }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("allows re-request after rejected", async () => {
    const result = await sendFriendRequestUseCase.execute({
      requesterId: "1",
      targetUserId: "5",
    });

    expect(result.request.status).toBe("pending");
    expect(result.request.requesterId).toBe("1");
    expect(result.request.recipientId).toBe("5");
  });

  it("accepts request only for recipient", async () => {
    await expect(
      acceptFriendRequestUseCase.execute({
        requestId: "fr-2",
        actorUserId: "2",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const accepted = await acceptFriendRequestUseCase.execute({
      requestId: "fr-2",
      actorUserId: "1",
    });

    expect(accepted.request.status).toBe("accepted");
    expect(accepted.request.respondedAt).not.toBeNull();
  });

  it("rejects request only for recipient", async () => {
    await expect(
      rejectFriendRequestUseCase.execute({
        requestId: "fr-3",
        actorUserId: "3",
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const rejected = await rejectFriendRequestUseCase.execute({
      requestId: "fr-3",
      actorUserId: "4",
    });

    expect(rejected.request.status).toBe("rejected");
    expect(rejected.request.respondedAt).not.toBeNull();
  });

  it("lists friends and pending requests", async () => {
    const friends = await listFriendsUseCase.execute({ userId: "2" });
    const incoming = await listIncomingPendingUseCase.execute({ userId: "2" });
    const outgoing = await listOutgoingPendingUseCase.execute({ userId: "1" });

    expect(friends.friendUserIds).toEqual(expect.arrayContaining(["1", "3"]));
    expect(incoming.data.some((item) => item.requesterId === "5")).toBe(true);
    expect(outgoing.data.some((item) => item.recipientId === "4")).toBe(true);
  });

  it("resolves friendship statuses", async () => {
    await expect(
      getFriendshipStatusUseCase.execute({ userId: "1", targetUserId: "1" }),
    ).resolves.toEqual({ status: "none" });

    await expect(
      getFriendshipStatusUseCase.execute({ userId: "1", targetUserId: "2" }),
    ).resolves.toEqual({ status: "friends" });

    await expect(
      getFriendshipStatusUseCase.execute({ userId: "1", targetUserId: "3" }),
    ).resolves.toEqual({ status: "pending_incoming" });

    await expect(
      getFriendshipStatusUseCase.execute({ userId: "1", targetUserId: "4" }),
    ).resolves.toEqual({ status: "pending_outgoing" });

    await expect(
      getFriendshipStatusUseCase.execute({ userId: "4", targetUserId: "5" }),
    ).resolves.toEqual({ status: "none" });
  });
});
