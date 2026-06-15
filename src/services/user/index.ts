import { AxiosInstance } from "axios";

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface AuthResponse {
  data: {
    token: string;
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
  message?: string;
}

export interface UserResponse {
  data: {
    id: string;
    email: string;
    name: string;
  };
}

export class UserApi {
  client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  register(data: RegisterRequest) {
    return this.client.post<AuthResponse>("/user/register", data);
  }

  login(data: LoginRequest) {
    return this.client.post<AuthResponse>("/user/login", data);
  }

  user() {
    return this.client.get<UserResponse>("/user/me");
  }
}

export default UserApi;