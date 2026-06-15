import axios, { AxiosInstance } from "axios";
import { UserApi } from "./user";
import { RagApi } from "./rag";
import { getToken } from "../utils/auth";

export class Api {
  axiosClient: AxiosInstance;
  user: UserApi;
  rag: RagApi;

  constructor(baseURL: string = "http://192.168.1.4:3000") {
    this.axiosClient = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add interceptor to dynamically inject the auth token on every request
    this.axiosClient.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Error retrieving token in request interceptor:", error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.user = new UserApi(this.axiosClient);
    this.rag = new RagApi(this.axiosClient);
  }
}

export const api = new Api();
export default api;