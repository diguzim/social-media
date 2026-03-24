export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  username: string;
  email: string;
}
