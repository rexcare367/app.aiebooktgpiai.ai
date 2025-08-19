import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/user/auth";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface GoogleLoginRequest {
  email: string;
}

export interface SignupRequest {
  ic_number: string;
  password: string;
  phone: string;
  email: string;
}

export interface UserData {
  id: string;
  email: string;
  ic_number: string;
  name: string;
  registration_status: string;
  avatar_url: string;
  birth: string;
  address: string;
  parent: string;
  school_id: string;
  rewards: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user_id?: string;
  data?: UserData;
}

class AuthService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);
      const data = response.data;

      if (data.success && data.token) {
        this.setToken(data.token);
        if (data.data) {
          this.setUserData(data.data);
        }
      }

      return data;
    } catch (error) {
      const err = error as any;
      if (err.response?.data) {
        return err.response.data;
      }
      if (err.code === "ECONNREFUSED" || err.message.includes("Network Error")) {
        return {
          success: false,
          message: "Unable to connect to server. Please check your connection.",
        };
      }
      throw new Error("Login failed");
    }
  }

  async google_login(credentials: GoogleLoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/google-login`, credentials);
      const data = response.data;

      if (data.success && data.token) {
        this.setToken(data.token);
        if (data.data) {
          this.setUserData(data.data);
        }
      }

      return data;
    } catch (error) {
      const err = error as any;
      if (err.response?.data) {
        return err.response.data;
      }
      if (err.code === "ECONNREFUSED" || err.message.includes("Network Error")) {
        return {
          success: false,
          message: "Unable to connect to server. Please check your connection.",
        };
      }
      throw new Error("Login failed");
    }
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, userData);
      const data = response.data;

      if (data.success && data.token) {
        this.setToken(data.token);
        if (data.data) {
          this.setUserData(data.data);
        }
      }

      return data;
    } catch (error) {
      const err = error as any;
      if (err.response?.data) {
        return err.response.data;
      }
      if (err.code === "ECONNREFUSED" || err.message.includes("Network Error")) {
        return {
          success: false,
          message: "Unable to connect to server. Please check your connection.",
        };
      }
      throw new Error("Signup failed");
    }
  }

  logout() {
    this.clearToken();
    this.clearUserData();
  }

  getUserData(): UserData | null {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }

  setUserData(userData: UserData) {
    localStorage.setItem("user_data", JSON.stringify(userData));
  }

  clearUserData() {
    localStorage.removeItem("user_data");
  }
}

export const authService = new AuthService();
export default authService;
