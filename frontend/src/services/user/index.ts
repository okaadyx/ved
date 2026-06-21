import { AxiosInstance } from "axios";
import { saveToken } from "../../utils/auth";

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
  status: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export class UserApi {
  client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async register(data: RegisterRequest) {
    const response = await this.client.post<AuthResponse>("/user/register", data);
    if (response.data && response.data.data && response.data.data.token) {
      await saveToken(response.data.data.token);
    }
    return response;
  }

  async login(data: LoginRequest) {
    const response = await this.client.post<AuthResponse>("/user/login", data);
    if (response.data && response.data.data && response.data.data.token) {
      await saveToken(response.data.data.token);
    }
    return response;
  }

  user() {
    return this.client.get<UserResponse>("/user/me");
  }
}

export default UserApi;