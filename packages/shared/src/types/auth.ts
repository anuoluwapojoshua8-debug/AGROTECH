export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'BUYER' | 'SELLER';
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IAuthResponse {
  user: import('./user').IUser;
  tokens: IAuthTokens;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
}

export interface IVerifyEmailRequest {
  token: string;
}
