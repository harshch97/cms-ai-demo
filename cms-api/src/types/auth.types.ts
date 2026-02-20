export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
