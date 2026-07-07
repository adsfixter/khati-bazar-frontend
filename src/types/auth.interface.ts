export interface IRegisterRequest {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
}


export interface ILoginRequest {
  identity: string; 
  password?: string;
}