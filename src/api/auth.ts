import { IAuthResponse, ILoginRequest, IRegisterRequest } from '../types/auth.interface';
import axiosInstance from './axiosInstance';


export const authAPI = {
  register: async (data: IRegisterRequest): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<IAuthResponse>('/auth/register', data);
    return response.data;
  },
  login: async (data: ILoginRequest): Promise<IAuthResponse> => {
    const response = await axiosInstance.post<IAuthResponse>('/auth/login', data);
    return response.data;
  },
};



