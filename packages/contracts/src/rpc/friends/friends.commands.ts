export const FRIENDS_COMMANDS = {
  sendFriendRequest: "friends.sendFriendRequest",
  acceptFriendRequest: "friends.acceptFriendRequest",
  rejectFriendRequest: "friends.rejectFriendRequest",
  listFriends: "friends.listFriends",
  listIncomingPending: "friends.listIncomingPending",
  listOutgoingPending: "friends.listOutgoingPending",
  getFriendshipStatus: "friends.getFriendshipStatus",
} as const;
