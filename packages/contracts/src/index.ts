// API contracts (Frontend <-> API Gateway)
export * as API from "./api/index.js";

// RPC contracts (API Gateway <-> Microservices)
export * as RPC from "./rpc/index.js";

// Legacy exports for backward compatibility (to be removed)
export * from "./auth/index.js";
export * from "./posts/index.js";
export * from "./image/index.js";
