export interface AuthResponseDto {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      createdAt: Date;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
